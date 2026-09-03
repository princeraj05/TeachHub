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



// ================= ASSIGN TEACHER TO CLASS(ES) & SUBJECT(S) =================

exports.assignTeacherToClass = async (req,res)=>{
try{

const { teacherId, classId, classIds, subjectId, subjectIds } = req.body;

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

// 1. Verify teacher belongs to this school
const teacherUser = await User.findOne({ _id: teacherId, role: "teacher", schoolName: req.user.schoolName });
if (!teacherUser) {
  return res.status(403).json({ message: "Teacher not found or does not belong to your school" });
}

// 2. Normalize class IDs
let targetClassIds = [];
if (Array.isArray(classIds) && classIds.length > 0) {
  targetClassIds = classIds;
} else if (classId) {
  targetClassIds = [classId];
}

if (targetClassIds.length === 0) {
  return res.status(400).json({ message: "At least one Class must be selected" });
}

// 3. Assign teacher to classes
await Class.updateMany(
  { _id: { $in: targetClassIds }, schoolName: req.user.schoolName },
  { teacher: teacherId, $addToSet: { teachers: teacherId } }
);

// 4. Normalize subject IDs & assign to teacher & classes
let targetSubjectIds = [];
if (Array.isArray(subjectIds) && subjectIds.length > 0) {
  targetSubjectIds = subjectIds;
} else if (subjectId) {
  targetSubjectIds = [subjectId];
}

if (targetSubjectIds.length > 0) {
  await Subject.updateMany(
    { _id: { $in: targetSubjectIds }, schoolName: req.user.schoolName },
    { teacher: teacherId, $addToSet: { classes: { $each: targetClassIds }, class: targetClassIds[0] } }
  );
}

res.json({
  message: "Teacher, Class(es) & Subject(s) assigned successfully"
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

const Timetable = require("../models/Timetable");

// ================= GET TEACHER ASSIGNMENTS =================
exports.getTeacherAssignments = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const schoolRegex = new RegExp(`^${(req.user.schoolName || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i");

    const teachers = await User.find({
      role: { $regex: /^teacher$/i },
      $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }]
    }).select("name email avatar phoneNumber").lean();

    const assignments = [];
    for (let t of teachers) {
      const timetableClassIds = await Timetable.distinct("class", { teacher: t._id });
      const subjectClassIds1 = await Subject.distinct("classes", { teacher: t._id, schoolName: schoolRegex });
      const subjectClassIds2 = await Subject.distinct("class", { teacher: t._id, schoolName: schoolRegex });

      const combinedClassIds = [...new Set([
        ...timetableClassIds.map(id => id.toString()),
        ...subjectClassIds1.map(id => id.toString()),
        ...subjectClassIds2.map(id => id.toString())
      ])];

      const classes = await Class.find({
        $or: [
          { teacher: t._id },
          { teachers: t._id },
          { _id: { $in: combinedClassIds } }
        ],
        schoolName: schoolRegex
      }).select("name section");

      const timetableSubjectIds = await Timetable.distinct("subject", { teacher: t._id });
      const subjects = await Subject.find({
        $or: [{ teacher: t._id }, { _id: { $in: timetableSubjectIds } }],
        schoolName: schoolRegex
      }).select("name code");

      assignments.push({
        _id: t._id,
        name: t.name,
        email: t.email,
        avatar: t.avatar,
        phoneNumber: t.phoneNumber,
        classes,
        subjects
      });
    }

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UNASSIGN TEACHER ASSIGNMENT =================
exports.unassignTeacherAssignment = async (req, res) => {
  try {
    const { teacherId, classId, subjectId, clearAll } = req.body;

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const schoolName = req.user.schoolName;

    if (clearAll) {
      await Class.updateMany({ schoolName }, { $pull: { teachers: teacherId } });
      await Class.updateMany({ teacher: teacherId, schoolName }, { $unset: { teacher: "" } });
      await Subject.updateMany({ teacher: teacherId, schoolName }, { $unset: { teacher: "" } });
      return res.json({ message: "All class and subject assignments cleared for this teacher" });
    }

    if (classId) {
      await Class.findOneAndUpdate({ _id: classId, schoolName }, { $pull: { teachers: teacherId } });
      await Class.findOneAndUpdate({ _id: classId, schoolName, teacher: teacherId }, { $unset: { teacher: "" } });
    }

    if (subjectId) {
      await Subject.findOneAndUpdate({ _id: subjectId, schoolName, teacher: teacherId }, { $unset: { teacher: "" } });
    }

    res.json({ message: "Assignment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};