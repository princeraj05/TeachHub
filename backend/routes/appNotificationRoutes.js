const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserNotifications,
  getUnreadCount,
  markAllRead,
  markSingleRead,
  deleteNotification
} = require("../controllers/appNotificationController");

router.use(protect);

router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllRead);
router.put("/:id/read", markSingleRead);
router.delete("/:id", deleteNotification);

module.exports = router;
