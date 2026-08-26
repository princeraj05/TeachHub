const mongoose = require("mongoose");
const teacherLeaveSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  schoolName: { type: String, required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  reason: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancelled"], default: "Pending", index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  leaveType: { type: String, enum: ["Casual Leave", "Medical Leave", "Personal Leave", "Sick Leave", "Earned Leave"], default: "Casual Leave" },
  duration: { type: Number, default: 1 },
  attachmentName: { type: String, default: "" },
  attachmentSize: { type: String, default: "" },
  attachmentUrl: { type: String, default: "" }
}, { timestamps: true });
teacherLeaveSchema.index({ schoolName: 1, status: 1, startDate: 1, endDate: 1 });
module.exports = mongoose.model("TeacherLeave", teacherLeaveSchema);
