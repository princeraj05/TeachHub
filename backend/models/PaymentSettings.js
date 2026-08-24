const mongoose = require("mongoose");
const schema = new mongoose.Schema({ gateway: { type: String, enum: ["razorpay"], default: "razorpay" }, environment: { type: String, enum: ["test", "live"], default: "test" }, onlineEnabled: { type: Boolean, default: true }, offlineEnabled: { type: Boolean, default: true }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } }, { timestamps: true });
module.exports = mongoose.model("PaymentSettings", schema);
