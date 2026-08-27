const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const Exam = require("../models/Exam");
const Announcement = require("../models/Announcement");
const mongoose = require("mongoose");

// Helper to construct ObjectId based on Date
const getObjectIdFromDate = (date) => {
  const seconds = Math.floor(date.getTime() / 1000);
  const hex = seconds.toString(16).padStart(8, '0') + "0000000000000000";
  return new mongoose.Types.ObjectId(hex);
};

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const schoolName = req.user.schoolName;
    const now = new Date();

    // ── DATE CALCULATIONS ──
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // ── STATS CARD 1: STUDENTS ──
    const totalStudents = await User.countDocuments({ role: "student", schoolName }) || 0;
    const studentsCreatedThisMonth = await User.countDocuments({
      role: "student",
      schoolName,
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    }) || 0;

    // ── STATS CARD 2: TEACHERS ──
    const totalTeachers = await User.countDocuments({ role: "teacher", schoolName }) || 0;
    const teachersCreatedThisMonth = await User.countDocuments({
      role: "teacher",
      schoolName,
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    }) || 0;

    // ── STATS CARD 3: CLASSES ──
    const totalClasses = await Class.countDocuments({ schoolName }) || 0;
    const classesCreatedThisMonth = await Class.countDocuments({
      schoolName,
      _id: { $gte: getObjectIdFromDate(startOfCurrentMonth) }
    }) || 0;

    // ── STATS CARD 4: SUBJECTS ──
    const totalSubjects = await Subject.countDocuments({ schoolName }) || 0;
    const subjectsCreatedThisMonth = await Subject.countDocuments({
      schoolName,
      _id: { $gte: getObjectIdFromDate(startOfCurrentMonth) }
    }) || 0;

    // ── STATS CARD 5: EVENTS ──
    const eventsThisMonth = await Event.countDocuments({
      schoolName,
      eventDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    }) || 0;
    const upcomingEventsCount = await Event.countDocuments({
      schoolName,
      eventDate: { $gte: startOfToday }
    }) || 0;

    // ── STATS CARD 6: PENDING PAYMENTS ──
    const pendingPayments = await Payment.find({
      schoolName,
      status: { $in: ["Pending", "Processing", "PendingVerification"] }
    }) || [];

    let totalPendingAmount = 0;
    const uniquePayers = new Set();
    pendingPayments.forEach(p => {
      totalPendingAmount += p.amount || 0;
      if (p.payer) uniquePayers.add(p.payer.toString());
    });
    // Divide by 100 as payments are stored in paise
    const pendingPaymentsAmount = totalPendingAmount / 100;
    const pendingPaymentsUsersCount = uniquePayers.size;

    // ── JOIN REQUESTS COUNT (FOR SIDEBAR / ACTION BADGE) ──
    const joinRequestsCount = await User.countDocuments({
      requestedSchool: schoolName,
      requestStatus: { $in: ["pending", "scheduled", "exam_completed"] }
    }) || 0;

    // ── ANNOUNCEMENTS (SEED IF EMPTY) ──
    let announcements = await Announcement.find({ schoolName }).sort({ date: -1 }).limit(5) || [];
    if (announcements.length === 0) {
      announcements = [];
    }

    // ── STUDENTS OVERVIEW (ATTENDANCE THIS MONTH) ──
    const attendanceRecords = await Attendance.find({
      schoolName,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
    }) || [];

    let presentCount = 0;
    let absentCount = 0;
    let onLeaveCount = 0;

    attendanceRecords.forEach(rec => {
      if (rec.status === "Present") presentCount++;
      else if (rec.status === "Absent") absentCount++;
      else if (rec.status === "On Leave") onLeaveCount++;
    });

    const totalAttendance = presentCount + absentCount + onLeaveCount;

    // ── ACTIVITY OVERVIEW (CHART & STATS) ──
    // Create 5 dynamic reference dates for the current month
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthName = monthNames[month];

    const weeks = [
      { label: `1 ${currentMonthName}`, start: new Date(year, month, 1), end: new Date(year, month, 7, 23, 59, 59) },
      { label: `8 ${currentMonthName}`, start: new Date(year, month, 8), end: new Date(year, month, 14, 23, 59, 59) },
      { label: `15 ${currentMonthName}`, start: new Date(year, month, 15), end: new Date(year, month, 21, 23, 59, 59) },
      { label: `22 ${currentMonthName}`, start: new Date(year, month, 22), end: new Date(year, month, 25, 23, 59, 59) },
      { label: `26 ${currentMonthName}`, start: new Date(year, month, 26), end: new Date(year, month + 1, 0, 23, 59, 59) }
    ];

    const chartData = [];
    for (const w of weeks) {
      const joinReqsCount = await User.countDocuments({
        requestedSchool: schoolName,
        createdAt: { $gte: w.start, $lte: w.end }
      }) || 0;

      const examsCount = await Exam.countDocuments({
        schoolName,
        date: { $gte: w.start, $lte: w.end }
      }) || 0;

      const assignmentsCount = await User.countDocuments({
        schoolName,
        role: "student",
        classId: { $ne: null },
        createdAt: { $gte: w.start, $lte: w.end }
      }) || 0;

      const evsCount = await Event.countDocuments({
        schoolName,
        eventDate: { $gte: w.start, $lte: w.end }
      }) || 0;

      chartData.push({
        name: w.label,
        "Join Requests": joinReqsCount,
        "Exams Conducted": examsCount,
        "Assignments": assignmentsCount,
        "Events": evsCount
      });
    }

    // Activity stats comparison (Current Month vs Previous Month)
    const helperGetActivityMonthCount = async (start, end) => {
      const joinReqs = await User.countDocuments({
        requestedSchool: schoolName,
        createdAt: { $gte: start, $lte: end }
      }) || 0;

      const exams = await Exam.countDocuments({
        schoolName,
        date: { $gte: start, $lte: end }
      }) || 0;

      const assignments = await User.countDocuments({
        schoolName,
        role: "student",
        classId: { $ne: null },
        createdAt: { $gte: start, $lte: end }
      }) || 0;

      const evs = await Event.countDocuments({
        schoolName,
        eventDate: { $gte: start, $lte: end }
      }) || 0;

      return { joinReqs, exams, assignments, evs };
    };

    const currentMonthActivity = await helperGetActivityMonthCount(startOfCurrentMonth, endOfCurrentMonth);
    const previousMonthActivity = await helperGetActivityMonthCount(startOfPreviousMonth, endOfPreviousMonth);

    const calcGrowth = (curr, prev) => {
      if (prev === 0) {
        return curr > 0 ? `+${curr * 100}%` : "0%";
      }
      const pct = Math.round(((curr - prev) / prev) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const activityStats = {
      joinRequests: {
        value: currentMonthActivity.joinReqs,
        growth: calcGrowth(currentMonthActivity.joinReqs, previousMonthActivity.joinReqs)
      },
      examsConducted: {
        value: currentMonthActivity.exams,
        growth: calcGrowth(currentMonthActivity.exams, previousMonthActivity.exams)
      },
      assignments: {
        value: currentMonthActivity.assignments,
        growth: calcGrowth(currentMonthActivity.assignments, previousMonthActivity.assignments)
      },
      events: {
        value: currentMonthActivity.evs,
        growth: calcGrowth(currentMonthActivity.evs, previousMonthActivity.evs)
      }
    };

    // ── UPCOMING EVENTS (SEED IF EMPTY) ──
    let upcomingEventsList = await Event.find({
      schoolName,
      eventDate: { $gte: startOfToday }
    }).sort({ eventDate: 1 }).limit(3) || [];

    if (upcomingEventsList.length === 0) {
      upcomingEventsList = [];
    }

    // ── RESPONSE DATA ──
    res.json({
      schoolName,
      adminName: req.user.name || "Admin",
      adminAvatar: req.user.avatar || "",
      adminStatus: req.user.isOnline ? "Online" : "Offline",
      systemStatusMessage: "TeachHub services are online and active.",
      stats: {
        students: {
          total: totalStudents,
          growth: studentsCreatedThisMonth > 0 ? `↑ ${studentsCreatedThisMonth} this month` : "No change"
        },
        teachers: {
          total: totalTeachers,
          growth: teachersCreatedThisMonth > 0 ? `↑ ${teachersCreatedThisMonth} this month` : "No change"
        },
        classes: {
          total: totalClasses,
          growth: classesCreatedThisMonth > 0 ? `↑ ${classesCreatedThisMonth} this month` : "No change"
        },
        subjects: {
          total: totalSubjects,
          growth: subjectsCreatedThisMonth > 0 ? `↑ ${subjectsCreatedThisMonth} this month` : "No change"
        },
        events: {
          total: eventsThisMonth,
          growth: upcomingEventsCount > 0 ? `↑ ${upcomingEventsCount} upcoming` : "No change"
        },
        payments: {
          total: pendingPaymentsAmount,
          growth: `From ${pendingPaymentsUsersCount} user${pendingPaymentsUsersCount !== 1 ? 's' : ''}`
        }
      },
      joinRequestsCount,
      announcements: announcements.map(ann => ({
        _id: ann._id,
        title: ann.title,
        content: ann.content,
        category: ann.category,
        date: ann.date,
        timeString: ann.timeString
      })),
      studentsOverview: {
        present: presentCount,
        absent: absentCount,
        onLeave: onLeaveCount,
        total: totalAttendance,
        totalStudents // for the label inside the donut chart
      },
      activityOverview: {
        chartData,
        stats: activityStats
      },
      upcomingEvents: upcomingEventsList.map(ev => {
        const monthNamesAbbr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const day = ev.eventDate ? String(ev.eventDate.getDate()).padStart(2, '0') : "00";
        const monthAbbr = ev.eventDate ? monthNamesAbbr[ev.eventDate.getMonth()] : "MAY";
        return {
          _id: ev._id,
          title: ev.title,
          subtitle: ev.subtitle || schoolName,
          dateDay: day,
          dateMonth: monthAbbr,
          time: ev.eventTime || "10:00 AM",
          status: ev.status === "upcoming" ? "Upcoming" : "Completed"
        };
      })
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};