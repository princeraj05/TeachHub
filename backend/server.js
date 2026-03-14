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

app.use(express.json());


// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
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


// ================= SOCKET =================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://myschool-admin-panel.vercel.app"
    ]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

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