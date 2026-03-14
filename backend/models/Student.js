const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true
  },

  classId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Class"
  },

  teacher:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }

},{timestamps:true});

module.exports = mongoose.model("Student",studentSchema);