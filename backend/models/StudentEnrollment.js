// backend/models/StudentEnrollment.js
const mongoose = require("mongoose");

const enrollmentAuditSchema = new mongoose.Schema({
  movedFromClass: { type: String, default: "" },
  movedFromSection: { type: String, default: "" },
  movedToClass: { type: String, default: "" },
  movedToSection: { type: String, default: "" },
  movedAt: { type: Date, default: Date.now },
  reason: { type: String, default: "" }
}, { _id: false });

const studentEnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  schoolName: {
    type: String,
    required: true,
    index: true
  },
  academicYear: {
    type: String,
    required: true,
    index: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  classNameSnapshot: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    default: "A"
  },
  rollNo: {
    type: Number,
    default: null
  },
  admissionNoSnapshot: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Active", "Promoted", "Repeated", "Transferred", "Suspended"],
    default: "Active"
  },
  finalWeightedScore: {
    type: Number,
    default: 0
  },
  rankSection: {
    type: Number,
    default: null
  },
  rankClass: {
    type: Number,
    default: null
  },
  promotedToEnrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentEnrollment",
    default: null
  },
  previousEnrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentEnrollment",
    default: null
  },
  enrollmentAuditHistory: {
    type: [enrollmentAuditSchema],
    default: []
  }
}, { timestamps: true });

// CANONICAL UNIQUE INDEX: Exactly ONE canonical enrollment per student per school per academic year
studentEnrollmentSchema.index(
  { student: 1, schoolName: 1, academicYear: 1 },
  { unique: true }
);

// QUERY INDEX for class roster and roll number validation
studentEnrollmentSchema.index(
  { schoolName: 1, academicYear: 1, class: 1, section: 1 }
);

module.exports = mongoose.model("StudentEnrollment", studentEnrollmentSchema);
