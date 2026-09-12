// backend/routes/school/profileRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");
const { getMySchool, updateMySchool } = require("../../controllers/school/schoolProfileController");

router.get("/my-school", protect, authorize("admin", "superadmin", "unassigned"), getMySchool);
router.put("/my-school", protect, authorize("admin", "superadmin", "unassigned"), updateMySchool);

module.exports = router;
