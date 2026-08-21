const mongoose = require("mongoose");

const examSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  correct: {
    type: Number,
    required: true
  },
  wrong: {
    type: Number,
    required: true
  },
  answers: {
    type: [Number],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("ExamSubmission", examSubmissionSchema);
