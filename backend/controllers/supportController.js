const Message = require("../models/Message");
const User = require("../models/User");
const Call = require("../models/Call");

// Check if sender is authorized to message receiver (Strict School Isolation)
const validateCommunicationRights = async (senderId, senderRole, senderSchool, receiverId) => {
  if (senderRole === "superadmin") return true;

  const receiver = await User.findById(receiverId);
  if (!receiver) return false;

  const receiverRole = receiver.role;
  const receiverSchool = receiver.schoolName || "";

  // Super Admin <-> Admin
  if (receiverRole === "superadmin" && senderRole === "admin") return true;

  // Admin <-> Teacher/Student of same school
  if (senderRole === "admin" && (receiverRole === "teacher" || receiverRole === "student") && senderSchool === receiverSchool) return true;
  if ((senderRole === "teacher" || senderRole === "student") && receiverRole === "admin" && senderSchool === receiverSchool) return true;

  // Teacher <-> Student of same school
  if (senderRole === "teacher" && receiverRole === "student" && senderSchool === receiverSchool) return true;
  if (senderRole === "student" && receiverRole === "teacher" && senderSchool === receiverSchool) return true;

  return false;
};

// ================= SEND MESSAGE =================
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, type, targetRole, content, attachments, replyTo, clientMessageId } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const schoolName = req.user.schoolName || "";

    // 1. Idempotency check: Duplicate message prevention
    if (clientMessageId) {
      const existing = await Message.findOne({ clientMessageId })
        .populate("sender", "name email role schoolName isOnline lastSeen")
        .populate("receiver", "name email role schoolName isOnline lastSeen")
        .populate("replyTo");
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    if (type === "personal") {
      if (!receiver) {
        return res.status(400).json({ message: "Receiver ID is required for personal messages" });
      }

      // Authorization / School Isolation check
      const isAuthorized = await validateCommunicationRights(senderId, senderRole, schoolName, receiver);
      if (!isAuthorized) {
        return res.status(403).json({ message: "You are not authorized to message this user" });
      }

      // Check if receiver is online to determine delivery status
      const receiverUser = await User.findById(receiver);
      const isReceiverOnline = receiverUser ? receiverUser.isOnline : false;
      const initialStatus = isReceiverOnline ? "delivered" : "sent";

      const message = await Message.create({
        sender: senderId,
        receiver,
        schoolName: senderRole === "superadmin" ? receiverUser.schoolName : schoolName,
        type: "personal",
        content: (content || "").trim(),
        attachments: attachments || [],
        replyTo: replyTo || null,
        clientMessageId,
        status: initialStatus
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name email role schoolName isOnline lastSeen")
        .populate("receiver", "name email role schoolName isOnline lastSeen")
        .populate("replyTo");

      const io = req.app.get("io");
      if (io) {
        // Emit to sender & receiver rooms
        io.to(senderId).emit("support:new-message", populated);
        io.to(receiver).emit("support:new-message", populated);
        
        // Notify sender of status if delivered
        if (initialStatus === "delivered") {
          io.to(senderId).emit("message:status-update", {
            messageId: populated._id,
            status: "delivered",
            receiverId: receiver
          });
        }
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
        content: (content || "").trim(),
        attachments: attachments || [],
        clientMessageId
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name email role schoolName isOnline lastSeen");

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
    const { otherUserId, broadcasts, page = 1, limit = 30 } = req.query;
    const currentUserId = req.user.id;
    const role = req.user.role;
    const schoolName = req.user.schoolName;

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

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
        .populate("sender", "name email role schoolName isOnline lastSeen")
        .sort({ createdAt: -1 })
        .skip(skipIndex)
        .limit(parseInt(limit));

      // Return oldest first for the page chunk
      return res.json(messages.reverse());
    }

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required for personal chat history" });
    }

    // Security/Isolation validation
    const isAuthorized = await validateCommunicationRights(currentUserId, role, schoolName, otherUserId);
    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not authorized to view chat history with this user" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ],
      type: "personal"
    })
      .populate("sender", "name email role schoolName isOnline lastSeen")
      .populate("receiver", "name email role schoolName isOnline lastSeen")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    // Return oldest first for proper frontend ordering
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET CONTACTS =================
exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const role = req.user.role;
    const schoolName = req.user.schoolName;

    if (role === "unassigned") {
      return res.status(403).json({ message: "Unassigned users have no contact permissions" });
    }

    let contacts = [];

    if (role === "superadmin") {
      contacts = await User.find({ role: "admin" })
        .select("name email role schoolName isOnline lastSeen avatar");
    } else if (role === "admin") {
      const superAdmins = await User.find({ role: "superadmin" }).select("name email role schoolName isOnline lastSeen avatar");
      const schoolUsers = await User.find({
        schoolName,
        role: { $in: ["teacher", "student"] }
      }).select("name email role schoolName isOnline lastSeen avatar");
      contacts = [...superAdmins, ...schoolUsers];
    } else if (role === "teacher") {
      const admins = await User.find({ role: "admin", schoolName }).select("name email role schoolName isOnline lastSeen avatar");
      const students = await User.find({ role: "student", schoolName }).select("name email role schoolName isOnline lastSeen avatar");
      contacts = [...admins, ...students];
    } else if (role === "student") {
      const admins = await User.find({ role: "admin", schoolName }).select("name email role schoolName isOnline lastSeen avatar");
      const teachers = await User.find({ role: "teacher", schoolName }).select("name email role schoolName isOnline lastSeen avatar");
      contacts = [...admins, ...teachers];
    }

    // Attach dynamic real-time metadata (lastMessage, unreadCount) to each contact
    const contactsWithMeta = await Promise.all(contacts.map(async (contact) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: currentUserId, receiver: contact._id },
          { sender: contact._id, receiver: currentUserId }
        ],
        type: "personal"
      })
      .sort({ createdAt: -1 })
      .populate("sender", "name email role schoolName")
      .populate("replyTo");

      const unreadCount = await Message.countDocuments({
        sender: contact._id,
        receiver: currentUserId,
        status: { $ne: "read" },
        type: "personal"
      });

      return {
        ...contact.toObject(),
        lastMessage: lastMsg,
        unreadCount
      };
    }));

    res.json(contactsWithMeta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FILE UPLOAD HANDLER =================
exports.handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Formulate a safe static URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      createdAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MESSAGE REACTION =================
exports.addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // School Isolation / Connection authorization check
    const partnerId = message.sender.toString() === userId ? message.receiver : message.sender;
    if (message.type === "personal" && partnerId) {
      const isAuthorized = await validateCommunicationRights(userId, req.user.role, req.user.schoolName, partnerId);
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to react to this message" });
      }
    }

    // Reaction update logic: Remove existing reaction from this user if it matches, or update it
    const existingIndex = message.reactions.findIndex(r => r.user.toString() === userId);
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle off reaction if clicked twice
        message.reactions.splice(existingIndex, 1);
      } else {
        // Update to new emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    const populated = await Message.findById(messageId)
      .populate("sender", "name email role schoolName isOnline lastSeen")
      .populate("receiver", "name email role schoolName isOnline lastSeen")
      .populate("replyTo");

    const io = req.app.get("io");
    if (io) {
      if (populated.type === "personal") {
        io.to(populated.sender._id.toString()).emit("message:reaction-updated", populated);
        io.to(populated.receiver._id.toString()).emit("message:reaction-updated", populated);
      } else {
        io.emit("message:reaction-updated", populated);
      }
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE MESSAGE =================
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteType } = req.query; // "me" or "everyone"
    const userId = req.user.id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (deleteType === "everyone") {
      if (message.sender.toString() !== userId) {
        return res.status(403).json({ message: "You are not authorized to delete this message for everyone" });
      }

      // Update content to show system delete alert
      message.content = "This message was deleted";
      message.attachments = [];
      message.reactions = [];
      await message.save();

      const populated = await Message.findById(id)
        .populate("sender", "name email role schoolName isOnline lastSeen")
        .populate("receiver", "name email role schoolName isOnline lastSeen")
        .populate("replyTo");

      const io = req.app.get("io");
      if (io) {
        if (populated.type === "personal") {
          io.to(populated.sender._id.toString()).emit("message:deleted-everyone", populated);
          io.to(populated.receiver._id.toString()).emit("message:deleted-everyone", populated);
        } else {
          io.emit("message:deleted-everyone", populated);
        }
      }

      return res.json(populated);
    } else {
      // Delete for me: Simply remove message reference or return success
      // (For simple execution, we remove from this requester's view by returning success and maintaining local UI states)
      return res.json({ messageId: id, deletedForMe: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CALL HISTORY =================
exports.getCallHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const schoolName = req.user.schoolName || "";

    const calls = await Call.find({
      $or: [
        { caller: currentUserId },
        { receiver: currentUserId }
      ]
    })
    .populate("caller", "name email role avatar schoolName")
    .populate("receiver", "name email role avatar schoolName")
    .sort({ createdAt: -1 })
    .limit(50);

    // Apply strict school isolation checks to the logs
    const filteredCalls = calls.filter(c => {
      if (req.user.role === "superadmin") return true;
      return c.schoolName === schoolName;
    });

    res.json(filteredCalls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
