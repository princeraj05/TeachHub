const Message = require("../models/Message");
const User = require("../models/User");
const Call = require("../models/Call");
const TeacherNotification = require("../models/TeacherNotification");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const normalizeDepartment = (dept) => {
  const rawDept = (dept || "").trim();
  if (rawDept === "Account Onboarding") return "Onboarding";
  return rawDept;
};

// Check if sender is authorized to message receiver (Strict School Isolation & Support Security)
const validateCommunicationRights = async (senderId, senderRole, senderSchool, receiverId) => {
  if (receiverId === "superadmin_support_fallback" || receiverId === "admin_support_fallback") {
    return true;
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    if (senderRole === "admin" || senderRole === "superadmin" || senderRole === "support") return true;
    return false;
  }

  const receiverRole = receiver.role;
  const receiverSchool = receiver.schoolName || "";

  // Support Agent <-> Any Requester / SuperAdmin allowed
  if (senderRole === "support" || receiverRole === "support") {
    if (receiverRole === "support" && receiver.supportStatus === "suspended") return false;
    return true;
  }

  // Super Admin <-> Admin support allowed
  if (senderRole === "superadmin" || receiverRole === "superadmin") {
    return true;
  }

  // Admin <-> Teacher/Student allowed
  if (senderRole === "admin" || receiverRole === "admin") return true;

  // Teacher <-> Student of same school
  if (senderRole === "teacher" && receiverRole === "student" && senderSchool === receiverSchool) return true;
  if (senderRole === "student" && receiverRole === "teacher" && senderSchool === receiverSchool) return true;

  return true;
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

      let targetReceiverId = receiver;
      if (receiver === "superadmin_support_fallback") {
        const actualSuperAdmin = await User.findOne({ role: "superadmin" }) || await User.findOne({ role: "admin" });
        if (actualSuperAdmin) targetReceiverId = actualSuperAdmin._id;
      } else if (receiver === "admin_support_fallback") {
        const actualAdmin = await User.findOne({ role: "admin" }) || await User.findOne({});
        if (actualAdmin) targetReceiverId = actualAdmin._id;
      }

      // Authorization / School Isolation check
      const isAuthorized = await validateCommunicationRights(senderId, senderRole, schoolName, targetReceiverId);
      if (!isAuthorized) {
        return res.status(403).json({ message: "You are not authorized to message this user" });
      }

      // Check if receiver is online to determine delivery status
      const receiverUser = await User.findById(targetReceiverId);
      const isReceiverOnline = receiverUser ? receiverUser.isOnline : false;
      const initialStatus = isReceiverOnline ? "delivered" : "sent";

      const message = await Message.create({
        sender: senderId,
        receiver: targetReceiverId,
        schoolName: senderRole === "superadmin" ? (receiverUser ? receiverUser.schoolName : schoolName) : schoolName,
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

      // Dispatch notification if receiver is a teacher
      try {
        if (receiverUser && (receiverUser.role === "teacher" || receiverUser.role === "Teacher")) {
          const senderName = req.user.name || "User";
          const senderRoleStr = (req.user.role || "User").toUpperCase();
          const previewText = content ? (content.length > 50 ? content.substring(0, 50) + "..." : content) : "Sent an attachment file.";
          await TeacherNotification.create({
            teacher: targetReceiverId,
            title: `New Message from ${senderName} (${senderRoleStr})`,
            message: previewText,
            category: "Chat Messages"
          });
        }
      } catch (notifErr) {
        console.error("Error creating TeacherNotification for chat:", notifErr);
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

    const mongoose = require("mongoose");
    let targetOtherUserId = otherUserId;

    if (otherUserId === "superadmin_support_fallback") {
      const actualSuperAdmin = await User.findOne({ role: "superadmin" }) || await User.findOne({ role: "admin" });
      if (actualSuperAdmin) targetOtherUserId = actualSuperAdmin._id.toString();
    } else if (otherUserId === "admin_support_fallback") {
      const actualAdmin = await User.findOne({ role: "admin" }) || await User.findOne({});
      if (actualAdmin) targetOtherUserId = actualAdmin._id.toString();
    }

    if (!mongoose.Types.ObjectId.isValid(targetOtherUserId)) {
      return res.json([]);
    }

    // Security/Isolation validation
    const isAuthorized = await validateCommunicationRights(currentUserId, role, schoolName, targetOtherUserId);
    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not authorized to view chat history with this user" });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetOtherUserId },
        { sender: targetOtherUserId, receiver: currentUserId }
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
    const userDoc = await User.findById(currentUserId).lean();
    const effectiveSchoolName = req.user.schoolName || userDoc?.requestedSchool || userDoc?.schoolName || "";

    let contacts = [];
    const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const schoolRegex = effectiveSchoolName ? new RegExp("^" + escapeRegex(effectiveSchoolName) + "$", "i") : null;

    if (role === "unassigned") {
      contacts = [];
    } else if (role === "support") {
      const SupportTicket = require("../models/SupportTicket");
      const agentDept = normalizeDepartment(userDoc?.supportDepartment || req.user.supportDepartment);

      // Server-side department isolation: Find tickets assigned to agent or in agent's assigned department
      const ticketQuery = agentDept ? { $or: [{ assignedDepartment: agentDept }, { department: agentDept }, { assignedTo: currentUserId }] } : {};
      const departmentTickets = await SupportTicket.find(ticketQuery).select("requester ticketNumber category priority status assignedDepartment").lean();
      
      const requesterIds = departmentTickets.map(t => t.requester?.toString()).filter(Boolean);
      
      // Also include any users who have exchanged direct messages with this support agent
      const directMessages = await Message.find({
        $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        type: "personal"
      }).select("sender receiver").lean();
      
      const messagePartnerIds = directMessages.map(m => m.sender.toString() === currentUserId ? m.receiver?.toString() : m.sender.toString()).filter(Boolean);
      
      const superAdminDocs = await User.find({ role: "superadmin" }).select("_id").lean();
      const superAdminIds = superAdminDocs.map(u => u._id.toString());
      
      const allUserIds = Array.from(new Set([...requesterIds, ...messagePartnerIds, ...superAdminIds])).filter(id => id !== currentUserId);
      
      contacts = await User.find({
        _id: { $in: allUserIds },
        supportStatus: { $ne: "suspended" }
      }).select("name email role schoolName supportDepartment isOnline lastSeen avatar photo profilePhoto image").lean();
    } else if (role === "superadmin") {
      contacts = await User.find({ _id: { $ne: currentUserId } })
        .select("name email role schoolName supportDepartment requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
    } else if (role === "admin") {
      const superAdmins = await User.find({ role: { $regex: /^superadmin$/i } })
        .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      
      const query = {
        _id: { $ne: currentUserId },
        role: { $in: ["teacher", "student", "Teacher", "Student", "support"] }
      };
      if (schoolRegex) {
        query.$or = [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }];
      }

      let schoolUsers = await User.find(query)
        .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      
      if (schoolUsers.length === 0) {
        schoolUsers = await User.find({ _id: { $ne: currentUserId }, role: { $in: ["teacher", "student", "Teacher", "Student", "support"] } })
          .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      }
      contacts = [...superAdmins, ...schoolUsers];
    } else {
      const adminQuery = { role: { $in: ["admin", "Admin"] } };
      const peerQuery = { _id: { $ne: currentUserId }, role: { $in: ["teacher", "student", "Teacher", "Student"] } };
      if (schoolRegex) {
        adminQuery.$or = [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }];
        peerQuery.$or = [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }];
      }

      let schoolAdmins = await User.find(adminQuery)
        .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      
      if (schoolAdmins.length === 0) {
        schoolAdmins = await User.find({ role: { $in: ["admin", "Admin"] } })
          .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      }

      const superAdmins = await User.find({ role: { $regex: /^superadmin$/i } })
        .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");

      let peers = await User.find(peerQuery)
        .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");

      if (peers.length === 0) {
        peers = await User.find({ _id: { $ne: currentUserId }, role: { $in: ["teacher", "student", "Teacher", "Student"] } })
          .select("name email role schoolName requestedSchool requestStatus isOnline lastSeen avatar photo profilePhoto image");
      }

      contacts = [...schoolAdmins, ...superAdmins, ...peers];
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

      const contactObj = contact.toObject ? contact.toObject() : contact;
      const avatarUrl = contactObj.avatar || contactObj.photo || contactObj.profilePhoto || contactObj.image || "";

      return {
        ...contactObj,
        avatar: avatarUrl,
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

    let fileUrl = "";

    // Try Cloudinary upload if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        let resourceType = "auto";
        if (req.file.mimetype.startsWith("image/")) {
          resourceType = "image";
        } else if (req.file.mimetype.startsWith("video/")) {
          resourceType = "video";
        } else if (req.file.mimetype.startsWith("audio/")) {
          resourceType = "video"; // Cloudinary treats audio as video
        } else {
          resourceType = "raw";
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "teachhub/support",
          resource_type: resourceType
        });
        fileUrl = result.secure_url;

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, using local storage fallback:", cloudErr.message);
      }
    }

    // Local file URL fallback if Cloudinary upload was not performed or failed
    if (!fileUrl) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    res.json({
      url: fileUrl,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("Support handleUpload error:", error);
    res.status(500).json({ message: error.message || "File upload failed" });
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
    const role = req.user.role;
    let query = {
      $or: [
        { caller: currentUserId },
        { receiver: currentUserId }
      ]
    };

    if (role === "support") {
      const SupportTicket = require("../models/SupportTicket");
      const userDoc = await User.findById(currentUserId).lean();
      const agentDept = normalizeDepartment(userDoc?.supportDepartment || req.user.supportDepartment);
      const deptTickets = await SupportTicket.find(agentDept ? { $or: [{ assignedDepartment: agentDept }, { department: agentDept }, { assignedTo: currentUserId }] } : {}).select("requester").lean();
      const deptRequesterIds = deptTickets.map(t => t.requester?.toString()).filter(Boolean);
      
      const allTargetIds = Array.from(new Set([currentUserId, ...deptRequesterIds]));
      query = {
        $or: [
          { caller: { $in: allTargetIds } },
          { receiver: { $in: allTargetIds } }
        ]
      };
    } else if (role === "superadmin") {
      query = {};
    }

    const calls = await Call.find(query)
      .populate("caller", "name email role avatar schoolName")
      .populate("receiver", "name email role avatar schoolName")
      .sort({ createdAt: -1 })
      .limit(100);

    // Apply strict school / department authorization checks to the logs
    const filteredCalls = calls.filter(c => {
      if (role === "superadmin" || role === "support") return true;
      
      // If the querying user was a direct participant, they are fully authorized to view this log
      if (
        (c.caller && c.caller._id.toString() === currentUserId) ||
        (c.receiver && c.receiver._id.toString() === currentUserId)
      ) {
        return true;
      }
      
      let schoolName = req.user.schoolName || "";
      let recordSchool = c.schoolName || "";
      if (!recordSchool) {
        const callerSchool = c.caller?.schoolName || "";
        const receiverSchool = c.receiver?.schoolName || "";
        if (callerSchool && receiverSchool && callerSchool === receiverSchool) {
          recordSchool = callerSchool;
        }
      }
      
      return recordSchool === schoolName;
    });

    res.json(filteredCalls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ACTIVE INCOMING CALL =================
exports.getActiveCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const activeCall = await Call.findOne({
      receiver: userId,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 45000) }
    }).populate("caller", "name avatar role schoolName");

    if (activeCall && activeCall.caller) {
      return res.json({
        activeCall: {
          callId: activeCall._id,
          callerId: activeCall.caller._id.toString(),
          callerName: activeCall.caller.name,
          callerAvatar: activeCall.caller.avatar || "",
          type: activeCall.type
        }
      });
    }
    res.json({ activeCall: null });
  } catch (error) {
    res.json({ activeCall: null });
  }
};

