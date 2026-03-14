const express = require("express");
const router = express.Router();

const {
getTeacherDashboard,
getMyClasses,
getMyStudents,
getMySubjects,
getTeacherProfile,
getTeacherExams,
updateTeacherProfile
} = require("../controllers/teacherController");

const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getTeacherDashboard);

router.get("/my-classes", protect, getMyClasses);

router.get("/my-students", protect, getMyStudents);

router.get("/my-subjects", protect, getMySubjects);

router.get("/profile/:id", protect, getTeacherProfile);

router.put("/profile/update", protect, updateTeacherProfile);

router.get("/exams", protect, getTeacherExams);

module.exports = router;