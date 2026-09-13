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
      enum: ["Half-Yearly", "Annual"],
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
