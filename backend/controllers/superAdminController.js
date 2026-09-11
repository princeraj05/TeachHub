const User = require("../models/User");

// GET /api/superadmin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, status, schoolName, search } = req.query;

    const query = {};

    if (role && role !== "All") {
      query.role = role.toLowerCase();
    }

    if (status && status !== "All") {
      if (status.toLowerCase() === "pending") {
        query.role = { $ne: "superadmin" };
        query.$or = [
          { role: "unassigned" },
          { requestStatus: { $in: ["pending", "scheduled", "exam_completed"] } }
        ];
      } else if (status.toLowerCase() === "approved") {
        query.role = { $ne: "unassigned" };
        query.requestStatus = { $nin: ["pending", "scheduled", "exam_completed"] };
      }
    }

    if (schoolName && schoolName !== "All") {
      query.schoolName = schoolName;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchCond = [
        { name: searchRegex },
        { email: searchRegex },
        { schoolName: searchRegex },
        { requestedSchool: searchRegex }
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchCond }
        ];
        delete query.$or;
      } else {
        query.$or = searchCond;
      }
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
    const { userId, role, schoolName, supportDepartment, supportShift } = req.body;

    const allowedRoles = ["admin", "teacher", "student", "support", "unassigned"];
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
    const targetSchoolName = (schoolName || user.requestedSchool || user.schoolName || "").trim();
    const assignedSchoolName = (role === "unassigned" || role === "support") ? "" : targetSchoolName;
    user.schoolName = assignedSchoolName;
    if (role === "admin") {
      user.requestStatus = "approved";
    }

    if (role === "support") {
      if (supportDepartment) user.supportDepartment = supportDepartment;
      if (supportShift) user.supportShift = supportShift;
      user.supportStatus = "active";
    }

    if (role !== "student") {
      user.classId = null; // Reset class if no longer a student
    }

    if (assignedSchoolName) {
      const School = require("../models/School");
      const normalized = assignedSchoolName.toLowerCase().replace(/\s+/g, " ");
      let school = await School.findOne({
        $or: [
          { adminId: user._id },
          { normalizedName: normalized },
          { name: new RegExp("^" + assignedSchoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") }
        ]
      });
      if (!school) {
        await School.create({
          adminId: user._id,
          name: assignedSchoolName,
          normalizedName: normalized,
          status: "Active"
        });
      } else {
        school.adminId = user._id;
        if (!school.name) school.name = assignedSchoolName;
        school.normalizedName = normalized;
        await school.save();
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
        supportDepartment: user.supportDepartment,
        supportShift: user.supportShift,
        supportStatus: user.supportStatus
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
      role: { $ne: "superadmin" },
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
      totalSchools = 0;
    }
    
    // 4. Financial overview
    const payments = await Payment.find({ status: "Successful" });
    const totalSystemVolume = payments.reduce((sum, p) => sum + (p.amount / 100), 0);
    
    // Super Admin actual platform revenue (from school subscriptions)
    const platformRevenue = payments
      .filter(p => p.purpose === "SCHOOL_SUBSCRIPTION" || p.receiverRole === "superadmin")
      .reduce((sum, p) => sum + (p.amount / 100), 0);

    const pendingPayments = await Payment.find({ status: { $in: ["Pending", "PendingVerification", "Processing"] } });
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
    const pendingSchools = new Set(pendingPayments.map(p => p.schoolName)).size;
    
    const successfulSchoolSubs = payments.filter(p => p.purpose === "SCHOOL_SUBSCRIPTION" || p.receiverRole === "superadmin");
    const paidSchools = new Set(successfulSchoolSubs.map(p => p.schoolName)).size;

    // School-wise platform revenue breakdown
    const schoolBreakdownMap = {};
    for (const p of payments) {
      const sName = (p.schoolName || "Other").trim();
      if (!schoolBreakdownMap[sName]) {
        schoolBreakdownMap[sName] = {
          schoolName: sName,
          superAdminRevenue: 0,
          totalStudentFees: 0,
          totalTeacherSalaries: 0,
          totalVolume: 0
        };
      }
      const amt = p.amount / 100;
      schoolBreakdownMap[sName].totalVolume += amt;
      if (p.purpose === "SCHOOL_SUBSCRIPTION" || p.receiverRole === "superadmin") {
        schoolBreakdownMap[sName].superAdminRevenue += amt;
      } else if (p.purpose === "STUDENT_SCHOOL_FEE") {
        schoolBreakdownMap[sName].totalStudentFees += amt;
      } else if (p.purpose === "TEACHER_SALARY") {
        schoolBreakdownMap[sName].totalTeacherSalaries += amt;
      }
    }
    const schoolRevenueBreakdown = Object.values(schoolBreakdownMap);

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
          platformRevenue,
          totalRevenue: platformRevenue,
          totalSystemVolume,
          pendingAmount,
          pendingSchools,
          paidSchools,
          schoolRevenueBreakdown
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
          detail: `${u.name} (${u.role === "unassigned" ? "Unassigned" : u.role.charAt(0).toUpperCase() + u.role.slice(1)})`,
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
    const SchoolSubscription = require("../models/SchoolSubscription");
    const FeePlan = require("../models/FeePlan");
    const Payment = require("../models/Payment");
    const TeacherCompensation = require("../models/TeacherCompensation");

    // Auto-sync missing School records from User collection
    const userSchools = await User.distinct("schoolName", { schoolName: { $ne: "", $exists: true } });
    for (const rawName of userSchools) {
      if (!rawName || !rawName.trim()) continue;
      const trimmed = rawName.trim();
      const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
      const exists = await School.findOne({ normalizedName: normalized });
      if (!exists) {
        const adminUser = await User.findOne({ schoolName: trimmed, role: "admin" });
        await School.create({
          name: trimmed,
          normalizedName: normalized,
          adminId: adminUser ? adminUser._id : null,
          email: adminUser ? adminUser.email : null,
          status: "Active"
        });
      }
    }

    let schoolDocs = await School.find({}).lean();
    const schoolsList = [];

    for (const school of schoolDocs) {
      const name = school.name;
      const adminCount = await User.countDocuments({ schoolName: name, role: "admin" });
      const teacherCount = await User.countDocuments({ schoolName: name, role: "teacher" });
      const studentCount = await User.countDocuments({ schoolName: name, role: "student" });

      const subscription = await SchoolSubscription.findOne({ schoolName: name });
      const feePlan = await FeePlan.findOne({ schoolName: name, active: true });
      const studentPayments = await Payment.find({ schoolName: name, purpose: "STUDENT_SCHOOL_FEE", status: "Successful" }).select("amount");
      const subPayments = await Payment.find({ schoolName: name, purpose: "SCHOOL_SUBSCRIPTION", status: "Successful" }).select("amount");
      const teacherComps = await TeacherCompensation.find({ schoolName: name, active: true }).select("salary teacher");

      let configuredPlan = null;
      if (subscription && subscription.monthlyFee) {
        const feeStr = (subscription.monthlyFee / 100).toFixed(2);
        configuredPlan = `Paid Subscription (₹${feeStr}/mo)`;
      }

      let plan = school.plan;
      if (!plan || plan === "yet not set" || plan === "Configured" || plan === "Pro" || plan === "Enterprise" || plan.includes("Pro") || plan.includes("Enterprise")) {
        plan = configuredPlan || "Free Plan (Trial)";
      }

      let price = "Free / Trial";
      let validTill = "Unlimited";
      if (subscription && subscription.monthlyFee) {
        price = `₹${(subscription.monthlyFee / 100).toFixed(2)} / Month`;
        const nextDate = subscription.nextBillingDate || subscription.billingStartDate;
        if (nextDate) {
          validTill = new Date(nextDate).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        }
      }

      const status = school.status || "Active";
      const adminUser = await User.findOne({ schoolName: name, role: "admin" });
      const emailToShow = adminUser ? adminUser.email : (school.email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`);

      const totalStudentReceived = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
      const totalSubscriptionPaid = subPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
      const studentMonthlyFee = feePlan?.monthlyFee ? feePlan.monthlyFee / 100 : 0;
      const teacherSalaryCount = teacherComps.length;
      const teacherSalariesTotal = teacherComps.reduce((sum, c) => sum + (c.salary || 0), 0) / 100;

      schoolsList.push({
        _id: school._id,
        name,
        email: emailToShow,
        location: school.address || "Patna, Bihar",
        plan,
        configuredPlan: configuredPlan || "Paid Subscription",
        hasSubscription: Boolean(subscription && subscription.monthlyFee),
        status,
        price,
        validTill,
        financials: {
          studentMonthlyFee,
          totalStudentReceived,
          totalSubscriptionPaid,
          teacherSalaryCount,
          teacherSalariesTotal
        },
        stats: {
          admins: adminCount,
          teachers: teacherCount,
          students: studentCount
        }
      });
    }

    res.json(schoolsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/superadmin/schools
exports.createSchool = async (req, res) => {
  try {
    const { name, email, address, plan } = req.body;
    if (!name) return res.status(400).json({ message: "School name is required" });
    
    const School = require("../models/School");
    const normalizedName = name.toLowerCase().replace(/\s+/g, " ");
    const exists = await School.findOne({ normalizedName });
    if (exists) return res.status(400).json({ message: "School already exists" });

    const school = await School.create({
      name,
      normalizedName,
      email,
      address,
      plan: plan || "yet not set",
      status: "Active"
    });

    res.status(201).json({ message: "School created successfully", school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/superadmin/schools/:id
exports.updateSchool = async (req, res) => {
  try {
    const { name, email, address, plan, status } = req.body;
    const { id } = req.params;
    const School = require("../models/School");
    const school = await School.findById(id);
    if (!school) return res.status(404).json({ message: "School not found" });

    if (name && name !== school.name) {
      const normalizedName = name.toLowerCase().replace(/\s+/g, " ");
      const exists = await School.findOne({ normalizedName, _id: { $ne: id } });
      if (exists) return res.status(400).json({ message: "School with this name already exists" });
      
      const User = require("../models/User");
      await User.updateMany({ schoolName: school.name }, { schoolName: name });
      
      const Class = require("../models/Class");
      await Class.updateMany({ schoolName: school.name }, { schoolName: name });

      school.name = name;
      school.normalizedName = normalizedName;
    }

    if (email !== undefined) {
      school.email = email;
      const User = require("../models/User");
      await User.updateOne({ schoolName: school.name, role: "admin" }, { email });
    }
    if (address !== undefined) school.address = address;
    if (plan !== undefined) school.plan = plan;
    if (status !== undefined) school.status = status;

    await school.save();
    res.json({ message: "School updated successfully", school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/superadmin/schools/:id
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const School = require("../models/School");
    const school = await School.findById(id);
    if (!school) return res.status(404).json({ message: "School not found" });

    const User = require("../models/User");
    const Class = require("../models/Class");
    
    // Cleanup users and classes belonging to this school
    await User.deleteMany({ schoolName: school.name, role: { $ne: "superadmin" } });
    await Class.deleteMany({ schoolName: school.name });

    await School.findByIdAndDelete(id);
    res.json({ message: "School and all associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUPPORT TEAM MANAGEMENT =================

// GET /api/superadmin/support-team
exports.getSupportTeam = async (req, res) => {
  try {
    const agents = await User.find({
      $or: [{ role: "support" }, { requestedRole: "support" }]
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const mapped = agents.map((u, idx) => ({
      _id: u._id,
      name: u.name || "Support Agent",
      email: u.email || "",
      phone: u.phoneNumber || u.alternatePhone || "+91 98765 43210",
      role: "support",
      department: u.supportDepartment || (idx % 2 === 0 ? "Technical" : "Billing & SaaS"),
      shift: u.supportShift || "Morning (09:00 - 17:00)",
      status: u.supportStatus || (u.requestStatus === "rejected" ? "suspended" : "active"),
      dutyState: u.isOnline ? "On Duty" : "Offline",
      ticketsResolved: u.ticketsResolved || 0,
      activeTickets: u.activeTickets || 0,
      joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "2026-01-01",
      avatar: u.avatar || ""
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/superadmin/support-team/create
exports.createSupportAgent = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { name, email, password, phone, department, shift } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "support123", 10);

    const newAgent = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phone || "",
      role: "support",
      requestedRole: "support",
      requestStatus: "approved",
      supportDepartment: department || "Technical",
      supportShift: shift || "Morning (09:00 - 17:00)",
      supportStatus: "active",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7C3AED&color=fff`
    });

    res.status(201).json({
      message: "Support Agent account created successfully",
      agent: {
        _id: newAgent._id,
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phoneNumber,
        role: "support",
        department: newAgent.supportDepartment,
        shift: newAgent.supportShift,
        status: newAgent.supportStatus,
        dutyState: "Offline",
        ticketsResolved: 0,
        activeTickets: 0,
        joinedDate: new Date(newAgent.createdAt).toISOString().split("T")[0],
        avatar: newAgent.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/superadmin/support-team/:id/status
exports.toggleSupportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, department, shift } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Support member not found" });
    }

    if (status) user.supportStatus = status;
    if (department) user.supportDepartment = department;
    if (shift) user.supportShift = shift;

    await user.save();

    res.json({
      message: "Support agent updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        status: user.supportStatus,
        department: user.supportDepartment,
        shift: user.supportShift
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/superadmin/support-team/:id
exports.revokeSupportRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "unassigned";
    user.requestedRole = "";
    user.supportStatus = "off_duty";
    await user.save();

    res.json({ message: "Support role revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

