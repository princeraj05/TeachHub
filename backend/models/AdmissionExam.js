const mongoose = require("mongoose");

const admissionExamSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    index: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },
  targetClass: {
    type: String,
    required: true,
    trim: true
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  negativeMarkValue: {
    type: Number,
    default: 0.25
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true
      },
      section: {
        type: String,
        required: true,
        enum: ["Mathematics", "Science", "Social Science"],
        default: "Mathematics"
      },
      options: {
        type: [String],
        required: true,
        validate: [arr => arr.length === 4, "Options must have exactly 4 choices"]
      },
      correctOptionIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 3
      }
    }
  ]
}, { timestamps: true });

// Compound Unique Index: One admission exam per target class per school
admissionExamSchema.index(
  { schoolName: 1, targetClass: 1 },
  { unique: true }
);

module.exports = mongoose.model("AdmissionExam", admissionExamSchema);

