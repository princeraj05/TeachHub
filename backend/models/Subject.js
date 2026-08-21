const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

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

module.exports = mongoose.model("Subject", subjectSchema);