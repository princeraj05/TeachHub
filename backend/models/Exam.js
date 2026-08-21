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
}

},{timestamps:true});

module.exports = mongoose.model("Exam",examSchema);