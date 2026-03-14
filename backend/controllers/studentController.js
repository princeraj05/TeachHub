const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");


// ================= STUDENT DASHBOARD =================

exports.getStudentDashboard = async (req, res) => {

  try {

    const studentId = req.user.id;

    const classData = await Class.findOne({
      students: studentId
    });

    let subjects = 0;
    let attendance = 0;
    let exams = 0;

    if (classData) {

      const subjectList = await Subject.find({
        class: classData._id
      });

      subjects = subjectList.length;

      const examList = await Exam.find({
        class: classData._id
      });

      exams = examList.length;

      const totalAttendance = await Attendance.countDocuments({
        student: studentId
      });

      const presentAttendance = await Attendance.countDocuments({
        student: studentId,
        status: "Present"
      });

      if (totalAttendance > 0) {
        attendance = Math.round((presentAttendance / totalAttendance) * 100);
      }

    }

    res.json({
      subjects,
      attendance,
      exams
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= GET STUDENT SUBJECTS =================

exports.getStudentSubjects = async (req,res)=>{

  try{

    const studentId = req.user.id;

    const classData = await Class.findOne({
      students: studentId
    });

    if(!classData){
      return res.json([]);
    }

    const subjects = await Subject.find({
      class: classData._id
    }).populate("teacher","name");

    res.json(subjects);

  }catch(err){

    res.status(500).json({
      message:err.message
    });

  }

};


// ================= GET STUDENT PROFILE =================

exports.getStudentProfile = async (req,res)=>{

  try{

    const studentId = req.user.id;

    const student = await require("../models/User")
    .findById(studentId)
    .select("-password");

    if(!student){
      return res.status(404).json({
        message:"Student not found"
      });
    }

    res.json(student);

  }catch(err){

    res.status(500).json({
      message:err.message
    });

  }

};


// ================= GET STUDENT ATTENDANCE =================

exports.getStudentAttendance = async (req,res)=>{

  try{

    const studentId = req.user.id;

    const attendance = await Attendance.find({
      student: studentId
    })
    .sort({ date:-1 })
    .select("date status");

    res.json(attendance);

  }catch(err){

    res.status(500).json({
      message: err.message
    });

  }

};


// ================= GET STUDENT EXAMS =================

exports.getStudentExams = async (req,res)=>{

  try{

    const studentId = req.user.id;

    const classData = await Class.findOne({
      students: studentId
    });

    if(!classData){
      return res.json([]);
    }

    const exams = await Exam.find({
      class: classData._id
    })
    .populate("subject","name")
    .sort({ date:1 });

    const formatted = exams.map(e=>({
      subject:e.subject?.name,
      date:e.date
    }));

    res.json(formatted);

  }catch(err){

    res.status(500).json({
      message:err.message
    });

  }

};