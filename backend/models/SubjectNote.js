const mongoose = require("mongoose");

const subjectNoteSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true
    },
    className: {
      type: String, // e.g. "Class 1" or "1"
      required: true,
      index: true
    },
    section: {
      type: String, // e.g. "A", "B", "All"
      default: "All",
      index: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    schoolName: {
      type: String,
      default: "",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    fileUrl: {
      type: String,
      default: ""
    },
    fileName: {
      type: String,
      default: ""
    },
    fileType: {
      type: String, // e.g. "pdf", "image", "doc"
      default: "file"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubjectNote", subjectNoteSchema);
