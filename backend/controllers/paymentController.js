const crypto = require("crypto");
const https = require("https");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const FeePlan = require("../models/FeePlan");
const SchoolSubscription = require("../models/SchoolSubscription");
const TeacherCompensation = require("../models/TeacherCompensation");
const PaymentSettings = require("../models/PaymentSettings");
const FreePeriod = require("../models/FreePeriod");
const PaymentAuditLog = require("../models/PaymentAuditLog");
const PaymentWebhookEvent = require("../models/PaymentWebhookEvent");
const User = require("../models/User");
const School = require("../models/School");

const fail = (res, error) => res.status(error.status || 500).json({ message: error.status === 503 ? "Payment gateway is unavailable" : (error.message || "Payment operation failed") });
const invalid = message => Object.assign(new Error(message), { status: 400 });
const same = (a, b) => { const x = Buffer.from(a || ""), y = Buffer.from(b || ""); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const receipt = payment => payment.receiptNumber || `TH-${payment._id.toString().slice(-10).toUpperCase()}-${Date.now().toString().slice(-6)}`;
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const addMonths = (date, months) => { const d = new Date(date); const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + months); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return d; };
const calendarPeriod = (date = new Date()) => { const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)); return { start, end, key: start.toISOString().slice(0, 7) }; };
const paymentPeriod = (cycle = "MONTHLY", date = new Date()) => {
  if (cycle === "ONE_TIME") return { key: "ONE_TIME", start: null, end: null };
  if (cycle === "WEEKLY") { const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - ((date.getUTCDay() + 6) % 7))); return { start, end: new Date(start.getTime() + 7 * 86400000), key: start.toISOString().slice(0, 10) }; }
  return calendarPeriod(date);
};
const audit = (req, action, previousValue, newValue, reason = "") => PaymentAuditLog.create({ actor: req.user.id, role: req.user.role, schoolName: newValue?.schoolName || previousValue?.schoolName || req.user.schoolName || "", action, previousValue, newValue, reason });

const escapeRegexStr = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getSettingsForReceiver(receiverId, purpose, schoolName) {
  let query = {};
  if (purpose === "SCHOOL_SUBSCRIPTION") {
    query = { role: "superadmin" };
  } else if (purpose === "STUDENT_SCHOOL_FEE" && schoolName) {
    query = { role: "admin", schoolName: new RegExp("^" + escapeRegexStr(schoolName) + "$", "i") };
  } else if (schoolName) {
    query = { role: "admin", schoolName: new RegExp("^" + escapeRegexStr(schoolName) + "$", "i") };
  } else if (receiverId) {
    query = { userId: receiverId };
  } else {
    query = { role: "superadmin" };
  }
  let s = await PaymentSettings.findOne(query).select("+razorpayKeySecret +razorpayWebhookSecret +liveRazorpayKeySecret +testRazorpayKeySecret");
  if (!s && query.role === "superadmin") {
    const sa = await User.findOne({ role: "superadmin" }).select("_id");
    if (sa) {
      s = await PaymentSettings.create({
        userId: sa._id,
        role: "superadmin",
        environment: "test",
        onlineEnabled: true,
        offlineEnabled: true,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || ""
      });
    }
  }
  if (!s) {
    return { environment: "test", onlineEnabled: false, offlineEnabled: true, keyId: "", keySecret: "", webhookSecret: "" };
  }

  const isLive = s.environment === "live";
  const activeKeyId = isLive
    ? (s.liveRazorpayKeyId || s.razorpayKeyId || "")
    : (s.testRazorpayKeyId || s.razorpayKeyId || "");
  const activeKeySecret = isLive
    ? (s.liveRazorpayKeySecret || s.razorpayKeySecret || "")
    : (s.testRazorpayKeySecret || s.razorpayKeySecret || "");

  return {
    environment: s.environment,
    onlineEnabled: s.onlineEnabled,
    offlineEnabled: s.offlineEnabled,
    keyId: activeKeyId || (s.role === "superadmin" ? process.env.RAZORPAY_KEY_ID : ""),
    keySecret: activeKeySecret || (s.role === "superadmin" ? process.env.RAZORPAY_KEY_SECRET : ""),
    webhookSecret: s.razorpayWebhookSecret || (s.role === "superadmin" ? process.env.RAZORPAY_WEBHOOK_SECRET : "")
  };
}
function gateway(method, path, body, c) { return new Promise((resolve, reject) => { if (!c.keyId || !c.keySecret) return reject(Object.assign(new Error("Razorpay is not configured"), { status: 503 })); const payload = body ? JSON.stringify(body) : ""; const request = https.request({ hostname: "api.razorpay.com", path, method, headers: { Authorization: `Basic ${Buffer.from(`${c.keyId}:${c.keySecret}`).toString("base64")}`, "Content-Type": "application/json", ...(payload && { "Content-Length": Buffer.byteLength(payload) }) } }, response => { let data = ""; response.on("data", c => data += c); response.on("end", () => { try { const json = JSON.parse(data || "{}"); if (response.statusCode >= 200 && response.statusCode < 300) resolve(json); else reject(Object.assign(new Error(json.error?.description || "Razorpay request failed"), { status: response.statusCode })); } catch (_) { reject(new Error("Invalid payment gateway response")); } }); }); request.on("error", reject); if (payload) request.write(payload); request.end(); }); }
const schoolAdmin = schoolName => User.findOne({ role: "admin", schoolName }).select("_id");
const superAdmin = () => User.findOne({ role: "superadmin" }).select("_id");
async function activeFreePeriod(schoolName, start, end) { return FreePeriod.findOne({ schoolName, status: "Active", startDate: { $lte: end }, endDate: { $gte: start } }).sort({ startDate: 1 }); }
async function subscriptionState(subscription) {
  const now = new Date();
  const start = new Date(subscription.billingStartDate || now);

  if (["Suspended", "Cancelled"].includes(subscription.status)) {
    return {
      status: subscription.status,
      amountDue: subscription.monthlyFee,
      paymentRequired: false,
      currentBillingPeriod: { start, end: subscription.nextBillingDate || addMonths(start, 1) },
      remainingDays: 0
    };
  }

  const free = await activeFreePeriod(subscription.schoolName, start, subscription.nextBillingDate || now);
  if (free && now >= free.startDate && now <= free.endDate) {
    const remainingDays = Math.max(0, Math.ceil((free.endDate.getTime() - now.getTime()) / 86400000));
    return {
      status: "Free",
      amountDue: 0,
      paymentRequired: false,
      currentBillingPeriod: { start: free.startDate, end: free.endDate },
      freePeriod: free,
      remainingDays
    };
  }

  const latestPayment = await Payment.findOne({
    schoolName: subscription.schoolName,
    purpose: "SCHOOL_SUBSCRIPTION",
    status: "Successful"
  }).sort({ paidAt: -1, createdAt: -1 });

  if (!latestPayment) {
    const graceDays = subscription.gracePeriodDays || 0;
    const graceEnd = new Date(start.getTime() + graceDays * 86400000);
    const inGrace = graceDays > 0 && now <= graceEnd;
    const remainingDays = inGrace ? Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / 86400000)) : 0;

    return {
      status: inGrace ? "Grace Period" : "Payment Due",
      amountDue: subscription.monthlyFee,
      paymentRequired: true,
      currentBillingPeriod: { start, end: addMonths(start, 1) },
      remainingDays
    };
  }

  const paidAt = latestPayment.paidAt || latestPayment.createdAt;
  const nextBilling = subscription.nextBillingDate ? new Date(subscription.nextBillingDate) : addMonths(paidAt, 1);
  const graceDays = subscription.gracePeriodDays || 0;
  const dueEnd = new Date(nextBilling.getTime() + graceDays * 86400000);

  if (now <= nextBilling) {
    const diff = nextBilling.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(diff / 86400000));
    const status = remainingDays <= 7 ? "Due Soon" : "Active";
    const paymentRequired = remainingDays <= 7;
    return {
      status,
      amountDue: subscription.monthlyFee,
      paymentRequired,
      currentBillingPeriod: { start: paidAt, end: nextBilling },
      remainingDays
    };
  } else if (now <= dueEnd) {
    const diff = dueEnd.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(diff / 86400000));
    return {
      status: "Grace Period",
      amountDue: subscription.monthlyFee,
      paymentRequired: true,
      currentBillingPeriod: { start: paidAt, end: nextBilling },
      remainingDays
    };
  } else {
    return {
      status: "Payment Due",
      amountDue: subscription.monthlyFee,
      paymentRequired: true,
      currentBillingPeriod: { start: paidAt, end: nextBilling },
      remainingDays: 0
    };
  }
}
async function createOrder(res, payment) { try { const c = await getSettingsForReceiver(payment.receiver, payment.purpose, payment.schoolName); if (!c.onlineEnabled) throw Object.assign(new Error("Online payments are currently unavailable"), { status: 409 }); const order = await gateway("POST", "/v1/orders", { amount: payment.amount, currency: payment.currency, receipt: payment._id.toString(), notes: { teachhubPaymentId: payment._id.toString(), purpose: payment.purpose } }, c); payment.razorpayOrderId = order.id; payment.status = "Processing"; await payment.save(); return res.status(201).json({ paymentId: payment._id, razorpayOrderId: order.id, razorpayKeyId: c.keyId, amount: payment.amount, currency: payment.currency }); } catch (e) { await Payment.findByIdAndUpdate(payment._id, { status: "Failed" }); return fail(res, e); } }
async function finish(orderId, paymentId, signature = "") { const payment = await Payment.findOne({ razorpayOrderId: orderId }); if (!payment) throw Object.assign(new Error("Payment record not found"), { status: 404 }); if (payment.status === "Successful") return payment; if (!["Pending", "Processing"].includes(payment.status)) throw Object.assign(new Error("Payment cannot be finalized"), { status: 409 }); const c = await getSettingsForReceiver(payment.receiver, payment.purpose, payment.schoolName); const remote = await gateway("GET", `/v1/payments/${encodeURIComponent(paymentId)}`, null, c); if (remote.order_id !== orderId || remote.amount !== payment.amount || remote.currency !== payment.currency || remote.status !== "captured") throw invalid("Gateway payment verification failed"); const paidAt = new Date(); const updated = await Payment.findOneAndUpdate({ _id: payment._id, status: { $in: ["Pending", "Processing"] } }, { $set: { status: "Successful", razorpayPaymentId: paymentId, razorpaySignature: signature, transactionReference: paymentId, verifiedAt: paidAt, paidAt, receiptNumber: receipt(payment) } }, { new: true }); if (!updated) return Payment.findById(payment._id); if (updated.purpose === "SCHOOL_SUBSCRIPTION") { const s = await SchoolSubscription.findOne({ schoolName: updated.schoolName }); if (s) { const billing = updated.metadata?.billingPeriod; const start = billing?.start ? new Date(billing.start) : new Date(s.nextBillingDate || s.billingStartDate || paidAt); const end = billing?.end ? new Date(billing.end) : addMonths(start, 1); s.nextBillingDate = end; s.currentBillingPeriod = { start, end }; s.status = "Active"; await s.save(); } } return updated; }
async function applyGatewayRefund(refund) {
  if (!refund?.id || !refund.payment_id || !Number.isSafeInteger(refund.amount) || refund.amount < 1) return;
  const payment = await Payment.findOne({ razorpayPaymentId: refund.payment_id });
  if (!payment || payment.refunds.some(item => item.refundId === refund.id)) return;
  const alreadyRefunded = payment.refunds.reduce((sum, item) => sum + item.amount, 0);
  const amount = Math.min(refund.amount, Math.max(0, payment.amount - alreadyRefunded));
  if (!amount) return;
  payment.refunds.push({ refundId: refund.id, amount, reason: String(refund.notes?.reason || "Gateway refund"), refundedAt: refund.created_at ? new Date(refund.created_at * 1000) : new Date() });
  const total = payment.refunds.reduce((sum, item) => sum + item.amount, 0);
  payment.status = total >= payment.amount ? "Refunded" : "Partially Refunded";
  await payment.save();
}

