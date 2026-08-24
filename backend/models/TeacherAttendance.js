const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  schoolName: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent"], required: true }
}, { timestamps: true });

teacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });
teacherAttendanceSchema.index({ schoolName: 1, date: 1 });

module.exports = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
