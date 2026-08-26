const Notification = require("../models/Notification");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    let notifications = await Notification.find().sort({ createdAt: -1 });

    // Seed mock data if empty
    if (notifications.length === 0) {
      const mockList = [
        {
          title: "School Approval Pending",
          message: "Green Valley School has submitted request for approval.",
          category: "approval",
          isRead: false,
          createdAt: new Date()
        },
        {
          title: "Payment Received",
          message: "₹24,999 received from Bright Future School (Premium Annual)",
          category: "payment",
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          title: "New Support Message",
          message: "You have a new message from Sunrise Public School.",
          category: "support",
          isRead: false,
          createdAt: new Date(Date.now() - 42 * 60 * 1000)
        },
        {
          title: "New School Registered",
          message: "Wisdom World School has registered on the platform.",
          category: "school",
          isRead: false,
          createdAt: new Date(Date.now() - 70 * 60 * 1000)
        },
        {
          title: "System Alert",
          message: "Backup completed successfully.",
          category: "system",
          isRead: false,
          createdAt: new Date(Date.now() - 105 * 60 * 1000)
        },
        {
          title: "Payment Pending",
          message: "Payment of ₹4,999 from Little Angels School is pending.",
          category: "payment",
          isRead: false,
          createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000)
        },
        {
          title: "School Approval Pending",
          message: "St. Mary's School has submitted request for approval.",
          category: "approval",
          isRead: false,
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
        },
        {
          title: "Support Message Reply",
          message: "You have a reply from DPS International.",
          category: "support",
          isRead: false,
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
          title: "Subscription Expiring Soon",
          message: "Rainbow Kids School subscription will expire in 5 days.",
          category: "payment",
          isRead: false,
          createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000)
        },
        {
          title: "System Alert",
          message: "High server CPU usage detected.",
          category: "system",
          isRead: false,
          createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
        },
        {
          title: "Payment Failed",
          message: "Payment of ₹2,999 from Oxford Public School failed.",
          category: "payment",
          isRead: false,
          createdAt: new Date("2025-05-17T19:45:00")
        },
        {
          title: "New School Registered",
          message: "City Public School has registered on the platform.",
          category: "school",
          isRead: false,
          createdAt: new Date("2025-05-17T17:30:00")
        },
        {
          title: "Support Message",
          message: "New message received from Royal Kids School.",
          category: "support",
          isRead: false,
          createdAt: new Date("2025-05-17T15:40:00")
        },
        {
          title: "Payment Received",
          message: "₹4,999 received from New Era School (Basic Monthly)",
          category: "payment",
          isRead: false,
          createdAt: new Date("2025-05-17T10:45:00")
        },
        {
          title: "System Alert",
          message: "Database optimization completed.",
          category: "system",
          isRead: false,
          createdAt: new Date("2025-05-17T09:15:00")
        }
      ];

      await Notification.insertMany(mockList);
      notifications = await Notification.find().sort({ createdAt: -1 });
    }

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