exports.createStudentOrder = async (req, res) => { try { const student = await User.findOne({ _id: req.user.id, role: "student" }); if (!student?.schoolName) throw Object.assign(new Error("Student is not assigned to a school"), { status: 403 }); const [plan, receiver] = await Promise.all([FeePlan.findOne({ schoolName: student.schoolName, active: true }), schoolAdmin(student.schoolName)]); if (!plan || !receiver) throw Object.assign(new Error("School fee payment is not configured"), { status: 409 }); const latestSuccessful = await Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: "Successful" }).sort({ paidAt: -1 }); let remainingDays = 0; if (latestSuccessful) { const validity = plan.validityDays || 30; const paidAt = latestSuccessful.paidAt || latestSuccessful.createdAt; const expiryDate = new Date(paidAt.getTime() + validity * 24 * 60 * 60 * 1000); const diff = expiryDate.getTime() - Date.now(); remainingDays = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000))); } const current = await Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: { $in: ["Pending", "Processing", "PendingVerification"] } }).sort({ createdAt: -1 }); if (current) return res.status(409).json({ message: "School fee payment is already pending verification" }); if (remainingDays > 0) return res.status(409).json({ message: `School fee is already paid. ${remainingDays} days validity remaining.` }); const period = calendarPeriod(); return createOrder(res, await Payment.create({ payer: student._id, receiver: receiver._id, schoolName: student.schoolName, purpose: "STUDENT_SCHOOL_FEE", amount: plan.monthlyFee, currency: plan.currency, gateway: "razorpay", metadata: { billingPeriod: period } })); } catch (e) { fail(res, e); } };
exports.createSubscriptionOrder = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); const subscription = await SchoolSubscription.findOne({ schoolName: admin?.schoolName }); if (!admin?.schoolName || !subscription) throw Object.assign(new Error("Subscription is not configured"), { status: 409 }); const state = await subscriptionState(subscription); if (!state.paymentRequired) return res.status(409).json({ message: state.status === "Free" ? "This school is currently in an authorized free period" : `Subscription is ${state.status}` }); const receiver = await superAdmin(); if (!receiver) throw Object.assign(new Error("Subscription receiver is not configured"), { status: 409 }); return createOrder(res, await Payment.create({ payer: admin._id, receiver: receiver._id, schoolName: admin.schoolName, purpose: "SCHOOL_SUBSCRIPTION", amount: state.amountDue, currency: subscription.currency, gateway: "razorpay", metadata: { billingPeriod: state.currentBillingPeriod } })); } catch (e) { fail(res, e); } };
exports.createTeacherSalaryOrder = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); if (!admin?.schoolName) throw Object.assign(new Error("School administrator is not assigned"), { status: 403 }); const [teacher, pay] = await Promise.all([User.findOne({ _id: req.params.teacherId, role: "teacher", schoolName: admin.schoolName }), TeacherCompensation.findOne({ teacher: req.params.teacherId, schoolName: admin.schoolName, active: true })]); if (!teacher || !pay) throw Object.assign(new Error("Teacher salary configuration was not found"), { status: 404 }); const period = paymentPeriod(pay.paymentCycle); const existing = await Payment.findOne({ receiver: teacher._id, purpose: "TEACHER_SALARY", "metadata.paymentPeriod.key": period.key, status: { $in: ["Pending", "Processing", "PendingVerification", "Successful"] } }).sort({ createdAt: -1 }); if (existing?.status === "Successful" || existing?.status === "PendingVerification") return res.status(409).json({ message: "Teacher payment is already completed or awaiting verification for this payment cycle" }); if (existing?.razorpayOrderId) { const c = await getSettingsForReceiver(existing.receiver, existing.purpose, existing.schoolName); return res.json({ paymentId: existing._id, razorpayOrderId: existing.razorpayOrderId, razorpayKeyId: c.keyId, amount: existing.amount, currency: existing.currency }); } return createOrder(res, await Payment.create({ payer: admin._id, receiver: teacher._id, schoolName: admin.schoolName, purpose: "TEACHER_SALARY", amount: pay.salary, currency: pay.currency, gateway: "razorpay", metadata: { teacher: teacher._id, paymentCycle: pay.paymentCycle, paymentPeriod: period } })); } catch (e) { fail(res, e); } };
exports.verifyCheckout = async (req, res) => { try { const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body; if (!orderId || !paymentId || !signature) throw invalid("Incomplete payment verification data"); const payment = await Payment.findOne({ razorpayOrderId: orderId, payer: req.user.id }); if (!payment) throw Object.assign(new Error("Payment does not belong to the authenticated user"), { status: 403 }); const c = await getSettingsForReceiver(payment.receiver, payment.purpose, payment.schoolName); const expected = crypto.createHmac("sha256", c.keySecret).update(`${orderId}|${paymentId}`).digest("hex"); if (!same(expected, signature)) throw invalid("Payment signature verification failed"); const done = await finish(orderId, paymentId, signature); res.json({ paymentId: done._id, status: done.status, receiptNumber: done.receiptNumber }); } catch (e) { fail(res, e); } };
exports.webhook = async (req, res) => { let delivery; try { const event = JSON.parse(req.body.toString("utf8")); const orderId = event.payload?.payment?.entity?.order_id; const paymentId = event.payload?.payment?.entity?.id || event.payload?.refund?.entity?.payment_id; let paymentObj; if (orderId) { paymentObj = await Payment.findOne({ razorpayOrderId: orderId }); } else if (paymentId) { paymentObj = await Payment.findOne({ razorpayPaymentId: paymentId }); } const c = paymentObj ? await getSettingsForReceiver(paymentObj.receiver, paymentObj.purpose, paymentObj.schoolName) : null; const secret = (c && c.webhookSecret) || process.env.RAZORPAY_WEBHOOK_SECRET; if (!secret) return res.status(503).json({ message: "Webhook is not configured" }); const signature = req.headers["x-razorpay-signature"]; const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex"); if (!same(expected, signature)) return res.status(400).json({ message: "Invalid webhook signature" }); const eventId = String(req.headers["x-razorpay-event-id"] || crypto.createHash("sha256").update(req.body).digest("hex")); delivery = await PaymentWebhookEvent.findOne({ eventId }); if (delivery?.status === "Processed") return res.json({ received: true, duplicate: true }); if (!delivery) { try { delivery = await PaymentWebhookEvent.create({ eventId, eventType: event.event || "unknown", razorpayOrderId: event.payload?.payment?.entity?.order_id || "" }); } catch (duplicate) { if (duplicate?.code !== 11000) throw duplicate; delivery = await PaymentWebhookEvent.findOne({ eventId }); if (delivery?.status === "Processed") return res.json({ received: true, duplicate: true }); } } await PaymentWebhookEvent.updateOne({ _id: delivery._id }, { $set: { status: "Processing", error: "" } }); const p = event.payload?.payment?.entity; if (event.event === "payment.captured" && p?.order_id) await finish(p.order_id, p.id); if (event.event === "payment.failed" && p?.order_id) await Payment.updateOne({ razorpayOrderId: p.order_id, status: { $in: ["Pending", "Processing"] } }, { $set: { status: "Failed" } }); if (["refund.created", "refund.processed"].includes(event.event)) await applyGatewayRefund(event.payload?.refund?.entity); await PaymentWebhookEvent.updateOne({ _id: delivery._id }, { $set: { status: "Processed", processedAt: new Date() } }); res.json({ received: true }); } catch (e) { if (delivery?._id) await PaymentWebhookEvent.updateOne({ _id: delivery._id }, { $set: { status: "Failed", error: String(e.message || "Webhook processing failed").slice(0, 500) } }); console.error("Payment webhook processing failed", e.message); res.status(500).json({ message: "Webhook processing failed" }); } };
exports.createOfflineStudentRequest = async (req, res) => { try { const student = await User.findOne({ _id: req.user.id, role: "student" }); const [plan, receiver] = await Promise.all([FeePlan.findOne({ schoolName: student?.schoolName, active: true }), schoolAdmin(student?.schoolName)]); const mode = await getSettingsForReceiver(receiver?._id, "STUDENT_SCHOOL_FEE", student?.schoolName); if (!mode.offlineEnabled) throw Object.assign(new Error("Offline payments are currently unavailable"), { status: 409 }); const method = String(req.body.method || "").toUpperCase(); if (!["CASH", "BANK_TRANSFER", "MANUAL_UPI", "CHEQUE"].includes(method)) throw invalid("A valid offline payment method is required"); const reference = String(req.body.reference || "").trim(); if (!student?.schoolName || !plan || !receiver) throw Object.assign(new Error("School fee payment is not configured"), { status: 409 }); if (!reference) throw invalid("Payment reference is required"); const latestSuccessful = await Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: "Successful" }).sort({ paidAt: -1 }); let remainingDays = 0; if (latestSuccessful) { const validity = plan.validityDays || 30; const paidAt = latestSuccessful.paidAt || latestSuccessful.createdAt; const expiryDate = new Date(paidAt.getTime() + validity * 24 * 60 * 60 * 1000); const diff = expiryDate.getTime() - Date.now(); remainingDays = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000))); } const current = await Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: { $in: ["Pending", "Processing", "PendingVerification"] } }).sort({ createdAt: -1 }); if (current || remainingDays > 0) throw Object.assign(new Error("A payment already exists or is pending verification"), { status: 409 }); const period = calendarPeriod(); const payment = await Payment.create({ payer: student._id, receiver: receiver._id, schoolName: student.schoolName, purpose: "STUDENT_SCHOOL_FEE", amount: plan.monthlyFee, currency: plan.currency, gateway: "offline", paymentMethod: method, status: "PendingVerification", offlineReference: reference, metadata: { billingPeriod: period } }); res.status(201).json({ paymentId: payment._id, status: payment.status }); } catch (e) { fail(res, e); } };
exports.approveOffline = async (req, res) => { try { const payment = await Payment.findOne({ _id: req.params.id, schoolName: req.user.schoolName, gateway: "offline", status: "PendingVerification" }); if (!payment) throw Object.assign(new Error("Pending offline payment not found"), { status: 404 }); payment.status = "Successful"; payment.verifiedAt = new Date(); payment.paidAt = payment.verifiedAt; payment.receiptNumber = receipt(payment); await payment.save(); await audit(req, payment.purpose === "TEACHER_SALARY" ? "TEACHER_PAYMENT_MARKED_PAID" : "OFFLINE_PAYMENT_APPROVED", { status: "PendingVerification" }, { schoolName: payment.schoolName, status: payment.status, paymentId: payment._id }, String(req.body.reason || "")); res.json({ paymentId: payment._id, status: payment.status, receiptNumber: payment.receiptNumber }); } catch (e) { fail(res, e); } };
exports.rejectOffline = async (req, res) => { try { const payment = await Payment.findOne({ _id: req.params.id, schoolName: req.user.schoolName, gateway: "offline", status: "PendingVerification" }); const reason = String(req.body.reason || "").trim(); if (!payment) throw Object.assign(new Error("Pending offline payment not found"), { status: 404 }); if (!reason) throw invalid("A rejection reason is required"); payment.status = "Failed"; payment.offlineDecisionReason = reason; await payment.save(); await audit(req, "OFFLINE_PAYMENT_REJECTED", { schoolName: payment.schoolName, status: "PendingVerification" }, { schoolName: payment.schoolName, status: payment.status, paymentId: payment._id }, reason); res.json({ paymentId: payment._id, status: payment.status }); } catch (e) { fail(res, e); } };
exports.createOfflineTeacherRequest = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); const [teacher, pay] = await Promise.all([User.findOne({ _id: req.params.teacherId, role: "teacher", schoolName: admin?.schoolName }), TeacherCompensation.findOne({ teacher: req.params.teacherId, schoolName: admin?.schoolName, active: true })]); const mode = await getSettingsForReceiver(teacher?._id, "TEACHER_SALARY", admin?.schoolName); if (!mode.offlineEnabled) throw Object.assign(new Error("Offline payments are currently unavailable"), { status: 409 }); const method = String(req.body.method || "").toUpperCase(); const reference = String(req.body.reference || "").trim(); if (!["CASH", "BANK_TRANSFER", "MANUAL_UPI", "CHEQUE"].includes(method) || !reference) throw invalid("A valid payment method and reference are required"); if (!admin?.schoolName || !teacher || !pay) throw Object.assign(new Error("Teacher salary configuration was not found"), { status: 404 }); const period = paymentPeriod(pay.paymentCycle); const existing = await Payment.exists({ receiver: teacher._id, purpose: "TEACHER_SALARY", "metadata.paymentPeriod.key": period.key, status: { $in: ["Pending", "Processing", "PendingVerification", "Successful"] } }); if (existing) throw Object.assign(new Error("A teacher payment already exists for this payment cycle"), { status: 409 }); const payment = await Payment.create({ payer: admin._id, receiver: teacher._id, schoolName: admin.schoolName, purpose: "TEACHER_SALARY", amount: pay.salary, currency: pay.currency, gateway: "offline", paymentMethod: method, status: "PendingVerification", offlineReference: reference, metadata: { teacher: teacher._id, paymentCycle: pay.paymentCycle, dueDate: pay.dueDate, paymentPeriod: period } }); res.status(201).json({ paymentId: payment._id, status: payment.status }); } catch (e) { fail(res, e); } };
exports.listPayments = async (req, res) => { try { const u = await User.findById(req.user.id); const q = u.role === "superadmin" ? { purpose: "SCHOOL_SUBSCRIPTION" } : u.role === "admin" ? { schoolName: u.schoolName } : u.role === "teacher" ? { receiver: u._id, purpose: "TEACHER_SALARY" } : { payer: u._id }; res.json(await Payment.find(q).populate("payer receiver", "name email role").sort({ createdAt: -1 }).limit(100)); } catch (e) { fail(res, e); } };
exports.getReceipt = async (req, res) => { try { const u = await User.findById(req.user.id); const q = u.role === "superadmin" ? { _id: req.params.id } : u.role === "admin" ? { _id: req.params.id, schoolName: u.schoolName } : { _id: req.params.id, $or: [{ payer: u._id }, { receiver: u._id }] }; const p = await Payment.findOne(q).populate("payer receiver", "name email role"); if (!p || !["Successful", "Refunded", "Partially Refunded"].includes(p.status)) throw Object.assign(new Error("Receipt not found"), { status: 404 }); const data = { receiptNumber: p.receiptNumber, payer: p.payer, receiver: p.receiver, school: p.schoolName, amount: p.amount, currency: p.currency, date: p.paidAt || p.verifiedAt, paymentMethod: p.paymentMethod, transactionId: p.transactionReference || p.razorpayPaymentId || p.offlineReference, purpose: p.purpose, status: p.status }; if (req.query.download === "1") { const formatPurpose = (purp) => { if (purp === "STUDENT_SCHOOL_FEE") return "School Fee"; if (purp === "SCHOOL_SUBSCRIPTION") return "School Subscription"; if (purp === "TEACHER_SALARY") return "Teacher Salary"; return purp.replaceAll("_", " "); }; const rows = [["Receipt", data.receiptNumber], ["Payer", data.payer?.name], ["Receiver", data.receiver?.name], ["School", data.school], ["Amount", `${data.currency} ${(data.amount / 100).toFixed(2)}`], ["Date", data.date ? new Date(data.date).toLocaleString("en-IN") : ""], ["Method", data.paymentMethod], ["Transaction ID", data.transactionId], ["Purpose", formatPurpose(data.purpose)], ["Status", data.status]].map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join(""); res.set({ "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename=receipt-${p.receiptNumber}.html` }); return res.send(`<!doctype html><html><head><title>Receipt ${escapeHtml(p.receiptNumber)}</title><style>body{font-family:Arial;margin:40px;color:#172033}table{border-collapse:collapse;width:100%;max-width:650px}th,td{border:1px solid #dbe1ea;padding:12px;text-align:left}th{width:35%;background:#f5f3ff}h1{color:#5b21b6}</style></head><body><h1>TeachHub Payment Receipt</h1><table>${rows}</table></body></html>`); } res.json(data); } catch (e) { fail(res, e); } };
exports.getSettings = async (req, res) => {
  try {
    let query = { userId: req.user.id };
    if (req.user.role === "admin" && req.user.schoolName) {
      query = { role: "admin", schoolName: new RegExp("^" + escapeRegexStr(req.user.schoolName) + "$", "i") };
    } else if (req.user.role === "superadmin") {
      query = { role: "superadmin" };
    }

    let s = await PaymentSettings.findOne(query).select("+razorpayKeySecret +liveRazorpayKeySecret +testRazorpayKeySecret");
    if (!s && req.user.role === "superadmin") {
      s = await PaymentSettings.create({
        userId: req.user.id,
        role: req.user.role,
        environment: "test",
        onlineEnabled: true,
        offlineEnabled: true,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
        razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || ""
      });
    }
    if (!s) {
      return res.json({
        gateway: "razorpay",
        environment: "test",
        onlineEnabled: false,
        offlineEnabled: true,
        keyId: "",
        secretConfigured: false,
        testKeyId: "",
        testSecretConfigured: false,
        liveKeyId: "",
        liveSecretConfigured: false
      });
    }

    const testKeyId = s.testRazorpayKeyId || (s.environment === "test" ? s.razorpayKeyId : "");
    const testSecretConfigured = Boolean(s.testRazorpayKeySecret || (s.environment === "test" && s.razorpayKeySecret));
    const liveKeyId = s.liveRazorpayKeyId || (s.environment === "live" ? s.razorpayKeyId : "");
    const liveSecretConfigured = Boolean(s.liveRazorpayKeySecret || (s.environment === "live" && s.razorpayKeySecret));

    const activeKeyId = s.environment === "live"
      ? (liveKeyId || s.razorpayKeyId || "")
      : (testKeyId || s.razorpayKeyId || "");
    const activeSecretConfigured = s.environment === "live"
      ? (liveSecretConfigured || Boolean(s.razorpayKeySecret))
      : (testSecretConfigured || Boolean(s.razorpayKeySecret));

    res.json({
      gateway: "razorpay",
      environment: s.environment,
      onlineEnabled: s.onlineEnabled,
      offlineEnabled: s.offlineEnabled,
      keyId: activeKeyId,
      secretConfigured: activeSecretConfigured,
      testKeyId,
      testSecretConfigured,
      liveKeyId,
      liveSecretConfigured
    });
  } catch (e) {
    fail(res, e);
  }
};
exports.getPaymentOptions = async (req, res) => { try { let schoolName = req.user.schoolName; let purpose = "OTHER"; if (req.user.role === "student") { const student = await User.findOne({ _id: req.user.id, role: "student" }); schoolName = student?.schoolName || ""; purpose = "STUDENT_SCHOOL_FEE"; } const c = await getSettingsForReceiver(null, purpose, schoolName); res.json({ onlineEnabled: Boolean(c.onlineEnabled), offlineEnabled: Boolean(c.offlineEnabled), available: Boolean(c.onlineEnabled || c.offlineEnabled) }); } catch (e) { fail(res, e); } };
exports.updateSettings = async (req, res) => {
  try {
    if (!["test", "live"].includes(req.body.environment)) throw invalid("Invalid payment environment");
    const onlineEnabled = req.body.onlineEnabled !== false, offlineEnabled = req.body.offlineEnabled !== false;
    if (!onlineEnabled && !offlineEnabled) throw invalid("At least one payment mode must be enabled");

    let query = { userId: req.user.id };
    if (req.user.role === "admin" && req.user.schoolName) {
      query = { role: "admin", schoolName: new RegExp("^" + escapeRegexStr(req.user.schoolName) + "$", "i") };
    } else if (req.user.role === "superadmin") {
      query = { role: "superadmin" };
    }

    const old = await PaymentSettings.findOne(query).select("+razorpayKeySecret +liveRazorpayKeySecret +testRazorpayKeySecret").lean();
    const isLive = req.body.environment === "live";

    const updateData = {
      userId: req.user.id,
      environment: req.body.environment,
      onlineEnabled,
      offlineEnabled,
      role: req.user.role,
      schoolName: req.user.schoolName || "",
      updatedBy: req.user.id
    };

    if (req.body.razorpayKeyId !== undefined) {
      updateData.razorpayKeyId = req.body.razorpayKeyId;
      if (isLive) {
        updateData.liveRazorpayKeyId = req.body.razorpayKeyId;
      } else {
        updateData.testRazorpayKeyId = req.body.razorpayKeyId;
      }
    }

    if (req.body.razorpayKeySecret) {
      updateData.razorpayKeySecret = req.body.razorpayKeySecret;
      if (isLive) {
        updateData.liveRazorpayKeySecret = req.body.razorpayKeySecret;
      } else {
        updateData.testRazorpayKeySecret = req.body.razorpayKeySecret;
      }
    }

    if (req.body.razorpayWebhookSecret) {
      updateData.razorpayWebhookSecret = req.body.razorpayWebhookSecret;
    }

    const s = await PaymentSettings.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    ).select("+razorpayKeySecret +liveRazorpayKeySecret +testRazorpayKeySecret");

    if (req.user.role === "admin" && req.user.schoolName) {
      await PaymentSettings.deleteMany({
        role: "admin",
        schoolName: new RegExp("^" + escapeRegexStr(req.user.schoolName) + "$", "i"),
        _id: { $ne: s._id }
      });
    }

    await audit(req, "PAYMENT_SETTINGS_CHANGED", old, s.toObject());

    const testKeyId = s.testRazorpayKeyId || (s.environment === "test" ? s.razorpayKeyId : "");
    const testSecretConfigured = Boolean(s.testRazorpayKeySecret || (s.environment === "test" && s.razorpayKeySecret));
    const liveKeyId = s.liveRazorpayKeyId || (s.environment === "live" ? s.razorpayKeyId : "");
    const liveSecretConfigured = Boolean(s.liveRazorpayKeySecret || (s.environment === "live" && s.razorpayKeySecret));

    const activeKeyId = isLive ? (liveKeyId || s.razorpayKeyId || "") : (testKeyId || s.razorpayKeyId || "");
    const activeSecretConfigured = isLive
      ? (liveSecretConfigured || Boolean(s.razorpayKeySecret))
      : (testSecretConfigured || Boolean(s.razorpayKeySecret));

    res.json({
      gateway: s.gateway,
      environment: s.environment,
      onlineEnabled: s.onlineEnabled,
      offlineEnabled: s.offlineEnabled,
      keyId: activeKeyId,
      secretConfigured: activeSecretConfigured,
      testKeyId,
      testSecretConfigured,
      liveKeyId,
      liveSecretConfigured
    });
  } catch (e) {
    fail(res, e);
  }
};
exports.setFeePlan = async (req, res) => { try { const monthlyFee = Number(req.body.monthlyFee), validityDays = Number(req.body.validityDays || 30); if (!Number.isSafeInteger(monthlyFee) || monthlyFee < 1) throw invalid("Fee must be a positive integer in paise"); if (!Number.isSafeInteger(validityDays) || validityDays < 1) throw invalid("Validity period must be a positive integer of days"); const old = await FeePlan.findOne({ schoolName: req.user.schoolName }).lean(); const plan = await FeePlan.findOneAndUpdate({ schoolName: req.user.schoolName }, { $set: { monthlyFee, validityDays, active: req.body.active !== false, updatedBy: req.user.id } }, { new: true, upsert: true }); await audit(req, "STUDENT_FEE_CHANGED", old, plan.toObject()); res.json(plan); } catch (e) { fail(res, e); } };
exports.getFeePlan = async (req, res) => { try { res.json(await FeePlan.findOne({ schoolName: req.user.schoolName }).select("monthlyFee validityDays currency active updatedAt") || null); } catch (e) { fail(res, e); } };
exports.getMyCompensation = async (req, res) => { try { const teacher = await User.findOne({ _id: req.user.id, role: "teacher" }); if (!teacher?.schoolName) throw Object.assign(new Error("Teacher is not assigned to a school"), { status: 403 }); res.json(await TeacherCompensation.findOne({ teacher: teacher._id, schoolName: teacher.schoolName, active: true }).select("salary currency paymentCycle dueDate updatedAt") || null); } catch (e) { fail(res, e); } };
exports.listTeacherCompensations = async (req, res) => { try { res.json(await TeacherCompensation.find({ schoolName: req.user.schoolName }).populate("teacher", "name email").sort({ updatedAt: -1 })); } catch (e) { fail(res, e); } };
exports.getStudentFeePlan = async (req, res) => { try { const student = await User.findOne({ _id: req.user.id, role: "student" }); if (!student?.schoolName) throw Object.assign(new Error("Student is not assigned to a school"), { status: 403 }); res.json(await FeePlan.findOne({ schoolName: student.schoolName }).select("monthlyFee validityDays currency active updatedAt") || null); } catch (e) { fail(res, e); } };
exports.getStudentPaymentSummary = async (req, res) => { try { const student = await User.findOne({ _id: req.user.id, role: "student" }); if (!student?.schoolName) throw Object.assign(new Error("Student is not assigned to a school"), { status: 403 }); const period = calendarPeriod(); const [plan, latestSuccessful, current, successfulPayments] = await Promise.all([FeePlan.findOne({ schoolName: student.schoolName, active: true }).select("monthlyFee validityDays currency active updatedAt"), Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: "Successful" }).sort({ paidAt: -1 }), Payment.findOne({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", "metadata.billingPeriod.key": period.key }).sort({ createdAt: -1 }).select("amount currency status verifiedAt createdAt receiptNumber"), Payment.find({ payer: student._id, purpose: "STUDENT_SCHOOL_FEE", status: "Successful" }).select("amount")]); const totalPaid = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0); let remainingDays = 0; let dueDate = period.end; let paymentAvailable = Boolean(plan?.active); if (latestSuccessful) { const validity = plan?.validityDays || 30; const paidAt = latestSuccessful.paidAt || latestSuccessful.createdAt; const expiryDate = new Date(paidAt.getTime() + validity * 24 * 60 * 60 * 1000); const diff = expiryDate.getTime() - Date.now(); remainingDays = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000))); dueDate = expiryDate; } const isLocked = (current && current.status === "PendingVerification") || (remainingDays > 0); if (isLocked) { paymentAvailable = false; } const paymentStatus = (!plan || !plan.active) ? "Not Configured" : (current && ["PendingVerification", "Processing"].includes(current.status)) ? current.status : remainingDays > 0 ? "Successful" : "Pending"; res.json({ currentFee: plan?.monthlyFee || 0, currency: plan?.currency || "INR", validityDays: plan?.validityDays || 30, remainingDays, paymentAvailable, paymentStatus, dueDate, currentBillingPeriod: period, lastPayment: latestSuccessful || null, totalPaid, nextPayment: plan ? { amount: plan.monthlyFee, dueDate } : null }); } catch (e) { fail(res, e); } };
exports.getStudentDashboard = async (req, res) => { try { const schoolName = req.user.schoolName; const userId = req.user.id; if (!schoolName) throw Object.assign(new Error("Student is not assigned to a school"), { status: 403 }); const period = calendarPeriod(); const [plan, payments, settings] = await Promise.all([FeePlan.findOne({ schoolName, active: true }).select("monthlyFee validityDays currency active updatedAt").lean(), Payment.find({ payer: userId }).populate("payer receiver", "name email role").sort({ createdAt: -1 }).limit(100).lean(), getSettingsForReceiver(null, "STUDENT_SCHOOL_FEE", schoolName)]); const options = { onlineEnabled: Boolean(settings.onlineEnabled), offlineEnabled: Boolean(settings.offlineEnabled), available: Boolean(settings.onlineEnabled || settings.offlineEnabled) }; const successfulPayments = payments.filter(p => p.purpose === "STUDENT_SCHOOL_FEE" && p.status === "Successful"); const latestSuccessful = successfulPayments[0] || null; const current = payments.find(p => p.purpose === "STUDENT_SCHOOL_FEE" && p.metadata?.billingPeriod?.key === period.key); const totalPaid = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0); let remainingDays = 0; let dueDate = period.end; let paymentAvailable = Boolean(plan?.active); if (latestSuccessful) { const validity = plan?.validityDays || 30; const paidAt = latestSuccessful.paidAt || latestSuccessful.createdAt; const expiryDate = new Date(new Date(paidAt).getTime() + validity * 24 * 60 * 60 * 1000); const diff = expiryDate.getTime() - Date.now(); remainingDays = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000))); dueDate = expiryDate; } const isLocked = (current && current.status === "PendingVerification") || (remainingDays > 0); if (isLocked) { paymentAvailable = false; } const paymentStatus = (!plan || !plan.active) ? "Not Configured" : (current && ["PendingVerification", "Processing"].includes(current.status)) ? current.status : remainingDays > 0 ? "Successful" : "Pending"; const summary = { currentFee: plan?.monthlyFee || 0, currency: plan?.currency || "INR", validityDays: plan?.validityDays || 30, remainingDays, paymentAvailable, paymentStatus, dueDate, currentBillingPeriod: period, lastPayment: latestSuccessful || null, totalPaid, nextPayment: plan ? { amount: plan.monthlyFee, dueDate } : null }; res.json({ plan, options, summary, payments }); } catch (e) { fail(res, e); } };
exports.setTeacherCompensation = async (req, res) => { try { const salary = Number(req.body.salary), paymentCycle = req.body.paymentCycle || "MONTHLY", dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null; const teacher = await User.findOne({ _id: req.params.teacherId, role: "teacher", schoolName: req.user.schoolName }); if (!teacher || !Number.isSafeInteger(salary) || salary < 1 || !["MONTHLY", "WEEKLY", "ONE_TIME"].includes(paymentCycle) || (dueDate && Number.isNaN(+dueDate))) throw invalid("Valid teacher salary, payment cycle and due date are required"); const old = await TeacherCompensation.findOne({ teacher: teacher._id, schoolName: req.user.schoolName }).lean(); const pay = await TeacherCompensation.findOneAndUpdate({ teacher: teacher._id, schoolName: req.user.schoolName }, { $set: { salary, paymentCycle, dueDate, active: req.body.active !== false, updatedBy: req.user.id } }, { new: true, upsert: true }); await audit(req, "TEACHER_SALARY_CHANGED", old, pay.toObject()); res.json(pay); } catch (e) { fail(res, e); } };
exports.setSubscription = async (req, res) => {
  try {
    const schoolName = String(req.params.schoolName || "").trim();
    const monthlyFee = Number(req.body.monthlyFee);
    const gracePeriodDays = Number(req.body.gracePeriodDays || 0);

    if (!schoolName || !Number.isSafeInteger(monthlyFee) || monthlyFee < 1 || !Number.isInteger(gracePeriodDays) || gracePeriodDays < 0 || gracePeriodDays > 90) {
      throw invalid("Valid school, monthly fee and grace period are required");
    }
    if (!await School.exists({ name: schoolName })) {
      throw Object.assign(new Error("School not found"), { status: 404 });
    }

    const old = await SchoolSubscription.findOne({ schoolName }).lean();
    const billingStartDate = req.body.billingStartDate ? new Date(req.body.billingStartDate) : (old?.billingStartDate || new Date());
    if (Number.isNaN(+billingStartDate)) throw invalid("Invalid billing start date");

    const hasPaid = await Payment.exists({ schoolName, purpose: "SCHOOL_SUBSCRIPTION", status: "Successful" });

    const calculatedNextBilling = hasPaid
      ? (old?.nextBillingDate && !Number.isNaN(new Date(old.nextBillingDate).getTime()) && new Date(old.nextBillingDate) > billingStartDate ? old.nextBillingDate : addMonths(billingStartDate, 1))
      : billingStartDate;

    const initialStatus = req.body.status === "Suspended" ? "Suspended" : (hasPaid ? "Active" : "Payment Due");

    const sub = await SchoolSubscription.findOneAndUpdate(
      { schoolName },
      {
        $set: {
          monthlyFee,
          billingStartDate,
          nextBillingDate: calculatedNextBilling,
          gracePeriodDays,
          status: initialStatus,
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    await audit(req, "SUBSCRIPTION_CHANGED", old, sub.toObject());
    res.json({ subscription: sub, billing: await subscriptionState(sub) });
  } catch (e) {
    fail(res, e);
  }
};
exports.changeSubscriptionStatus = async (req, res) => { try { const status = String(req.body.status || ""); if (!["Suspended", "Cancelled", "Payment Due", "Active"].includes(status)) throw invalid("Invalid subscription status"); const sub = await SchoolSubscription.findOne({ schoolName: req.params.schoolName }); if (!sub) throw Object.assign(new Error("Subscription not found"), { status: 404 }); const previous = sub.toObject(); sub.status = status; sub.updatedBy = req.user.id; if (status === "Suspended") sub.suspendedAt = new Date(); if (status === "Active") sub.reactivatedAt = new Date(); await sub.save(); await audit(req, status === "Suspended" ? "SUBSCRIPTION_SUSPENDED" : status === "Active" ? "SUBSCRIPTION_REACTIVATED" : "SUBSCRIPTION_STATUS_CHANGED", previous, sub.toObject(), String(req.body.reason || "")); res.json({ subscription: sub, billing: await subscriptionState(sub) }); } catch (e) { fail(res, e); } };
exports.grantFreePeriod = async (req, res) => { try { const startDate = new Date(req.body.startDate || Date.now()); startDate.setUTCHours(0, 0, 0, 0); const days = Number(req.body.days); const endDate = req.body.endDate ? new Date(req.body.endDate) : new Date(startDate.getTime() + (Number.isInteger(days) && days > 0 ? days - 1 : 0) * 86400000); endDate.setUTCHours(23, 59, 59, 999); if (Number.isNaN(+startDate) || Number.isNaN(+endDate) || endDate < startDate || (!req.body.endDate && (!Number.isInteger(days) || days < 1))) throw invalid("Provide a valid duration or custom free-period start and end date"); const subscription = await SchoolSubscription.findOne({ schoolName: req.params.schoolName }); if (!subscription) throw Object.assign(new Error("Subscription not found"), { status: 404 }); const type = String(req.body.type || "OTHER"); if (!["FREE_TRIAL", "PROMOTIONAL", "COMPENSATION", "SPECIAL_OFFER", "OTHER"].includes(type)) throw invalid("Invalid free-period type"); const period = await FreePeriod.create({ schoolName: subscription.schoolName, type, startDate, endDate, reason: String(req.body.reason || ""), note: String(req.body.note || ""), grantedBy: req.user.id }); await audit(req, "FREE_PERIOD_GRANTED", null, period.toObject(), period.reason); res.status(201).json(period); } catch (e) { fail(res, e); } };
exports.cancelFreePeriod = async (req, res) => { try { const period = await FreePeriod.findOne({ _id: req.params.id, status: "Active" }); if (!period) throw Object.assign(new Error("Active free period not found"), { status: 404 }); period.status = "Cancelled"; period.cancelledAt = new Date(); period.cancelledBy = req.user.id; await period.save(); await audit(req, "FREE_PERIOD_CANCELLED", { schoolName: period.schoolName, status: "Active" }, period.toObject(), String(req.body.reason || "")); res.json(period); } catch (e) { fail(res, e); } };
exports.getSubscriptionStatus = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); const s = await SchoolSubscription.findOne({ schoolName: admin?.schoolName }); if (!s) throw Object.assign(new Error("Subscription is not configured"), { status: 404 }); res.json({ subscription: s, billing: await subscriptionState(s) }); } catch (e) { fail(res, e); } };
exports.listSubscriptions = async (req, res) => { try { const subscriptions = await SchoolSubscription.find().sort({ schoolName: 1 }).lean(); const result = await Promise.all(subscriptions.map(async subscription => ({ subscription, billing: await subscriptionState(subscription), freePeriods: await FreePeriod.find({ schoolName: subscription.schoolName }).sort({ startDate: -1 }).limit(20).lean() }))); res.json(result); } catch (e) { fail(res, e); } };
exports.listAuditLogs = async (req, res) => { try { res.json(await PaymentAuditLog.find().populate("actor", "name email role").sort({ createdAt: -1 }).limit(200)); } catch (e) { fail(res, e); } };
exports.refundPayment = async (req, res) => { try { const payment = await Payment.findById(req.params.id); const amount = Number(req.body.amount); if (!payment || !["Successful", "Partially Refunded"].includes(payment.status) || !payment.razorpayPaymentId) throw Object.assign(new Error("Only refundable online payments can be refunded"), { status: 404 }); const alreadyRefunded = payment.refunds.reduce((sum, item) => sum + item.amount, 0); if (!Number.isSafeInteger(amount) || amount < 1 || amount > payment.amount - alreadyRefunded) throw invalid("Invalid refund amount"); const c = await getSettingsForReceiver(payment.receiver, payment.purpose, payment.schoolName); const refund = await gateway("POST", `/v1/payments/${encodeURIComponent(payment.razorpayPaymentId)}/refund`, { amount, notes: { reason: String(req.body.reason || "") } }, c); payment.refunds.push({ refundId: refund.id, amount, reason: String(req.body.reason || ""), refundedAt: new Date(), initiatedBy: req.user.id }); const total = payment.refunds.reduce((sum, item) => sum + item.amount, 0); payment.status = total >= payment.amount ? "Refunded" : "Partially Refunded"; await payment.save(); await audit(req, "REFUND_INITIATED", { schoolName: payment.schoolName, status: "Successful" }, { schoolName: payment.schoolName, status: payment.status, paymentId: payment._id, amount }, String(req.body.reason || "")); res.json({ paymentId: payment._id, status: payment.status, refundId: refund.id }); } catch (e) { fail(res, e); } };
exports.dashboard = async (req, res) => { try {
  const u = await User.findById(req.user.id); if (!u) throw Object.assign(new Error("User not found"), { status: 401 });
  const q = u.role === "superadmin" ? { purpose: "SCHOOL_SUBSCRIPTION" } : u.role === "admin" ? { schoolName: u.schoolName } : u.role === "teacher" ? { receiver: u._id, purpose: "TEACHER_SALARY" } : { payer: u._id, purpose: "STUDENT_SCHOOL_FEE" };
  const payments = await Payment.find(q).sort({ createdAt: -1 }); const successful = payments.filter(p => p.status === "Successful");
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthly = successful.filter(p => (p.paidAt || p.verifiedAt || p.createdAt) >= monthStart);
  const base = { totalReceived: successful.reduce((sum, p) => sum + p.amount, 0), monthlyReceived: monthly.reduce((sum, p) => sum + p.amount, 0), pendingPayments: payments.filter(p => ["Pending", "Processing", "PendingVerification"].includes(p.status)).length, paymentCount: payments.length, recentPayments: payments.slice(0, 10) };
  if (u.role === "superadmin") {
    const subscriptions = await SchoolSubscription.find(); const billed = await Promise.all(subscriptions.map(async sub => ({ sub, state: await subscriptionState(sub) })));
    const freePeriodsEndingSoon = await FreePeriod.find({ status: "Active", endDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) } }).sort({ endDate: 1 }).limit(20);
    return res.json({ ...base, totalRevenue: base.totalReceived, monthlyRevenue: base.monthlyReceived, activeSchools: billed.filter(x => x.state.status === "Active").length, freeSchools: billed.filter(x => x.state.status === "Free").length, dueSchools: billed.filter(x => ["Due Soon", "Payment Due", "Grace Period"].includes(x.state.status)).length, suspendedSchools: billed.filter(x => x.state.status === "Suspended").length, upcomingPayments: billed.filter(x => x.state.paymentRequired).map(x => ({ schoolName: x.sub.schoolName, amount: x.state.amountDue, dueDate: x.state.currentBillingPeriod.start, status: x.state.status })), freePeriodsEndingSoon });
  }
  if (u.role === "admin") {
    const students = await User.find({ schoolName: u.schoolName, role: "student" }).select("_id"); const paidStudentIds = new Set(successful.filter(p => p.purpose === "STUDENT_SCHOOL_FEE").map(p => String(p.payer)));
    return res.json({ ...base, pendingStudentPayments: payments.filter(p => p.purpose === "STUDENT_SCHOOL_FEE" && ["Pending", "Processing", "PendingVerification"].includes(p.status)).length, teacherPayments: payments.filter(p => p.purpose === "TEACHER_SALARY"), paidStudents: students.filter(s => paidStudentIds.has(String(s._id))).length, unpaidStudents: students.filter(s => !paidStudentIds.has(String(s._id))).length });
  }
  if (u.role === "teacher") { const compensation = await TeacherCompensation.findOne({ teacher: u._id, schoolName: u.schoolName, active: true }); return res.json({ ...base, currentPayment: compensation ? { amount: compensation.salary, currency: compensation.currency, dueDate: compensation.dueDate, paymentCycle: compensation.paymentCycle } : null, pendingPayment: payments.find(p => ["Pending", "Processing", "PendingVerification"].includes(p.status)) || null, lastPayment: successful[0] || null }); }
  const plan = await FeePlan.findOne({ schoolName: u.schoolName, active: true }); return res.json({ ...base, currentFee: plan?.monthlyFee || 0, paymentStatus: payments[0]?.status || "Pending", lastPayment: successful[0] || null, nextPayment: plan ? { amount: plan.monthlyFee, dueDate: addMonths(successful[0]?.paidAt || new Date(), 1) } : null });
} catch (e) { fail(res, e); } };
exports.cancelProcessingPayment = async (req, res) => { try { const payment = await Payment.findOne({ payer: req.user.id, purpose: "STUDENT_SCHOOL_FEE", status: "Processing" }).sort({ createdAt: -1 }); if (payment) { payment.status = "Failed"; await payment.save(); return res.json({ success: true, paymentId: payment._id }); } res.json({ success: false, message: "No processing payment found" }); } catch (e) { fail(res, e); } };
exports.markStudentFeePaidDirectly = async (req, res) => { try { const admin = await User.findOne({ _id: req.user.id, role: "admin" }); if (!admin?.schoolName) throw Object.assign(new Error("Admin is not assigned to a school"), { status: 403 }); const student = await User.findOne({ _id: req.params.studentId, role: "student", schoolName: admin.schoolName }); if (!student) throw Object.assign(new Error("Student not found"), { status: 404 }); const plan = await FeePlan.findOne({ schoolName: admin.schoolName, active: true }); if (!plan) throw Object.assign(new Error("School fee plan is not configured"), { status: 409 }); const period = calendarPeriod(); const paidAt = new Date(); const payment = await Payment.create({ payer: student._id, receiver: admin._id, schoolName: admin.schoolName, purpose: "STUDENT_SCHOOL_FEE", amount: plan.monthlyFee, currency: plan.currency, gateway: "offline", paymentMethod: "CASH", status: "Successful", paidAt, verifiedAt: paidAt, receiptNumber: receipt({ _id: new mongoose.Types.ObjectId() }), metadata: { billingPeriod: period } }); await audit(req, "OFFLINE_PAYMENT_APPROVED", null, { schoolName: payment.schoolName, status: payment.status, paymentId: payment._id }); res.status(201).json(payment); } catch (e) { fail(res, e); } };
exports.verifyPaymentStatusDirectly = async (req, res) => { try { const payment = await Payment.findById(req.params.id); if (!payment) throw Object.assign(new Error("Payment record not found"), { status: 404 }); const u = await User.findById(req.user.id); if (u.role !== "superadmin" && String(payment.payer) !== String(u._id) && String(payment.receiver) !== String(u._id)) { throw Object.assign(new Error("Unauthorized to verify this payment"), { status: 403 }); } if (payment.status === "Successful") { return res.json({ status: "Successful", receiptNumber: payment.receiptNumber }); } if (payment.gateway !== "razorpay" || !payment.razorpayOrderId) { throw Object.assign(new Error("Only online Razorpay payments can be verified directly"), { status: 400 }); } const c = await getSettingsForReceiver(payment.receiver, payment.purpose, payment.schoolName); const result = await gateway("GET", `/v1/orders/${encodeURIComponent(payment.razorpayOrderId)}/payments`, null, c); const successfulPayment = result.items?.find(p => p.status === "captured"); if (successfulPayment) { const done = await finish(payment.razorpayOrderId, successfulPayment.id, ""); return res.json({ status: "Successful", receiptNumber: done.receiptNumber }); } const failedPayment = result.items?.find(p => p.status === "failed"); if (failedPayment && result.items.length === 1) { payment.status = "Failed"; await payment.save(); return res.json({ status: "Failed", message: "Payment was failed by Razorpay" }); } res.json({ status: payment.status, message: "No successful payment detected on Razorpay yet" }); } catch (e) { fail(res, e); } };
