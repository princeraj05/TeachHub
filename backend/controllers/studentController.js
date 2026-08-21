const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const User = require("../models/User");
const AdmissionExam = require("../models/AdmissionExam");


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

// ================= GET ADMISSION EXAM =================
exports.getStudentAdmissionExam = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const school = student.schoolName || student.requestedSchool;
    if (!school) {
      return res.status(400).json({ message: "No school associated with student" });
    }

    let exam = await AdmissionExam.findOne({ schoolName: school });
    if (!exam) {
      const defaultQuestions = require("../utils/defaultQuestions");
      exam = new AdmissionExam({
        schoolName: school,
        negativeMarking: false,
        negativeMarkValue: 0.25,
        questions: defaultQuestions
      });
      await exam.save();
    }

    // Security check: strip correctOptionIndex
    const secureQuestions = exam.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      section: q.section,
      options: q.options
    }));

    res.json({
      _id: exam._id,
      schoolName: exam.schoolName,
      negativeMarking: exam.negativeMarking,
      negativeMarkValue: exam.negativeMarkValue,
      questions: secureQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUBMIT ADMISSION EXAM =================
exports.submitStudentAdmissionExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.admissionExamTaken) {
      return res.status(400).json({ message: "You have already completed this admission exam" });
    }

    const school = student.schoolName || student.requestedSchool;
    const exam = await AdmissionExam.findOne({ schoolName: school });
    if (!exam) {
      return res.status(404).json({ message: "Admission exam not found for this school" });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let score = 0;

    exam.questions.forEach((q, idx) => {
      const studentAns = answers && answers[idx] !== undefined ? answers[idx] : -1;
      if (studentAns === q.correctOptionIndex) {
        correctCount += 1;
        score += 1;
      } else if (studentAns !== -1 && studentAns !== null) {
        wrongCount += 1;
        if (exam.negativeMarking) {
          score -= exam.negativeMarkValue;
        }
      }
    });

    student.admissionExamTaken = true;
    student.admissionExamScore = Number(score.toFixed(2));
    student.admissionExamTotal = exam.questions.length;
    student.admissionExamCorrect = correctCount;
    student.admissionExamWrong = wrongCount;

    await student.save();

    res.json({
      message: "Admission exam graded successfully",
      result: {
        score: student.admissionExamScore,
        total: student.admissionExamTotal,
        correct: student.admissionExamCorrect,
        wrong: student.admissionExamWrong
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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