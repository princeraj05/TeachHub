const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getAdminDashboard
} = require("../controllers/adminDashboardController");

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAdminDashboard);

module.exports = router;