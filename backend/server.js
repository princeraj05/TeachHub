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

const app = express();
const server = http.createServer(app);


// ================= CORS =================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://myschool-admin-panel.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);


// ================= MIDDLEWARE =================

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
        { schoolName: "G.D Accedmy" }
      );
      console.log("Database Migration: Updated Banny Thapar's school to G.D Accedmy", result);
    } catch (migrationError) {
      console.error("Migration Error:", migrationError);
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

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, "User:", socket.user?.id);

  if (socket.user?.id) {
    socket.join(socket.user.id);
  }

  // WebRTC Signaling Router for Live proctoring
  socket.on("proctor-signal", ({ targetId, signal }) => {
    io.to(targetId).emit("proctor-signal", { senderId: socket.user.id, signal });
  });

  // Session notifications to alert proctors/teachers instantly
  socket.on("test-session-start", ({ proctorId }) => {
    io.to(proctorId).emit("student-test-started", { 
      studentId: socket.user.id, 
      studentName: socket.user.name || "Student" 
    });
  });

  socket.on("test-session-stop", ({ proctorId }) => {
    io.to(proctorId).emit("student-test-stopped", { studentId: socket.user.id });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});