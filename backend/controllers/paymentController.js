const crypto = require("crypto");
const https = require("https");
const Payment = require("../models/Payment");
const FeePlan = require("../models/FeePlan");
const SchoolSubscription = require("../models/SchoolSubscription");
const TeacherCompensation = require("../models/TeacherCompensation");
const PaymentSettings = require("../models/PaymentSettings");
const User = require("../models/User");

const safeSettings = async () => {
  let settings = await PaymentSettings.findOne();
  if (!settings) settings = await PaymentSettings.create({});
  const environment = settings.environment;
  const keyId = environment === "live" ? process.env.RAZORPAY_LIVE_KEY_ID : process.env.RAZORPAY_TEST_KEY_ID;
  const keySecret = environment === "live" ? process.env.RAZORPAY_LIVE_KEY_SECRET : process.env.RAZORPAY_TEST_KEY_SECRET;
  return { settings, environment, keyId: keyId || process.env.RAZORPAY_KEY_ID, keySecret: keySecret || process.env.RAZORPAY_KEY_SECRET };
};
const razorpay = (method, path, body, credentials) => new Promise((resolve, reject) => {
  if (!credentials.keyId || !credentials.keySecret) return reject(Object.assign(new Error("Razorpay is not configured"), { status: 503 }));
  const payload = body ? JSON.stringify(body) : "";
  const request = https.request({ hostname: "api.razorpay.com", path, method, headers: { Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`, "Content-Type": "application/json", ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}) } }, response => {
    let data = ""; response.on("data", chunk => { data += chunk; }); response.on("end", () => { try { const parsed = JSON.parse(data || "{}"); if (response.statusCode >= 200 && response.statusCode < 300) resolve(parsed); else reject(Object.assign(new Error(parsed.error?.description || "Razorpay request failed"), { status: response.statusCode })); } catch { reject(new Error("Invalid Razorpay response")); } });
  }); request.on("error", reject); if (payload) request.write(payload); request.end();
});
const receipt = payment => `TH-${payment._id.toString().slice(-10).toUpperCase()}-${Date.now().toString().slice(-6)}`;
const statusError = (res, error) => res.status(error.status || 500).json({ message: error.status === 503 ? "Payment gateway is unavailable" : "Payment operation failed" });
const schoolAdmin = async schoolName => User.findOne({ role: "admin", schoolName }).select("_id");
const superAdmin = async () => User.findOne({ role: "superadmin" }).select("_id");
const matchesSignature = (expected, received) => {
  const left = Buffer.from(expected || ""); const right = Buffer.from(received || "");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

async function createOrder(res, payment) {
  try {
    const gateway = await safeSettings();
    const order = await razorpay("POST", "/v1/orders", { amount: payment.amount, currency: payment.currency, receipt: payment._id.toString(), notes: { teachhubPaymentId: payment._id.toString(), purpose: payment.purpose } }, gateway);
    payment.razorpayOrderId = order.id; payment.gateway = "razorpay"; await payment.save();
    return res.status(201).json({ paymentId: payment._id, razorpayOrderId: order.id, razorpayKeyId: gateway.keyId, amount: payment.amount, currency: payment.currency });
  } catch (error) { await Payment.findByIdAndUpdate(payment._id, { status: "Failed" }); return statusError(res, error); }
}

exports.createStudentOrder = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.user.id, role: "student" });
    if (!student?.schoolName) return res.status(403).json({ message: "Student is not assigned to a school" });
    const [plan, receiver] = await Promise.all([FeePlan.findOne({ schoolName: student.schoolName, active: true }), schoolAdmin(student.schoolName)]);
    if (!plan || !receiver) return res.status(409).json({ message: "School fee payment is not configured" });
    const pending = await Payment.findOne({ payer: student._id, schoolName: student.schoolName, purpose: "STUDENT_SCHOOL_FEE", status: "Pending", gateway: "razorpay" }).sort({ createdAt: -1 });
    if (pending?.razorpayOrderId) { const gateway = await safeSettings(); return res.json({ paymentId: pending._id, razorpayOrderId: pending.razorpayOrderId, razorpayKeyId: gateway.keyId, amount: pending.amount, currency: pending.currency }); }
    return createOrder(res, await Payment.create({ payer: student._id, receiver: receiver._id, schoolName: student.schoolName, purpose: "STUDENT_SCHOOL_FEE", amount: plan.monthlyFee, currency: plan.currency }));
  } catch (error) { statusError(res, error); }
};
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.user.id, role: "admin" }); if (!admin?.schoolName) return res.status(403).json({ message: "School administrator is not assigned to a school" });
    const subscription = await SchoolSubscription.findOne({ schoolName: admin.schoolName }); if (!subscription) return res.status(409).json({ message: "Subscription is not configured" });
    if (subscription.status === "Free" && subscription.freeUntil && subscription.freeUntil > new Date()) return res.status(409).json({ message: "This school is currently in an authorized free period" });
    const receiver = await superAdmin(); if (!receiver) return res.status(409).json({ message: "Subscription receiver is not configured" });
    return createOrder(res, await Payment.create({ payer: admin._id, receiver: receiver._id, schoolName: admin.schoolName, purpose: "SCHOOL_SUBSCRIPTION", amount: subscription.monthlyFee, currency: subscription.currency }));
  } catch (error) { statusError(res, error); }
};
exports.createTeacherSalaryOrder = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.user.id, role: "admin" }); const teacherId = req.params.teacherId;
    if (!admin?.schoolName) return res.status(403).json({ message: "School administrator is not assigned to a school" });
    const [teacher, compensation] = await Promise.all([User.findOne({ _id: teacherId, role: "teacher", schoolName: admin.schoolName }), TeacherCompensation.findOne({ teacher: teacherId, schoolName: admin.schoolName, active: true })]);
    if (!teacher || !compensation) return res.status(404).json({ message: "Teacher salary configuration was not found" });
    return createOrder(res, await Payment.create({ payer: admin._id, receiver: teacher._id, schoolName: admin.schoolName, purpose: "TEACHER_SALARY", amount: compensation.salary, currency: compensation.currency, metadata: { teacher: teacher._id } }));
  } catch (error) { statusError(res, error); }
};

async function finalizePayment({ orderId, paymentId }) {
  const payment = await Payment.findOne({ razorpayOrderId: orderId }); if (!payment) throw Object.assign(new Error("Payment record not found"), { status: 404 });
  if (payment.status === "Successful") return payment;
  if (payment.status !== "Pending" && payment.status !== "Processing") throw Object.assign(new Error("Payment cannot be finalized"), { status: 409 });
  const gateway = await safeSettings(); const gatewayPayment = await razorpay("GET", `/v1/payments/${encodeURIComponent(paymentId)}`, null, gateway);
  if (gatewayPayment.order_id !== payment.razorpayOrderId || gatewayPayment.amount !== payment.amount || gatewayPayment.currency !== payment.currency || gatewayPayment.status !== "captured") throw Object.assign(new Error("Gateway payment verification failed"), { status: 400 });
  const updated = await Payment.findOneAndUpdate({ _id: payment._id, status: { $in: ["Pending", "Processing"] } }, { $set: { status: "Successful", razorpayPaymentId: paymentId, verifiedAt: new Date(), receiptNumber: receipt(payment) } }, { new: true });
  if (!updated) return Payment.findById(payment._id);
  if (updated.purpose === "SCHOOL_SUBSCRIPTION") await SchoolSubscription.updateOne({ schoolName: updated.schoolName }, { $set: { status: "Active", nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  return updated;
}
exports.verifyCheckout = async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!orderId || !paymentId || !signature) return res.status(400).json({ message: "Incomplete payment verification data" });
    const gateway = await safeSettings(); const expected = crypto.createHmac("sha256", gateway.keySecret).update(`${orderId}|${paymentId}`).digest("hex");
    if (!matchesSignature(expected, signature)) return res.status(400).json({ message: "Payment signature verification failed" });
    const payment = await Payment.findOne({ razorpayOrderId: orderId, payer: req.user.id }); if (!payment) return res.status(403).json({ message: "Payment does not belong to the authenticated user" });
    const finalized = await finalizePayment({ orderId, paymentId }); res.json({ paymentId: finalized._id, status: finalized.status, receiptNumber: finalized.receiptNumber });
  } catch (error) { statusError(res, error); }
};
exports.webhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; if (!secret) return res.status(503).json({ message: "Webhook is not configured" });
    const signature = req.headers["x-razorpay-signature"]; const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex"); if (!matchesSignature(expected, signature)) return res.status(400).json({ message: "Invalid webhook signature" });
    const event = JSON.parse(req.body.toString("utf8")); const entity = event.payload?.payment?.entity; if (!entity?.order_id) return res.status(200).json({ received: true });
    if (event.event === "payment.captured") await finalizePayment({ orderId: entity.order_id, paymentId: entity.id });
    if (event.event === "payment.failed") await Payment.updateOne({ razorpayOrderId: entity.order_id, status: { $in: ["Pending", "Processing"] } }, { $set: { status: "Failed" } });
    res.status(200).json({ received: true });
  } catch (error) { console.error("Payment webhook processing failed", error.message); res.status(500).json({ message: "Webhook processing failed" }); }
};
exports.createOfflineStudentRequest = async (req, res) => { try { const student = await User.findOne({ _id: req.user.id, role: "student" }); const [plan, receiver] = await Promise.all([FeePlan.findOne({ schoolName: student?.schoolName, active: true }), schoolAdmin(student?.schoolName)]); if (!student?.schoolName || !plan || !receiver) return res.status(409).json({ message: "School fee payment is not configured" }); const reference = String(req.body.reference || "").trim(); if (!reference) return res.status(400).json({ message: "Payment reference is required" }); const payment = await Payment.create({ payer: student._id, receiver: receiver._id, schoolName: student.schoolName, purpose: "STUDENT_SCHOOL_FEE", amount: plan.monthlyFee, currency: plan.currency, gateway: "offline", status: "PendingVerification", offlineReference: reference }); res.status(201).json({ paymentId: payment._id, status: payment.status }); } catch (error) { statusError(res, error); } };
exports.approveOffline = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); const payment = await Payment.findOne({ _id: req.params.id, schoolName: admin?.schoolName, gateway: "offline", status: "PendingVerification" }); if (!payment) return res.status(404).json({ message: "Pending offline payment not found" }); payment.status = "Successful"; payment.verifiedAt = new Date(); payment.receiptNumber = receipt(payment); await payment.save(); res.json({ paymentId: payment._id, status: payment.status, receiptNumber: payment.receiptNumber }); } catch (error) { statusError(res, error); } };
exports.listPayments = async (req, res) => { try { const user = await User.findById(req.user.id); const query = user.role === "superadmin" ? {} : user.role === "admin" ? { schoolName: user.schoolName } : { payer: user._id }; const payments = await Payment.find(query).populate("payer receiver", "name email role").sort({ createdAt: -1 }).limit(100); res.json(payments); } catch (error) { statusError(res, error); } };
exports.getSettings = async (req, res) => { try { const gateway = await safeSettings(); res.json({ gateway: "razorpay", environment: gateway.environment, keyId: gateway.keyId || "", secretConfigured: Boolean(gateway.keySecret) }); } catch (error) { statusError(res, error); } };
exports.updateSettings = async (req, res) => { try { if (!["test", "live"].includes(req.body.environment)) return res.status(400).json({ message: "Invalid payment environment" }); const settings = await PaymentSettings.findOneAndUpdate({}, { $set: { environment: req.body.environment, updatedBy: req.user.id } }, { new: true, upsert: true }); res.json({ gateway: settings.gateway, environment: settings.environment, secretConfigured: Boolean((await safeSettings()).keySecret) }); } catch (error) { statusError(res, error); } };
exports.setFeePlan = async (req, res) => { try { const amount = Number(req.body.monthlyFee); if (!Number.isSafeInteger(amount) || amount < 1) return res.status(400).json({ message: "Fee must be a positive integer in paise" }); const plan = await FeePlan.findOneAndUpdate({ schoolName: req.user.schoolName }, { $set: { monthlyFee: amount, active: req.body.active !== false, updatedBy: req.user.id } }, { new: true, upsert: true }); res.json(plan); } catch (error) { statusError(res, error); } };
exports.getFeePlan = async (req, res) => { const plan = await FeePlan.findOne({ schoolName: req.user.schoolName }).select("monthlyFee currency active updatedAt"); res.json(plan || null); };
exports.setTeacherCompensation = async (req, res) => { try { const salary = Number(req.body.salary); const teacher = await User.findOne({ _id: req.params.teacherId, role: "teacher", schoolName: req.user.schoolName }); if (!teacher || !Number.isSafeInteger(salary) || salary < 1) return res.status(400).json({ message: "Valid teacher and salary in paise are required" }); const compensation = await TeacherCompensation.findOneAndUpdate({ teacher: teacher._id, schoolName: req.user.schoolName }, { $set: { salary, active: req.body.active !== false, updatedBy: req.user.id } }, { new: true, upsert: true }); res.json(compensation); } catch (error) { statusError(res, error); } };
exports.setSubscription = async (req, res) => { try { const school = String(req.params.schoolName || "").trim(); const monthlyFee = Number(req.body.monthlyFee); const status = req.body.status || "PastDue"; if (!school || !Number.isSafeInteger(monthlyFee) || monthlyFee < 1 || !["Active", "PastDue", "Suspended"].includes(status)) return res.status(400).json({ message: "Valid school, subscription fee in paise, and status are required" }); const subscription = await SchoolSubscription.findOneAndUpdate({ schoolName: school }, { $set: { monthlyFee, status, freeUntil: null, updatedBy: req.user.id } }, { new: true, upsert: true }); res.json(subscription); } catch (error) { statusError(res, error); } };
exports.grantFreePeriod = async (req, res) => { try { const days = Number(req.body.days); if (!Number.isInteger(days) || days < 1 || days > 365) return res.status(400).json({ message: "Free period must be between 1 and 365 days" }); const subscription = await SchoolSubscription.findOneAndUpdate({ schoolName: req.params.schoolName }, { $set: { status: "Free", freeUntil: new Date(Date.now() + days * 86400000), updatedBy: req.user.id } }, { new: true }); if (!subscription) return res.status(404).json({ message: "Subscription not found" }); res.json(subscription); } catch (error) { statusError(res, error); } };
