const Message = require("../models/Message");
const User = require("../models/User");

// ================= SEND MESSAGE =================

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, type, targetRole, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const schoolName = req.user.schoolName || "";

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    if (type === "personal") {
      if (!receiver) {
        return res.status(400).json({ message: "Receiver ID is required for personal messages" });
      }

      const receiverUser = await User.findById(receiver);
      if (!receiverUser) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      const receiverRole = receiverUser.role;
      let authorized = false;

      // Super Admin <-> Admin
      if (senderRole === "superadmin" && receiverRole === "admin") authorized = true;
      if (senderRole === "admin" && receiverRole === "superadmin") authorized = true;

      // Admin <-> Teacher/Student of same school
      if (senderRole === "admin" && (receiverRole === "teacher" || receiverRole === "student") && schoolName === receiverUser.schoolName) authorized = true;
      if ((senderRole === "teacher" || senderRole === "student") && receiverRole === "admin" && schoolName === receiverUser.schoolName) authorized = true;

      // Teacher <-> Student of same school
      if (senderRole === "teacher" && receiverRole === "student" && schoolName === receiverUser.schoolName) authorized = true;
      if (senderRole === "student" && receiverRole === "teacher" && schoolName === receiverUser.schoolName) authorized = true;

      if (!authorized) {
        return res.status(403).json({ message: "You are not authorized to message this user" });
      }

      const message = await Message.create({
        sender: senderId,
        receiver,
        schoolName: senderRole === "superadmin" ? receiverUser.schoolName : schoolName,
        type: "personal",
        content: content.trim()
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name email role schoolName")
        .populate("receiver", "name email role schoolName");

      const io = req.app.get("io");
      if (io) {
        io.emit("support:new-message", populated);
      }

      return res.status(201).json(populated);
    } else if (type === "broadcast") {
      if (senderRole !== "admin") {
        return res.status(403).json({ message: "Only Admins are allowed to send broadcast messages" });
      }

      if (!["teacher", "student"].includes(targetRole)) {
        return res.status(400).json({ message: "Invalid broadcast target role" });
      }

      const message = await Message.create({
        sender: senderId,
        schoolName,
        type: "broadcast",
        targetRole,
        content: content.trim()
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name email role schoolName");

      const io = req.app.get("io");
      if (io) {
        io.emit("support:new-message", populated);
      }

      return res.status(201).json(populated);
    } else {
      return res.status(400).json({ message: "Invalid message type" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET CHAT HISTORY =================

exports.getHistory = async (req, res) => {
  try {
    const { otherUserId, broadcasts } = req.query;
    const currentUserId = req.user.id;
    const role = req.user.role;
    const schoolName = req.user.schoolName;

    if (broadcasts === "true") {
      if (role === "unassigned") {
        return res.status(403).json({ message: "Unassigned users cannot access broadcasts" });
      }

      let query;
      if (role === "admin") {
        query = { sender: currentUserId, type: "broadcast" };
      } else {
        query = { schoolName, type: "broadcast", targetRole: role };
      }

      const messages = await Message.find(query)
        .populate("sender", "name email role schoolName")
        .sort({ createdAt: 1 });

      return res.json(messages);
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required for personal chat history" });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let authorized = false;
    if (role === "superadmin" && otherUser.role === "admin") authorized = true;
    if (role === "admin" && otherUser.role === "superadmin") authorized = true;
    if (role === "admin" && (otherUser.role === "teacher" || otherUser.role === "student") && schoolName === otherUser.schoolName) authorized = true;
    if ((role === "teacher" || role === "student") && otherUser.role === "admin" && schoolName === otherUser.schoolName) authorized = true;
    if (role === "teacher" && otherUser.role === "student" && schoolName === otherUser.schoolName) authorized = true;
    if (role === "student" && otherUser.role === "teacher" && schoolName === otherUser.schoolName) authorized = true;

    if (!authorized) {
      return res.status(403).json({ message: "You are not authorized to view chat history with this user" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      type: "personal"
    })
      .populate("sender", "name email role schoolName")
      .populate("receiver", "name email role schoolName")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET CONTACTS =================

exports.getContacts = async (req, res) => {
  try {
    const role = req.user.role;
    const schoolName = req.user.schoolName;

    if (role === "unassigned") {
      return res.status(403).json({ message: "Unassigned users have no contact permissions" });
    }

    let contacts = [];

    if (role === "superadmin") {
      contacts = await User.find({ role: "admin" })
        .select("name email role schoolName");
    } else if (role === "admin") {
      const superAdmins = await User.find({ role: "superadmin" }).select("name email role schoolName");
      const schoolUsers = await User.find({
        schoolName,
        role: { $in: ["teacher", "student"] }
      }).select("name email role schoolName");
      contacts = [...superAdmins, ...schoolUsers];
    } else if (role === "teacher") {
      const admins = await User.find({ role: "admin", schoolName }).select("name email role schoolName");
      const students = await User.find({ role: "student", schoolName }).select("name email role schoolName");
      contacts = [...admins, ...students];
    } else if (role === "student") {
      const admins = await User.find({ role: "admin", schoolName }).select("name email role schoolName");
      const teachers = await User.find({ role: "teacher", schoolName }).select("name email role schoolName");
      contacts = [...admins, ...teachers];
    }

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
