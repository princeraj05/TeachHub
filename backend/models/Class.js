const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

section:{
type:String,
required:true
},

schoolName: {
type: String,
required: true,
index: true
},

teacher:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

teachers:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
],

students:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}
]

});

module.exports = mongoose.model("Class",classSchema);