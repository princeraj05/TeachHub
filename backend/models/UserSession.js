const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  device: {
    type: String,
    default: "Unknown Device"
  },
  browser: {
    type: String,
    default: "Unknown Browser"
  },
  ip: {
    type: String,
    default: "127.0.0.1"
  },
  location: {
    type: String,
    default: "Unknown Location"
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["Active", "Logged out"],
    default: "Active"
  }
}, { timestamps: true });

userSessionSchema.index({ token: 1 });
userSessionSchema.index({ userId: 1 });

module.exports = mongoose.model("UserSession", userSessionSchema);
