const AppNotification = require("../models/AppNotification");

// Get notifications for the authenticated user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, page = 1, limit = 50 } = req.query;

    const query = { recipient: userId };
    if (category && category !== "All") {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await AppNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AppNotification.countDocuments(query);
    const unreadCount = await AppNotification.countDocuments({ recipient: userId, isRead: false });

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await AppNotification.countDocuments({ recipient: userId, isRead: false });
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all notifications as read for current user
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await AppNotification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark single notification as read
exports.markSingleRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await AppNotification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await AppNotification.findOneAndDelete({ _id: id, recipient: userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
