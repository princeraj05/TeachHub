const mongoose = require("mongoose");

const masterSyllabusSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      index: true
    },
    className: {
      type: String,
      required: true,
      index: true
    },
    subjectName: {
      type: String,
      required: true,
      index: true
    },
    chapters: [
      {
        chapterNo: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        defaultTopics: [{ type: String }]
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

masterSyllabusSchema.index({ schoolName: 1, className: 1, subjectName: 1 }, { unique: true });

module.exports = mongoose.model("MasterSyllabus", masterSyllabusSchema);
