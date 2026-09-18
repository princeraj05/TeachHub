const Exam = require("../models/Exam");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const StudentMark = require("../models/StudentMark");
const ExamSubmission = require("../models/ExamSubmission");
const TeacherNotification = require("../models/TeacherNotification");
const { notifyStudentsInClass, notifySchoolRole } = require("../utils/notificationHelper");


// ================= CREATE EXAM =================

exports.createExam = async (req,res)=>{

try{

const { title, classId, subjectId, examTerm, academicYear, maxMarks, date, time, duration, roomNumber, mode, negativeMarking, negativeMarkValue, questions, proctorId } = req.body;

if (!req.user || (req.user.role !== "superadmin" && !req.user.schoolName)) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

if (!classId || !subjectId) {
  return res.status(400).json({ message: "classId and subjectId are required" });
}

const termVal = examTerm || "Half-Yearly";
if (!["Half-Yearly", "Annual"].includes(termVal)) {
  return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
}

if (!academicYear || typeof academicYear !== "string" || !academicYear.trim()) {
  return res.status(400).json({ message: "academicYear is required" });
}

if (maxMarks === undefined || maxMarks === null || maxMarks === "") {
  return res.status(400).json({ message: "maxMarks is required" });
}
const numMaxMarks = Number(maxMarks);
if (!Number.isFinite(numMaxMarks) || numMaxMarks <= 0) {
  return res.status(400).json({ message: "maxMarks must be a positive number greater than 0" });
}

const exam = new Exam({
  title: title || `${termVal} Examination`,
  class: classId,
  subject: subjectId,
  examTerm: termVal,
  academicYear: academicYear.trim(),
  maxMarks: numMaxMarks,
  date,
  time: time || "09:00 AM",
  duration: duration || "1h 30m",
  roomNumber: roomNumber || "",
  schoolName: req.user.schoolName,
  mode: mode || "offline",
  negativeMarking: !!negativeMarking,
  negativeMarkValue: negativeMarkValue !== undefined ? negativeMarkValue : 0.25,
  questions: questions || [],
  proctor: proctorId || null
});

await exam.save();

// Dispatch notifications to assigned teachers
try {
  if (proctorId) {
    await TeacherNotification.create({
      teacher: proctorId,
      title: "Exam Conduct Assigned",
      message: `You have been assigned to conduct ${mode || "offline"} exam "${title || "Exam"}" on ${date}${roomNumber ? ` (Room ${roomNumber})` : ""}.`,
      category: "Exam Updates"
    });
  }

  if (subjectId) {
    const subj = await Subject.findById(subjectId);
    if (subj && subj.teacher && subj.teacher.toString() !== (proctorId || "").toString()) {
      await TeacherNotification.create({
        teacher: subj.teacher,
        title: "New Exam Scheduled",
        message: `An exam "${title || "Exam"}" has been scheduled for your subject ${subj.name} on ${date}.`,
        category: "Exam Updates"
      });
    }
  }

  // Dispatch AppNotification to Students for this class/school
  if (classId) {
    const targetClass = await Class.findById(classId).lean();
    if (targetClass) {
      notifyStudentsInClass({
        schoolName: req.user.schoolName,
        className: targetClass.name,
        section: targetClass.section,
        title: "New Exam Scheduled",
        message: `An exam "${title || "Exam"}" has been scheduled on ${date} at ${time || "09:00 AM"}.`,
        category: "Exams",
        link: "/student/exams"
      }).catch(err => console.error("Error notifying students of new exam:", err.message));
    }
  } else {
    notifySchoolRole({
      schoolName: req.user.schoolName,
      role: "student",
      title: "New Exam Scheduled",
      message: `An exam "${title || "Exam"}" has been scheduled on ${date}.`,
      category: "Exams",
      link: "/student/exams"
    }).catch(err => console.error("Error notifying all students of new exam:", err.message));
  }
} catch (notifErr) {
  console.error("TeacherNotification error during exam creation:", notifErr);
}

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


// ================= UPDATE EXAM =================

exports.updateExam = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const { title, classId, subjectId, examTerm, academicYear, maxMarks, date, time, duration, roomNumber, mode, negativeMarking, negativeMarkValue, questions, proctorId } = req.body;

    const exam = await Exam.findOne({ _id: req.params.id, schoolName: req.user.schoolName });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (examTerm) {
      if (!["Half-Yearly", "Annual"].includes(examTerm)) {
        return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
      }
      exam.examTerm = examTerm;
    }
    if (academicYear) exam.academicYear = academicYear;
    if (maxMarks !== undefined) {
      const numMax = Number(maxMarks);
      if (isNaN(numMax) || numMax <= 0) {
        return res.status(400).json({ message: "maxMarks must be a positive number" });
      }
      exam.maxMarks = numMax;
    }

    if (title !== undefined) exam.title = title;
    if (classId) exam.class = classId;
    if (subjectId) exam.subject = subjectId;
    if (date) exam.date = date;
    if (time !== undefined) exam.time = time;
    if (duration !== undefined) exam.duration = duration;
    if (roomNumber !== undefined) exam.roomNumber = roomNumber;
    if (mode) exam.mode = mode;
    if (negativeMarking !== undefined) exam.negativeMarking = !!negativeMarking;
    if (negativeMarkValue !== undefined) exam.negativeMarkValue = negativeMarkValue;
    if (questions !== undefined) exam.questions = questions;
    if (proctorId !== undefined) exam.proctor = proctorId || null;

    await exam.save();
    const updatedExam = await Exam.findById(exam._id)
      .populate("class", "name section")
      .populate("subject", "name")
      .populate("proctor", "name email role");

    res.json({ message: "Exam updated successfully", data: updatedExam });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  const student = await User.findById(req.user.id).select("classId schoolName").lean();
  if (!student?.classId) return res.json([]);

  const studentClassDoc = await Class.findById(student.classId).select("name schoolName").lean();
  if (!studentClassDoc) {
    query.class = student.classId;
  } else {
    const sameLevelClassIds = await Class.find({
      schoolName: studentClassDoc.schoolName || req.user.schoolName,
      name: studentClassDoc.name
    }).distinct("_id");
    query.class = { $in: sameLevelClassIds };
  }
}

if (req.user.role === "teacher") {
  const teacherClasses = await Class.find({ schoolName: req.user.schoolName, teacher: req.user.id }).select("name").lean();
  const teacherClassNames = [...new Set(teacherClasses.map(c => c.name))];
  const sameLevelClassIds = await Class.find({
    schoolName: req.user.schoolName,
    name: { $in: teacherClassNames }
  }).distinct("_id");
  query.$or = [
    { proctor: req.user.id },
    { proctor: null, class: { $in: sameLevelClassIds } },
    { proctor: { $exists: false }, class: { $in: sameLevelClassIds } }
  ];
}
const exams = await Exam.find(query)
  .populate("class", "name section")
  .populate("subject", "name")
  .populate("proctor", "name email role")
  .sort({ date: 1 });

if (req.user.role === "student") {
  const studentMarks = await StudentMark.find({
    student: req.user.id,
    ...(req.user.schoolName ? { schoolName: req.user.schoolName } : {})
  }).lean();

  const studentSubmissions = await ExamSubmission.find({
    student: req.user.id
  }).lean();

  const marksMap = new Map();
  studentMarks.forEach((m) => {
    const subjId = m.subject?._id ? m.subject._id.toString() : m.subject?.toString();
    if (subjId) {
      const key = `${subjId}_${m.examTerm}_${m.academicYear}`;
      marksMap.set(key, m);
    }
  });

  const submissionMap = new Map();
  studentSubmissions.forEach((sub) => {
    if (sub.exam) {
      submissionMap.set(sub.exam.toString(), sub);
    }
  });

  const formattedExams = exams.map((exam) => {
    const examObj = exam.toObject();
    const subjId = exam.subject?._id ? exam.subject._id.toString() : exam.subject?.toString();
    const markKey = `${subjId}_${exam.examTerm}_${exam.academicYear}`;
    const mark = marksMap.get(markKey);
    const submission = submissionMap.get(exam._id.toString());

    if (mark) {
      const percentage = mark.maxMarks > 0 ? Math.round((mark.marksObtained / mark.maxMarks) * 100) : 0;
      examObj.studentMark = {
        marksObtained: mark.marksObtained,
        maxMarks: mark.maxMarks,
        isAbsent: mark.isAbsent,
        grade: mark.grade,
        percentage
      };
      examObj.taken = !mark.isAbsent;
    }
    if (submission) {
      examObj.submission = submission;
      examObj.taken = true;
    }

    return examObj;
  });

  return res.json(formattedExams);
}

res.json(exams);

} catch (err) {
  res.status(500).json({ message: err.message });
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
