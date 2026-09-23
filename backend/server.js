const fs = require("fs");
const path = require("path");

require("dotenv").config();

console.log(`[startup] PID: ${process.pid} | PPID: ${process.ppid} | server.js initialized`);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const classRoutes = require("./routes/classRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const adminAssignRoutes = require("./routes/adminAssignRoutes");

const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");

const adminProfileRoutes = require("./routes/adminProfileRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const supportRoutes = require("./routes/supportRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");
const helpArticleRoutes = require("./routes/helpArticleRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventVideoInteractionRoutes = require("./routes/eventVideoInteractionRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const aboutAppRoutes = require("./routes/aboutAppRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const featureRoutes = require("./routes/featureRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const paymentController = require("./controllers/paymentController");
const syllabusRoutes = require("./routes/syllabusRoutes");
const noteRoutes = require("./routes/noteRoutes");
const appNotificationRoutes = require("./routes/appNotificationRoutes");
const accountDeletionRoutes = require("./routes/accountDeletionRoutes");
const publicLegalRoutes = require("./routes/publicLegalRoutes");
const schoolChangeRoutes = require("./routes/schoolChangeRoutes");

const app = express();
const server = http.createServer(app);


// ================= CORS =================

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins dynamically, including mobile apps, curl, Vercel frontends, and custom domains
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: "*",
  exposedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit CORS fallback middleware to guarantee CORS headers on every response (including preflight and errors)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});


// ================= MIDDLEWARE =================

// Razorpay's signature is calculated from the exact bytes; this route must precede JSON parsing.
app.post("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }), paymentController.webhook);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploaded files (photos, documents, attachments)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
}
app.use("/uploads", express.static(uploadsDir));


const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.MONGO_URI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI environment variable is required in production!");
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/teachhub";
mongoose.set("bufferCommands", false);

mongoose.connection.on("connected", () => {
  console.log(`[mongo:${process.pid}] event: connected`);
  try {
    const client = mongoose.connection.client;
    if (client && typeof client.on === "function") {
      client.on("connectionCheckOutFailed", (event) => {
        console.warn(`[mongo:${process.pid}] pool connectionCheckOutFailed:`, event.reason);
      });
    }
  } catch (e) {}
});
mongoose.connection.on("disconnected", () => console.log(`[mongo:${process.pid}] event: disconnected`));
mongoose.connection.on("reconnected", () => console.log(`[mongo:${process.pid}] event: reconnected`));
mongoose.connection.on("error", (err) => console.error(`[mongo:${process.pid}] event error:`, err.message));

let isStarted = false;
async function startServer() {
  if (isStarted) {
    console.log(`[startup:${process.pid}] startServer already called, skipping duplicate invocation.`);
    return;
  }
  isStarted = true;

  try {
    console.log(`[startup:${process.pid}] MongoDB URI configured:`, !!process.env.MONGO_URI);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      waitQueueTimeoutMS: 5000
    });
    console.log(`[startup:${process.pid}] ✅ MongoDB Connected`);

    try {
      const School = require("./models/School");
      const indexes = await School.collection.indexes();
      console.log(`[startup:${process.pid}] ✅ School collection indexes verified:`, JSON.stringify(indexes.map(idx => ({ name: idx.name, key: idx.key }))));
    } catch (idxErr) {
      console.error(`[startup:${process.pid}] ⚠️ Index verification notice:`, idxErr.message);
    }

    try {
      const User = require("./models/User");
      await User.updateMany(
        { name: "Banny Thapar", role: "admin" },
        { schoolName: "G.D Academy" }
      );

      const AboutApp = require("./models/AboutApp");
      const appInfo = await AboutApp.findOne();
      if (!appInfo) {
        await AboutApp.create({});
      } else {
        const publicFrontendUrl = process.env.FRONTEND_URL || "https://yourschoolacademy.com";
        let updated = false;
        const legalMap = {
          privacyPolicyUrl: "/privacy-policy",
          cookiePolicyUrl: "/cookie-policy",
          termsOfServiceUrl: "/terms-of-service",
          disclaimerUrl: "/disclaimer",
          refundPolicyUrl: "/refund-policy",
          aboutUsUrl: "/about-us",
          accountDeletionUrl: "/delete-account"
        };
        for (const [field, routePath] of Object.entries(legalMap)) {
          if (!appInfo[field] || appInfo[field].includes("hostingersite.com") || appInfo[field].includes("onrender.com")) {
            appInfo[field] = `${publicFrontendUrl}${routePath}`;
            updated = true;
          }
        }
        if (updated) {
          await appInfo.save();
          console.log(`[startup:${process.pid}] ✅ AboutApp legal URLs migrated to ${publicFrontendUrl}`);
        }
      }
    } catch (migrationError) {
      console.error(`[startup:${process.pid}] Startup Initialization Notice:`, migrationError.message);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[startup:${process.pid}] 🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`[startup:${process.pid}] ❌ MongoDB Connection Error:`, err.message);
    if (err.name === "MongoServerError" && err.code === 18) {
      console.error("👉 BAD AUTHENTICATION: Check the username and password in your MONGO_URI environment variable on Hostinger.");
      console.error("👉 Tip: If your password contains special characters like @, #, $, %, etc., remember to URL-encode them (e.g. @ becomes %40).");
    }
    process.exit(1);
  }
}

