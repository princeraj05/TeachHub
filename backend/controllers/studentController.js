const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const User = require("../models/User");
const AdmissionExam = require("../models/AdmissionExam");
const ExamSubmission = require("../models/ExamSubmission");


// Helper: Authoritatively resolve class for a student scoped by user's active school
const resolveStudentClassData = async (user) => {
  if (!user || !user.schoolName) return null;
  let classData = null;
  if (user.classId) {
    classData = await Class.findOne({ _id: user.classId, schoolName: user.schoolName }).lean();
  }
  if (!classData) {
    classData = await Class.findOne({ students: user._id, schoolName: user.schoolName }).lean();
  }
  return classData;
};


// ================= STUDENT DASHBOARD =================

exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await User.findById(studentId).select("schoolName classId").lean();
    if (!user || !user.schoolName) {
      return res.json({
        subjects: 0,
        attendance: 0,
        exams: 0,
        achievements: 0
      });
    }

    const classData = await resolveStudentClassData(user);

    let subjects = 0;
    let attendance = 0;
    let exams = 0;

    if (classData) {
      const subjectList = await Subject.find({
        schoolName: user.schoolName,
        $or: [{ class: classData._id }, { classes: classData._id }]
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
      exams,
      achievements: 0
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// ================= GET STUDENT SUBJECTS =================

exports.getStudentSubjects = async (req, res) => {
  try {
    const studentId = req.user.id;
    const SubjectSyllabus = require("../models/SubjectSyllabus");
    const MasterSyllabus = require("../models/MasterSyllabus");
    const SubjectNote = require("../models/SubjectNote");

    const user = await User.findById(studentId).select("schoolName classId").lean();
    if (!user || !user.schoolName) {
      return res.json([]);
    }

    const classData = await resolveStudentClassData(user);

    if (!classData) {
      return res.json([]);
    }

    const subjects = await Subject.find({
      schoolName: user.schoolName,
      $or: [{ class: classData._id }, { classes: classData._id }]
    }).populate("teacher", "name").lean();

    const classNameStr = `Class ${classData.name}`;
    const sectionStr = classData.section || "A";

    const enrichedSubjects = [];
    for (const sub of subjects) {
      if (!sub) continue;

      let syllabus = await SubjectSyllabus.findOne({
        subject: sub._id,
        $or: [
          { className: classNameStr },
          { className: classData.name },
          { className: `${classData.name}-${sectionStr}` }
        ]
      }).lean();

      let chapters = syllabus?.chapters || [];
      if (chapters.length === 0) {
        const master = await MasterSyllabus.findOne({
          subjectName: new RegExp("^" + (sub.name || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i"),
          className: { $in: [classNameStr, classData.name] }
        }).lean();
        if (master && master.chapters) {
          chapters = master.chapters;
        }
      }

      const totalChapters = chapters.length;
      const completedChapters = chapters.filter(c => c.status === "Completed").length;
      const inProgressChapters = chapters.filter(c => c.status === "In Progress").length;

      let progressPct = 0;
      if (totalChapters > 0) {
        progressPct = Math.round(
          (completedChapters / totalChapters) * 100 + (inProgressChapters / totalChapters) * 40
        );
        if (progressPct > 100) progressPct = 100;
      }

      const notesCount = await SubjectNote.countDocuments({
        subject: sub._id,
        className: { $in: [classNameStr, classData.name] },
        section: { $in: [sectionStr.toUpperCase(), "ALL", ""] }
      });

      enrichedSubjects.push({
        ...sub,
        chapters: totalChapters,
        chaptersList: chapters,
        progress: progressPct,
        notesCount
      });
    }

    res.json(enrichedSubjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= GET STUDENT PROFILE =================

exports.getStudentProfile = async (req,res)=>{

  try{

    const studentId = req.user.id;

    const student = await require("../models/User")
    .findById(studentId)
    .populate("admissionExamProctor", "name email role")
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
    const user = await User.findById(studentId).select("schoolName").lean();
    if (!user || !user.schoolName) {
      return res.json([]);
    }

    const attendance = await Attendance.find({
      student: studentId,
      schoolName: user.schoolName
    })
    .sort({ date:-1 })
    .populate("subject", "name")
    .populate("teacher", "name email role")
    .select("date status subject teacher remarks");

    res.json(attendance);

  }catch(err){

    res.status(500).json({
      message: err.message
    });

  }

};

// Helper: Normalize target class name
const normalizeStudentTargetClass = (rawName) => {
  if (!rawName) return "Class 1";
  const str = String(rawName).trim();
  if (/^class\s+/i.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return `Class ${str}`;
};

// Helper: Authoritatively determine student applicable class name
const getStudentApplicableClass = async (student) => {
  if (student.classId) {
    const cDoc = await Class.findById(student.classId).lean();
    if (cDoc && cDoc.name) return normalizeStudentTargetClass(cDoc.name);
  }
  if (student.targetClass) {
    return normalizeStudentTargetClass(student.targetClass);
  }
  return "Class 1";
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

    const targetClassName = await getStudentApplicableClass(student);

    let exam = await AdmissionExam.findOne({ schoolName: school, targetClass: targetClassName });
    
    // Fallback: If no class-specific exam found, check if a global or fallback exam exists
    if (!exam) {
      exam = await AdmissionExam.findOne({ schoolName: school });
    }

    if (!exam) {
      const defaultQuestions = require("../utils/defaultQuestions");
      exam = new AdmissionExam({
        schoolName: school,
        targetClass: targetClassName,
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
      targetClass: exam.targetClass || targetClassName,
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
    const targetClassName = await getStudentApplicableClass(student);

    let exam = await AdmissionExam.findOne({ schoolName: school, targetClass: targetClassName });
    if (!exam) {
      exam = await AdmissionExam.findOne({ schoolName: school });
    }

    if (!exam) {
      return res.status(404).json({ message: "Admission exam not found for your class" });
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
    student.requestStatus = "exam_completed";

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
    const user = await User.findById(studentId).select("schoolName classId").lean();
    if (!user || !user.schoolName) {
      return res.json([]);
    }

    const classData = await resolveStudentClassData(user);

    if(!classData){
      return res.json([]);
    }

    const sameLevelClassIds = await Class.find({
      schoolName: user.schoolName,
      name: classData.name
    }).distinct("_id");

    const exams = await Exam.find({
      class: { $in: sameLevelClassIds.length > 0 ? sameLevelClassIds : [classData._id] },
      schoolName: user.schoolName
    })
    .populate("subject","name")
    .populate("proctor", "name email role")
    .sort({ date:1 });

    const formatted = await Promise.all(exams.map(async (e) => {
      const submission = await ExamSubmission.findOne({ student: studentId, exam: e._id });
      return {
        _id: e._id,
        title: e.title || `${e.examTerm || "Half-Yearly"} Examination`,
        subject: e.subject?.name || "—",
        date: e.date,
        time: e.time || "09:00 AM",
        duration: e.duration || "1h 30m",
        roomNumber: e.roomNumber || "",
        maxMarks: e.maxMarks || 100,
        examTerm: e.examTerm || "Half-Yearly",
        academicYear: e.academicYear || "2026-2027",
        mode: e.mode || "offline",
        negativeMarking: e.negativeMarking || false,
        negativeMarkValue: e.negativeMarkValue || 0.25,
        questions: e.questions ? e.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          section: q.section
        })) : [],
        proctor: e.proctor,
        taken: !!submission,
        submission: submission ? {
          score: submission.score,
          total: submission.total,
          correct: submission.correct,
          wrong: submission.wrong
        } : null
      };
    }));

    res.json(formatted);

  }catch(err){
    res.status(500).json({
      message:err.message
    });
  }
};

// ================= SUBMIT STUDENT EXAM =================
exports.submitStudentExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const examId = req.params.id;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId).populate("subject", "name");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Verify student hasn't already submitted
    const existingSubmission = await ExamSubmission.findOne({ student: studentId, exam: examId });
    if (existingSubmission) {
      return res.status(400).json({ message: "You have already submitted this exam" });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let score = 0;

    (exam.questions || []).forEach((q, idx) => {
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

    const submission = await ExamSubmission.create({
      student: studentId,
      exam: examId,
      score: Number(score.toFixed(2)),
      total: (exam.questions || []).length,
      correct: correctCount,
      wrong: wrongCount,
      answers
    });

    res.json({
      message: "Exam submitted and graded successfully",
      result: {
        score: submission.score,
        total: submission.total,
        correct: submission.correct,
        wrong: submission.wrong
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET DETAILED EXAM RESULT =================
exports.getStudentExamResult = async (req, res) => {
  try {
    const studentId = req.user.id;
    const examId = req.params.examId;

    const submission = await ExamSubmission.findOne({ student: studentId, exam: examId });
    if (!submission) {
      return res.status(404).json({ message: "Exam submission not found for this student" });
    }

    const exam = await Exam.findById(examId).populate("subject", "name");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({
      _id: submission._id,
      score: submission.score,
      total: submission.total,
      correct: submission.correct,
      wrong: submission.wrong,
      answers: submission.answers,
      exam: {
        _id: exam._id,
        subject: exam.subject?.name || "—",
        date: exam.date,
        schoolName: exam.schoolName || "",
        questions: exam.questions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= MY DIARY (STUDENT HOMEWORK) =================

const MyDiary = require("../models/MyDiary");

// Helper to clean up any legacy dummy/seed homework entries from database
const purgeDummyDiaryEntries = async () => {
  try {
    await MyDiary.deleteMany({
      $or: [
        { teacherName: { $in: ["Kavita Ma'am", "Rohan Sir", "Singh Sir", "Anjali Ma'am"] } },
        { title: { $in: ["पाठ 2 के प्रश्न उत्तर एवं सुलेख", "Chapter 3 Reading & Vocabulary", "Unit 2 Practice & Tables", "Plant Life Cycle Project"] } }
      ]
    });
  } catch (e) {
    console.warn("Dummy diary cleanup warning:", e);
  }
};

exports.getStudentDiary = async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await User.findById(studentId).lean();
    if (!user || !user.schoolName) return res.status(404).json({ message: "Student not found or not associated with an active school" });

    const classData = await resolveStudentClassData(user);
    const schoolName = user.schoolName;
    const className = classData ? `Class ${classData.name}` : "Class 5";
    const section = classData?.section || "A";

    const todayStr = new Date().toISOString().split("T")[0];
    const targetDate = req.query.date || todayStr;

    // Purge any legacy dummy seed entries from DB
    await purgeDummyDiaryEntries();

    const query = {
      homeworkDate: targetDate,
      $or: [
        { classId: classData?._id },
        { schoolName: schoolName }
      ]
    };

    if (req.query.subject && req.query.subject !== "All") {
      query.subjectName = new RegExp(req.query.subject, "i");
    }

    const rawHomeworks = await MyDiary.find(query).sort({ createdAt: -1 }).lean();

    let completedCount = 0;
    let pendingCount = 0;
    const subjectSet = new Set();

    const formattedHomeworks = rawHomeworks.map((hw) => {
      subjectSet.add(hw.subjectName);

      const studentComp = (hw.studentCompletions || []).find(
        (sc) => sc.studentId?.toString() === studentId.toString()
      );

      const status = studentComp?.status || "Pending";
      if (status === "Completed" || status === "Submitted" || status === "Reviewed") {
        completedCount++;
      } else {
        pendingCount++;
      }

      return {
        _id: hw._id,
        schoolName: hw.schoolName,
        className: hw.className,
        section: hw.section,
        subjectName: hw.subjectName,
        teacherName: hw.teacherName || "Assigned Teacher",
        homeworkDate: hw.homeworkDate,
        dueDate: hw.dueDate || hw.homeworkDate,
        title: hw.title,
        description: hw.description,
        types: hw.types || ["Exercise"],
        status: status,
        parentSignatureName: studentComp?.parentSignatureName || "",
        parentSignedAt: studentComp?.parentSignedAt || null,
        completedAt: studentComp?.completedAt || null,
        submittedAt: studentComp?.submittedAt || null,
        attachment: studentComp?.attachment || { url: "", filename: "", fileType: "" },
        reviewNote: studentComp?.reviewNote || ""
      };
    });

    res.json({
      schoolName,
      className,
      section,
      date: targetDate,
      summary: {
        totalHomework: formattedHomeworks.length,
        completed: completedCount,
        pending: pendingCount,
        subjectsCount: subjectSet.size
      },
      homeworks: formattedHomeworks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHomeworkDetails = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const hw = await MyDiary.findById(id).lean();
    if (!hw) {
      return res.status(404).json({ message: "Homework entry not found" });
    }

    const studentComp = (hw.studentCompletions || []).find(
      (sc) => sc.studentId?.toString() === studentId.toString()
    );

    res.json({
      _id: hw._id,
      schoolName: hw.schoolName,
      className: hw.className,
      section: hw.section,
      subjectName: hw.subjectName,
      teacherName: hw.teacherName || "Assigned Teacher",
      homeworkDate: hw.homeworkDate,
      dueDate: hw.dueDate || hw.homeworkDate,
      title: hw.title,
      description: hw.description,
      types: hw.types || [],
      status: studentComp?.status || "Pending",
      parentSignatureName: studentComp?.parentSignatureName || "",
      parentSignedAt: studentComp?.parentSignedAt || null,
      completedAt: studentComp?.completedAt || null,
      submittedAt: studentComp?.submittedAt || null,
      attachment: studentComp?.attachment || { url: "", filename: "", fileType: "" },
      reviewNote: studentComp?.reviewNote || ""
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markHomeworkCompleted = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { parentSignatureName, parentName } = req.body;
    const signatureName = parentSignatureName || parentName || "Parent / Guardian";

    const hw = await MyDiary.findById(id);
    if (!hw) {
      return res.status(404).json({ message: "Homework entry not found" });
    }

    let studentComp = hw.studentCompletions.find(
      (sc) => sc.studentId?.toString() === studentId.toString()
    );

    if (!studentComp) {
      hw.studentCompletions.push({
        studentId,
        status: "Completed",
        parentSignatureName: signatureName,
        parentSignedAt: new Date(),
        completedAt: new Date()
      });
      studentComp = hw.studentCompletions[hw.studentCompletions.length - 1];
    } else {
      studentComp.status = "Completed";
      studentComp.parentSignatureName = signatureName;
      studentComp.parentSignedAt = new Date();
      studentComp.completedAt = new Date();
    }

    await hw.save();

    res.json({
      message: "Homework marked as Completed with Parent Signature!",
      status: studentComp.status,
      parentSignatureName: studentComp.parentSignatureName,
      parentSignedAt: studentComp.parentSignedAt,
      completedAt: studentComp.completedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitHomework = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { attachmentUrl, filename, fileType } = req.body;

    const hw = await MyDiary.findById(id);
    if (!hw) {
      return res.status(404).json({ message: "Homework entry not found" });
    }

    let studentComp = hw.studentCompletions.find(
      (sc) => sc.studentId?.toString() === studentId.toString()
    );

    const attachmentObj = {
      url: attachmentUrl || "",
      filename: filename || "homework_submission",
      fileType: fileType || "image/png"
    };

    if (!studentComp) {
      hw.studentCompletions.push({
        studentId,
        status: "Submitted",
        submittedAt: new Date(),
        attachment: attachmentObj
      });
      studentComp = hw.studentCompletions[hw.studentCompletions.length - 1];
    } else {
      studentComp.status = "Submitted";
      studentComp.submittedAt = new Date();
      studentComp.attachment = attachmentObj;
    }

    await hw.save();

    res.json({
      message: "Homework submitted successfully!",
      status: studentComp.status,
      submittedAt: studentComp.submittedAt,
      attachment: studentComp.attachment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

