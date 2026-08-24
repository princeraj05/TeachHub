const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  schoolName: { type: String, required: true, index: true },
  purpose: { type: String, enum: ["STUDENT_SCHOOL_FEE", "SCHOOL_SUBSCRIPTION", "TEACHER_SALARY"], required: true },
  amount: { type: Number, required: true, min: 1 }, // smallest currency unit (paise)
  currency: { type: String, enum: ["INR"], default: "INR" },
  gateway: { type: String, enum: ["razorpay", "offline"], required: true },
  status: { type: String, enum: ["Pending", "Processing", "PendingVerification", "Successful", "Failed", "Cancelled", "Refunded"], default: "Pending", index: true },
  razorpayOrderId: { type: String, unique: true, sparse: true, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  receiptNumber: { type: String, unique: true, sparse: true },
  offlineReference: { type: String, trim: true, maxlength: 120, default: "" },
  verifiedAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
paymentSchema.index({ schoolName: 1, purpose: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("Payment", paymentSchema);
