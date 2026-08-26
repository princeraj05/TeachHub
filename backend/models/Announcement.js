const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Upcoming", "General", "Academic"],
    default: "General"
  },
  date: {
    type: Date,
    default: Date.now
  },
  timeString: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
