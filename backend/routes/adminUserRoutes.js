const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
getTeachers,
getStudents,
getJoinRequests,
processJoinRequest
} = require("../controllers/adminUserController");

router.use(protect);
router.use(authorize("admin"));

router.get("/teachers",getTeachers);
router.get("/students",getStudents);
router.get("/join-requests", getJoinRequests);
router.post("/process-request", processJoinRequest);

module.exports = router;