// backend/routes/school/admissionSettingsRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");
const { getAdmissionSettingsInfo, updateAdmissionSettingsInfo } = require("../../controllers/school/admissionSettingsController");

router.get("/my-school/admission-settings", protect, authorize("admin", "superadmin", "unassigned"), getAdmissionSettingsInfo);
router.put("/my-school/admission-settings", protect, authorize("admin", "superadmin", "unassigned"), updateAdmissionSettingsInfo);

module.exports = router;
