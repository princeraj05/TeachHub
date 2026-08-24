const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, role: { type: String, required: true }, schoolName: { type: String, default: "" },
  action: { type: String, required: true, index: true }, previousValue: mongoose.Schema.Types.Mixed, newValue: mongoose.Schema.Types.Mixed,
  reason: { type: String, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("PaymentAuditLog", schema);
