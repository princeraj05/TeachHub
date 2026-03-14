const mongoose = require("mongoose");

const adminProfileSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true
  },

  phone:{
    type:String
  },

  role:{
    type:String,
    default:"Admin"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("AdminProfile",adminProfileSchema);