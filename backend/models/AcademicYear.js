// backend/models/AcademicYear.js
const mongoose = require("mongoose");
const { DEFAULT_TERM_WEIGHTAGES, MISSING_TERM_POLICIES } = require("../utils/examTermConstants");

/**
 * Note: termWeightages and missingTermPolicy are DEPRECATED and retained only for schema backward compatibility.
 * Final Academic Results and promotion are strictly 100% driven by the Final Year Examination.
 */
const termWeightageSchema = new mongoose.Schema({
  termKey: {
    type: String,
    enum: ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR"],
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  weightagePercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const academicYearSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    index: true
  },
  yearString: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active"
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  // Deprecated configuration fields (no longer drive calculation)
  termWeightages: {
    type: [termWeightageSchema],
    default: DEFAULT_TERM_WEIGHTAGES
  },
  missingTermPolicy: {
    type: String,
    enum: Object.values(MISSING_TERM_POLICIES),
    default: MISSING_TERM_POLICIES.PROPORTIONAL_REDISTRIBUTION
  }
}, { timestamps: true });

// Enforce unique yearString per school
academicYearSchema.index({ schoolName: 1, yearString: 1 }, { unique: true });

// Query index for school active/current lookup
academicYearSchema.index({ schoolName: 1, isCurrent: 1 });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
