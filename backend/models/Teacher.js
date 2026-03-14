const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  subject:{
    type:String,
    default:"Not Assigned"
  },

  phone:String,

  qualification:String,

  experience:String,

  address:String

});

module.exports = mongoose.model("Teacher",teacherSchema);