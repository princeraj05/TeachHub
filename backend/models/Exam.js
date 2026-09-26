const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({

class:{
type:mongoose.Schema.Types.ObjectId,
ref:"Class",
required:true
},

subject:{
type:mongoose.Schema.Types.ObjectId,
ref:"Subject",
required:true
},

examTerm: {
  type: String,
  enum: ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR", "Half-Yearly", "Annual"],
  required: true,
  default: "THREE_MONTH"
},

section: {
  type: String,
  default: "ALL"
},

academicYear: {
  type: String,
  required: true
},

maxMarks: {
  type: Number,
  required: true,
  min: 1
},

date:{
type:Date,
required:true
},

  schoolName: {
    type: String,
    default: "",
    index: true
  },
  mode: {
    type: String,
    enum: ["online", "offline"],
    default: "offline"
  },
  // Offline Paper Management
  paperUrl: {
    type: String,
    default: ""
  },
  paperSets: {
    type: [String],
    default: []
  },
  // Online Proctoring & Randomization Config
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  proctoringConfig: {
    webcamRequired: { type: Boolean, default: false },
    tabSwitchLimit: { type: Number, default: 3 },
    blockCopyPaste: { type: Boolean, default: true }
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  negativeMarkValue: {
    type: Number,
    default: 0.25
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    correctOptionIndex: {
      type: Number,
      required: true
    },
    section: {
      type: String,
      default: ""
    }
  }],
  title: {
    type: String,
    default: ""
  },
  time: {
    type: String,
    default: "09:00 AM"
  },
  duration: {
    type: String,
    default: "1h 30m"
  },
  roomNumber: {
    type: String,
    default: ""
  },
  proctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

// Query index for exam lookup
examSchema.index({
  schoolName: 1,
  class: 1,
  subject: 1,
  examTerm: 1,
  academicYear: 1
});

module.exports = mongoose.model("Exam",examSchema);