// backend/routes/school/basicInformationRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/authMiddleware");
const { getBasicInfo, updateBasicInfo } = require("../../controllers/school/basicInformationController");

router.get("/my-school/basic-info", protect, authorize("admin", "superadmin", "unassigned"), getBasicInfo);
router.put("/my-school/basic-info", protect, authorize("admin", "superadmin", "unassigned"), updateBasicInfo);

module.exports = router;
