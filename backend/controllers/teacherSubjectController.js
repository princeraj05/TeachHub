const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const User = require("../models/User");
const Timetable = require("../models/Timetable");
const ExamSubmission = require("../models/ExamSubmission");
const SubjectSyllabus = require("../models/SubjectSyllabus");
const MasterSyllabus = require("../models/MasterSyllabus");

const escapeRegex = (str) => String(str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const teacherClasses = await Class.find({ $or: [{ teacher: teacherId }, { teachers: teacherId }] }).distinct("_id");

    const subjects = await Subject.find({
      $or: [
        { teacher: teacherId },
        { _id: { $in: timetableSubjectIds } },
        { classes: { $in: teacherClasses } },
        { class: { $in: teacherClasses } },
        { schoolName: req.user.schoolName }
      ]
    }).populate({
      path: "classes",
      select: "name section students"
    });

    const detailedSubjects = [];
    for (const sub of subjects) {
      if (!sub) continue;
      const ttClassIds = await Timetable.distinct("class", { subject: sub._id, teacher: teacherId });
      const ttClasses = await Class.find({ _id: { $in: ttClassIds } }).select("name section students");

      const classMap = new Map();
      if (sub.classes && Array.isArray(sub.classes)) {
        sub.classes.filter(Boolean).forEach(c => classMap.set(String(c._id), c));
      }
      ttClasses.filter(Boolean).forEach(c => classMap.set(String(c._id), c));
      const mergedClasses = sortClassesNumerically(Array.from(classMap.values()));

      let totalStudents = 0;
      mergedClasses.forEach(c => {
        if (c && c.students && Array.isArray(c.students)) {
          totalStudents += c.students.length;
        }
      });

      let chaptersCount = 0;
      let progressPct = 0;

      const masterSyllabi = await MasterSyllabus.find({
        schoolName: new RegExp("^" + escapeRegex(req.user.schoolName) + "$", "i"),
        subjectName: new RegExp("^" + escapeRegex(sub.name) + "$", "i")
      }).lean();

      if (masterSyllabi && masterSyllabi.length > 0) {
        const maxCh = Math.max(...masterSyllabi.map(m => m.chapters?.length || 0));
        chaptersCount = maxCh;
      }
      
      const subjectSyllabi = await SubjectSyllabus.find({ subject: sub._id }).lean();
      if (subjectSyllabi && subjectSyllabi.length > 0) {
        const firstWithCh = subjectSyllabi.find(s => s.chapters && s.chapters.length > 0);
        if (firstWithCh) {
          chaptersCount = Math.max(chaptersCount, firstWithCh.chapters.length);
          const completed = firstWithCh.chapters.filter(ch => ch.status === "Completed").length;
          progressPct = chaptersCount > 0 ? Math.round((completed / chaptersCount) * 100) : 0;
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
    const teacherClasses = await Class.find({ $or: [{ teacher: teacherId }, { teachers: teacherId }] }).distinct("_id");

    let subject = await Subject.findOne({
      _id: subjectId,
      $or: [
        { teacher: teacherId },
        { _id: { $in: timetableSubjectIds } },
        { classes: { $in: teacherClasses } },
        { class: { $in: teacherClasses } }
      ]
    }).populate({
      path: "classes",
      populate: { path: "students", select: "name email avatar gender" }
    });

    if (!subject) {
      subject = await Subject.findById(subjectId).populate({
        path: "classes",
        populate: { path: "students", select: "name email avatar gender" }
      });
    }

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Today's Timetable
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = days[new Date().getDay()];
    const timetableEntries = await Timetable.find({
      subject: subjectId,
      teacher: teacherId,
      day: todayDayName
    }).populate("class", "name section");

    const formattedTimetable = timetableEntries.map(e => ({
      _id: e._id,
      startTime: e.startTime,
      endTime: e.endTime,
      className: `${e.class?.name || "Class"}${e.class?.section ? ` - ${e.class.section}` : ""}`,
      topic: e.notes || "Syllabus Discussion",
      room: e.room || "Room 201"
    }));

    // Upcoming Exams
    const exams = await Exam.find({
      subject: subjectId
    }).populate("class", "name section");

    const formattedExams = exams.map(ex => ({
      _id: ex._id,
      title: ex.notes || "Unit Test",
      className: `${ex.class?.name || "Class"}${ex.class?.section ? ` - ${ex.class.section}` : ""}`,
      date: ex.date
    }));

    // Collect class list and student lists per class safely
    let totalStudents = 0;
    const classProgressList = [];
    const allStudentsList = [];
    
    (subject.classes || []).filter(Boolean).forEach((c) => {
      const classStudents = (c?.students || []).filter(Boolean).map(st => ({
        _id: st._id,
        name: st?.name || "Student",
        email: st?.email || "",
        avatar: st?.avatar || "",
        gender: st?.gender || "Other",
        className: `Class ${c.name}${c.section ? ` - ${c.section}` : ""}`,
        classId: c._id
      }));

      const studentCount = classStudents.length;
      totalStudents += studentCount;
      allStudentsList.push(...classStudents);

      classProgressList.push({
        _id: c._id,
        name: `Class ${c.name}${c.section ? ` - ${c.section}` : ""}`,
        rawName: c.name,
        section: c.section || "",
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
    const targetClassName = extractBaseClassName(requestedClassName) || (sortedClasses[0] ? `Class ${sortedClasses[0].rawName}` : "Class 1");
    
    let liveSyllabus = null;
    if (targetClassName) {
      liveSyllabus = await SubjectSyllabus.findOne({
        subject: subjectId,
        $or: [
          { className: targetClassName },
          { className: requestedClassName },
          { className: targetClassName.replace("Class ", "") }
        ]
      }).lean();
    }
    if (!liveSyllabus) {
      liveSyllabus = await SubjectSyllabus.findOne({ subject: subjectId }).lean();
    }

    let chaptersList = liveSyllabus?.chapters || [];

    // Fallback to MasterSyllabus if SubjectSyllabus chapters are 0
    if (chaptersList.length === 0) {
      const masterQuery = {
        subjectName: new RegExp("^" + escapeRegex(subject.name) + "$", "i")
      };
      if (targetClassName) {
        masterQuery.className = { $in: [targetClassName, requestedClassName, targetClassName.replace("Class ", "")] };
      }
      if (schoolName) {
        masterQuery.schoolName = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
      }
      const master = await MasterSyllabus.findOne(masterQuery).lean();
      if (master && master.chapters && master.chapters.length > 0) {
        chaptersList = master.chapters.map(ch => ({
          chapterNo: ch.chapterNo,
          title: ch.title,
          description: ch.description || "",
          status: "Not Started",
          isMasterChapter: true,
          topics: (ch.defaultTopics || []).map(t => ({ title: typeof t === 'string' ? t : (t.title || ""), completed: false }))
        }));

        // Seed SubjectSyllabus in background so future reads are fast
        SubjectSyllabus.create({
          subject: subjectId,
          className: targetClassName,
          teacher: teacherId,
          schoolName: schoolName || "",
          chapters: chaptersList
        }).catch(() => {});
      }
    }

    let totalChaptersCount = chaptersList.length;
    let completedChaptersCount = chaptersList.filter(ch => ch.status === "Completed").length;
    let inProgCount = chaptersList.filter(ch => ch.status === "In Progress").length;
    let notStartedCount = chaptersList.filter(ch => ch.status === "Not Started").length;

    let calculatedProgress = 0;
    let inProgressPct = 0;
    let notStartedPct = 0;

    if (totalChaptersCount > 0) {
      calculatedProgress = Math.round(
        (completedChaptersCount / totalChaptersCount) * 100 + (inProgCount / totalChaptersCount) * 40
      );
      if (calculatedProgress > 100) calculatedProgress = 100;

      inProgressPct = Math.round((inProgCount / totalChaptersCount) * 100);
      notStartedPct = Math.round((notStartedCount / totalChaptersCount) * 100);
    }

    // Update progress on class progress list based on actual live syllabus
    for (const c of sortedClasses) {
      const clsName = `Class ${c.rawName}`;
      let clsSyllabus = await SubjectSyllabus.findOne({
        subject: subjectId,
        $or: [
          { className: clsName },
          { className: c.rawName },
          { className: c.name }
        ]
      }).lean();

      let chs = clsSyllabus?.chapters || [];
      if (chs.length === 0) {
        const master = await MasterSyllabus.findOne({
          schoolName: new RegExp("^" + escapeRegex(schoolName) + "$", "i"),
          subjectName: new RegExp("^" + escapeRegex(subject.name) + "$", "i"),
          className: { $in: [clsName, c.rawName, c.name] }
        }).lean();
        if (master && master.chapters) {
          chs = master.chapters;
        }
      }

      if (chs.length > 0) {
        const total = chs.length;
        const comp = chs.filter(ch => ch.status === "Completed").length;
        c.progress = Math.round((comp / total) * 100);
      } else {
        c.progress = 0;
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
        overdue: 0,
        chapterCompletion: `${completedChaptersCount} / ${totalChaptersCount}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
