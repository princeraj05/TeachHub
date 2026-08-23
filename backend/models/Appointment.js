const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schoolName: { type: String, required: true, index: true },
  applicationRole: { type: String, enum: ["teacher"], default: "teacher" },
  date: { type: Date, required: true },
  time: { type: String, required: true, trim: true },
  mode: { type: String, enum: ["Online", "Offline"], required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"], default: "Pending" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" }
}, { timestamps: true });
appointmentSchema.index({ schoolName: 1, date: 1, time: 1 });
module.exports = mongoose.model("Appointment", appointmentSchema);
