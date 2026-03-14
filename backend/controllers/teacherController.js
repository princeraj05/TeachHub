const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const User = require("../models/User");



// ================= GET TEACHER DASHBOARD =================

exports.getTeacherDashboard = async (req,res)=>{

try{

const teacherId = req.user.id;


// classes
const classes = await Class
.find({ teacher: teacherId })
.populate("students","name email");


// students
let students = [];

classes.forEach(cls=>{
students = students.concat(cls.students);
});


// subjects
const subjects = await Subject.find({ teacher: teacherId });


// recent students
const recentStudents = students.slice(-5);


res.json({

students: students.length,
subjects: subjects.length,
classes: classes.length,
attendanceToday: 0,
recentStudents

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= GET MY CLASSES =================

exports.getMyClasses = async (req,res)=>{

try{

const teacherId = req.user.id;

const classes = await Class
.find({ teacher: teacherId })
.populate("students","name email");

res.json(classes);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= GET MY STUDENTS =================

exports.getMyStudents = async (req,res)=>{

try{

const teacherId = req.user.id;

const classes = await Class
.find({ teacher: teacherId })
.populate("students","name email");

let students = [];

classes.forEach(cls=>{
students = students.concat(cls.students);
});

res.json(students);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= GET MY SUBJECTS =================

exports.getMySubjects = async (req,res)=>{

try{

const teacherId = req.user.id;

const subjects = await Subject
.find({ teacher: teacherId })
.populate({
path:"class",
select:"name section"
});

res.json(subjects);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= GET TEACHER PROFILE =================

exports.getTeacherProfile = async (req,res)=>{

try{

const teacherId = req.params.id;

const teacher = await User
.findById(teacherId)
.select("-password");

if(!teacher){

return res.status(404).json({
message:"Teacher not found"
});

}

res.json(teacher);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= UPDATE TEACHER PROFILE =================

exports.updateTeacherProfile = async (req,res)=>{

try{

const teacherId = req.user.id;

const {name,email} = req.body;

const teacher = await User.findByIdAndUpdate(

teacherId,
{name,email},
{
new:true,
runValidators:true
}

).select("-password");

res.json({
message:"Profile updated",
teacher
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



// ================= GET TEACHER EXAMS =================

exports.getTeacherExams = async (req,res)=>{

try{

const teacherId = req.user.id;


// teacher ke subjects
const subjects = await Subject.find({
teacher: teacherId
});

const subjectIds = subjects.map(s=>s._id);


// exams
const exams = await Exam
.find({ subject: { $in: subjectIds } })
.populate("class","name section")
.populate("subject","name")
.sort({ date:1 });


res.json(exams);

}catch(err){

res.status(500).json({
error:err.message
});

}

};