const Exam = require("../models/Exam");
const User = require("../models/User");
const Class = require("../models/Class");


// ================= CREATE EXAM =================

exports.createExam = async (req,res)=>{

try{

const { classId, subjectId, date, mode, negativeMarking, negativeMarkValue, questions, proctorId } = req.body;

if (!req.user || (req.user.role !== "superadmin" && !req.user.schoolName)) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const exam = new Exam({
  class: classId,
  subject: subjectId,
  date,
  schoolName: req.user.schoolName,
  mode: mode || "offline",
  negativeMarking: !!negativeMarking,
  negativeMarkValue: negativeMarkValue !== undefined ? negativeMarkValue : 0.25,
  questions: questions || [],
  proctor: proctorId || null
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

if (!req.user || (req.user.role !== "superadmin" && !req.user.schoolName)) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const query = req.user.role === "superadmin" ? {} : { schoolName: req.user.schoolName };
if (req.user.role === "student") {
  const student = await User.findById(req.user.id).select("classId").lean();
  if (!student?.classId) return res.json([]);
  query.class = student.classId;
}
if (req.user.role === "teacher") {
  const classIds = await Class.find({ schoolName: req.user.schoolName, teacher: req.user.id }).distinct("_id");
  query.$or = [{ proctor: req.user.id }, { class: { $in: classIds } }];
}
const exams = await Exam.find(query)
.populate("class","name section")
.populate("subject","name")
.populate("proctor", "name email role")
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

try {

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

// Verify ownership before deleting
const exam = await Exam.findOne({ _id: req.params.id, schoolName: req.user.schoolName });
if (!exam) {
  return res.status(403).json({ message: "Access Denied: Exam does not belong to your school" });
}

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
