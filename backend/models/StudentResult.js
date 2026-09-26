const mongoose = require("mongoose");

const studentResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    section: {
      type: String,
      required: true
    },
    examTerm: {
      type: String,
      enum: ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR", "Half-Yearly", "Annual"],
      required: true
    },
    academicYear: {
      type: String,
      required: true
    },
    totalMarksObtained: {
      type: Number,
      required: true,
      default: 0
    },
    totalMaxMarks: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0
    },
    overallGrade: {
      type: String,
      required: true,
      default: "F"
    },
    overallResult: {
      type: String,
      enum: ["PASS", "FAIL"],
      required: true,
      default: "FAIL"
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Independent Term Card Publication Statuses
    publishedTermCards: {
      THREE_MONTH: {
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date, default: null }
      },
      SIX_MONTH: {
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date, default: null }
      },
      NINE_MONTH: {
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date, default: null }
      },
      FINAL_YEAR: {
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date, default: null }
      }
    },
    // Decoupled Final Academic Year Summary Publication & Merit Ranks
    finalAcademicSummary: {
      isPublished: { type: Boolean, default: false },
      publishedAt: { type: Date, default: null },
      weightedScore: { type: Number, default: 0 },
      overallGrade: { type: String, default: "" },
      classRank: { type: Number, default: null },
      sectionRank: { type: Number, default: null },
      promotionStatus: {
        type: String,
        enum: ["PENDING", "PROMOTED", "DETAINED"],
        default: "PENDING"
      }
    },
    schoolName: {
      type: String,
      required: true,
      index: true
    },
    teacherRemarks: {
      type: String,
      default: ""
    },

    // Historical Snapshots (preserves historical readability)
    studentNameSnapshot: {
      type: String,
      default: ""
    },
    classNameSnapshot: {
      type: String,
      default: ""
    },
    sectionSnapshot: {
      type: String,
      default: ""
    },
    rollNoSnapshot: {
      type: String,
      default: ""
    },
    admissionNoSnapshot: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Compound Unique Index: One result summary per student, per exam term, per academic year
studentResultSchema.index(
  { student: 1, examTerm: 1, academicYear: 1 },
  { unique: true }
);

// Class-level Query Index for fast admin review & published student result lookup
studentResultSchema.index({
  schoolName: 1,
  class: 1,
  examTerm: 1,
  academicYear: 1,
  isPublished: 1
});

module.exports = mongoose.model("StudentResult", studentResultSchema);
