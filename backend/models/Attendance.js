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
    enum: ["Present", "Absent", "On Leave", "Late", "Leave"],
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  schoolName: {
    type: String,
    default: "",
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null
  },

  remarks: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);