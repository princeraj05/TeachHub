const mongoose = require("mongoose");

const accountDeletionRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  name: {
    type: String,
    trim: true,
    default: ""
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin", "other"],
    default: "other"
  },
  schoolName: {
    type: String,
    trim: true,
    default: ""
  },
  reason: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "processed", "rejected"],
    default: "pending",
    index: true
  },
  ip: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("AccountDeletionRequest", accountDeletionRequestSchema);
