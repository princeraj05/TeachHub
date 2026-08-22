const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getAboutInfo, updateAboutInfo } = require("../controllers/aboutAppController");

router.get("/", protect, getAboutInfo);
router.put("/", protect, authorize("superadmin"), updateAboutInfo);

module.exports = router;
