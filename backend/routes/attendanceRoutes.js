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

module.exports = router;