startServer();


// ================= ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/admin/classes", classRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/subjects", subjectRoutes);
app.use("/api/admin/assign", adminAssignRoutes);

app.use("/api/teacher", teacherRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/student", studentRoutes);

app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);

app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/support/tickets", supportTicketRoutes);
app.use("/api/support/help-articles", helpArticleRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/events/videos", eventVideoInteractionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/about-app", aboutAppRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/app-notifications", appNotificationRoutes);
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api", featureRoutes);
app.use("/api", paymentRoutes);
app.use("/api/account-deletion-request", accountDeletionRoutes);
app.use("/api/school-change-requests", schoolChangeRoutes);
app.use("/", publicLegalRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "TeachHub Backend Server is Running", timestamp: new Date() });
});

app.get("/privacy-policy", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - TeachHub (Your School)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a73e8; }
    h2 { color: #202124; margin-top: 24px; }
    p, li { font-size: 15px; }
  </style>
</head>
<body>
  <h1>Privacy Policy for TeachHub / Your School</h1>
  <p>Effective Date: September 10, 2026</p>
  <p>This Privacy Policy describes how TeachHub ("we", "our", or "us") collects, uses, and protects your information when you use our mobile application and platform services.</p>

  <h2>1. Information We Collect</h2>
  <p>We collect information you provide directly to us when creating an account or using our features, including:</p>
  <ul>
    <li>Account credentials (name, email address, role, school name)</li>
    <li>Educational data (classes, subjects, attendance, grades, announcements)</li>
    <li>Communication data (chat messages and call logs within the app)</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <p>We use the collected information solely to provide, operate, maintain, and improve the TeachHub platform services, including user authentication, attendance management, and educational collaboration.</p>

  <h2>3. Data Protection and Storage</h2>
  <p>Your data is stored securely using industry-standard encryption protocols. We do not sell, trade, or rent your personal information to third parties.</p>

  <h2>4. Contact Us</h2>
  <p>If you have any questions regarding this Privacy Policy, please contact us at: <strong>princerajmne@gmail.com</strong></p>
</body>
</html>`);
});

app.get("/api/health", async (req, res) => {
  const { pingDatabase } = require("./utils/databaseDiagnostics");
  const dbHealth = await pingDatabase("health-check");
  const statusCode = dbHealth.connected ? 200 : 503;
  res.status(statusCode).json({
    status: dbHealth.connected ? "OK" : "DEGRADED",
    message: "TeachHub Backend Health Check",
    database: dbHealth,
    timestamp: new Date()
  });
});

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
}, express.static(uploadDir, {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");
  }
}));


// ================= SOCKET =================

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*"]
  }
});

const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Message = require("./models/Message");
const Call = require("./models/Call");
const TeacherNotification = require("./models/TeacherNotification");

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    // Fetch database-authoritative user profile
    const dbUser = await User.findById(decoded.id).select("name email role schoolName avatar");
    if (!dbUser) {
      return next(new Error("Authentication error: User not found"));
    }
    socket.user = {
      id: dbUser._id.toString(),
      role: dbUser.role,
      schoolName: dbUser.schoolName || "",
      name: dbUser.name || "School Member",
      avatar: dbUser.avatar || ""
    };
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

const activeSockets = new Map(); // userId -> Set<socket.id>

// Helper to validate user communication permissions for sockets
const canCommunicate = async (sender, receiverId) => {
  if (
    receiverId === "admin" ||
    receiverId === "admin_support_fallback" ||
    receiverId === "superadmin" ||
    receiverId === "superadmin_support_fallback"
  ) {
    return true;
  }
  const receiver = await User.findById(receiverId);
  if (!receiver) return false;
  return true;
};

// Global in-memory map for active call rooms
const activeCallRooms = new Map(); // roomId -> { roomId, callId, hostId, peerId, type }

// Send socket event to all active sockets of a specific user
const emitToUser = (userId, eventName, data) => {
  if (!userId) return;
  const uIdStr = userId.toString();
  io.to(uIdStr).emit(eventName, data);
  const socketIds = activeSockets.get(uIdStr);
  if (socketIds) {
    for (const socketId of socketIds) {
      io.to(socketId).emit(eventName, data);
    }
  }
};

io.on("connection", (socket) => {
  const rawUserId = socket.user?.id || socket.user?._id;
  if (!rawUserId) {
    return socket.disconnect();
  }
  const userId = rawUserId.toString();

  console.log("Client connected:", socket.id, "User:", userId);

  // Initialize Set for this user if not present
  if (!activeSockets.has(userId)) {
    activeSockets.set(userId, new Set());
  }
  activeSockets.get(userId).add(socket.id);
  socket.join(userId);

  // Mark user online & trigger delivery ticks
  const handleUserOnline = async () => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isOnline = true;
        await user.save();

        // Broadcast presence update to everyone
        io.emit("user:status-change", {
          userId,
          isOnline: true,
          lastSeen: null
        });
      }

      // Sync offline messages: mark any personal messages to this user as "delivered"
      const undeliveredMessages = await Message.find({
        receiver: userId,
        status: "sent",
        type: "personal"
      });

      if (undeliveredMessages.length > 0) {
        await Message.updateMany(
          { receiver: userId, status: "sent", type: "personal" },
          { $set: { status: "delivered" } }
        );

        // Notify senders about delivery status update
        undeliveredMessages.forEach((msg) => {
          emitToUser(msg.sender.toString(), "message:status-update", {
            messageId: msg._id,
            status: "delivered",
            receiverId: userId
          });
        });
      }
    } catch (err) {
      console.error("Error setting user online:", err);
    }
  };
  handleUserOnline();

  // Typing state forwards
  socket.on("typing:start", async ({ receiverId }) => {
    if (await canCommunicate(socket.user, receiverId)) {
      emitToUser(receiverId, "typing:start", { senderId: userId });
    }
  });

  socket.on("typing:stop", async ({ receiverId }) => {
    if (await canCommunicate(socket.user, receiverId)) {
      emitToUser(receiverId, "typing:stop", { senderId: userId });
    }
  });

  // Read ticks: Recipient sends read signal
  socket.on("message:read", async ({ senderId }) => {
    try {
      if (await canCommunicate(socket.user, senderId)) {
        await Message.updateMany(
          { sender: senderId, receiver: userId, status: { $ne: "read" }, type: "personal" },
          { $set: { status: "read" } }
        );

        emitToUser(senderId, "message:read-receipt", {
          senderId: userId,
          receiverId: senderId
        });
      }
    } catch (err) {
      console.error("Error updating read ticks:", err);
    }
  });

  // WebRTC Audio/Video Calling Router with room-based waiting & instant joining
  socket.on("call:initiate", async ({ receiverId, type }) => {
    try {
      const senderUser = await User.findById(userId);
      let receiverUser = null;

      if (
        receiverId === "admin" ||
        receiverId === "admin_support_fallback" ||
        receiverId === "superadmin" ||
        receiverId === "superadmin_support_fallback"
      ) {
        const schoolRegex = senderUser?.schoolName || senderUser?.requestedSchool
          ? new RegExp("^" + (senderUser.schoolName || senderUser.requestedSchool).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i")
          : null;

        if (schoolRegex) {
          receiverUser = await User.findOne({ role: "admin", $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }] });
        }
        if (!receiverUser) {
          receiverUser = await User.findOne({ role: "admin" }) || await User.findOne({ role: "superadmin" });
        }
        if (receiverUser) {
          receiverId = receiverUser._id.toString();
        }
      } else {
        receiverUser = await User.findById(receiverId);
      }

      if (!senderUser || !receiverUser) {
        return socket.emit("call:error", { message: "Caller or Receiver not found" });
      }

      if (await canCommunicate(senderUser, receiverId)) {
        const roomId = [userId.toString(), receiverId.toString()].sort().join("_");
        
        // Remove any old stale room before starting a fresh call
        if (activeCallRooms.has(roomId)) {
          activeCallRooms.delete(roomId);
        }

        // Create call record & set up waiting room
        const call = await Call.create({
          caller: userId,
          receiver: receiverId,
          type,
          status: "pending",
          schoolName: senderUser.schoolName || ""
        });

        const room = {
          roomId,
          callId: call._id,
          hostId: userId.toString(),
          peerId: receiverId.toString(),
          type,
          status: "waiting"
        };
        activeCallRooms.set(roomId, room);
        socket.currentCallId = call._id;

        // Notify caller that they are in room waiting
        socket.emit("call:waiting", {
          callId: call._id,
          roomId,
          partner: { _id: receiverUser._id, name: receiverUser.name, avatar: receiverUser.avatar }
        });

        // Send incoming call notification to receiver
        emitToUser(receiverId.toString(), "call:incoming", {
          callId: call._id,
          callerId: userId,
          callerName: senderUser.name || "School Member",
          callerAvatar: senderUser.avatar || "",
          type
        });

        if (receiverUser && (receiverUser.role === "teacher" || receiverUser.role === "Teacher")) {
          try {
            await TeacherNotification.create({
              teacher: receiverUser._id,
              title: `Incoming ${type.toUpperCase()} Call`,
              message: `${senderUser.name || "A user"} (${(senderUser.role || "User").toUpperCase()}) is calling you.`,
              category: "Call Alerts"
            });
          } catch (notifErr) {
            console.error("Error creating incoming call notification:", notifErr);
          }
        }
      } else {
        socket.emit("call:error", { message: "Calling unauthorized user" });
      }
    } catch (err) {
      console.error("Error initiating call:", err);
    }
  });

  socket.on("call:cancel", async ({ callId }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "cancelled";
        await call.save();
        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        activeCallRooms.delete(roomId);
        emitToUser(call.receiver.toString(), "call:cancelled", { callId });

        const receiverUserDoc = await User.findById(call.receiver);
        if (receiverUserDoc && (receiverUserDoc.role === "teacher" || receiverUserDoc.role === "Teacher")) {
          const callerDoc = await User.findById(call.caller);
          await TeacherNotification.create({
            teacher: call.receiver,
            title: `Missed ${call.type ? call.type.toUpperCase() : "VOICE"} Call`,
            message: `You missed a call from ${callerDoc ? callerDoc.name : "a user"}.`,
            category: "Call Alerts"
          });
        }
      }
    } catch (err) {
      console.error("Error cancelling call:", err);
    }
  });

  socket.on("call:accept", async ({ callId }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "completed";
        call.startedAt = new Date();
        await call.save();

        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        const room = activeCallRooms.get(roomId);
        if (room) {
          room.status = "connected";
        }

        const callerUser = await User.findById(call.caller);
        const receiverUser = await User.findById(call.receiver);

        emitToUser(call.caller.toString(), "call:accepted", {
          callId,
          isHost: true,
          partner: receiverUser ? { _id: receiverUser._id, name: receiverUser.name, avatar: receiverUser.avatar, role: receiverUser.role } : null
        });
        emitToUser(call.receiver.toString(), "call:accepted", {
          callId,
          isHost: false,
          partner: callerUser ? { _id: callerUser._id, name: callerUser.name, avatar: callerUser.avatar, role: callerUser.role } : null
        });
      }
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  });

  socket.on("call:reject", async ({ callId }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "rejected";
        await call.save();

        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        activeCallRooms.delete(roomId);

        emitToUser(call.caller.toString(), "call:rejected", { callId });
      }
    } catch (err) {
      console.error("Error rejecting call:", err);
    }
  });

  socket.on("call:busy", async ({ callId }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "busy";
        await call.save();

        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        activeCallRooms.delete(roomId);

        emitToUser(call.caller.toString(), "call:busy", { callId });
      }
    } catch (err) {
      console.error("Error setting call busy:", err);
    }
  });

  socket.on("call:timeout", async ({ callId }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "timeout";
        await call.save();

        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        activeCallRooms.delete(roomId);

        emitToUser(call.receiver.toString(), "call:cancelled", { callId });
      }
    } catch (err) {
      console.error("Error timeout call:", err);
    }
  });

  const resolveTargetUserId = async (senderUser, targetId) => {
    if (!targetId) return null;
    if (
      targetId === "admin" ||
      targetId === "admin_support_fallback" ||
      targetId === "superadmin" ||
      targetId === "superadmin_support_fallback"
    ) {
      const schoolRegex = senderUser?.schoolName || senderUser?.requestedSchool
        ? new RegExp("^" + (senderUser.schoolName || senderUser.requestedSchool).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i")
        : null;

      let receiverUser = null;
      if (schoolRegex) {
        receiverUser = await User.findOne({ role: "admin", $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }] });
      }
      if (!receiverUser) {
        receiverUser = await User.findOne({ role: "admin" }) || await User.findOne({ role: "superadmin" });
      }
      return receiverUser ? receiverUser._id.toString() : null;
    }
    return targetId.toString();
  };

  socket.on("call:offer", async ({ receiverId, offer }) => {
    try {
      const targetId = await resolveTargetUserId(socket.user, receiverId);
      if (targetId && (await canCommunicate(socket.user, targetId))) {
        emitToUser(targetId, "call:offer", { senderId: userId, offer });
      }
    } catch (err) {
      console.error("Error in call:offer", err);
    }
  });

  socket.on("call:answer", async ({ receiverId, answer }) => {
    try {
      const targetId = await resolveTargetUserId(socket.user, receiverId);
      if (targetId && (await canCommunicate(socket.user, targetId))) {
        emitToUser(targetId, "call:answer", { senderId: userId, answer });
      }
    } catch (err) {
      console.error("Error in call:answer", err);
    }
  });

  socket.on("call:ice-candidate", async ({ receiverId, candidate }) => {
    try {
      const targetId = await resolveTargetUserId(socket.user, receiverId);
      if (targetId && (await canCommunicate(socket.user, targetId))) {
        emitToUser(targetId, "call:ice-candidate", { senderId: userId, candidate });
      }
    } catch (err) {
      console.error("Error in call:ice-candidate", err);
    }
  });

  socket.on("call:end", async ({ callId, duration }) => {
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.endedAt = new Date();
        if (duration) {
          call.duration = duration;
        } else if (call.startedAt) {
          call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
        }
        await call.save();

        const roomId = [call.caller.toString(), call.receiver.toString()].sort().join("_");
        activeCallRooms.delete(roomId);

        const targetId = call.caller.toString() === userId ? call.receiver.toString() : call.caller.toString();
        emitToUser(targetId, "call:ended", { callId });
      }
    } catch (err) {
      console.error("Error ending call:", err);
    }
  });

  // WebRTC Signaling Router for Live proctoring (preserve existing)
  socket.on("proctor-signal", ({ targetId, signal }) => {
    io.to(targetId).emit("proctor-signal", { senderId: userId, signal });
  });

  // Session notifications to alert proctors/teachers instantly (preserve existing)
  socket.on("test-session-start", ({ proctorId }) => {
    io.to(proctorId).emit("student-test-started", { 
      studentId: userId, 
      studentName: socket.user?.name || "Student" 
    });
  });

  socket.on("test-session-stop", ({ proctorId }) => {
    io.to(proctorId).emit("student-test-stopped", { studentId: userId });
  });

  // Disconnect handler with multi-tab support & grace period
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id, "User:", userId);

    const userSockets = activeSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        activeSockets.delete(userId);

        // Disconnect grace period (5 seconds) to avoid flicker on page refreshes
        setTimeout(async () => {
          const currentSockets = activeSockets.get(userId);
          if (!currentSockets || currentSockets.size === 0) {
            try {
              const user = await User.findById(userId);
              if (user) {
                user.isOnline = false;
                user.lastSeen = new Date();
                await user.save();

                // Broadcast presence update
                io.emit("user:status-change", {
                  userId,
                  isOnline: false,
                  lastSeen: user.lastSeen
                });
              }
            } catch (err) {
              console.error("Error setting user offline:", err);
            }
          }
        }, 5000);
      }
    }
  });
});

app.set("io", io);
global.io = io;


// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("Global Express Error:", err);
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});


// ================= PROCESS ERROR HANDLERS =================
process.on("uncaughtException", (err) => {
  console.error(`[process:${process.pid}] Uncaught Exception:`, err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`[process:${process.pid}] Unhandled Rejection at:`, promise, "reason:", reason);
});

const gracefulShutdown = async (signal) => {
  console.log(`[shutdown:${process.pid}] Received ${signal}. Starting graceful shutdown...`);
  try {
    server.close(() => {
      console.log(`[shutdown:${process.pid}] HTTP server closed.`);
    });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log(`[shutdown:${process.pid}] Mongoose connection closed.`);
    }
  } catch (err) {
    console.error(`[shutdown:${process.pid}] Error during shutdown:`, err.message);
  } finally {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
