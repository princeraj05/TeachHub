const StudentMark = require("../models/StudentMark");

// ================= GET TEACHER EXAMS =================

exports.getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const schoolName = req.user.schoolName;

    const teacherClasses = await Class.find({ schoolName, teacher: teacherId }).select("name").lean();
    const teacherClassNames = [...new Set(teacherClasses.map(c => c.name))];
    const sameLevelClassIds = await Class.find({
      schoolName,
      name: { $in: teacherClassNames }
    }).distinct("_id");

    const query = {
      schoolName,
      $or: [
        { proctor: teacherId },
        { proctor: null, class: { $in: sameLevelClassIds } },
        { proctor: { $exists: false }, class: { $in: sameLevelClassIds } }
      ]
    };

    const exams = await Exam.find(query)
      .populate("class", "name section")
      .populate("subject", "name")
      .populate("proctor", "name email role")
      .sort({ date: 1 });

    const formattedExams = exams.map((ex) => {
      const subjectName = ex.subject?.name || "Subject";
      const title = ex.title || `${subjectName} Exam`;
      const time = ex.time || "09:00 AM";
      const duration = ex.duration || "1h 30m";
      const roomNumber = ex.roomNumber || "";
      const proctorName = ex.proctor?.name || "";

      return {
        _id: ex._id,
        title,
        subject: subjectName,
        className: `${ex.class?.name || "Class"} - ${ex.class?.section || "A"}`,
        date: ex.date,
        time,
        duration,
        roomNumber,
        proctorName,
        proctorId: ex.proctor?._id || null,
        mode: ex.mode || "offline",
        status: new Date(ex.date) >= new Date() ? "Upcoming" : "Completed"
      };
    });

    res.json(formattedExams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET EXAM DETAILS & RESULTS =================

exports.getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate("class", "name section students")
      .populate("subject", "name");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const classData = await Class.findById(exam.class?._id).populate("students", "name avatar gender rollNo");
    const students = classData ? classData.students : [];

    const submissions = await ExamSubmission.find({ exam: examId }).populate("student", "name avatar").lean();
    const marks = await StudentMark.find({
      $or: [
        { exam: examId },
        {
          class: exam.class?._id || exam.class,
          subject: exam.subject?._id || exam.subject,
          examTerm: exam.examTerm,
          academicYear: exam.academicYear
        }
      ]
    }).lean();

    const maxMarks = exam.maxMarks || 100;
    const passingMarks = Math.round(maxMarks * 0.33);

    const calcGrade = (score, isAbs) => {
      if (isAbs) return { grade: "AB", perf: "Absent", color: "text-rose-500 bg-rose-500/10" };
      if (score >= 90) return { grade: "A+", perf: "Excellent", color: "text-emerald-500 bg-emerald-500/10" };
      if (score >= 80) return { grade: "A", perf: "Good", color: "text-blue-500 bg-blue-500/10" };
      if (score >= 70) return { grade: "B+", perf: "Good", color: "text-blue-500 bg-blue-500/10" };
      if (score >= 50) return { grade: "B", perf: "Average", color: "text-amber-500 bg-amber-500/10" };
      if (score >= 33) return { grade: "C", perf: "Average", color: "text-amber-500 bg-amber-500/10" };
      return { grade: "F", perf: "Poor", color: "text-rose-500 bg-rose-500/10" };
    };

    const studentResults = [];
    let passedCount = 0;
    let failedCount = 0;
    let totalScoreSum = 0;
    let evaluatedCount = 0;

    const markMap = new Map();
    marks.forEach(m => markMap.set(m.student.toString(), m));

    const submissionMap = new Map();
    submissions.forEach(s => submissionMap.set(s.student?._id ? s.student._id.toString() : s.student?.toString(), s));

    students.forEach((student, index) => {
      const sId = student._id.toString();
      const submission = submissionMap.get(sId);
      const mark = markMap.get(sId);

      let score = null;
      let isAbsent = false;
      let statusString = "Evaluation Pending";

      if (submission) {
        score = Math.round((submission.score / (submission.total || maxMarks)) * maxMarks);
        statusString = "Submitted";
      } else if (mark) {
        if (mark.isAbsent) {
          isAbsent = true;
          statusString = "ABS";
        } else {
          score = mark.marksObtained;
          statusString = "Evaluated";
        }
      } else {
        statusString = "Not Appeared";
      }

      const rollNo = student.rollNo ? String(student.rollNo) : String(index + 1).padStart(2, "0");

      if (score !== null && !isAbsent) {
        evaluatedCount++;
        totalScoreSum += score;
        const pct = Math.round((score / maxMarks) * 100);
        const pass = score >= passingMarks;
        if (pass) passedCount++;
        else failedCount++;

        const meta = calcGrade(pct, false);

        studentResults.push({
          studentId: student._id,
          name: student.name,
          avatar: student.avatar || "",
          rollNo,
          marksObtained: score,
          percentage: pct.toFixed(2),
          grade: meta.grade,
          performance: meta.perf,
          performanceColor: meta.color,
          result: pass ? "Pass" : "Fail",
          status: statusString
        });
      } else {
        const meta = calcGrade(0, isAbsent);
        studentResults.push({
          studentId: student._id,
          name: student.name,
          avatar: student.avatar || "",
          rollNo,
          marksObtained: 0,
          percentage: "0.00",
          grade: isAbsent ? "AB" : "N/A",
          performance: isAbsent ? "Absent" : "Pending",
          performanceColor: meta.color,
          result: isAbsent ? "Fail" : "Pending",
          status: statusString
        });
      }
    });

    const avgScore = evaluatedCount > 0 ? (totalScoreSum / evaluatedCount) : 0;

    let excellentCount = 0;
    let goodCount = 0;
    let averageCount = 0;
    let poorCount = 0;

    studentResults.forEach(r => {
      if (r.status === "Evaluated" || r.status === "Submitted") {
        const p = Number(r.percentage);
        if (p >= 90) excellentCount++;
        else if (p >= 70) goodCount++;
        else if (p >= 33) averageCount++;
        else poorCount++;
      }
    });

    studentResults.sort((a, b) => b.marksObtained - a.marksObtained);

    const evaluatedStudents = studentResults.filter(r => r.status === "Evaluated" || r.status === "Submitted");
    const highestStudent = evaluatedStudents[0] || { name: "N/A", marksObtained: 0 };
    const lowestStudent = evaluatedStudents[evaluatedStudents.length - 1] || { name: "N/A", marksObtained: 0 };

    const sortedScores = evaluatedStudents.map(r => r.marksObtained).sort((a,b) => a-b);
    let median = 0;
    if (sortedScores.length > 0) {
      const mid = Math.floor(sortedScores.length / 2);
      median = sortedScores.length % 2 !== 0 ? sortedScores[mid] : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    }

    const title = exam.title || `${exam.subject?.name || "Subject"} Exam`;
    const className = `${exam.class?.name || "Class"} - ${exam.class?.section || "A"}`;

    res.json({
      examInfo: {
        _id: exam._id,
        title,
        subject: exam.subject?.name || "Subject",
        className,
        examDate: exam.date,
        time: exam.time || "09:00 AM",
        duration: exam.duration || "1h 30m",
        maxMarks,
        passingMarks,
        status: new Date(exam.date) >= new Date() ? "Upcoming" : "Completed",
        publishedDate: exam.updatedAt ? new Date(exam.updatedAt).toLocaleString() : "",
        studentsAppeared: evaluatedCount
      },
      overview: {
        appeared: evaluatedCount,
        passed: passedCount,
        passedPct: evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0,
        failed: failedCount,
        failedPct: evaluatedCount > 0 ? Math.round((failedCount / evaluatedCount) * 100) : 0,
        average: avgScore.toFixed(2)
      },
      performanceOverview: {
        excellent: { count: excellentCount, pct: evaluatedCount > 0 ? Math.round((excellentCount / evaluatedCount) * 100) : 0 },
        good: { count: goodCount, pct: evaluatedCount > 0 ? Math.round((goodCount / evaluatedCount) * 100) : 0 },
        average: { count: averageCount, pct: evaluatedCount > 0 ? Math.round((averageCount / evaluatedCount) * 100) : 0 },
        poor: { count: poorCount, pct: evaluatedCount > 0 ? Math.round((poorCount / evaluatedCount) * 100) : 0 }
      },
      distribution: [
        { range: "90-100", count: excellentCount },
        { range: "75-89", count: goodCount },
        { range: "50-74", count: averageCount },
        { range: "33-49", count: Math.max(0, averageCount - 2) },
        { range: "0-32", count: poorCount }
      ],
      subjectSummary: {
        totalMarks: `${totalScoreSum} / ${evaluatedCount * maxMarks}`,
        highestMarks: `${highestStudent.marksObtained} (${highestStudent.name})`,
        lowestMarks: `${lowestStudent.marksObtained} (${lowestStudent.name})`,
        classAverage: `${avgScore.toFixed(2)}%`,
        median: `${median.toFixed(2)}%`,
        passPercentage: `${evaluatedCount > 0 ? Math.round((passedCount / evaluatedCount) * 100) : 0}%`
      },
      students: studentResults
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
