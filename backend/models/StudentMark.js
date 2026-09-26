const mongoose = require("mongoose");

const studentMarkSchema = new mongoose.Schema(
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
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: false,
      index: true
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentEnrollment",
      required: false,
      index: true
    },
    examTerm: {
      type: String,
      enum: ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR", "3_MONTH", "6_MONTH", "9_MONTH"],
      required: true
    },
    approvalStatus: {
      type: String,
      enum: ["draft", "submitted", "approved"],
      default: "draft"
    },
    academicYear: {
      type: String,
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
      min: 1
    },
    isAbsent: {
      type: Boolean,
      default: false
    },
    grade: {
      type: String,
      default: ""
    },
    remarks: {
      type: String,
      default: ""
    },
    schoolName: {
      type: String,
      required: true,
      index: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
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
    subjectNameSnapshot: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Modern Compound Unique Index: One mark record per exam, per student
studentMarkSchema.index(
  { exam: 1, student: 1 },
  { unique: true }
);

// Class-level Query Index for fast roster and admin/teacher class mark lookups
studentMarkSchema.index({
  schoolName: 1,
  class: 1,
  examTerm: 1,
  academicYear: 1
});

module.exports = mongoose.model("StudentMark", studentMarkSchema);
