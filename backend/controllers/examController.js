const Exam = require("../models/Exam");


// ================= CREATE EXAM =================

exports.createExam = async (req,res)=>{

try{

const { classId, subjectId, date } = req.body;

const exam = new Exam({
class:classId,
subject:subjectId,
date
});

await exam.save();

res.json({
message:"Exam created successfully",
data:exam
});

}catch(err){

res.status(500).json({
message:err.message
});

}

};



// ================= GET ALL EXAMS =================

exports.getAllExams = async (req,res)=>{

try{

const exams = await Exam.find()
.populate("class","name section")
.populate("subject","name")
.sort({date:1});

res.json(exams);

}catch(err){

res.status(500).json({
message:err.message
});

}

};



// ================= DELETE EXAM =================

exports.deleteExam = async (req,res)=>{

try{

await Exam.findByIdAndDelete(req.params.id);

res.json({
message:"Exam deleted"
});

}catch(err){

res.status(500).json({
message:err.message
});

}

};