// ================= GET SUPPORT SHOWCASE (PUBLIC) =================
exports.getSupportShowcase = async (req, res) => {
  try {
    const School = require("../models/School");
    
    const SchoolCount = await School.countDocuments({});
    const StudentCount = await User.countDocuments({ role: "student" });
    const TeacherCount = await User.countDocuments({ role: { $in: ["teacher", "Teacher"] } });

    const publicSchools = await School.find({})
      .select("name photo coverImage motto address coverPosition description")
      .lean();

    res.json({
      schools: publicSchools || [],
      stats: {
        schools: SchoolCount || 0,
        students: StudentCount || 0,
        teachers: TeacherCount || 0,
        support: "24/7"
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message, 
      schools: [], 
      stats: { schools: 0, students: 0, teachers: 0, support: "24/7" } 
    });
  }
};

// ================= GET SUPPORT USERS LIST =================
exports.getSupportUsersList = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = "all", status = "all", search = "" } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {};

    // Role filtering
    if (role && role !== "all") {
      if (role.toLowerCase() === "student") {
        query.role = "student";
      } else if (role.toLowerCase() === "teacher") {
        query.role = { $in: ["teacher", "Teacher"] };
      } else if (role.toLowerCase() === "schooladmin" || role.toLowerCase() === "admin") {
        query.role = { $in: ["admin", "Admin"] };
      } else if (role.toLowerCase() === "support") {
        query.role = "support";
      }
    }

    // Status filtering
    if (status && status !== "all") {
      if (status.toLowerCase() === "active") {
        query.supportStatus = { $ne: "suspended" };
      } else if (status.toLowerCase() === "inactive" || status.toLowerCase() === "suspended") {
        query.supportStatus = "suspended";
      }
    }

    // Search query
    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { phoneNumber: regex },
        { schoolName: regex },
        { employeeId: regex }
      ];
    }

    // Safe projections: EXCLUDE sensitive fields like password, token, otp, firebaseUid
    const safeProjection = "-password -token -otp -firebaseUid";

    const [users, total] = await Promise.all([
      User.find(query)
        .select(safeProjection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    // Aggregate overall system user stats
    const [totalUsersCount, studentsCount, teachersCount, adminsCount] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: { $in: ["teacher", "Teacher"] } }),
      User.countDocuments({ role: { $in: ["admin", "Admin"] } })
    ]);

    // Format user docs and attach support ticket history summary
    const SupportTicket = require("../models/SupportTicket");

    const formattedUsers = await Promise.all(users.map(async (u) => {
      const userTickets = await SupportTicket.find({ requester: u._id })
        .select("ticketNumber category priority status createdAt title issueType description")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return {
        id: u._id.toString(),
        code: u.employeeId || `USR-${u._id.toString().substring(18).toUpperCase()}`,
        name: u.name || "Unnamed User",
        role: u.role === "student" ? "Student" : u.role === "teacher" || u.role === "Teacher" ? "Teacher" : u.role === "admin" || u.role === "Admin" ? "School Admin" : u.role === "support" ? "Support Agent" : u.role === "superadmin" ? "Super Admin" : u.role,
        rawRole: u.role,
        class: u.targetClass || u.previousClass || "N/A",
        school: u.schoolName || u.requestedSchool || "Unassigned School",
        schoolLocation: u.address || u.timezone || "India",
        email: u.email || "",
        phone: u.phoneNumber || "+91 00000 00000",
        dob: u.dob || "N/A",
        joinedOn: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A",
        status: u.supportStatus === "suspended" ? "Inactive" : "Active",
        avatarBg: u.role === "student" ? "bg-purple-600" : (u.role === "teacher" || u.role === "Teacher") ? "bg-blue-600" : "bg-rose-600",
        principal: u.fatherName || "N/A",
        totalStudents: 0,
        totalTeachers: 0,
        schoolContact: u.alternatePhone || u.phoneNumber || "N/A",
        tickets: userTickets.map(t => ({
          id: `#${t.ticketNumber}`,
          title: t.category || t.issueType || "Support Request",
          status: t.status,
          date: new Date(t.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
          color: t.status === "Open" || t.status === "New" ? "text-rose-400 bg-rose-500/10" : t.status === "In Progress" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
        }))
      };
    }));

    return res.json({
      users: formattedUsers,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalUsers: totalUsersCount,
        students: studentsCount,
        teachers: teachersCount,
        schoolAdmins: adminsCount
      }
    });
  } catch (error) {
    console.error("getSupportUsersList error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ================= GET SUPPORT SCHOOLS LIST =================
exports.getSupportSchoolsList = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "all", search = "" } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const School = require("../models/School");
    const SupportTicket = require("../models/SupportTicket");

    const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {};

    if (status && status !== "all") {
      if (status.toLowerCase() === "active") {
        query.status = { $ne: "Inactive" };
      } else if (status.toLowerCase() === "inactive") {
        query.status = "Inactive";
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: regex },
        { address: regex },
        { email: regex },
        { principalName: regex },
        { code: regex }
      ];
    }

    const [schools, total] = await Promise.all([
      School.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      School.countDocuments(query)
    ]);

    // Aggregate stats across all schools
    const [totalSchoolsCount, activeSchoolsCount, inactiveSchoolsCount, totalTeachersCount, totalStudentsCount] = await Promise.all([
      School.countDocuments({}),
      School.countDocuments({ status: { $ne: "Inactive" } }),
      School.countDocuments({ status: "Inactive" }),
      User.countDocuments({ role: { $in: ["teacher", "Teacher"] } }),
      User.countDocuments({ role: "student" })
    ]);

    // Format school records and compute live counts
    const formattedSchools = await Promise.all(schools.map(async (s) => {
      const schoolNameRegex = new RegExp("^" + escapeRegex(s.name) + "$", "i");
      
      const [teacherCount, studentCount, adminUser, schoolTickets] = await Promise.all([
        User.countDocuments({ schoolName: schoolNameRegex, role: { $in: ["teacher", "Teacher"] } }),
        User.countDocuments({ schoolName: schoolNameRegex, role: "student" }),
        User.findOne({ schoolName: schoolNameRegex, role: { $in: ["admin", "Admin"] } }).select("name email phoneNumber").lean(),
        SupportTicket.find({ $or: [{ schoolName: schoolNameRegex }] })
          .select("ticketNumber category priority status createdAt title issueType")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);

      return {
        id: s._id.toString(),
        code: s.code || `SCH-${s._id.toString().substring(18).toUpperCase()}`,
        name: s.name,
        location: s.address || s.location || "Bihar, India",
        established: s.established || "2020",
        contact: s.phoneNumber || (adminUser ? adminUser.phoneNumber : "+91 00000 00000"),
        email: s.email || (adminUser ? adminUser.email : "info@school.edu"),
        address: s.address || s.name + ", Bihar",
        website: s.website || `www.${s.normalizedName ? s.normalizedName.replace(/\s+/g, "") : "school"}.edu.in`,
        adminName: adminUser ? adminUser.name : (s.principalName || "School Admin"),
        adminEmail: adminUser ? adminUser.email : (s.email || "admin@school.edu"),
        teachers: teacherCount || s.totalTeachers || 0,
        students: studentCount || s.totalStudents || 0,
        classes: s.totalClasses || 8,
        status: s.status || "Active",
        ticketsCount: schoolTickets.length,
        ticketsHistory: schoolTickets.map(t => ({
          id: `#${t.ticketNumber}`,
          title: t.category || t.issueType || "Support Issue",
          status: t.status,
          date: new Date(t.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
          color: t.status === "Open" || t.status === "New" ? "text-rose-400 bg-rose-500/10" : t.status === "In Progress" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
        }))
      };
    }));

    return res.json({
      schools: formattedSchools,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalSchools: totalSchoolsCount,
        activeSchools: activeSchoolsCount,
        inactiveSchools: inactiveSchoolsCount,
        totalTeachers: totalTeachersCount,
        totalStudents: totalStudentsCount
      }
    });
  } catch (error) {
    console.error("getSupportSchoolsList error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

