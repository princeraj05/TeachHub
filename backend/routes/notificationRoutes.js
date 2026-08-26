const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllAsRead,
  markAsRead,
  getNotificationStats
} = require("../controllers/notificationController");

router.use(protect);
router.use(authorize("superadmin"));

router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.get("/stats", getNotificationStats);

module.exports = router;
