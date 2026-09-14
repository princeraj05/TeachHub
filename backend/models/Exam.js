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
  enum: ["Half-Yearly", "Annual"],
  required: true,
  default: "Half-Yearly"
},

academicYear: {
  type: String,
  required: true,
  default: "2026-2027"
},

maxMarks: {
  type: Number,
  required: true,
  default: 100,
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