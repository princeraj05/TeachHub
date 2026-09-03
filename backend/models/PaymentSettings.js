const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["superadmin", "admin", "teacher"], required: true },
  schoolName: { type: String, default: "", index: true },
  gateway: { type: String, enum: ["razorpay"], default: "razorpay" },
  environment: { type: String, enum: ["test", "live"], default: "test" },
  onlineEnabled: { type: Boolean, default: true },
  offlineEnabled: { type: Boolean, default: true },
  razorpayKeyId: { type: String, default: "" },
  razorpayKeySecret: { type: String, default: "", select: false },
  razorpayWebhookSecret: { type: String, default: "", select: false },
  testRazorpayKeyId: { type: String, default: "" },
  testRazorpayKeySecret: { type: String, default: "", select: false },
  liveRazorpayKeyId: { type: String, default: "" },
  liveRazorpayKeySecret: { type: String, default: "", select: false },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

module.exports = mongoose.model("PaymentSettings", schema);
