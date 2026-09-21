const AppNotification = require("../models/AppNotification");
const User = require("../models/User");

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const firebaseAdmin = require("../config/firebase");

/**
 * Create a single notification for a specific user
 */
const createAppNotification = async ({ recipient, schoolName, role, title, message, category = "General", link = "", metadata = {} }) => {
  try {
    if (!recipient || !schoolName || !role) return null;

    // Do not notify suspended support agents
    if (role === "support") {
      const targetUser = await User.findById(recipient).select("supportStatus").lean();
      if (targetUser && targetUser.supportStatus === "suspended") {
        return null;
      }
    }
    const notification = await AppNotification.create({
      recipient,
      schoolName,
      role,
      title,
      message,
      category,
      link,
      metadata
    });

    if (global.io && recipient) {
      global.io.to(recipient.toString()).emit("notification:new", notification);
      global.io.to(recipient.toString()).emit("app-notification:new", notification);
    }

    // Extended FCM Mobile Push Notification Dispatch
    try {
      const recipientUser = await User.findById(recipient).select("fcmToken pushNotifications").lean();
      if (recipientUser && recipientUser.fcmToken && recipientUser.pushNotifications !== false) {
        const messaging = firebaseAdmin.messaging();
        if (messaging) {
          await messaging.send({
            token: recipientUser.fcmToken,
            notification: {
              title: title || "Your School Alert",
              body: message || "You have a new notification."
            },
            data: {
              notificationId: notification._id.toString(),
              category: category || "General",
              link: link || "",
              route: link || "/"
            },
            android: {
              priority: "high",
              notification: {
                channelId: "default",
                sound: "default"
              }
            }
          });
        }
      }
    } catch (fcmErr) {
      console.warn("FCM push notification delivery notice:", fcmErr.message);
      if (fcmErr.code === "messaging/registration-token-not-registered" || fcmErr.code === "messaging/invalid-registration-token") {
        try {
          await User.findByIdAndUpdate(recipient, { fcmToken: "" });
        } catch (e) {}
      }
    }

    return notification;
  } catch (err) {
    console.error("Error creating AppNotification:", err.message);
    return null;
  }
};

/**
 * Notify all Admins belonging to a specific school
 */
const notifySchoolAdmins = async ({ schoolName, title, message, category = "Join Request", link = "/admin/requests", metadata = {} }) => {
  try {
    if (!schoolName) return [];
    const schoolRegex = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    const admins = await User.find({ role: "admin", schoolName: schoolRegex }).select("_id schoolName").lean();
    
    const notifications = [];
    for (const admin of admins) {
      const notif = await createAppNotification({
        recipient: admin._id,
        schoolName: admin.schoolName || schoolName,
        role: "admin",
        title,
        message,
        category,
        link,
        metadata
      });
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error("Error notifying school admins:", err.message);
    return [];
  }
};

/**
 * Notify all users of a specific role in a school (e.g. all teachers or all students)
 */
const notifySchoolRole = async ({ schoolName, role, title, message, category = "Events", link = "", metadata = {} }) => {
  try {
    if (!schoolName || !role) return [];
    const schoolRegex = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    const users = await User.find({ role, schoolName: schoolRegex }).select("_id schoolName role").lean();

    const notifications = [];
    for (const user of users) {
      const notif = await createAppNotification({
        recipient: user._id,
        schoolName: user.schoolName || schoolName,
        role: user.role,
        title,
        message,
        category,
        link,
        metadata
      });
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error(`Error notifying school role ${role}:`, err.message);
    return [];
  }
};

/**
 * Notify students of a specific class/section
 */
const notifyStudentsInClass = async ({ schoolName, className, section, title, message, category = "General", link = "", metadata = {} }) => {
  try {
    if (!schoolName) return [];
    const schoolRegex = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    const query = { role: "student", schoolName: schoolRegex };
    if (className) query.className = className;
    if (section) query.section = section;

    const students = await User.find(query).select("_id schoolName role").lean();
    const notifications = [];
    for (const student of students) {
      const notif = await createAppNotification({
        recipient: student._id,
        schoolName: student.schoolName || schoolName,
        role: "student",
        title,
        message,
        category,
        link,
        metadata
      });
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error("Error notifying students in class:", err.message);
    return [];
  }
};

/**
 * Notify active Support Team agents belonging to a specific department (or SuperAdmins)
 */
const notifySupportDepartment = async ({ department, title, message, category = "Support", link = "/support/requests", metadata = {} }) => {
  try {
    const agents = await User.find({
      role: { $in: ["support", "superadmin"] },
      supportStatus: { $ne: "suspended" },
      $or: [
        { role: "superadmin" },
        { supportDepartment: department }
      ]
    }).select("_id role schoolName supportDepartment").lean();

    const notifications = [];
    for (const agent of agents) {
      const notif = await createAppNotification({
        recipient: agent._id,
        schoolName: agent.schoolName || "TeachHub HQ",
        role: agent.role,
        title,
        message,
        category,
        link,
        metadata
      });
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (err) {
    console.error(`Error notifying support department ${department}:`, err.message);
    return [];
  }
};

/**
 * Notify a specific ticket requester
 */
const notifyTicketRequester = async ({ requesterId, title, message, category = "Support", link = "/support/requests", metadata = {} }) => {
  try {
    if (!requesterId) return null;
    const user = await User.findById(requesterId).select("_id role schoolName").lean();
    if (!user) return null;

    const ticketId = metadata?.ticketId;
    const targetRole = user.role === "unassigned" ? "pending" : (user.role || "student");
    const requesterLink = ticketId
      ? `/${targetRole}/support-team/requests/${ticketId}`
      : (link && !link.startsWith("/support/requests") ? link : `/${targetRole}/support-team`);

    return await createAppNotification({
      recipient: user._id,
      schoolName: user.schoolName || "Campus HQ",
      role: user.role,
      title,
      message,
      category,
      link: requesterLink,
      metadata
    });
  } catch (err) {
    console.error("Error notifying ticket requester:", err.message);
    return null;
  }
};

module.exports = {
  createAppNotification,
  notifySchoolAdmins,
  notifySchoolRole,
  notifyStudentsInClass,
  notifySupportDepartment,
  notifyTicketRequester
};
