const User = require("../models/User");


// ================= GET TEACHERS =================

exports.getTeachers = async (req,res)=>{

try{

const teachers = await User
.find({ role:"teacher" })
.select("-password");

res.json(teachers);

}catch(error){

res.status(500).json({
message:error.message
})

}

};



// ================= GET STUDENTS =================

exports.getStudents = async (req,res)=>{

try{

const students = await User
.find({ role:"student" })
.select("-password");

res.json(students);

}catch(error){

res.status(500).json({
message:error.message
})

}

};