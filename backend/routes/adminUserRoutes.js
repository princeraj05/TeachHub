const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
getTeachers,
getStudents,
getJoinRequests,
processJoinRequest,
getAdmissionExam,
saveAdmissionExam,
assignClass,
addStudent,
updateStudentRollNo,
deleteUser,
getTeacherProfile,
updateTeacherProfile,
addTeacherPhoto,
deleteTeacherPhoto,
reorderTeacherPhotos
} = require("../controllers/adminUserController");

router.use(protect);
router.use(authorize("admin"));

router.get("/teachers",getTeachers);
router.get("/teachers/:id", getTeacherProfile);
router.put("/teachers/:id", updateTeacherProfile);
router.post("/teachers/:id/photos", addTeacherPhoto);
router.delete("/teachers/:id/photos/:photoId", deleteTeacherPhoto);
router.put("/teachers/:id/photos/reorder", reorderTeacherPhotos);

router.get("/students",getStudents);
router.post("/students", addStudent);
router.put("/students/:id/rollno", updateStudentRollNo);
router.get("/join-requests", getJoinRequests);
router.post("/process-request", processJoinRequest);
router.get("/admission-exam", getAdmissionExam);
router.post("/admission-exam", saveAdmissionExam);
router.post("/assign-class", assignClass);
router.delete("/:id", deleteUser);

module.exports = router;
