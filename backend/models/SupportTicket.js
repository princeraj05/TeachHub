const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    requesterRole: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true
    },
    schoolName: {
      type: String,
      default: "",
      trim: true,
      index: true
    },

    department: {
      type: String,
      enum: ["Billing", "Technical", "Onboarding"],
      required: true,
      index: true
    },
    assignedDepartment: {
      type: String,
      enum: ["Billing", "Technical", "Onboarding"],
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["New", "Open", "In Progress", "Waiting", "Resolved", "Closed", "Escalated"],
      default: "New",
      index: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    isEscalated: {
      type: Boolean,
      default: false,
      index: true
    },
    escalatedReason: {
      type: String,
      default: "",
      trim: true
    },
    escalatedAt: {
      type: Date,
      default: null
    },

    messageIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
      }
    ],
    callIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Call"
      }
    ],

    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, default: "" },
        mimeType: { type: String, default: "" },
        size: { type: Number, default: 0 }
      }
    ],

    firstResponseAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for performant query filtering and sorting
supportTicketSchema.index({ department: 1, status: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
supportTicketSchema.index({ schoolName: 1, requester: 1, createdAt: -1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
