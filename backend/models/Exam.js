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

module.exports = mongoose.model("Exam",examSchema);