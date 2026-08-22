const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin", "superadmin", "unassigned"],
    default: "unassigned"
  },
  schoolName: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  requestedSchool: {
    type: String,
    default: ""
  },
  requestedRole: {
    type: String,
    enum: ["student", "teacher", "admin", "superadmin", "unassigned", ""],
    default: ""
  },
  requestStatus: {
    type: String,
    enum: ["pending", "scheduled", "exam_completed", "approved", "rejected", ""],
    default: ""
  },
  admissionExamDate: {
    type: Date,
    default: null
  },
  admissionExamMode: {
    type: String,
    enum: ["Online", "Offline", ""],
    default: ""
  },
  admissionExamTaken: {
    type: Boolean,
    default: false
  },
  admissionExamScore: {
    type: Number,
    default: 0
  },
  admissionExamTotal: {
    type: Number,
    default: 0
  },
  admissionExamCorrect: {
    type: Number,
    default: 0
  },
  admissionExamWrong: {
    type: Number,
    default: 0
  },
  admissionExamProctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);