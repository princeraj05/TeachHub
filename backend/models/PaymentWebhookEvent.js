const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { type: String, required: true },
  razorpayOrderId: { type: String, default: "" },
  status: { type: String, enum: ["Processing", "Processed", "Failed"], default: "Processing", index: true },
  error: { type: String, default: "" },
  processedAt: { type: Date, default: null }
}, { timestamps: true });
module.exports = mongoose.model("PaymentWebhookEvent", schema);
