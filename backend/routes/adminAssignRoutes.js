const express = require("express");
const router = express.Router();

const {
assignStudentToClass,
assignTeacherToClass,
assignSubjectTeacher
} = require("../controllers/adminAssignController");

router.post("/assign-student-class", assignStudentToClass);
router.post("/assign-teacher-class", assignTeacherToClass);
router.post("/assign-subject-teacher", assignSubjectTeacher);

module.exports = router;