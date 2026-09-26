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

// Prevent duplicate online exam submissions for same student and exam
examSubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ExamSubmission", examSubmissionSchema);
