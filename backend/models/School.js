const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  principalName: {
    type: String,
    default: ""
  },
  totalTeachers: {
    type: Number,
    default: null
  },
  totalStudents: {
    type: Number,
    default: null
  },
  totalClasses: {
    type: Number,
    default: null
  },
  availableClasses: {
    type: String,
    default: ""
  },
  schoolTypes: {
    type: [String],
    default: []
  },
  schoolType: { type: String, enum: ["Private", "Government", ""], default: "" },
  admissionExam: {
    type: Boolean,
    default: null
  },
  directAdmission: {
    type: Boolean,
    default: null
  },
  description: {
    type: String,
    default: ""
  },
  
  // Extended fields for About Your School profile
  email: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  established: { type: String, default: "" },
  code: { type: String, default: "" },
  affiliation: { type: String, default: "" },
  academicYear: { type: String, default: "" },
  medium: { type: String, default: "" },
  website: { type: String, default: "" },
  status: { type: String, default: "Active" },
  plan: { type: String, default: "yet not set" },
  registrationNumber: { type: String, default: "" },
  category: { type: String, default: "" },
  motto: { type: String, default: "" },
  photo: { type: String, default: "" },
  
  // School Categories / Facilities
  academicLevel: { type: String, default: "" },
  coEducational: { type: String, default: "Co-Educational" },
  schoolOperationType: { type: String, default: "Day School" },
  admissionType: { type: String, default: "Direct Admission" },
  transportation: { type: String, default: "Available" },
  hostelFacility: { type: String, default: "Not Available" },

  // New multi-tab fields
  coverImage: { type: String, default: "" },
  schoolPhotos: { type: [String], default: [] },
  principalPhoto: { type: String, default: "" },
  principalDesignation: { type: String, default: "" },
  principalEmail: { type: String, default: "" },
  principalPhone: { type: String, default: "" },
  principalLeadershipSince: { type: String, default: "" },
  principalIntroduction: { type: String, default: "" },
  schoolCategoriesList: { type: [String], default: [] },
  admissionProcess: { type: mongoose.Schema.Types.Mixed, default: ["Direct Admission"] },
  schoolBoardType: { type: String, default: "Private" },
  workingDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  openingTime: { type: String, default: "08:00 AM" },
  closingTime: { type: String, default: "04:00 PM" },
  holidays: [{ date: String, name: String }]
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);
