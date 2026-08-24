const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  // `class` is kept temporarily for existing records. New subjects use
  // `classes`, so one subject (for example Mathematics) can serve many levels.
  class: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  }],

  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  }],

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  schoolName: {
    type: String,
    default: "",
    index: true
  }

});

subjectSchema.index({ schoolName: 1, name: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
