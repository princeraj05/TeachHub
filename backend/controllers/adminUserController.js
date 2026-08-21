const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");


// ================= GET TEACHERS =================

exports.getTeachers = async (req,res)=>{

try{

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const teachers = await User
.find({ role:"teacher", schoolName: req.user.schoolName })
.select("-password")
.lean();

for (let teacher of teachers) {
  const classes = await Class.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name section");
  const subjects = await Subject.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name");
  teacher.classes = classes;
  teacher.subjects = subjects;
}

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

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const students = await User
.find({ role:"student", schoolName: req.user.schoolName })
.populate("classId", "name section")
.select("-password");

res.json(students);

}catch(error){

res.status(500).json({
message:error.message
})

}

};