const mongoose = require("mongoose");

const chatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: "Group Chat", maxlength: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schoolName: { type: String, required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  groupType: { type: String, enum: ["normal"], default: "normal" },
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: null }
}, { timestamps: true });
chatGroupSchema.index({ schoolName: 1, members: 1, lastMessageAt: -1 });
module.exports = mongoose.model("ChatGroup", chatGroupSchema);
