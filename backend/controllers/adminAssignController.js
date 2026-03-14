const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Student = require("../models/Student");


// ================= ASSIGN STUDENT TO CLASS =================

exports.assignStudentToClass = async (req,res)=>{
try{

const { studentId, classId } = req.body;

await Student.findByIdAndUpdate(
studentId,
{ classId: classId },
{ new:true }
);

await Class.findByIdAndUpdate(
classId,
{ $addToSet: { students: studentId } }
);

res.json({
message:"Student assigned to class"
});

}catch(err){
res.status(500).json({error:err.message});
}
};



// ================= ASSIGN TEACHER TO CLASS =================

exports.assignTeacherToClass = async (req,res)=>{
try{

const { teacherId, classId } = req.body;

const updatedClass = await Class.findByIdAndUpdate(
classId,
{ teacher: teacherId },
{ new:true }
);

res.json({
message:"Teacher assigned to class",
data:updatedClass
});

}catch(err){
res.status(500).json({error:err.message});
}
};



// ================= ASSIGN SUBJECT TO TEACHER =================

exports.assignSubjectTeacher = async (req,res)=>{
try{

const { subjectId, teacherId } = req.body;

const subject = await Subject.findByIdAndUpdate(
subjectId,
{ teacher: teacherId },
{ new:true }
);

res.json({
message:"Subject assigned to teacher",
data:subject
});

}catch(err){
res.status(500).json({error:err.message});
}
};