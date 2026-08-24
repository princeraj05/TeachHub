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
path:"classes",
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

// ================= GET PROCTOR SESSIONS =================
exports.getProctorSessions = async (req, res) => {
  try {
    const User = require("../models/User");
    const Exam = require("../models/Exam");
    const ExamSubmission = require("../models/ExamSubmission");
    const school = req.user.schoolName;
    if (!school) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    let query = {
      requestedSchool: school,
      requestStatus: "scheduled"
    };

    // If it's a teacher, filter by assigned proctor
    if (req.user.role === "teacher") {
      query.admissionExamProctor = req.user.id;
    }

    const admissionSessions = await User.find(query)
      .populate("admissionExamProctor", "name email role")
      .select("-password")
      .lean();

    // Fetch class exam sessions
    let examQuery = { schoolName: school, mode: "online" };
    if (req.user.role === "teacher") {
      examQuery.proctor = req.user.id;
    }

    const classExams = await Exam.find(examQuery)
      .populate("class", "name section")
      .populate("subject", "name")
      .lean();

    const classIds = classExams.map(ce => ce.class._id);
    const students = await User.find({ classId: { $in: classIds }, role: "student" })
      .select("-password")
      .lean();

    const classSessions = [];
    for (let student of students) {
      const studentExams = classExams.filter(ce => ce.class._id.toString() === student.classId.toString());
      for (let ce of studentExams) {
        // Check if student already finished this exam
        const submission = await ExamSubmission.findOne({ student: student._id, exam: ce._id });
        if (!submission) {
          classSessions.push({
            _id: student._id,
            name: student.name,
            email: student.email,
            date: ce.date,
            isClassExam: true,
            examId: ce._id,
            examName: ce.subject?.name || "General",
            class: `${ce.class?.name || "Class"} (${ce.class?.section || "A"})`
          });
        }
      }
    }

    const allSessions = [
      ...admissionSessions.map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        date: s.admissionExamDate,
        isAdmission: true
      })),
      ...classSessions
    ];

    res.json(allSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
