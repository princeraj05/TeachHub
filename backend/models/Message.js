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
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent"
    },

    attachments: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      thumbnailUrl: { type: String }
    }],

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null
    },

    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      emoji: { type: String, required: true }
    }],

    clientMessageId: {
      type: String,
      unique: true,
      sparse: true
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
