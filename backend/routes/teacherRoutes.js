const express = require("express");
const router = express.Router();

const {
getTeacherDashboard,
getMyClasses,
getClassDetails,
getMyStudents,
getStudentDetails,
getMySubjects,
getTeacherProfile,
getTeacherExams,
  updateTeacherProfile,
  getProctorSessions
} = require("../controllers/teacherController");

const { protect } = require("../middleware/authMiddleware");
const teacherSubjectController = require("../controllers/teacherSubjectController");

router.get("/dashboard", protect, getTeacherDashboard);

router.get("/my-classes", protect, getMyClasses);

router.get("/my-classes/:classId/details", protect, getClassDetails);

router.get("/my-students", protect, getMyStudents);

router.get("/my-students/:studentId/details", protect, getStudentDetails);

router.get("/my-subjects", protect, teacherSubjectController.getMySubjectsDetailed);
router.get("/my-subjects/:subjectId/details", protect, teacherSubjectController.getSubjectDetails);

router.get("/profile/:id", protect, getTeacherProfile);

router.put("/profile/update", protect, updateTeacherProfile);

router.get("/exams", protect, getTeacherExams);

router.get("/proctor-sessions", protect, getProctorSessions);

module.exports = router;