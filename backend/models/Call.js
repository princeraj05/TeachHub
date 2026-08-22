const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["voice", "video"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "ringing", "completed", "missed", "rejected", "busy", "timeout", "cancelled"],
    required: true
  },
  duration: {
    type: Number,
    default: 0 // in seconds
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  schoolName: {
    type: String,
    default: ""
  }
}, { timestamps: true });

callSchema.index({ caller: 1, receiver: 1 });
callSchema.index({ receiver: 1, caller: 1 });

module.exports = mongoose.model("Call", callSchema);
