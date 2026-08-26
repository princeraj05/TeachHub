const User = require("../models/User");

// GET /api/superadmin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, schoolName, search } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }
    if (schoolName) {
      query.schoolName = schoolName;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .populate("classId", "name section")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/superadmin/assign-role
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, schoolName } = req.body;

    const allowedRoles = ["admin", "teacher", "student", "unassigned"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot change Super Admin role" });
    }

    user.role = role;
    const assignedSchoolName = (role === "unassigned") ? "" : (schoolName || "").trim();
    user.schoolName = assignedSchoolName;

    if (role !== "student") {
      user.classId = null; // Reset class if no longer a student
    }

    if (assignedSchoolName) {
      const School = require("../models/School");
      const normalized = assignedSchoolName.toLowerCase().replace(/\s+/g, " ");
      const exists = await School.findOne({ normalizedName: normalized });
      if (!exists) {
        await School.create({
          name: assignedSchoolName,
          normalizedName: normalized
        });
      }
    }

    await user.save();

    res.json({
      message: "User role/school assigned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/superadmin/schools
exports.getSchools = async (req, res) => {
  try {
    const School = require("../models/School");
    const schools = await School.distinct("name");
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/superadmin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Class = require("../models/Class");
    const Subject = require("../models/Subject");
    const Attendance = require("../models/Attendance");

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Cannot delete a Super Admin" });
    }

    const userId = user._id;

    // Clean up references
    await Class.updateMany({ students: userId }, { $pull: { students: userId } });
    await Class.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Subject.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Attendance.deleteMany({ student: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/superadmin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const Payment = require("../models/Payment");
    const Event = require("../models/Event");

    // 1. User stats
    const totalUsers = await User.countDocuments({ role: { $ne: "superadmin" } });
    const pendingApprovals = await User.countDocuments({ 
      $or: [
        { role: "unassigned", requestStatus: { $ne: "rejected" } },
        { requestStatus: { $in: ["pending", "scheduled", "exam_completed"] } }
      ]
    });
    
    // 2. Roles breakdown
    const admins = await User.countDocuments({ role: "admin" });
    const teachers = await User.countDocuments({ role: "teacher" });
    const students = await User.countDocuments({ role: "student" });
    // 3. Schools count
    const School = require("../models/School");
    let totalSchools = await School.countDocuments();
    if (totalSchools === 0) {
      const dummySchools = [
        {
          name: "G.D Academy",
          normalizedName: "g.d academy",
          email: "gdacademy@gmail.com",
          address: "Patna, Bihar"
        },
        {
          name: "Prince school",
          normalizedName: "prince school",
          email: "princeschool@gmail.com",
          address: "Patna, Bihar"
        }
      ];

      for (const ds of dummySchools) {
        let exists = await School.findOne({ name: ds.name });
        if (!exists) {
          await School.create(ds);
        }
      }
      totalSchools = await School.countDocuments();
    }
    
    // 4. Financial overview
    const payments = await Payment.find({ status: "Successful" });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount / 100), 0);
    
    const pendingPayments = await Payment.find({ status: { $in: ["Pending", "PendingVerification", "Processing"] } });
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
    const pendingSchools = new Set(pendingPayments.map(p => p.schoolName)).size;
    
    const successfulSchoolSubs = await Payment.find({ 
      purpose: "SCHOOL_SUBSCRIPTION", 
      status: "Successful" 
    });
    const paidSchools = new Set(successfulSchoolSubs.map(p => p.schoolName)).size;

    // 5. Recent Activity
    const recentUsers = await User.find({ role: { $ne: "superadmin" } })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
      
    const recentEvents = await Event.find({})
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("payer", "name")
      .lean();

    // 6. Support metrics
    const openConversations = 2;
    const openTickets = 0;
    const pendingCalls = 3;
    const avgResponseTime = "1h 24m";

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingApprovals,
        totalSchools,
        admins,
        teachers,
        students,
        financials: {
          totalRevenue,
          pendingAmount,
          pendingSchools,
          paidSchools
        },
        support: {
          openConversations,
          openTickets,
          pendingCalls,
          avgResponseTime
        }
      },
      recentActivity: [
        ...recentUsers.map(u => ({
          _id: u._id,
          type: u.role === "unassigned" ? "New user registered" : "User approved",
          detail: `${u.name} (${u.role === "unassigned" ? "Student" : u.role.charAt(0).toUpperCase() + u.role.slice(1)})`,
          time: new Date(u.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateText: new Date(u.createdAt).toDateString() === new Date().toDateString() ? "Today" : "Yesterday",
          rawDate: u.createdAt
        })),
        ...recentEvents.map(e => ({
          _id: e._id,
          type: "New event created",
          detail: `${e.title} - ${e.schoolName || "Global"}`,
          time: "All Day",
          dateText: new Date(e.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
          rawDate: e.createdAt
        })),
        ...recentPayments.map(p => ({
          _id: p._id,
          type: "Payment received",
          detail: `${p.schoolName} - ${p.purpose.replaceAll("_", " ")}`,
          time: new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dateText: new Date(p.createdAt).toDateString() === new Date().toDateString() ? "Today" : "Yesterday",
          rawDate: p.createdAt
        }))
      ].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/superadmin/schools-detail
exports.getSchoolsDetail = async (req, res) => {
  try {
    const School = require("../models/School");
    const User = require("../models/User");

    let schoolDocs = await School.find({}).lean();
    if (schoolDocs.length === 0) {
      const dummySchools = [
        {
          name: "G.D Academy",
          normalizedName: "g.d academy",
          email: "gdacademy@gmail.com",
          address: "Patna, Bihar"
        },
        {
          name: "Prince school",
          normalizedName: "prince school",
          email: "princeschool@gmail.com",
          address: "Patna, Bihar"
        }
      ];

      for (const ds of dummySchools) {
        let exists = await School.findOne({ name: ds.name });
        if (!exists) {
          await School.create(ds);
        }
      }
      schoolDocs = await School.find({}).lean();
    }

    const schoolsList = [];

    for (const school of schoolDocs) {
      const name = school.name;
      const adminCount = await User.countDocuments({ schoolName: name, role: "admin" });
      const teacherCount = await User.countDocuments({ schoolName: name, role: "teacher" });
      const studentCount = await User.countDocuments({ schoolName: name, role: "student" });

      const plan = "Pro Plan";
      const status = "Active";
      const price = "₹2,999 / Year";
      
      const createdAtDate = school.createdAt || new Date();
      const validTillDate = new Date(createdAtDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const validTill = validTillDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      schoolsList.push({
        _id: school._id,
        name,
        email: school.email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        location: school.address || "Patna, Bihar",
        plan,
        status,
        price,
        validTill,
        stats: {
          admins: adminCount || 1,
          teachers: teacherCount || 1,
          students: studentCount || 1
        }
      });
    }

    res.json(schoolsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
