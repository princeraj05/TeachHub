const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  section: {
    type: String,
    default: ""
  },

  schoolName: {
    type: String,
    required: true,
    index: true
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  /**
   * Capacity is manual / Admin controlled.
   * Null or zero indicates no hardcoded automatic limit.
   */
  maxCapacity: {
    type: Number,
    default: null
  }

});

module.exports = mongoose.model("Class", classSchema);