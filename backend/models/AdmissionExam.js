const mongoose = require("mongoose");

const admissionExamSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    unique: true
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

module.exports = mongoose.model("AdmissionExam", admissionExamSchema);
