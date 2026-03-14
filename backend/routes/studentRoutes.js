const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");


// ================= DASHBOARD =================
router.get(
"/dashboard",
protect,
authorize("student"),
studentController.getStudentDashboard
);


// ================= SUBJECTS =================
router.get(
"/subjects",
protect,
authorize("student"),
studentController.getStudentSubjects
);


// ================= PROFILE =================
router.get(
"/profile",
protect,
authorize("student"),
studentController.getStudentProfile
);


// ================= ATTENDANCE =================
router.get(
"/attendance",
protect,
authorize("student"),
studentController.getStudentAttendance
);


// ================= STUDENT EXAMS =================
router.get(
"/exams",
protect,
authorize("student"),
studentController.getStudentExams
);


module.exports = router;