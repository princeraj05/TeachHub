const mongoose = require("mongoose");
const feePlanSchema = new mongoose.Schema({ schoolName: { type: String, unique: true, required: true, index: true }, monthlyFee: { type: Number, required: true, min: 1 }, validityDays: { type: Number, default: 30, min: 1 }, currency: { type: String, default: "INR" }, active: { type: Boolean, default: true }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } }, { timestamps: true });
module.exports = mongoose.model("FeePlan", feePlanSchema);
