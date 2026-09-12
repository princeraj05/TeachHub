// backend/routes/school/schoolDescriptionRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");
const { getDescriptionInfo, updateDescriptionInfo } = require("../../controllers/school/schoolDescriptionController");

router.get("/my-school/description", protect, authorize("admin", "superadmin", "unassigned"), getDescriptionInfo);
router.put("/my-school/description", protect, authorize("admin", "superadmin", "unassigned"), updateDescriptionInfo);

module.exports = router;
