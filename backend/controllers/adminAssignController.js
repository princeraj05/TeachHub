const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const User = require("../models/User");


// ================= ASSIGN STUDENT TO CLASS =================

exports.assignStudentToClass = async (req,res)=>{
try{

const { studentId, classId } = req.body;

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

// 1. Verify class belongs to this school
const classData = await Class.findOne({ _id: classId, schoolName: req.user.schoolName });
if (!classData) {
  return res.status(403).json({ message: "Class not found or does not belong to your school" });
}

// 2. Verify student belongs to this school
const studentUser = await User.findOne({ _id: studentId, role: "student", schoolName: req.user.schoolName });
if (!studentUser) {
  return res.status(403).json({ message: "Student not found or does not belong to your school" });
}

// 3. Update student classId in User collection
await User.findByIdAndUpdate(studentId, { classId });

// 4. Update Student collection just in case
try {
  await Student.findByIdAndUpdate(
    studentId,
    { classId: classId },
    { new: true }
  );
} catch (e) {
  // Ignore if Student model is missing
}

// 5. Remove student from any previous classes of this school to avoid duplicates
await Class.updateMany(
  { schoolName: req.user.schoolName },
  { $pull: { students: studentId } }
);

// 6. Add student to new class
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



// ================= ASSIGN TEACHER TO CLASS & SUBJECT(S) =================

exports.assignTeacherToClass = async (req,res)=>{
try{

const { teacherId, classId, subjectId, subjectIds } = req.body;

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

// 1. Verify class belongs to this school
const classData = await Class.findOne({ _id: classId, schoolName: req.user.schoolName });
if (!classData) {
  return res.status(403).json({ message: "Class not found or does not belong to your school" });
}

// 2. Verify teacher belongs to this school
const teacherUser = await User.findOne({ _id: teacherId, role: "teacher", schoolName: req.user.schoolName });
if (!teacherUser) {
  return res.status(403).json({ message: "Teacher not found or does not belong to your school" });
}

// 3. Assign teacher to class
const updatedClass = await Class.findByIdAndUpdate(
classId,
{ teacher: teacherId },
{ new:true }
);

// 4. Handle multiple or single subject assignment
let targetSubjectIds = [];
if (Array.isArray(subjectIds) && subjectIds.length > 0) {
  targetSubjectIds = subjectIds;
} else if (subjectId) {
  targetSubjectIds = [subjectId];
}

if (targetSubjectIds.length > 0) {
  await Subject.updateMany(
    { _id: { $in: targetSubjectIds }, schoolName: req.user.schoolName },
    { teacher: teacherId, $addToSet: { classes: classId, class: classId } }
  );
}

res.json({
message: targetSubjectIds.length > 0 ? "Teacher, Class & Subject(s) assigned successfully" : "Teacher assigned to class successfully",
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

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

// 1. Verify subject belongs to this school
const subjectData = await Subject.findOne({ _id: subjectId, schoolName: req.user.schoolName });
if (!subjectData) {
  return res.status(403).json({ message: "Subject not found or does not belong to your school" });
}

// 2. Verify teacher belongs to this school
const teacherUser = await User.findOne({ _id: teacherId, role: "teacher", schoolName: req.user.schoolName });
if (!teacherUser) {
  return res.status(403).json({ message: "Teacher not found or does not belong to your school" });
}

// 3. Assign subject to teacher
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