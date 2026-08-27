const mongoose = require("mongoose");
const teacherNotificationSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Appointment Requests", "Leave Updates", "Exam Updates", "Announcements", "System Updates"], 
    default: "System Updates" 
  },
  isRead: { type: Boolean, default: false },
  appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("TeacherNotification", teacherNotificationSchema);
