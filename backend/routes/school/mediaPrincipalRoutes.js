// backend/routes/school/mediaPrincipalRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");
const { getMediaPrincipalInfo, updateMediaPrincipalInfo } = require("../../controllers/school/mediaPrincipalController");

router.get("/my-school/media-principal", protect, authorize("admin", "superadmin", "unassigned"), getMediaPrincipalInfo);
router.put("/my-school/media-principal", protect, authorize("admin", "superadmin", "unassigned"), updateMediaPrincipalInfo);

module.exports = router;
