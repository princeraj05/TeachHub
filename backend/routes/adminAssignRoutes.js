const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
assignStudentToClass,
assignTeacherToClass,
assignSubjectTeacher,
getTeacherAssignments,
unassignTeacherAssignment
} = require("../controllers/adminAssignController");

router.use(protect);
router.use(authorize("admin"));

router.get("/teacher-assignments", getTeacherAssignments);
router.post("/unassign-teacher", unassignTeacherAssignment);
router.post("/assign-student-class", assignStudentToClass);
router.post("/assign-teacher-class", assignTeacherToClass);
router.post("/assign-subject-teacher", assignSubjectTeacher);

module.exports = router;