const mongoose = require("mongoose");
const timetableSchema = new mongoose.Schema({
  schoolName: { type: String, required: true, index: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
  startTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 1, max: 600 },
  endTime: { type: String, required: true }
}, { timestamps: true });
timetableSchema.index({ schoolName: 1, class: 1, day: 1, startTime: 1 });
timetableSchema.index({ schoolName: 1, teacher: 1, day: 1, startTime: 1 });
module.exports = mongoose.model("Timetable", timetableSchema);
