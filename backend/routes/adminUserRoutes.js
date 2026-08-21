const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
getTeachers,
getStudents
} = require("../controllers/adminUserController");

router.use(protect);
router.use(authorize("admin"));

router.get("/teachers",getTeachers);

router.get("/students",getStudents);


module.exports = router;