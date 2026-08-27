require("dotenv").config();

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

const adminProfileRoutes = require("./routes/adminProfileRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const supportRoutes = require("./routes/supportRoutes");
const eventRoutes = require("./routes/eventRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const aboutAppRoutes = require("./routes/aboutAppRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const featureRoutes = require("./routes/featureRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const paymentController = require("./controllers/paymentController");

const app = express();
const server = http.createServer(app);


// ================= CORS =================

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);


// ================= MIDDLEWARE =================

// Razorpay's signature is calculated from the exact bytes; this route must precede JSON parsing.
app.post("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }), paymentController.webhook);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    try {
      const User = require("./models/User");
      const result = await User.updateMany(
        { name: "Banny Thapar", role: "admin" },
        { schoolName: "G.D Academy" }
      );
      await User.updateMany(
        { requestedSchool: { $in: ["G.D Accedmy", "G.D Accedmy "] } },
        { requestedSchool: "G.D Academy" }
      );
      await User.updateMany(
        { schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } },
        { schoolName: "G.D Academy" }
      );
      console.log("Database Migration: Updated Banny Thapar's school to G.D Academy and cleaned requestedSchool records", result);

      // ================= DUMMY / SEEDER DATA CLEANUP =================
      const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "princerajmne@gmail.com").toLowerCase();
      const dummyEmails = [
        "teacher@gmail.com",
        "student@gmail.com",
        "admin@gmail.com",
        "superadmin@gmail.com",
        "pending@gmail.com",
        "test@test.com",
        "test@gmail.com"
      ];
      
      const School = require("./models/School");
      const Class = require("./models/Class");
      const Subject = require("./models/Subject");
      const Event = require("./models/Event");
      const Announcement = require("./models/Announcement");
      const TeacherLeave = require("./models/TeacherLeave");
      const TeacherNotification = require("./models/TeacherNotification");
      const Attendance = require("./models/Attendance");
      const Exam = require("./models/Exam");
      const ExamSubmission = require("./models/ExamSubmission");
      const Appointment = require("./models/Appointment");

      const usersToDelete = await User.find({
        $or: [
          { email: { $in: dummyEmails } },
          { email: { $regex: /^(test|dummy|mock)/i } },
          { name: { $regex: /^(test|dummy|mock)/i } }
        ],
        email: { $ne: superAdminEmail }
      });
      const userIdsToDelete = usersToDelete.map(u => u._id);

      if (userIdsToDelete.length > 0) {
        console.log(`Startup Cleanup: Deleting ${userIdsToDelete.length} dummy users...`);
        await User.deleteMany({ _id: { $in: userIdsToDelete } });
        await Class.updateMany({ students: { $in: userIdsToDelete } }, { $pull: { students: { $in: userIdsToDelete } } });
        await Class.updateMany({ teacher: { $in: userIdsToDelete } }, { $unset: { teacher: "" } });
        await Subject.updateMany({ teacher: { $in: userIdsToDelete } }, { $unset: { teacher: "" } });
        await Attendance.deleteMany({ student: { $in: userIdsToDelete } });
        await ExamSubmission.deleteMany({ student: { $in: userIdsToDelete } });
        await Appointment.deleteMany({ $or: [{ teacher: { $in: userIdsToDelete } }, { student: { $in: userIdsToDelete } }, { requestedBy: { $in: userIdsToDelete } }] });
        await TeacherLeave.deleteMany({ teacherId: { $in: userIdsToDelete } });
        await TeacherNotification.deleteMany({ teacher: { $in: userIdsToDelete } });
      }

      // Delete seeded dummy records
      await Announcement.deleteMany({
        title: { $in: ["Independence Day Celebration", "Parent-Teacher Meeting", "Exam Schedule Released"] }
      });
      await Event.deleteMany({
        title: { $in: ["Science Exhibition", "Parent Teacher Meeting", "Annual Sports Day"] }
      });
      await TeacherLeave.deleteMany({
        reason: { $in: ["Family function", "Medical checkup", "Personal work", "Sick leave", "Vacation"] }
      });
      await School.deleteMany({ name: "Prince school" });

      console.log("Startup Cleanup: All database dummy/seeder data successfully removed.");

      // Non-destructive startup check: ensure all unique schoolName values in User database have corresponding School records
      const School = require("./models/School");
      const userSchools = await User.distinct("schoolName", { schoolName: { $ne: "" } });
      for (const rawName of userSchools) {
        const trimmed = rawName.trim();
        const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
        if (!normalized) continue;
        const exists = await School.findOne({ normalizedName: normalized });
        if (!exists) {
          console.log(`Startup Sync: Creating missing School record for '${trimmed}'`);
          await School.create({
            name: trimmed,
            normalizedName: normalized,
            photo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
            schoolPhotos: [
              "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=600&q=80"
            ],
            principalName: "Banny Thapar",
            principalPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80",
            description: `<h3><strong>${trimmed}</strong></h3><p>${trimmed} is a reputed educational institution committed to providing quality education in a safe, supportive, and engaging learning environment.</p>`
          });
        }
      }

      // Non-destructive check to fill empty fields/photos for existing schools in the database
      const schools = await School.find({});
      for (const s of schools) {
        let modified = false;
        if (!s.photo) {
          s.photo = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80";
          modified = true;
        }
        if (!s.schoolPhotos || s.schoolPhotos.length === 0) {
          s.schoolPhotos = [
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=600&q=80"
          ];
          modified = true;
        }
        if (!s.principalName) {
          s.principalName = "Banny Thapar";
          modified = true;
        }
        if (!s.principalPhoto) {
          s.principalPhoto = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80";
          modified = true;
        }
        if (!s.description) {
          s.description = `<h3><strong>${s.name}</strong></h3><p>${s.name} is a reputed educational institution committed to providing quality education in a safe, supportive, and engaging learning environment.</p><p>Our school focuses on the overall development of students by combining strong academic foundations with discipline, creativity, sports, and extracurricular activities.</p><p>With dedicated and experienced teachers, modern learning facilities, and a student-centered approach, we encourage students to develop confidence, critical thinking, communication skills, and strong moral values.</p>`;
          modified = true;
        }
        if (modified) {
          await s.save();
          console.log(`Database Migration: Updated missing fields/photos for school '${s.name}'`);
        }
      }

      // Seed AboutApp global config if not present
      const AboutApp = require("./models/AboutApp");
      const appInfo = await AboutApp.findOne();
      if (!appInfo) {
        console.log("Startup Sync: Seeding initial global AboutApp configuration...");
        await AboutApp.create({});
      }
    } catch (migrationError) {
      console.error("Migration/Startup Sync Error:", migrationError);
    }
  })
  .catch((err) => console.log(err));


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

