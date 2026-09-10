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
    enum: ["student", "teacher", "admin", "superadmin", "support", "unassigned"],
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
  
  // Custom Profile fields
  alternateEmail: { type: String, default: "" },
  dob: { type: String, default: "" },
  gender: { type: String, default: "" },
  address: { type: String, default: "" },
  timezone: { type: String, default: "" },
  language: { type: String, default: "" },
  about: { type: String, default: "" },
  alternatePhone: { type: String, default: "" },
  pincode: { type: String, default: "" },
  department: { type: String, default: "" },
  designation: { type: String, default: "" },
  bio: { type: String, default: "" },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  dndMode: { type: Boolean, default: false },

  fatherMobileNumber: { type: String, default: "", trim: true, maxlength: 20 },
  motherMobileNumber: { type: String, default: "", trim: true, maxlength: 20 },
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
    enum: ["student", "teacher", "admin", "superadmin", "support", "unassigned", ""],
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
  interviewDate: {
    type: Date,
    default: null
  },
  interviewTime: {
    type: String,
    default: ""
  },
  interviewMode: {
    type: String,
    enum: ["Online", "Offline", ""],
    default: ""
  },
  interviewVenue: {
    type: String,
    default: ""
  },
  interviewNotes: {
    type: String,
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
  rollNo: {
    type: Number,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: null
  },
  // Teacher Management & Applicant Fields
  qualification: { type: String, default: "" },
  experience: { type: String, default: "" },
  joiningDate: { type: String, default: "" },
  employeeId: { type: String, default: "" },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 32 },
  
  // Student & Teacher Applicant Fields
  targetClass: { type: String, default: "" },
  previousClass: { type: String, default: "" },
  previousSchool: { type: String, default: "" },
  previousGrade: { type: String, default: "" },
  fatherName: { type: String, default: "" },
  subjectsOfExpertise: [{ type: String }],
  previousInstitute: { type: String, default: "" },

  // Support Team Specific Fields
  supportDepartment: { type: String, default: "Technical" },
  supportShift: { type: String, default: "Morning (09:00 - 17:00)" },
  supportStatus: { type: String, enum: ["active", "suspended", "on_duty", "off_duty"], default: "active" },
  ticketsResolved: { type: Number, default: 0 },
  activeTickets: { type: Number, default: 0 },

  galleryPhotos: [
    {
      url: { type: String, required: true },
      filename: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
