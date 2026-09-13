const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");


// ================= MARK ATTENDANCE =================

exports.markAttendance = async (req, res) => {

  try {

    const { student, status } = req.body;

    const teacherId = req.user.id;
    
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    // check student exists
    const studentData = await User.findOne({ _id: student, schoolName: req.user.schoolName });

    if (!studentData) {
      return res.status(404).json({
        message: "Student not found in your school"
      });
    }

    // find class from Class collection
    const classData = await Class.findOne({
      students: student,
      schoolName: req.user.schoolName
    });

    if (!classData) {
      return res.status(400).json({
        message: "Student class not assigned"
      });
    }

    const classId = classData._id;

    // today date
    const today = new Date();
    today.setHours(0,0,0,0);

    // check existing attendance
    const existing = await Attendance.findOne({
      student,
      date: { $gte: today },
      schoolName: req.user.schoolName
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance has already been marked for today and cannot be updated"
      });
    }

    const attendance = new Attendance({

      student,
      class: classId,
      teacher: teacherId,
      status,
      schoolName: req.user.schoolName

    });

    await attendance.save();

    res.json({
      message: "Attendance marked successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET ATTENDANCE REPORT =================

exports.getAttendanceReport = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const query = { schoolName: req.user.schoolName };
    if (req.user.role === "teacher") {
      query.teacher = req.user.id;
    }

    const data = await Attendance.find(query)
      .populate("student","name email")
      .populate("class","name section")
      .populate("teacher","name email")
      .sort({ date:-1 });

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET TODAY'S ATTENDANCE =================

exports.getTodayAttendance = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const teacherId = req.user.id;

    const records = await Attendance.find({
      teacher: teacherId,
      date: { $gte: today },
      schoolName: req.user.schoolName
    });

    res.json(records);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= GET CLASS ATTENDANCE FOR DATE =================

exports.getClassAttendanceForDate = async (req, res) => {
  try {
    const { classId, date, subjectId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    const schoolName = req.user.schoolName;

    // Fetch class
    const classData = await Class.findOne({ _id: classId, schoolName }).populate("students", "name email avatar gender");
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Determine query date range
    const searchDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch attendance records for this class on this date (optionally filtered by subject)
    const attQuery = {
      class: classId,
      date: { $gte: startOfDay, $lte: endOfDay },
      schoolName
    };

    if (req.user.role === "teacher") {
      attQuery.teacher = req.user.id;
    }
    
    if (subjectId && subjectId !== "none" && subjectId !== "") {
      attQuery.subject = subjectId;
    } else {
      attQuery.subject = null;
    }

    const records = await Attendance.find(attQuery);

    const classNum = classData.name.match(/\d+/) ? classData.name.match(/\d+/)[0] : "10";
    const sectionLetter = classData.section ? classData.section.trim().toUpperCase().charAt(0) : "A";

    const studentsWithStatus = classData.students.map((student, index) => {
      const rollNo = `${classNum}${sectionLetter}${String(index + 1).padStart(3, "0")}`;
      const record = records.find(r => r.student.toString() === student._id.toString());
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        gender: student.gender,
        rollNo,
        status: record ? record.status : "",
        remarks: record ? record.remarks : ""
      };
    });

    res.json({
      students: studentsWithStatus,
      alreadyMarked: records.length > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= BULK SAVE ATTENDANCE =================

exports.bulkSaveAttendance = async (req, res) => {
  try {
    const { classId, date, subjectId, records } = req.body;
    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Class, date and records list are required" });
    }

    const schoolName = req.user.schoolName;
    const teacherId = req.user.id;

    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const subId = (subjectId && subjectId !== "none" && subjectId !== "") ? subjectId : null;

    // Strict Security Check: Only allow teacher to mark attendance for subjects assigned to them
    if (subId && req.user.role !== "admin" && req.user.role !== "superadmin") {
      const isAssignedSubject = await Subject.exists({
        _id: subId,
        $or: [
          { teacher: teacherId },
          { teachers: teacherId }
        ]
      });

      const isTimetableTeacher = await Timetable.exists({
        subject: subId,
        teacher: teacherId
      });

      if (!isAssignedSubject && !isTimetableTeacher) {
        return res.status(403).json({
          message: "Forbidden: You can only mark attendance for subjects assigned to you."
        });
      }
    }

    for (const rec of records) {
      const { studentId, status, remarks } = rec;
      if (!studentId || !status) continue;

      // Find or update existing record
      const existing = await Attendance.findOne({
        student: studentId,
        class: classId,
        teacher: teacherId,
        date: { $gte: startOfDay, $lte: endOfDay },
        subject: subId,
        schoolName
      });

      if (existing) {
        existing.status = status;
        existing.remarks = remarks || "";
        existing.teacher = teacherId;
        await existing.save();
      } else {
        const newRecord = new Attendance({
          student: studentId,
          class: classId,
          teacher: teacherId,
          status,
          remarks: remarks || "",
          date: startOfDay,
          schoolName,
          subject: subId
        });
        await newRecord.save();
      }
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET ATTENDANCE HISTORY STATS =================

exports.getAttendanceHistoryStats = async (req, res) => {
  try {
    const { classId, studentId, month, view } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    const schoolName = req.user.schoolName;

    // Fetch class and all its students
    const classData = await Class.findOne({ _id: classId, schoolName }).populate("students", "name email avatar gender");
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    let startRange, endRange;
    if (view === "Custom" && req.query.startDate && req.query.endDate) {
      startRange = new Date(req.query.startDate);
      startRange.setHours(0, 0, 0, 0);
      endRange = new Date(req.query.endDate);
      endRange.setHours(23, 59, 59, 999);
    } else {
      const yearMonth = month || new Date().toISOString().substring(0, 7);
      const [year, m] = yearMonth.split("-").map(Number);
      startRange = new Date(year, m - 1, 1, 0, 0, 0, 0);
      endRange = new Date(year, m, 0, 23, 59, 59, 999);
    }

    const query = {
      class: classId,
      date: { $gte: startRange, $lte: endRange },
      schoolName
    };

    if (req.user.role === "teacher") {
      query.teacher = req.user.id;
    }

    if (studentId && studentId !== "All") {
      query.student = studentId;
    }

    const records = await Attendance.find(query).populate("student", "name avatar");

    // Compute KPIs
    const distinctDays = new Set();
    records.forEach(r => {
      if (r.date) {
        const dayStr = new Date(r.date).toISOString().substring(0, 10);
        distinctDays.add(dayStr);
      }
    });
    const totalClasses = distinctDays.size;

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    records.forEach(r => {
      if (r.status === "Present") presentCount++;
      else if (r.status === "Absent") absentCount++;
      else if (r.status === "Late") lateCount++;
      else if (r.status === "Leave" || r.status === "On Leave") leaveCount++;
    });

    const avgAttendance = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

    // Compute Calendar Data
    const calendarData = {};
    const daysInPeriod = Math.round((endRange - startRange) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < daysInPeriod; i++) {
      const d = new Date(startRange);
      d.setDate(startRange.getDate() + i);
      const dayStr = d.toISOString().substring(0, 10);
      calendarData[dayStr] = {
        day: d.getDate(),
        date: dayStr,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        status: "No Class",
        records: []
      };
    }

    records.forEach(r => {
      if (r.date) {
        const dayStr = new Date(r.date).toISOString().substring(0, 10);
        if (calendarData[dayStr]) {
          calendarData[dayStr].records.push({
            studentId: r.student?._id,
            name: r.student?.name,
            status: r.status
          });

          if (r.status === "Present") calendarData[dayStr].present++;
          else if (r.status === "Absent") calendarData[dayStr].absent++;
          else if (r.status === "Late") calendarData[dayStr].late++;
          else if (r.status === "Leave" || r.status === "On Leave") calendarData[dayStr].leave++;
        }
      }
    });

    Object.keys(calendarData).forEach(dayStr => {
      const dayData = calendarData[dayStr];
      if (dayData.records.length > 0) {
        if (studentId && studentId !== "All") {
          dayData.status = dayData.records[0].status;
        } else {
          if (dayData.absent > 0) dayData.status = "Absent";
          else if (dayData.late > 0) dayData.status = "Late";
          else if (dayData.leave > 0) dayData.status = "Leave";
          else dayData.status = "Present";
        }
      }
    });

    // Compute Student-wise Stats
    const studentStats = classData.students.map((student, index) => {
      const studentRecords = records.filter(r => r.student?._id.toString() === student._id.toString());
      const total = studentRecords.length;
      const present = studentRecords.filter(r => r.status === "Present").length;
      const absent = studentRecords.filter(r => r.status === "Absent").length;
      const late = studentRecords.filter(r => r.status === "Late").length;
      const leave = studentRecords.filter(r => r.status === "Leave" || r.status === "On Leave").length;

      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      const classNum = classData.name.match(/\d+/) ? classData.name.match(/\d+/)[0] : "10";
      const sectionLetter = classData.section ? classData.section.trim().toUpperCase().charAt(0) : "A";
      const rollNo = `${classNum}${sectionLetter}${String(index + 1).padStart(3, "0")}`;

      const sortedRecords = [...studentRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
      const trend = sortedRecords.map(r => {
        if (r.status === "Present") return 1;
        if (r.status === "Late") return 0.5;
        return 0;
      });
      const defaultTrend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const finalTrend = trend.length > 0 ? trend.slice(-10) : defaultTrend;

      return {
        studentId: student._id,
        name: student.name,
        avatar: student.avatar,
        rollNo,
        present,
        absent,
        late,
        leave,
        attendancePct: pct,
        trend: finalTrend
      };
    });

    let bestStudent = { name: "N/A", attendancePct: 0 };
    let worstStudent = { name: "N/A", attendancePct: 0 };

    if (studentStats.length > 0 && records.length > 0) {
      const sorted = [...studentStats].sort((a, b) => b.attendancePct - a.attendancePct);
      bestStudent = { name: sorted[0].name, attendancePct: sorted[0].attendancePct };
      worstStudent = { name: sorted[sorted.length - 1].name, attendancePct: sorted[sorted.length - 1].attendancePct };
    }

    res.json({
      summary: {
        avgAttendance,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        leave: leaveCount,
        totalClasses,
        bestStudent,
        worstStudent
      },
      calendar: Object.values(calendarData),
      students: studentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};