app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/about-app", aboutAppRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", featureRoutes);
app.use("/api", paymentRoutes);

const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));


// ================= SOCKET =================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://myschool-admin-panel.vercel.app"
    ]
  }
});

const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Message = require("./models/Message");
const Call = require("./models/Call");

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Helper to validate school isolation for sockets
const canCommunicate = async (sender, receiverId) => {
  if (sender.role === "superadmin") return true;

  const receiver = await User.findById(receiverId);
  if (!receiver) return false;

  // Super Admin <-> Admin
  if (receiver.role === "superadmin" && sender.role === "admin") return true;

  // Admin <-> Teacher/Student of same school
  if (sender.role === "admin" && (receiver.role === "teacher" || receiver.role === "student") && sender.schoolName === receiver.schoolName) return true;
  if ((sender.role === "teacher" || sender.role === "student") && receiver.role === "admin" && sender.schoolName === receiver.schoolName) return true;

  // Teacher <-> Student of same school
  if (sender.role === "teacher" && receiver.role === "student" && sender.schoolName === receiver.schoolName) return true;
  if (sender.role === "student" && receiver.role === "teacher" && sender.schoolName === receiver.schoolName) return true;

  return false;
};

// Send socket event to all active sockets of a specific user
const emitToUser = (userId, eventName, data) => {
  const socketIds = activeSockets.get(userId.toString());
  if (socketIds) {
    for (const socketId of socketIds) {
      io.to(socketId).emit(eventName, data);
    }
  }
};

io.on("connection", (socket) => {
  const userId = socket.user?.id;
  if (!userId) {
    return socket.disconnect();
  }

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

        // Broadcast presence update to everyone (clients will filter based on role/school permissions)
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
      // Current user is receiver reading sender's messages
      if (await canCommunicate(socket.user, senderId)) {
        await Message.updateMany(
          { sender: senderId, receiver: userId, status: { $ne: "read" }, type: "personal" },
          { $set: { status: "read" } }
        );

        // Emit read receipt back to the sender
        emitToUser(senderId, "message:read-receipt", {
          senderId: userId, // current user who read the message
          receiverId: senderId // the sender who receives green ticks
        });
      }
    } catch (err) {
      console.error("Error updating read ticks:", err);
    }
  });

  // WebRTC Audio/Video Calling Router with verification
  socket.on("call:initiate", async ({ receiverId, type }) => {
    try {
      const senderUser = await User.findById(userId);
      const receiverUser = await User.findById(receiverId);

      if (!senderUser || !receiverUser) {
        return socket.emit("call:error", { message: "Caller or Receiver not found" });
      }

      if (await canCommunicate(senderUser, receiverId)) {
        const receiverSockets = activeSockets.get(receiverId.toString());
        if (!receiverSockets || receiverSockets.size === 0) {
          // Receiver offline: create missed Call record
          const call = await Call.create({
            caller: userId,
            receiver: receiverId,
            type,
            status: "missed",
            schoolName: senderUser.schoolName || ""
          });
          socket.emit("call:rejected", { reason: "unavailable", callId: call._id });
          return;
        }

        // Create Call record with status "pending"
        const call = await Call.create({
          caller: userId,
          receiver: receiverId,
          type,
          status: "pending",
          schoolName: senderUser.schoolName || ""
        });

        socket.currentCallId = call._id;

        emitToUser(receiverId, "call:incoming", {
          callId: call._id,
          callerId: userId,
          callerName: senderUser.name || "School Member",
          callerAvatar: senderUser.avatar || "",
          type
        });
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
        emitToUser(call.receiver.toString(), "call:cancelled", { callId });
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

        emitToUser(call.caller.toString(), "call:accepted", { callId });
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

        emitToUser(call.receiver.toString(), "call:cancelled", { callId });
      }
    } catch (err) {
      console.error("Error timeout call:", err);
    }
  });

  socket.on("call:offer", async ({ receiverId, offer }) => {
    if (await canCommunicate(socket.user, receiverId)) {
      emitToUser(receiverId, "call:offer", { senderId: userId, offer });
    }
  });

  socket.on("call:answer", async ({ receiverId, answer }) => {
    if (await canCommunicate(socket.user, receiverId)) {
      emitToUser(receiverId, "call:answer", { senderId: userId, answer });
    }
  });

  socket.on("call:ice-candidate", async ({ receiverId, candidate }) => {
    if (await canCommunicate(socket.user, receiverId)) {
      emitToUser(receiverId, "call:ice-candidate", { senderId: userId, candidate });
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


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
