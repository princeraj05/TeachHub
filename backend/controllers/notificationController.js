const Notification = require("../models/Notification");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications/stats
exports.getNotificationStats = async (req, res) => {
  try {
    const approvals = await Notification.countDocuments({ category: "approval" });
    const payments = await Notification.countDocuments({ category: "payment" });
    const support = await Notification.countDocuments({ category: "support" });
    const schools = await Notification.countDocuments({ category: "school" });
    const system = await Notification.countDocuments({ category: "system" });
    const total = approvals + payments + support + schools + system;

    res.json({
      approvals,
      payments,
      support,
      schools,
      system,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
