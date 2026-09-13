const AppNotification = require("../models/AppNotification");
const User = require("../models/User");

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Create a single notification for a specific user
 */
const createAppNotification = async ({ recipient, schoolName, role, title, message, category = "General", link = "", metadata = {} }) => {
  try {
    if (!recipient || !schoolName || !role) return null;
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

module.exports = {
  createAppNotification,
  notifySchoolAdmins,
  notifySchoolRole,
  notifyStudentsInClass
};
