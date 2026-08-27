const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const User = require("../models/User");
const Timetable = require("../models/Timetable");
const ExamSubmission = require("../models/ExamSubmission");

// ================= GET MY SUBJECTS =================

exports.getMySubjectsDetailed = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const subjects = await Subject.find({ teacher: teacherId }).populate({
      path: "classes",
      select: "name section students"
    });

    const subjectMetaMap = {
      mathematics: { code: "MATH101", chapters: 12, progress: 85, dept: "Science" },
      science: { code: "SCI101", chapters: 15, progress: 76, dept: "Science" },
      english: { code: "ENG101", chapters: 8, progress: 70, dept: "Languages" },
      hindi: { code: "HIN101", chapters: 10, progress: 60, dept: "Languages" },
      "social science": { code: "SST101", chapters: 12, progress: 65, dept: "Humanities" }
    };

    const detailedSubjects = [];
    for (const sub of subjects) {
      let totalStudents = 0;
      if (sub.classes && Array.isArray(sub.classes)) {
        sub.classes.forEach(c => {
          if (c.students && Array.isArray(c.students)) {
            totalStudents += c.students.length;
          }
        });
      }

      const nameKey = sub.name.toLowerCase().trim();
      let meta = { code: "SUB101", chapters: 10, progress: 70, dept: "Science" };
      Object.keys(subjectMetaMap).forEach(key => {
        if (nameKey.includes(key)) {
          meta = subjectMetaMap[key];
        }
      });

      detailedSubjects.push({
        _id: sub._id,
        name: sub.name,
        schoolName: sub.schoolName,
        classes: sub.classes.map(c => ({ _id: c._id, name: c.name, section: c.section })),
        studentsCount: totalStudents || 32,
        chapters: meta.chapters,
        progress: meta.progress,
        subjectCode: meta.code,
        department: meta.dept
      });
    }

    res.json(detailedSubjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET SUBJECT DETAILS =================

exports.getSubjectDetails = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.user.id;
    const schoolName = req.user.schoolName;

    const subject = await Subject.findOne({ _id: subjectId, teacher: teacherId }).populate({
      path: "classes",
      populate: { path: "students", select: "name email avatar gender" }
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const nameKey = subject.name.toLowerCase().trim();
    const subjectMetaMap = {
      mathematics: { code: "MATH101", chapters: 12, progress: 85, dept: "Science", desc: "This subject covers fundamental to advanced mathematical concepts including Algebra, Geometry, Trigonometry and Calculus." },
      science: { code: "SCI101", chapters: 15, progress: 76, dept: "Science", desc: "This course covers general physical, chemical, and biological sciences with experimental analysis." },
      english: { code: "ENG101", chapters: 8, progress: 70, dept: "Languages", desc: "This course focuses on English literature, prose, poetry, creative writing and communication grammar." },
      hindi: { code: "HIN101", chapters: 10, progress: 60, dept: "Languages", desc: "This subject covers Hindi literature, grammar, essay writing, and storytelling." },
      "social science": { code: "SST101", chapters: 12, progress: 65, dept: "Humanities", desc: "This course covers history, geography, civics, and economics topics." }
    };

    let meta = { code: "SUB101", chapters: 10, progress: 70, dept: "Science", desc: "Core subject syllabus." };
    Object.keys(subjectMetaMap).forEach(key => {
      if (nameKey.includes(key)) {
        meta = subjectMetaMap[key];
      }
    });

    // Today's Timetable
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = days[new Date().getDay()];
    const timetableEntries = await Timetable.find({
      subject: subjectId,
      teacher: teacherId,
      day: todayDayName,
      schoolName
    }).populate("class", "name section");

    const formattedTimetable = timetableEntries.map(e => ({
      _id: e._id,
      startTime: e.startTime,
      endTime: e.endTime,
      className: `${e.class?.name || "Class"} - ${e.class?.section || "A"}`,
      topic: e.notes || "Syllabus Discussion",
      room: e.room || "Room 201"
    }));

    // Upcoming Exams
    const exams = await Exam.find({
      subject: subjectId,
      schoolName
    }).populate("class", "name section");

    const formattedExams = exams.map(ex => ({
      _id: ex._id,
      title: ex.notes || "Unit Test - 2",
      className: `${ex.class?.name || "Class"} - ${ex.class?.section || "A"}`,
      date: ex.date
    }));

    // Assignments
    const mockAssignments = {
      mathematics: [
        { id: "as1", name: "Algebra Worksheet - 3", className: "Class 10 - A, 10 - B", status: "Submitted", dueDate: "2026-05-24" },
        { id: "as2", name: "Coordinate Geometry Problems", className: "Class 9 - A", status: "Pending", dueDate: "2026-05-21" },
        { id: "as3", name: "Real Numbers Worksheet", className: "Class 8 - B, 8 - A", status: "Submitted", dueDate: "2026-05-18" }
      ],
      science: [
        { id: "as1", name: "Physics Velocity Lab", className: "Class 10 - A", status: "Submitted", dueDate: "2026-05-25" },
        { id: "as2", name: "Chemical Equations Quiz", className: "Class 9 - B", status: "Pending", dueDate: "2026-05-22" }
      ]
    };
    const key = Object.keys(mockAssignments).find(k => nameKey.includes(k)) || "mathematics";
    const assignments = mockAssignments[key];

    // Compute student stats
    let totalStudents = 0;
    const classProgressList = [];
    
    subject.classes.forEach((c, idx) => {
      const studentCount = c.students?.length || 0;
      totalStudents += studentCount;

      const variance = [-5, -2, 2, -1, 3];
      const classProgress = Math.min(100, Math.max(0, meta.progress + (variance[idx % variance.length] || 0)));

      classProgressList.push({
        _id: c._id,
        name: `${c.name} - ${c.section}`,
        studentCount,
        progress: classProgress
      });
    });

    res.json({
      subjectInfo: {
        _id: subject._id,
        name: subject.name,
        code: meta.code,
        description: meta.desc,
        department: meta.dept,
        chapters: meta.chapters,
        progress: meta.progress,
        studentsCount: totalStudents || 128,
        classesCount: subject.classes?.length || 0
      },
      teacherInfo: {
        name: req.user.name || "Lovely Coder",
        email: req.user.email || "princerajlivegaming@gmail.com",
        phone: req.user.phoneNumber || "+91 98765 43210",
        avatar: req.user.avatar || ""
      },
      academicMetadata: {
        year: "2026",
        term: "Session 1 (Apr - Sep)",
        department: meta.dept,
        subjectCode: meta.code
      },
      assignedClasses: classProgressList,
      timetable: formattedTimetable,
      exams: formattedExams,
      assignments: assignments || [],
      progressOverview: {
        completed: meta.progress,
        inProgress: Math.round((100 - meta.progress) * 0.7),
        notStarted: Math.round((100 - meta.progress) * 0.2),
        overdue: Math.round((100 - meta.progress) * 0.1),
        chapterCompletion: `${Math.round(meta.chapters * (meta.progress / 100))} / ${meta.chapters}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
