const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const User = require("../models/User");
const Timetable = require("../models/Timetable");
const ExamSubmission = require("../models/ExamSubmission");
const SubjectSyllabus = require("../models/SubjectSyllabus");
const MasterSyllabus = require("../models/MasterSyllabus");

// Helper to sort classes in natural numerical order (Class 1, Class 2, Class 3...)
const sortClassesNumerically = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const nameA = String(a.rawName || a.name || "");
    const nameB = String(b.rawName || b.name || "");
    const numA = parseInt(nameA.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(nameB.replace(/\D/g, ""), 10) || 0;
    if (numA !== numB) return numA - numB;
    return String(a.section || "").localeCompare(String(b.section || ""));
  });
};

// ================= GET MY SUBJECTS =================

exports.getMySubjectsDetailed = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const timetableSubjectIds = await Timetable.distinct("subject", { teacher: teacherId });
    const subjects = await Subject.find({
      $or: [{ teacher: teacherId }, { _id: { $in: timetableSubjectIds } }]
    }).populate({
      path: "classes",
      select: "name section students"
    });

    const detailedSubjects = [];
    for (const sub of subjects) {
      // Get all classes for this subject via Timetable as well
      const ttClassIds = await Timetable.distinct("class", { subject: sub._id, teacher: teacherId });
      const ttClasses = await Class.find({ _id: { $in: ttClassIds } }).select("name section students");

      const classMap = new Map();
      if (sub.classes && Array.isArray(sub.classes)) {
        sub.classes.forEach(c => classMap.set(String(c._id), c));
      }
      ttClasses.forEach(c => classMap.set(String(c._id), c));
      const mergedClasses = sortClassesNumerically(Array.from(classMap.values()));

      let totalStudents = 0;
      mergedClasses.forEach(c => {
        if (c.students && Array.isArray(c.students)) {
          totalStudents += c.students.length;
        }
      });

      // Check if real syllabus exists in DB
      let chaptersCount = 0;
      let progressPct = 0;

      const masterSyllabi = await MasterSyllabus.find({
        schoolName: req.user.schoolName || "",
        subjectName: new RegExp("^" + sub.name.trim() + "$", "i")
      }).lean();

      if (masterSyllabi && masterSyllabi.length > 0) {
        const totalCh = masterSyllabi.reduce((acc, m) => acc + (m.chapters?.length || 0), 0);
        chaptersCount = Math.round(totalCh / masterSyllabi.length);
      } else {
        const subjectSyllabi = await SubjectSyllabus.find({ subject: sub._id }).lean();
        if (subjectSyllabi && subjectSyllabi.length > 0) {
          const firstWithCh = subjectSyllabi.find(s => s.chapters && s.chapters.length > 0);
          if (firstWithCh) {
            chaptersCount = firstWithCh.chapters.length;
            const completed = firstWithCh.chapters.filter(ch => ch.status === "Completed").length;
            progressPct = chaptersCount > 0 ? Math.round((completed / chaptersCount) * 100) : 0;
          }
        }
      }

      detailedSubjects.push({
        _id: sub._id,
        name: sub.name,
        schoolName: sub.schoolName,
        classes: mergedClasses.map(c => ({ _id: c._id, name: c.name, section: c.section })),
        studentsCount: totalStudents,
        chapters: chaptersCount,
        progress: progressPct,
        subjectCode: sub.code || "SUB101",
        department: sub.department || "General"
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

    const timetableSubjectIds = await Timetable.distinct("subject", { teacher: teacherId });
    const subject = await Subject.findOne({
      _id: subjectId,
      $or: [{ teacher: teacherId }, { _id: { $in: timetableSubjectIds } }]
    }).populate({
      path: "classes",
      populate: { path: "students", select: "name email avatar gender" }
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

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
      title: ex.notes || "Unit Test",
      className: `${ex.class?.name || "Class"} - ${ex.class?.section || "A"}`,
      date: ex.date
    }));

    // Collect class list and student lists per class
    let totalStudents = 0;
    const classProgressList = [];
    const allStudentsList = [];
    
    subject.classes.forEach((c) => {
      const classStudents = (c.students || []).map(st => ({
        _id: st._id,
        name: st.name || "Student",
        email: st.email || "",
        avatar: st.avatar || "",
        gender: st.gender || "Other",
        className: `Class ${c.name} - ${c.section}`,
        classId: c._id
      }));

      const studentCount = classStudents.length;
      totalStudents += studentCount;
      allStudentsList.push(...classStudents);

      classProgressList.push({
        _id: c._id,
        name: `Class ${c.name} - ${c.section}`,
        rawName: c.name,
        section: c.section,
        studentCount,
        progress: 0,
        students: classStudents
      });
    });

    const sortedClasses = sortClassesNumerically(classProgressList);

    // Helper to extract base class name
    const extractBaseClassName = (str) => {
      if (!str || str === "All") return null;
      const numMatch = String(str).match(/\d+/);
      return numMatch ? `Class ${numMatch[0]}` : String(str).trim();
    };

    const requestedClassName = req.query.className;
    const targetClassName = extractBaseClassName(requestedClassName);
    let liveSyllabus = null;

    if (targetClassName) {
      liveSyllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: targetClassName }).lean();
    }
    if (!liveSyllabus) {
      liveSyllabus = await SubjectSyllabus.findOne({ subject: subjectId }).lean();
    }

    let totalChaptersCount = 0;
    let completedChaptersCount = 0;
    let calculatedProgress = 0;
    let inProgressPct = 0;
    let notStartedPct = 0;
    let overduePct = 0;

    if (liveSyllabus && liveSyllabus.chapters && liveSyllabus.chapters.length > 0) {
      totalChaptersCount = liveSyllabus.chapters.length;
      completedChaptersCount = liveSyllabus.chapters.filter(ch => ch.status === "Completed").length;
      const inProgCount = liveSyllabus.chapters.filter(ch => ch.status === "In Progress").length;
      const notStartedCount = liveSyllabus.chapters.filter(ch => ch.status === "Not Started").length;

      calculatedProgress = Math.round(
        (completedChaptersCount / totalChaptersCount) * 100 + (inProgCount / totalChaptersCount) * 40
      );
      if (calculatedProgress > 100) calculatedProgress = 100;

      inProgressPct = Math.round((inProgCount / totalChaptersCount) * 100);
      notStartedPct = Math.round((notStartedCount / totalChaptersCount) * 100);
      overduePct = 0;
    }

    // Update progress on class progress list based on actual live syllabus
    for (const c of sortedClasses) {
      const clsName = `Class ${c.rawName}`;
      const clsSyllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: clsName }).lean();
      if (clsSyllabus && clsSyllabus.chapters && clsSyllabus.chapters.length > 0) {
        const total = clsSyllabus.chapters.length;
        const comp = clsSyllabus.chapters.filter(ch => ch.status === "Completed").length;
        c.progress = Math.round((comp / total) * 100);
      } else {
        c.progress = calculatedProgress;
      }
    }

    // Filter students if a specific class was requested
    let filteredStudents = allStudentsList;
    if (requestedClassName && requestedClassName !== "All") {
      const matchedClass = sortedClasses.find(
        c => c.name.toLowerCase() === requestedClassName.toLowerCase() ||
             c.name.toLowerCase().includes(requestedClassName.toLowerCase()) ||
             `class ${c.rawName}`.toLowerCase() === requestedClassName.toLowerCase()
      );
      if (matchedClass) {
        filteredStudents = matchedClass.students;
      }
    }

    res.json({
      subjectInfo: {
        _id: subject._id,
        name: subject.name,
        code: subject.code || "SUB101",
        description: subject.description || `Syllabus and details for ${subject.name}.`,
        department: subject.department || "General",
        chapters: totalChaptersCount,
        progress: calculatedProgress,
        studentsCount: totalStudents,
        classesCount: subject.classes?.length || 0
      },
      teacherInfo: {
        name: req.user.name || "Course Instructor",
        email: req.user.email || "",
        phone: req.user.phoneNumber || "",
        avatar: req.user.avatar || ""
      },
      academicMetadata: {
        year: "2026",
        term: "Session 1 (Apr - Sep)",
        department: subject.department || "General",
        subjectCode: subject.code || "SUB101"
      },
      assignedClasses: sortedClasses,
      students: filteredStudents,
      allStudents: allStudentsList,
      timetable: formattedTimetable,
      exams: formattedExams,
      assignments: [],
      progressOverview: {
        completed: calculatedProgress,
        inProgress: inProgressPct,
        notStarted: notStartedPct,
        overdue: overduePct,
        chapterCompletion: `${completedChaptersCount} / ${totalChaptersCount}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
