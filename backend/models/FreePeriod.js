const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  schoolName: { type: String, required: true, index: true },
  type: { type: String, enum: ["FREE_TRIAL", "PROMOTIONAL", "COMPENSATION", "SPECIAL_OFFER", "OTHER"], required: true },
  startDate: { type: Date, required: true }, endDate: { type: Date, required: true },
  reason: { type: String, trim: true, maxlength: 500, default: "" }, note: { type: String, trim: true, maxlength: 1000, default: "" },
  grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Active", "Cancelled"], default: "Active" }, cancelledAt: Date, cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
schema.index({ schoolName: 1, startDate: 1, endDate: 1, status: 1 });
module.exports = mongoose.model("FreePeriod", schema);
