const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");


// MARK ATTENDANCE
router.post(
  "/mark",
  protect,
  attendanceController.markAttendance
);


// GET ATTENDANCE REPORT
router.get(
  "/report",
  protect,
  attendanceController.getAttendanceReport
);


// GET TODAY'S ATTENDANCE
router.get(
  "/today",
  protect,
  attendanceController.getTodayAttendance
);

// GET ATTENDANCE BY CLASS & DATE
router.get(
  "/by-class",
  protect,
  attendanceController.getClassAttendanceForDate
);

// BULK SAVE ATTENDANCE
router.post(
  "/bulk-save",
  protect,
  attendanceController.bulkSaveAttendance
);

// GET ATTENDANCE HISTORY STATS
router.get(
  "/history-stats",
  protect,
  attendanceController.getAttendanceHistoryStats
);

module.exports = router;