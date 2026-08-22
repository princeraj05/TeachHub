const mongoose = require("mongoose");

const aboutAppSchema = new mongoose.Schema({
  aboutDeveloper: {
    type: String,
    default: "Designed and Developed by princeraj05"
  },
  aboutApp: {
    type: String,
    default: "TeachHub is a state-of-the-art school management system designed to coordinate students, teachers, classes, and exams dynamically."
  }
}, { timestamps: true });

module.exports = mongoose.model("AboutApp", aboutAppSchema);
