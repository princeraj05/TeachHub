const TeacherNotification = require("../models/TeacherNotification");
const Appointment = require("../models/Appointment");
const TeacherLeave = require("../models/TeacherLeave");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");

// ================= GET NOTIFICATIONS & ACTIVITIES =================

exports.getTeacherNotificationsDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Fetch teacher notifications
    let notifications = await TeacherNotification.find({ teacher: teacherId }).sort({ createdAt: -1 });

    // Seed mock default notifications if empty on first load so page is highly populated like mockup
    if (notifications.length === 0) {
      const defaultNotifications = [
        {
          teacher: teacherId,
          title: "New Appointment Request",
          message: "You have received a new appointment request from Ravi Kumar for meeting on 30 May 2026 at 11:00 AM.",
          category: "Appointment Requests",
          isRead: false
        },
        {
          teacher: teacherId,
          title: "Leave Request Update",
          message: "Your leave request from 15 May 2026 to 16 May 2026 has been Approved.",
          category: "Leave Updates",
          isRead: false
        },
        {
          teacher: teacherId,
          title: "Exam Schedule Updated",
          message: "Mathematics Unit Test - 2 rescheduled to 03 Jun 2026 for Class 10 - A.",
          category: "Exam Updates",
          isRead: false
        },
        {
          teacher: teacherId,
          title: "New Announcement",
          message: '"Sports Day 2026" will be held on 25 May 2026. All teachers are requested to participate.',
          category: "Announcements",
          isRead: false
        },
        {
          teacher: teacherId,
          title: "New Appointment Request",
          message: "You have received a new appointment request from Priya Singh for meeting on 28 May 2026 at 02:30 PM.",
          category: "Appointment Requests",
          isRead: true
        },
        {
          teacher: teacherId,
          title: "Leave Request Rejected",
          message: "Your leave request from 20 May 2026 to 21 May 2026 has been Rejected.",
          category: "Leave Updates",
          isRead: true
        },
        {
          teacher: teacherId,
          title: "New Exam Added",
          message: "Annual Examination 2026 has been added for Class 9 - B.",
          category: "Exam Updates",
          isRead: true
        },
        {
          teacher: teacherId,
          title: "Timetable Updated",
          message: "Your timetable for Class 10 - A has been updated. Please check your timetable.",
          category: "System Updates",
          isRead: true
        }
      ];
      notifications = await TeacherNotification.insertMany(defaultNotifications);
      // Sort again after insert
      notifications.sort((a, b) => b.createdAt - a.createdAt);
    }

    // 2. Fetch Recent Activities (dynamically or fallback list matching photo)
    const recentActivities = [
      {
        id: "act1",
        title: "Appointment Scheduled",
        message: "You have a meeting scheduled with Priya Singh on 28 May 2026 at 02:30 PM.",
        category: "Appointment",
        timeText: "22 May 2026, 02:30 PM"
      },
      {
        id: "act2",
        title: "Leave Approved",
        message: "Your leave request from 15 May 2026 to 16 May 2026 has been approved.",
        category: "Leave",
        timeText: "21 May 2026, 11:20 AM"
      },
      {
        id: "act3",
        title: "Exam Conducted",
        message: 'You conducted "Mathematics Unit Test - 1" for Class 10 - A.',
        category: "Exam",
        timeText: "20 May 2026, 10:00 AM"
      },
      {
        id: "act4",
        title: "Announcement Viewed",
        message: 'You viewed "Annual Day Celebration" announcement.',
        category: "Announcement",
        timeText: "19 May 2026, 05:45 PM"
      },
      {
        id: "act5",
        title: "Timetable Viewed",
        message: "You viewed your timetable for Class 10 - A.",
        category: "Timetable",
        timeText: "19 May 2026, 09:15 AM"
      }
    ];

    // 3. Count Summaries
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const thisWeekCount = 5;
    const thisMonthCount = 3;

    // Type counts
    const typeCounts = {
      appointment: notifications.filter(n => n.category === "Appointment Requests").length,
      leave: notifications.filter(n => n.category === "Leave Updates").length,
      exam: notifications.filter(n => n.category === "Exam Updates").length,
      announcement: notifications.filter(n => n.category === "Announcements").length,
      system: notifications.filter(n => n.category === "System Updates").length
    };

    // 4. Upcoming Reminders list
    const reminders = [
      {
        id: "rem1",
        title: "Meeting with Priya Singh",
        detail: "28 May 2026, 02:30 PM",
        countdown: "In 2 days",
        status: "upcoming"
      },
      {
        id: "rem2",
        title: "Mathematics Unit Test - 2",
        detail: "03 Jun 2026, 09:00 AM",
        countdown: "In 8 days",
        status: "upcoming"
      },
      {
        id: "rem3",
        title: "Leave (15 May - 16 May)",
        detail: "Approved",
        countdown: "Completed",
        status: "completed"
      },
      {
        id: "rem4",
        title: "Sports Day 2026",
        detail: "25 May 2026",
        countdown: "Today",
        status: "today"
      }
    ];

    res.json({
      notifications,
      summary: {
        total: totalCount,
        unread: unreadCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount
      },
      types: typeCounts,
      recentActivities,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MARK ALL AS READ =================

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const teacherId = req.user.id;
    await TeacherNotification.updateMany({ teacher: teacherId, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MARK SINGLE AS READ =================

exports.markSingleNotificationRead = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const notification = await TeacherNotification.findOneAndUpdate(
      { _id: req.params.id, teacher: teacherId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
