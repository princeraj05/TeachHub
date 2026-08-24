const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { type: String, required: true },
  razorpayOrderId: { type: String, default: "" },
  processedAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model("PaymentWebhookEvent", schema);
