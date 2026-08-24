const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  payerRole: { type: String, enum: ["superadmin", "admin", "teacher", "student"], default: null },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  receiverRole: { type: String, enum: ["superadmin", "admin", "teacher", "student"], default: null },
  schoolName: { type: String, required: true, index: true },
  purpose: { type: String, enum: ["STUDENT_SCHOOL_FEE", "SCHOOL_SUBSCRIPTION", "TEACHER_SALARY", "OTHER"], required: true },
  amount: { type: Number, required: true, min: 1 }, // smallest currency unit (paise)
  currency: { type: String, enum: ["INR"], default: "INR" },
  gateway: { type: String, enum: ["razorpay", "offline"], required: true },
  paymentMethod: { type: String, enum: ["ONLINE", "CASH", "BANK_TRANSFER", "MANUAL_UPI", "CHEQUE"], default: "ONLINE" },
  status: { type: String, enum: ["Pending", "Processing", "PendingVerification", "Successful", "Failed", "Cancelled", "Refunded", "Partially Refunded"], default: "Pending", index: true },
  razorpayOrderId: { type: String, unique: true, sparse: true, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  razorpaySignature: { type: String, select: false, default: "" },
  receiptNumber: { type: String, unique: true, sparse: true },
  offlineReference: { type: String, trim: true, maxlength: 120, default: "" },
  offlineDecisionReason: { type: String, trim: true, maxlength: 500, default: "" },
  transactionReference: { type: String, trim: true, maxlength: 120, default: "" },
  refunds: [{ refundId: String, amount: { type: Number, min: 1 }, reason: { type: String, maxlength: 500 }, refundedAt: Date, initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
  verifiedAt: { type: Date, default: null },
  paidAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
paymentSchema.index({ schoolName: 1, purpose: 1, status: 1, createdAt: -1 });
paymentSchema.pre("validate", async function fillParties() {
  if (this.payerRole && (!this.receiver || this.receiverRole)) return;
  const User = mongoose.model("User");
  const users = await User.find({ _id: { $in: [this.payer, this.receiver].filter(Boolean) } }).select("_id role").lean();
  const payer = users.find(user => String(user._id) === String(this.payer));
  const receiver = users.find(user => this.receiver && String(user._id) === String(this.receiver));
  if (!this.payerRole && payer) this.payerRole = payer.role;
  if (!this.receiverRole && receiver) this.receiverRole = receiver.role;
});
module.exports = mongoose.model("Payment", paymentSchema);
