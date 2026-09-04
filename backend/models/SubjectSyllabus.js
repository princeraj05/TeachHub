const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapterNo: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started"
  },
  isMasterChapter: { type: Boolean, default: true },
  completedDate: { type: Date, default: null },
  topics: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ]
});

const subjectSyllabusSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true
    },
    className: {
      type: String,
      required: true,
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
    chapters: [chapterSchema]
  },
  { timestamps: true }
);

subjectSyllabusSchema.index({ subject: 1, className: 1, schoolName: 1 }, { unique: true });

module.exports = mongoose.model("SubjectSyllabus", subjectSyllabusSchema);
