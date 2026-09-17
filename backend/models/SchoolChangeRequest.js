const mongoose = require("mongoose");

const schoolChangeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    userRole: {
      type: String,
      enum: ["student", "teacher"],
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    currentSchoolName: {
      type: String,
      required: true
    },
    requestedSchoolName: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true
    },
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    superAdminReviewedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

schoolChangeRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" }
  }
);

module.exports = mongoose.model("SchoolChangeRequest", schoolChangeRequestSchema);
