const mongoose = require("mongoose");

const appNotificationSchema = new mongoose.Schema({
  recipient: {
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
  role: {
    type: String,
    enum: ["admin", "teacher", "student", "unassigned", "superadmin", "support"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Join Request", "Attendance", "Exams", "Events", "System", "Leave", "Support", "General"],
    default: "General"
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  link: {
    type: String,
    default: ""
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model("AppNotification", appNotificationSchema);
