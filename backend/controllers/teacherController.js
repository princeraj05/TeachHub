const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");
const TeacherLeave = require("../models/TeacherLeave");
const ExamSubmission = require("../models/ExamSubmission");
const StudentResult = require("../models/StudentResult");
const StudentMark = require("../models/StudentMark");
const MyDiary = require("../models/MyDiary");

// Helper: Fetch all classes assigned to a teacher (via direct assignment, teachers array, subjects, or timetable)
const getTeacherClasses = async (teacherId) => {
  try {
    const timetableClassIds = await Timetable.distinct("class", { teacher: teacherId });
    const subjectClassIds1 = await Subject.distinct("classes", { teacher: teacherId });
    const subjectClassIds2 = await Subject.distinct("class", { teacher: teacherId });

    const combinedClassIds = [...new Set([
      ...(timetableClassIds || []).filter(Boolean).map(id => id.toString()),
      ...(subjectClassIds1 || []).filter(Boolean).map(id => id.toString()),
      ...(subjectClassIds2 || []).filter(Boolean).map(id => id.toString())
    ])];

    return await Class.find({
      $or: [
        { teacher: teacherId },
        { teachers: teacherId },
        { _id: { $in: combinedClassIds } }
      ]
    }).populate("students", "name email avatar gender classId");
  } catch (err) {
    console.error("Error in getTeacherClasses:", err);
    return [];
  }
};

