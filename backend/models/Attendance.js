const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

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

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);