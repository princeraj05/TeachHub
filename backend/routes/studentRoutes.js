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
authorize("student", "unassigned"),
studentController.getStudentExams
);

router.post(
  "/exams/:id/submit",
  protect,
  authorize("student"),
  studentController.submitStudentExam
);

// ================= ADMISSION EXAMS =================
router.get(
"/admission-exam",
protect,
authorize("student", "unassigned"),
studentController.getStudentAdmissionExam
);

router.post(
"/admission-exam/submit",
protect,
authorize("student", "unassigned"),
studentController.submitStudentAdmissionExam
);


// ================= STUDENT EXAM RESULT =================
router.get(
  "/exams/:examId/result",
  protect,
  authorize("student", "unassigned"),
  studentController.getStudentExamResult
);


module.exports = router;