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
  }
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);