// ================= GET TEACHER DASHBOARD =================

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const schoolName = req.user.schoolName || "";

    // 1. Fetch teacher classes (direct, teachers array, subject & timetable assignment)
    const classes = await getTeacherClasses(teacherId);

    // Extract student IDs and sections
    let studentIds = [];
    const sectionsSet = new Set();
    classes.forEach(c => {
      if (c.section) sectionsSet.add(c.section);
      if (c.students) {
        c.students.forEach(s => {
          studentIds.push(s._id.toString());
        });
      }
    });
    const uniqueStudentIds = [...new Set(studentIds)];
    const uniqueStudentsCount = uniqueStudentIds.length;
    const classesCount = classes.length;
    const sectionsCount = sectionsSet.size;

    // 2. Fetch subjects count (both direct & timetable assignment)
    const timetableSubjectIds = await Timetable.distinct("subject", { teacher: teacherId });
    const subjects = await Subject.find({
      $or: [{ teacher: teacherId }, { _id: { $in: timetableSubjectIds } }]
    });
    const subjectsCount = subjects.length;

    // 3. Fetch today's attendance stats for teacher's students
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.find({
      teacher: teacherId,
      student: { $in: uniqueStudentIds },
      date: { $gte: startOfDay, $lte: endOfDay },
      schoolName: req.user.schoolName
    });

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    todayAttendance.forEach(a => {
      if (a.status === "Present") presentCount++;
      else if (a.status === "Absent") absentCount++;
      else if (a.status === "On Leave" || a.status === "Leave") leaveCount++;
    });

    const totalAttendanceCount = todayAttendance.length;
    const attendanceStats = {
      present: presentCount,
      absent: absentCount,
      late: 0,
      leave: leaveCount,
      total: totalAttendanceCount
    };
    attendanceStats.percentage = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0;

    // 4. Fetch upcoming exams count and list
    const upcomingExams = await Exam.find({
      class: { $in: classes.map(c => c._id) },
      date: { $gte: new Date() }
    })
      .populate("class", "name section")
      .populate("subject", "name")
      .sort({ date: 1 })
      .lean();

    const upcomingExamsCount = upcomingExams.length;

    const formattedExams = upcomingExams.map(exam => {
      const diffTime = Math.abs(new Date(exam.date) - new Date());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        _id: exam._id,
        subjectName: exam.subject?.name || "Subject",
        className: exam.class?.name || "Class",
        sectionName: exam.class?.section || "A",
        date: exam.date,
        daysLeft: diffDays
      };
    });

    // 5. Today's Timetable
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = daysOfWeek[new Date().getDay()];

    const timetable = await Timetable.find({
      teacher: teacherId,
      day: todayDayName
    })
      .populate("class", "name section")
      .populate("subject", "name")
      .sort({ startTime: 1 })
      .lean();

    // Calculate timetable statuses (Completed, In Progress, Upcoming)
    const formattedTimetable = timetable.map(item => {
      const now = new Date();
      const currentHourMin = now.getHours() * 60 + now.getMinutes();

      // Helper to parse time strings like "09:00 AM" or "09:00" to minutes from start of day
      const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const clean = timeStr.trim().toUpperCase();
        const matches = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
        if (!matches) {
          // Fallback simple split if no AM/PM
          const parts = clean.split(":");
          return Number(parts[0]) * 60 + (Number(parts[1]) || 0);
        }
        let hours = Number(matches[1]);
        const minutes = Number(matches[2]);
        const ampm = matches[3];
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const startMin = parseTimeToMinutes(item.startTime);
      const endMin = parseTimeToMinutes(item.endTime);

      let status = "Upcoming";
      if (currentHourMin >= startMin && currentHourMin <= endMin) {
        status = "In Progress";
      } else if (currentHourMin > endMin) {
        status = "Completed";
      }

      return {
        _id: item._id,
        startTime: item.startTime,
        endTime: item.endTime,
        subjectName: item.subject?.name || "Subject",
        className: item.class?.name || "Class",
        sectionName: item.class?.section || "A",
        room: item.room || "Room",
        status
      };
    });

    // 6. Class Performance Overview (average scores across classes)
    const classPerformance = [];
    for (const c of classes) {
      const classExams = await Exam.find({ class: c._id });
      const examIds = classExams.map(e => e._id);
      
      const submissions = await ExamSubmission.find({ exam: { $in: examIds } });
      let avgScore = 0;
      if (submissions.length > 0) {
        const totalScorePct = submissions.reduce((sum, sub) => {
          const totalMax = sub.total || 100;
          return sum + (sub.score / totalMax) * 100;
        }, 0);
        avgScore = Math.round(totalScorePct / submissions.length);
      } else {
        avgScore = 0;
      }
      classPerformance.push({
        className: `${c.name} - ${c.section}`,
        performance: avgScore
      });
    }

    // Sort class performance for consistency
    classPerformance.sort((a, b) => a.className.localeCompare(b.className));

    // 7. Recent Activities
    const recentActivities = [];

    // Recent Attendance Actions
    const recentAttendance = await Attendance.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("class", "name section")
      .lean();

    recentAttendance.forEach(a => {
      recentActivities.push({
        type: "attendance",
        title: `You marked attendance for Class ${a.class?.name || "Class"} - ${a.class?.section || "A"}`,
        time: a.createdAt
      });
    });

    // Recent Exams Scheduled
    const recentExams = await Exam.find({ class: { $in: classes.map(c => c._id) } })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("class", "name section")
      .populate("subject", "name")
      .lean();

    recentExams.forEach(e => {
      recentActivities.push({
        type: "exam",
        title: `Exam scheduled: ${e.subject?.name || "Subject"} - Unit Test`,
        time: e.createdAt
      });
    });

    // Recent Leave Requests
    const recentLeaves = await TeacherLeave.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    recentLeaves.forEach(l => {
      recentActivities.push({
        type: "leave",
        title: `Leave request ${l.status.toLowerCase()}`,
        time: l.createdAt
      });
    });

    // Sort recent activities by time descending
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // 8. Recent Students list (from teacher's classes)
    const recentStudents = [];
    classes.forEach(c => {
      if (c.students) {
        c.students.forEach(s => {
          if (recentStudents.length < 5 && !recentStudents.some(item => item._id.toString() === s._id.toString())) {
            recentStudents.push({
              _id: s._id,
              name: s.name,
              email: s.email
            });
          }
        });
      }
    });

    res.json({
      studentsCount: uniqueStudentsCount,
      classesCount: classesCount,
      sectionsCount: sectionsCount,
      subjectsCount: subjectsCount,
      upcomingExamsCount: upcomingExamsCount,
      attendanceStats,
      timetable: formattedTimetable,
      upcomingExams: formattedExams,
      classPerformance,
      recentActivities: recentActivities.slice(0, 5),
      recentStudents
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// ================= GET MY CLASSES =================

// ================= GET MY CLASSES =================

exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const classes = await getTeacherClasses(teacherId);

    const detailedClasses = [];
    for (const c of classes) {
      if (!c) continue;

      // Find subject name taught by the teacher in this class
      let subject = null;
      try {
        subject = await Subject.findOne({
          $or: [{ class: c._id }, { classes: c._id }],
          teacher: teacherId
        });
      } catch (e) {}

      if (!subject) {
        try {
          const ttSubjectEntry = await Timetable.findOne({ class: c._id, teacher: teacherId }).populate("subject", "name");
          if (ttSubjectEntry && ttSubjectEntry.subject) {
            subject = ttSubjectEntry.subject;
          }
        } catch (e) {}
      }
      const subjectName = subject ? (subject.name || "General Subject") : "General Class";

      // Find timings from timetable
      let timings = "Flexible Timings";
      try {
        const timetableEntry = await Timetable.findOne({ class: c._id, teacher: teacherId });
        if (timetableEntry && timetableEntry.startTime && timetableEntry.endTime) {
          timings = `${timetableEntry.startTime} - ${timetableEntry.endTime}`;
        }
      } catch (e) {}

      // Class Performance (average marks from real exam submissions)
      let performance = 0;
      try {
        const classExams = await Exam.find({ class: c._id });
        const examIds = classExams.map(e => e._id).filter(Boolean);
        if (examIds.length > 0) {
          const submissions = await ExamSubmission.find({ exam: { $in: examIds } });
          if (submissions.length > 0) {
            const totalPct = submissions.reduce((sum, sub) => sum + ((sub.score || 0) / (sub.total || 100)) * 100, 0);
            performance = Math.round(totalPct / submissions.length);
          }
        }
      } catch (e) {}

      // Class Attendance (This Month)
      let attendancePercentage = 0;
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        const studentIds = (c.students || []).map(s => s._id).filter(Boolean);
        if (studentIds.length > 0) {
          const attendanceRecords = await Attendance.find({
            student: { $in: studentIds },
            date: { $gte: startOfMonth }
          });
          if (attendanceRecords.length > 0) {
            const present = attendanceRecords.filter(r => r.status === "Present").length;
            attendancePercentage = Math.round((present / attendanceRecords.length) * 100);
          }
        }
      } catch (e) {}

      // Assignments Count from SubjectNote collection
      let assignmentsCount = 0;
      try {
        const SubjectNote = require("../models/SubjectNote");
        assignmentsCount = await SubjectNote.countDocuments({
          teacher: teacherId,
          $or: [{ className: c.name }, { className: `Class ${c.name}` }]
        });
      } catch (e) {}

      // Tests Conducted (exams count)
      let testsConductedCount = 0;
      try {
        const classExamsCount = await Exam.countDocuments({ class: c._id });
        testsConductedCount = classExamsCount;
      } catch (e) {}

      detailedClasses.push({
        _id: c._id,
        name: c.name,
        section: c.section,
        studentsCount: c.students?.length || 0,
        subjectName,
        timings,
        performance,
        attendancePercentage,
        assignmentsCount,
        testsConductedCount
      });
    }

    res.json(detailedClasses);
  } catch (err) {
    console.error("Error in getMyClasses:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= GET CLASS DETAILS =================

exports.getClassDetails = async (req, res) => {
  try {
    const classId = req.params.classId;
    const teacherId = req.user.id;

    // Find class
    const cls = await Class.findById(classId).populate("students", "name email gender rollNo");
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find main subject taught by teacher
    const teacherSubject = await Subject.findOne({ class: classId, teacher: teacherId });
    const teacherSubjectName = teacherSubject ? teacherSubject.name : "General Subject";

    // Timing and Room from Timetable
    const timetableEntries = await Timetable.find({ class: classId })
      .populate("teacher", "name")
      .populate("subject", "name");
    
    const teacherTimetable = timetableEntries.find(t => t.teacher?._id.toString() === teacherId);
    const room = teacherTimetable?.room || "Class Room";

    // Count Boys and Girls accurately
    let boysCount = 0;
    let girlsCount = 0;
    (cls.students || []).forEach(s => {
      const g = s.gender ? s.gender.trim().toLowerCase() : "";
      if (g === "female" || g === "girl") girlsCount++;
      else if (g === "male" || g === "boy") boysCount++;
      else boysCount++; // Default to male if unspecified
    });

    // Students list with roll numbers and real statuses
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    const todayAttendance = await Attendance.find({
      class: classId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const rawStudents = [...(cls.students || [])].sort((a, b) => (a.rollNo || 999) - (b.rollNo || 999));

    const studentsList = rawStudents.map((s, index) => {
      const rollNo = s.rollNo ? String(s.rollNo).padStart(2, "0") : String(index + 1).padStart(2, "0");
      const att = todayAttendance.find(a => a.student.toString() === s._id.toString());
      const status = att ? att.status : "Not Marked";
      return {
        _id: s._id,
        rollNo,
        numericRollNo: s.rollNo || (index + 1),
        name: s.name,
        email: s.email,
        status
      };
    });

    // Subjects list in this class
    const subjectsList = [];
    const classSubjects = await Subject.find({ $or: [{ class: classId }, { classes: classId }] }).populate("teacher", "name");
    classSubjects.forEach((sub, index) => {
      const periods = timetableEntries.filter(t => t.subject?._id.toString() === sub._id.toString()).length;
      subjectsList.push({
        _id: sub._id,
        name: sub.name,
        teacherName: sub.teacher?.name || "Unassigned",
        periodsPerWeek: periods || 0
      });
    });

    // Today's Timetable Timeline
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayName = daysOfWeek[new Date().getDay()];
    const todayTimetable = timetableEntries.filter(t => t.day === todayDayName);

    const formattedTimetable = todayTimetable.map(item => {
      const now = new Date();
      const currentHourMin = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const clean = timeStr.trim().toUpperCase();
        const matches = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
        if (!matches) {
          const parts = clean.split(":");
          return Number(parts[0]) * 60 + (Number(parts[1]) || 0);
        }
        let hours = Number(matches[1]);
        const minutes = Number(matches[2]);
        const ampm = matches[3];
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const startMin = parseTimeToMinutes(item.startTime);
      const endMin = parseTimeToMinutes(item.endTime);

      let status = "Upcoming";
      if (currentHourMin >= startMin && currentHourMin <= endMin) {
        status = "In Progress";
      } else if (currentHourMin > endMin) {
        status = "Completed";
      }

      return {
        _id: item._id,
        startTime: item.startTime,
        endTime: item.endTime,
        subjectName: item.subject?.name || "Subject",
        room: item.room || "Class Room",
        status
      };
    });

    // Attendance Summary (This Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const studentIds = (cls.students || []).map(s => s._id);
    const monthlyAttendance = await Attendance.find({
      teacher: teacherId,
      student: { $in: studentIds },
      date: { $gte: startOfMonth },
      schoolName: req.user.schoolName
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    monthlyAttendance.forEach(a => {
      if (a.status === "Present") present++;
      else if (a.status === "Absent") absent++;
      else if (a.status === "On Leave") leave++;
    });

    const totalAttendance = present + absent + late + leave;
    const attendancePercentage = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

    // Performance Overview (average scores)
    const classExams = await Exam.find({ class: classId });
    const examIds = classExams.map(e => e._id);
    const submissions = await ExamSubmission.find({ exam: { $in: examIds } });
    
    let classAverage = 0;
    let highestScore = 0;
    let passPercentage = 0;
    let classGrade = "N/A";

    if (submissions.length > 0) {
      const scores = submissions.map(s => Math.round((s.score / (s.total || 100)) * 100));
      classAverage = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      highestScore = Math.max(...scores);
      const passed = scores.filter(s => s >= 40).length;
      passPercentage = Math.round((passed / scores.length) * 100);

      if (classAverage >= 90) classGrade = "A+";
      else if (classAverage >= 80) classGrade = "A";
      else if (classAverage >= 70) classGrade = "B+";
      else if (classAverage >= 60) classGrade = "B";
      else classGrade = "C";
    }

    // Real Recent Activity
    const recentActivities = [];
    if (todayAttendance.length > 0) {
      recentActivities.push({ id: "a1", title: "Attendance recorded for today", time: todayAttendance[0].createdAt || new Date() });
    }
    if (classExams.length > 0) {
      recentActivities.push({ id: "a2", title: `Exam scheduled: ${classExams[0].title || teacherSubjectName}`, time: classExams[0].createdAt || new Date() });
    }

    res.json({
      classId,
      name: cls.name,
      section: cls.section,
      subjectName: teacherSubjectName,
      room,
      status: "Active",
      studentsCount: cls.students.length,
      boysCount,
      girlsCount,
      students: studentsList,
      subjects: subjectsList,
      timetable: formattedTimetable,
      attendanceSummary: {
        percentage: attendancePercentage,
        present,
        absent,
        late,
        leave,
        total: totalAttendance
      },
      performanceOverview: {
        classAverage,
        highestScore,
        passPercentage,
        classGrade
      },
      recentActivities
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET MY STUDENTS =================

exports.getMyStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Find all classes taught by teacher (direct, teachers array, subject & timetable assignment)
    const classes = await getTeacherClasses(teacherId);
    
    const detailedStudents = [];
    
    // For today's attendance calculation (Present Today card)
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    // Monthly stats range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    let presentTodayCount = 0;
    let totalTodayAttendance = 0;
    let sumAttendancePct = 0;
    let sumPerformancePct = 0;
    let topPerformerName = "Aarav Sharma";
    let topPerformerPct = 0;

    for (const c of classes) {
      const studentIds = c.students.map(s => s._id);
      
      // Fetch today's attendance for these students marked by this teacher
      const todayAtt = await Attendance.find({
        teacher: teacherId,
        student: { $in: studentIds },
        date: { $gte: startOfDay, $lte: endOfDay },
        schoolName: req.user.schoolName
      });

      // Fetch monthly attendance marked by this teacher
      const monthlyAtt = await Attendance.find({
        teacher: teacherId,
        student: { $in: studentIds },
        date: { $gte: startOfMonth },
        schoolName: req.user.schoolName
      });

      // Fetch exams for this class
      const classExams = await Exam.find({ class: c._id });
      const examIds = classExams.map(e => e._id);
      const submissions = await ExamSubmission.find({ exam: { $in: examIds } });

      c.students.forEach((student, index) => {
        // Roll No: e.g. Class 10-A -> 10A001
        const classNum = c.name.match(/\d+/) ? c.name.match(/\d+/)[0] : "10";
        const sectionLetter = c.section ? c.section.trim().toUpperCase().charAt(0) : "A";
        const rollNo = `${classNum}${sectionLetter}${String(index + 1).padStart(3, "0")}`;

        // Today's attendance status
        const todayRecord = todayAtt.find(a => a.student.toString() === student._id.toString());
        if (todayRecord) {
          totalTodayAttendance++;
          if (todayRecord.status === "Present") {
            presentTodayCount++;
          }
        }

        // Monthly attendance percent
        const studentMonthly = monthlyAtt.filter(a => a.student.toString() === student._id.toString());
        let attendancePercentage = 0;
        if (studentMonthly.length > 0) {
          const present = studentMonthly.filter(a => a.status === "Present").length;
          attendancePercentage = Math.round((present / studentMonthly.length) * 100);
        }
        sumAttendancePct += attendancePercentage;

        // Student performance score
        const studentSubmissions = submissions.filter(s => s.student.toString() === student._id.toString());
        let performancePercentage = 0;
        if (studentSubmissions.length > 0) {
          const totalPct = studentSubmissions.reduce((sum, s) => sum + (s.score / (s.total || 100)) * 100, 0);
          performancePercentage = Math.round(totalPct / studentSubmissions.length);
        }
        sumPerformancePct += performancePercentage;

        if (performancePercentage > topPerformerPct) {
          topPerformerPct = performancePercentage;
          topPerformerName = student.name;
        }

        // Letter Grade mapping
        let grade = "N/A";
        if (performancePercentage >= 95) grade = "A+";
        else if (performancePercentage >= 90) grade = "A";
        else if (performancePercentage >= 85) grade = "A-";
        else if (performancePercentage >= 80) grade = "B+";
        else if (performancePercentage >= 75) grade = "B";
        else if (performancePercentage >= 70) grade = "B-";
        else if (performancePercentage >= 60) grade = "C";
        else if (performancePercentage > 0) grade = "D";

        // Status
        const status = "Active";

        detailedStudents.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar || "",
          rollNo,
          className: c.name,
          sectionName: c.section,
          attendancePercentage,
          performancePercentage,
          performanceGrade: grade,
          status
        });
      });
    }

    const totalStudents = detailedStudents.length;
    const avgAttendance = totalStudents > 0 ? Math.round(sumAttendancePct / totalStudents) : 0;
    const avgPerformance = totalStudents > 0 ? Math.round(sumPerformancePct / totalStudents) : 0;

    res.json({
      totalStudents,
      presentToday: presentTodayCount,
      presentTodayPercentage: totalTodayAttendance > 0 ? Math.round((presentTodayCount / totalTodayAttendance) * 100) : 0,
      avgAttendance,
      avgPerformance,
      topPerformer: {
        name: topPerformerPct > 0 ? topPerformerName : "N/A",
        average: topPerformerPct
      },
      students: detailedStudents
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET STUDENT DETAILS =================

exports.getStudentDetails = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 1. Find student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Security Check: Ensure student belongs to the requesting user's school
    if (student.schoolName !== req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: Student belongs to another school" });
    }

    // 2. Find class of the student & class teacher
    let cls = null;
    if (student.classId) {
      cls = await Class.findOne({ _id: student.classId, schoolName: req.user.schoolName }).populate("teacher", "name");
    }
    if (!cls) {
      cls = await Class.findOne({ students: studentId, schoolName: req.user.schoolName }).populate("teacher", "name");
    }

    const className = cls ? cls.name : "";
    const sectionName = cls ? cls.section : "";
    const classAndSection = cls ? `Class ${className}${sectionName ? ` - ${sectionName}` : ""}` : "Not Assigned";
    const classTeacher = cls?.teacher?.name || "Not Assigned";

    // Timing/Roll Number details
    const classNum = className.match(/\d+/) ? className.match(/\d+/)[0] : "10";
    const sectionLetter = sectionName ? sectionName.trim().toUpperCase().charAt(0) : "A";
    const rollNo = student.rollNo || (student.phoneNumber ? `${classNum}${sectionLetter}${student.phoneNumber.slice(-3)}` : `${classNum}${sectionLetter}001`);
    const admissionNo = student.admissionNo || `ADM2023${student._id.toString().slice(-3).toUpperCase()}`;

    // 3. Count Attendance Stats & History across the school for this student
    const schoolAtt = await Attendance.find({
      student: studentId,
      schoolName: req.user.schoolName
    })
      .populate("teacher", "name")
      .populate("class", "name section")
      .populate("subject", "name")
      .sort({ date: -1 });

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    schoolAtt.forEach(a => {
      if (a.status === "Present") present++;
      else if (a.status === "Absent") absent++;
      else if (a.status === "Late") late++;
      else if (a.status === "On Leave" || a.status === "Leave") leave++;
    });

    const totalAttendance = schoolAtt.length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

    const attendanceHistory = schoolAtt.map(a => ({
      _id: a._id,
      date: a.date,
      status: a.status,
      className: a.class ? `Class ${a.class.name}${a.class.section ? ` - ${a.class.section}` : ""}` : (classAndSection !== "Not Assigned" ? classAndSection : "Class"),
      teacherName: a.teacher?.name || classTeacher || "Teacher",
      subjectName: a.subject?.name || "General Attendance",
      remarks: a.remarks || ""
    }));

    // 4. Academic Performance & Published Results (StudentResult & StudentMark)
    const allPublishedResults = await StudentResult.find({
      student: studentId,
      schoolName: req.user.schoolName,
      isPublished: true
    }).sort({ createdAt: -1 });

    let overallGrade = "N/A";
    let averageScore = 0;
    let highestScoreVal = 0;
    let highestSubject = "N/A";
    let lowestScoreVal = 100;
    let lowestSubject = "N/A";
    let subjectList = [];
    const publishedResults = [];

    for (const r of allPublishedResults) {
      const marks = await StudentMark.find({
        student: studentId,
        schoolName: req.user.schoolName,
        examTerm: r.examTerm,
        academicYear: r.academicYear
      }).populate("subject", "name");

      const formattedMarks = marks.map(m => {
        const subName = m.subject?.name || m.subjectNameSnapshot || "Subject";
        const max = m.maxMarks || 100;
        const scorePct = Math.round((m.marksObtained / max) * 100);
        return {
          _id: m._id,
          subjectName: subName,
          marksObtained: m.marksObtained,
          maxMarks: max,
          percentage: scorePct,
          grade: m.grade || (scorePct >= 90 ? "A+" : scorePct >= 80 ? "A" : scorePct >= 70 ? "B" : scorePct >= 60 ? "C" : "D"),
          isAbsent: m.isAbsent,
          remarks: m.remarks || ""
        };
      });

      publishedResults.push({
        _id: r._id,
        examTerm: r.examTerm,
        academicYear: r.academicYear,
        totalMarksObtained: r.totalMarksObtained,
        totalMaxMarks: r.totalMaxMarks,
        percentage: Math.round(r.percentage || 0),
        overallGrade: r.overallGrade || "N/A",
        overallResult: r.overallResult || "FAIL",
        publishedAt: r.publishedAt || r.createdAt,
        teacherRemarks: r.teacherRemarks || "",
        marks: formattedMarks
      });
    }

    // Top result calculation
    const topPublished = publishedResults[0];
    if (topPublished) {
      overallGrade = topPublished.overallGrade;
      averageScore = topPublished.percentage;

      if (topPublished.marks.length > 0) {
        let hasValidMark = false;
        topPublished.marks.forEach(m => {
          if (!hasValidMark) {
            highestScoreVal = m.percentage;
            highestSubject = m.subjectName;
            lowestScoreVal = m.percentage;
            lowestSubject = m.subjectName;
            hasValidMark = true;
          } else {
            if (m.percentage > highestScoreVal) {
              highestScoreVal = m.percentage;
              highestSubject = m.subjectName;
            }
            if (m.percentage < lowestScoreVal) {
              lowestScoreVal = m.percentage;
              lowestSubject = m.subjectName;
            }
          }

          subjectList.push({
            name: m.subjectName,
            average: m.percentage,
            grade: m.grade
          });
        });
      }
    } else {
      // Check ExamSubmissions if any exist
      const submissions = await ExamSubmission.find({ student: studentId }).populate({
        path: "exam",
        populate: { path: "subject", select: "name" }
      });

      if (submissions.length > 0) {
        let totalSum = 0;
        let count = 0;
        let maxVal = -1;
        let minVal = 101;

        submissions.forEach(sub => {
          const max = sub.total || 100;
          const scorePct = Math.round((sub.score / max) * 100);
          const subName = sub.exam?.subject?.name || "Subject";

          totalSum += scorePct;
          count++;

          if (scorePct > maxVal) {
            maxVal = scorePct;
            highestSubject = subName;
          }
          if (scorePct < minVal) {
            minVal = scorePct;
            lowestSubject = subName;
          }

          subjectList.push({
            name: subName,
            average: scorePct,
            grade: scorePct >= 90 ? "A+" : scorePct >= 80 ? "A" : scorePct >= 70 ? "B" : "C"
          });
        });

        if (count > 0) {
          averageScore = Math.round(totalSum / count);
          highestScoreVal = maxVal;
          lowestScoreVal = minVal;
          overallGrade = averageScore >= 90 ? "A+" : averageScore >= 80 ? "A" : averageScore >= 70 ? "B" : "C";
        }
      }
    }

    // 5. Exams List & Submissions
    const submissionsForExams = await ExamSubmission.find({ student: studentId })
      .populate({ path: "exam", populate: { path: "subject", select: "name" } })
      .sort({ createdAt: -1 });

    const recentExams = submissionsForExams.slice(0, 4).map(sub => {
      const max = sub.total || 100;
      const scorePct = Math.round((sub.score / max) * 100);
      let g = "F";
      if (scorePct >= 90) g = "A+";
      else if (scorePct >= 80) g = "A";
      else if (scorePct >= 70) g = "B";
      else if (scorePct >= 60) g = "C";

      return {
        _id: sub._id,
        examName: sub.exam?.title || sub.exam?.name || "Unit Test",
        subjectName: sub.exam?.subject?.name || "Subject",
        score: scorePct,
        grade: g,
        date: sub.createdAt || sub.exam?.date || new Date()
      };
    });

    let classExams = [];
    if (cls?._id) {
      classExams = await Exam.find({ class: cls._id, schoolName: req.user.schoolName })
        .populate("subject", "name")
        .sort({ date: -1 });
    }

    const allExamsMap = [];
    classExams.forEach(e => {
      const sub = submissionsForExams.find(s => s.exam?._id?.toString() === e._id.toString());
      if (sub) {
        const max = sub.total || e.totalMarks || 100;
        const scorePct = Math.round((sub.score / max) * 100);
        let g = "F";
        if (scorePct >= 90) g = "A+";
        else if (scorePct >= 80) g = "A";
        else if (scorePct >= 70) g = "B";
        else if (scorePct >= 60) g = "C";

        allExamsMap.push({
          _id: e._id,
          title: e.title || e.name || "Class Exam",
          subjectName: e.subject?.name || "Subject",
          date: e.date || e.createdAt,
          maxMarks: e.totalMarks || 100,
          status: "Evaluated",
          score: scorePct,
          grade: g
        });
      } else {
        allExamsMap.push({
          _id: e._id,
          title: e.title || e.name || "Class Exam",
          subjectName: e.subject?.name || "Subject",
          date: e.date || e.createdAt,
          maxMarks: e.totalMarks || 100,
          status: "Not Taken",
          score: null,
          grade: "N/A"
        });
      }
    });

    // 6. Assignments List (from real MyDiary homeworks for this student's class)
    let assignments = [];
    if (cls?._id) {
      const diaries = await MyDiary.find({ schoolName: req.user.schoolName, classId: cls._id })
        .sort({ createdAt: -1 });

      assignments = diaries.map(d => {
        const sc = d.studentCompletions?.find(c => c.studentId?.toString() === studentId.toString());
        return {
          id: d._id,
          name: d.title,
          description: d.description || "",
          subjectName: d.subjectName || "Subject",
          homeworkDate: d.homeworkDate || "",
          dueDate: d.dueDate || d.homeworkDate || new Date().toISOString(),
          teacherName: d.teacherName || "Teacher",
          status: sc?.status || "Pending",
          types: d.types || []
        };
      });
    }

    const recentAssignments = assignments.slice(0, 4);

    // 7. Assigned Class Subjects
    if (subjectList.length === 0 && cls?._id) {
      const assignedSubjects = await Subject.find({
        schoolName: req.user.schoolName,
        $or: [{ class: cls._id }, { classes: cls._id }]
      }).populate("teacher", "name");

      assignedSubjects.forEach(s => {
        subjectList.push({
          name: s.name,
          teacherName: s.teacher?.name || "Assigned Teacher",
          average: 0,
          grade: "N/A"
        });
      });
    }

    // Calculate Age from DOB if present
    let age = null;
    if (student.dob) {
      const dobDate = new Date(student.dob);
      if (!isNaN(dobDate.getTime())) {
        const ageDiffMs = Date.now() - dobDate.getTime();
        const ageDate = new Date(ageDiffMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }

    const formattedDob = student.dob ? new Date(student.dob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
    const formattedJoinedOn = student.joiningDate || (student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

    res.json({
      studentId,
      name: student.name,
      avatar: student.avatar || "",
      status: "Active",
      rollNo,
      admissionNo,
      dob: formattedDob,
      age: age !== null ? age : undefined,
      gender: student.gender || "",
      email: student.email || "",
      phone: student.phoneNumber || "",
      address: student.address || "",
      classAndSection,
      classTeacher,
      joinedOn: formattedJoinedOn,
      attendanceOverview: {
        percentage: attendancePercentage,
        present,
        absent,
        late,
        leave,
        total: totalAttendance
      },
      attendanceHistory,
      academicPerformance: {
        overallGrade,
        averageScore,
        highestScore: highestSubject !== "N/A" ? `${highestScoreVal}%` : "N/A",
        highestSubject,
        lowestScore: lowestSubject !== "N/A" ? `${lowestScoreVal}%` : "N/A",
        lowestSubject
      },
      publishedResults,
      subjects: subjectList,
      allExams: allExamsMap,
      recentExams,
      assignments,
      recentAssignments,
      documents: [],
      notes: []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const {
      name,
      email,
      dob,
      gender,
      phoneNumber,
      alternatePhone,
      address,
      pincode,
      department,
      designation,
      bio,
      avatar
    } = req.body;

    const teacher = await User.findByIdAndUpdate(
      teacherId,
      {
        name,
        email,
        dob,
        gender,
        phoneNumber,
        alternatePhone,
        address,
        pincode,
        department,
        designation,
        bio,
        avatar
      },
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


// ================= TEACHER MY DIARY (HOMEWORK MANAGEMENT) =================

exports.getTeacherDiary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { date, classId } = req.query;

    const teacher = await User.findById(teacherId).lean();
    const schoolName = req.user.schoolName || teacher?.schoolName || "G.D Academy";

    const schoolRegex = new RegExp(`^${schoolName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i");
    const query = {
      teacher: teacherId,
      $or: [{ schoolName: schoolRegex }, { schoolName: schoolName }]
    };

    if (date) query.homeworkDate = date;
    if (classId && classId !== "All") query.classId = classId;

    // Purge any legacy dummy seed entries from DB
    await MyDiary.deleteMany({
      $or: [
        { teacherName: { $in: ["Kavita Ma'am", "Rohan Sir", "Singh Sir", "Anjali Ma'am"] } },
        { title: { $in: ["पाठ 2 के प्रश्न उत्तर एवं सुलेख", "Chapter 3 Reading & Vocabulary", "Unit 2 Practice & Tables", "Plant Life Cycle Project"] } }
      ]
    }).catch(() => {});

    const homeworks = await MyDiary.find(query).sort({ createdAt: -1 }).lean();
    res.json(homeworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTeacherDiary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId).lean();
    const schoolName = req.user.schoolName || teacher?.schoolName || "G.D Academy";

    const {
      classId,
      className,
      section,
      subjectName,
      homeworkDate,
      dueDate,
      title,
      description,
      types
    } = req.body;

    const newDiary = await MyDiary.create({
      schoolName,
      classId: classId || null,
      className: className || "Class 5",
      section: section || "A",
      subjectName: subjectName || "General",
      teacher: teacherId,
      teacherName: teacher?.name || "Assigned Teacher",
      homeworkDate: homeworkDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || homeworkDate || new Date().toISOString().split("T")[0],
      title: title || "New Homework",
      description: description || "",
      types: Array.isArray(types) ? types : ["Exercise"]
    });

    res.status(201).json({ message: "Homework assigned successfully!", homework: newDiary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTeacherDiary = async (req, res) => {
  try {
    const { id } = req.params;
    await MyDiary.findByIdAndDelete(id);
    res.json({ message: "Homework entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeacherClassSignatureReport = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    let students = [];
    if (classId && classId !== "All") {
      const cls = await Class.findById(classId).populate("students", "name email rollNo").lean();
      if (cls) {
        const classStudents = cls.students || [];
        const userStudents = await User.find({
          role: { $regex: /^student$/i },
          $or: [
            { class: classId },
            { className: cls.className || cls.name },
            { className: `${cls.className || cls.name} (${cls.section || 'A'})` }
          ]
        }).select("name email rollNo").lean();

        const stdMap = new Map();
        classStudents.forEach(s => { if (s && s._id) stdMap.set(s._id.toString(), s); });
        userStudents.forEach(s => { if (s && s._id) stdMap.set(s._id.toString(), s); });

        students = Array.from(stdMap.values());
      }
    } else {
      const schoolName = req.user?.schoolName;
      if (schoolName) {
        const schoolRegex = new RegExp(`^${schoolName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i");
        students = await User.find({
          role: { $regex: /^student$/i },
          $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }]
        }).select("name email rollNo").lean();
      } else {
        students = await User.find({ role: { $regex: /^student$/i } }).select("name email rollNo").limit(30).lean();
      }
    }

    const query = { homeworkDate: targetDate };
    if (classId && classId !== "All") query.classId = classId;

    const homeworks = await MyDiary.find(query).lean();

    const report = students.map((std, idx) => {
      let completedHomeworksCount = 0;
      let signatures = [];

      homeworks.forEach((hw) => {
        const comp = (hw.studentCompletions || []).find(
          (sc) => sc.studentId?.toString() === std._id?.toString()
        );
        if (comp && (comp.status === "Completed" || comp.status === "Submitted" || comp.status === "Reviewed")) {
          completedHomeworksCount++;
          if (comp.parentSignatureName) {
            signatures.push({
              subject: hw.subjectName,
              parentSignatureName: comp.parentSignatureName,
              signedAt: comp.parentSignedAt || comp.completedAt
            });
          }
        }
      });

      const totalHw = homeworks.length;
      const isSigned = signatures.length > 0 || (totalHw > 0 && completedHomeworksCount === totalHw);

      return {
        _id: std._id,
        name: std.name || `Student ${idx + 1}`,
        rollNo: std.rollNo || idx + 1,
        totalHomeworks: totalHw,
        completedHomeworks: completedHomeworksCount,
        isSigned: isSigned,
        parentSignatureName: signatures[0]?.parentSignatureName || (isSigned ? "Parent Signed" : ""),
        parentSignedAt: signatures[0]?.signedAt || null
      };
    });

    res.json({
      date: targetDate,
      totalStudents: report.length,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


