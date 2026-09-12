// backend/routes/school/publicRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const { getSchools, getSchoolDetails, getSchoolTeachers } = require("../../controllers/school/schoolPublicController");

router.get("/", protect, getSchools);
router.get("/:name", protect, getSchoolDetails);
router.get("/:name/teachers", protect, getSchoolTeachers);

module.exports = router;
