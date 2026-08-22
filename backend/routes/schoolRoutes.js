const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getSchools, getSchoolDetails, getMySchool, updateMySchool } = require("../controllers/schoolController");

// Register specific routes first
router.get("/my-school", protect, authorize("admin"), getMySchool);
router.put("/my-school", protect, authorize("admin"), updateMySchool);

// Register list and parameterized routes last
router.get("/", protect, getSchools);
router.get("/:name", protect, getSchoolDetails);

module.exports = router;
