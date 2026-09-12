const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  normalizedName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  principalName: {
    type: String,
    default: null
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
    default: null
  },
  schoolTypes: {
    type: [String],
    default: []
  },
  schoolType: { type: String, default: null },
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
    default: null
  },
  
  // Extended fields for About Your School profile
  email: { type: String, default: null, index: true },
  phoneNumber: { type: String, default: null },
  address: { type: String, default: null },
  latitude: { type: String, default: null },
  longitude: { type: String, default: null },
  established: { type: String, default: null },
  code: { type: String, default: null },
  affiliation: { type: String, default: null },
  academicYear: { type: String, default: null },
  medium: { type: String, default: null },
  website: { type: String, default: null },
  status: { type: String, default: "Active" },
  plan: { type: String, default: "yet not set" },
  registrationNumber: { type: String, default: null },
  category: { type: String, default: null },
  motto: { type: String, default: null },
  photo: { type: String, default: null },
  
  // School Categories / Facilities
  academicLevel: { type: String, default: null },
  coEducational: { type: String, default: null },
  schoolOperationType: { type: String, default: null },
  admissionType: { type: String, default: null },
  transportation: { type: String, default: null },
  hostelFacility: { type: String, default: null },

  // Multi-tab fields
  coverImage: { type: String, default: null },
  coverPosition: { type: Number, default: 50 },
  isLegacySeedCleaned: { type: Boolean, default: false },
  schoolPhotos: { type: [String], default: [] },
  principalPhoto: { type: String, default: null },
  principalDesignation: { type: String, default: null },
  principalEmail: { type: String, default: null, index: true },
  principalPhone: { type: String, default: null },
  principalLeadershipSince: { type: String, default: null },
  principalIntroduction: { type: String, default: null },
  schoolCategoriesList: { type: [String], default: [] },
  admissionProcess: { type: [String], default: [] },
  schoolBoardType: { type: String, default: null },
  workingDays: { type: [String], default: [] },
  openingTime: { type: String, default: null },
  closingTime: { type: String, default: null },
  shortBreakStartTime: { type: String, default: null },
  shortBreakDuration: { type: Number, default: 30 },
  lunchBreakStartTime: { type: String, default: null },
  lunchBreakDuration: { type: Number, default: 60 },
  holidays: [{ date: String, name: String }],
  profileCompletion: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);
