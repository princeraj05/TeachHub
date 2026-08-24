const mongoose = require("mongoose");
const schema = new mongoose.Schema({ teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, schoolName: { type: String, required: true, index: true }, salary: { type: Number, required: true, min: 1 }, currency: { type: String, default: "INR" }, active: { type: Boolean, default: true }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } }, { timestamps: true });
schema.index({ teacher: 1, schoolName: 1 }, { unique: true });
module.exports = mongoose.model("TeacherCompensation", schema);
