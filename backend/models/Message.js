const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    schoolName: {
      type: String,
      default: ""
    },

    type: {
      type: String,
      enum: ["personal", "broadcast"],
      default: "personal"
    },

    targetRole: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: null
    },

    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster history retrieval
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, sender: 1 });
messageSchema.index({ schoolName: 1, type: 1, targetRole: 1 });

module.exports = mongoose.model("Message", messageSchema);
