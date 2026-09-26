const mongoose = require("mongoose");

const promotedStudentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sourceEnrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentEnrollment"
  },
  targetEnrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentEnrollment"
  },
  sourceClass: {
    type: String,
    required: true
  },
  sourceSection: {
    type: String,
    default: "A"
  },
  targetClass: {
    type: String,
    required: true
  },
  targetSection: {
    type: String,
    default: "A"
  },
  status: {
    type: String,
    enum: ["PROMOTED", "RETAINED", "GRADUATED", "EXEMPTED"],
    required: true
  },
  finalGrade: {
    type: String,
    default: ""
  },
  finalPercentage: {
    type: Number,
    default: 0
  },
  rankInClass: {
    type: Number,
    default: null
  },
  rankInGrade: {
    type: Number,
    default: null
  },
  remarks: {
    type: String,
    default: ""
  }
}, { _id: false });

const auditHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["DRAFT", "APPROVED", "EXECUTED", "ROLLED_BACK"],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ""
  }
}, { _id: false });

const promotionBatchSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    index: true
  },
  sourceAcademicYear: {
    type: String,
    required: true
  },
  targetAcademicYear: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["DRAFT", "APPROVED", "EXECUTED", "ROLLED_BACK"],
    default: "DRAFT",
    index: true
  },
  students: [promotedStudentSchema],
  totalStudentsEvaluated: {
    type: Number,
    default: 0
  },
  totalPromoted: {
    type: Number,
    default: 0
  },
  totalRetained: {
    type: Number,
    default: 0
  },
  totalGraduated: {
    type: Number,
    default: 0
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  executedAt: {
    type: Date,
    default: null
  },
  auditHistory: [auditHistorySchema]
}, { timestamps: true });

promotionBatchSchema.index({ schoolName: 1, sourceAcademicYear: 1, targetAcademicYear: 1 });

module.exports = mongoose.model("PromotionBatch", promotionBatchSchema);
