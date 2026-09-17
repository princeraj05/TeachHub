const mongoose = require("mongoose");
const SchoolChangeRequest = require("../models/SchoolChangeRequest");
const User = require("../models/User");
const School = require("../models/School");
const { createAppNotification, notifySchoolAdmins } = require("../utils/notificationHelper");

// Helper to notify all Super Admins
const notifySuperAdmins = async ({ title, message, category = "General", link = "/superadmin/school-change-requests", metadata = {} }) => {
  try {
    const superAdmins = await User.find({ role: "superadmin" }).select("_id").lean();
    for (const sa of superAdmins) {
      await createAppNotification({
        recipient: sa._id,
        schoolName: "System",
        role: "superadmin",
        title,
        message,
        category,
        link,
        metadata
      });
    }
  } catch (err) {
    console.error("Error notifying super admins:", err.message);
  }
};

// ================= CREATE SCHOOL CHANGE REQUEST =================
// POST /api/school-change-requests
exports.createRequest = async (req, res) => {
  try {
    const { requestedSchoolName, reason } = req.body;

    if (!requestedSchoolName || !requestedSchoolName.trim()) {
      return res.status(400).json({ message: "Requested school name is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user role is student or teacher
    if (!["student", "teacher"].includes(user.role)) {
      return res.status(400).json({ message: "Only active students and teachers can submit a school change request" });
    }

    // Verify user currently has an active school
    if (!user.schoolName || !user.schoolName.trim()) {
      return res.status(400).json({ message: "You are not currently associated with an active school" });
    }

    const currentSchoolClean = user.schoolName.trim();
    const requestedSchoolClean = requestedSchoolName.trim();

    // Verify target school is different from current school
    if (currentSchoolClean.toLowerCase() === requestedSchoolClean.toLowerCase()) {
      return res.status(400).json({ message: "Requested school cannot be the same as your current school" });
    }

    // Check for existing pending school change request
    const existingPending = await SchoolChangeRequest.findOne({
      userId: user._id,
      status: "pending"
    });

    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending school change request" });
    }

    // Create the SchoolChangeRequest
    const changeRequest = await SchoolChangeRequest.create({
      userId: user._id,
      userRole: user.role,
      userName: user.name,
      userEmail: user.email,
      currentSchoolName: currentSchoolClean,
      requestedSchoolName: requestedSchoolClean,
      reason: reason ? reason.trim() : "",
      status: "pending"
    });

    // Notify Super Admin
    await notifySuperAdmins({
      title: "New School Change Request",
      message: `New School Change Request from ${user.name} (${user.role.toUpperCase()}). Current: ${currentSchoolClean}, Requested: ${requestedSchoolClean}.`,
      category: "General",
      link: "/superadmin/school-change-requests",
      metadata: { requestId: changeRequest._id, userId: user._id }
    });

    res.status(201).json({
      message: "School change request submitted successfully",
      request: changeRequest
    });
  } catch (error) {
    console.error("Error creating school change request:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MY ACTIVE SCHOOL CHANGE REQUEST =================
// GET /api/school-change-requests/my-request
exports.getMyActiveRequest = async (req, res) => {
  try {
    const activeRequest = await SchoolChangeRequest.findOne({
      userId: req.user.id,
      status: "pending"
    }).sort({ createdAt: -1 });

    res.json(activeRequest || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUPER ADMIN: GET ALL SCHOOL CHANGE REQUESTS =================
// GET /api/superadmin/school-change-requests
exports.getSuperAdminRequests = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }

    const { role, status, search } = req.query;

    const query = {};

    if (role && role !== "All") {
      query.userRole = role.toLowerCase();
    }

    if (status && status !== "All") {
      query.status = status.toLowerCase();
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { currentSchoolName: searchRegex },
        { requestedSchoolName: searchRegex },
        { reason: searchRegex }
      ];
    }

    const requests = await SchoolChangeRequest.find(query)
      .populate("userId", "name email avatar role schoolName phoneNumber")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUPER ADMIN: PROCESS ACTION ON REQUEST =================
// POST /api/superadmin/school-change-requests/:id/action
exports.processSuperAdminAction = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }

    const { id } = req.params;
    const { action, note } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid school change request ID" });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be approve or reject." });
    }

    // Atomic update: only match and update if status is still pending
    const targetStatus = action === "approve" ? "completed" : "rejected";
    const updateFields = {
      status: targetStatus,
      superAdminId: req.user.id,
      superAdminReviewedAt: new Date()
    };
    if (action === "approve") {
      updateFields.completedAt = new Date();
    }

    const changeRequest = await SchoolChangeRequest.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!changeRequest) {
      const existingDoc = await SchoolChangeRequest.findById(id);
      if (!existingDoc) {
        return res.status(404).json({ message: "School change request not found" });
      }
      return res.status(400).json({ message: `Request has already been processed with status: ${existingDoc.status}` });
    }

    const targetUser = await User.findById(changeRequest.userId);
    if (!targetUser) {
      return res.status(404).json({ message: "Associated user not found" });
    }

    if (action === "reject") {
      // Notify User of Rejection
      await createAppNotification({
        recipient: targetUser._id,
        schoolName: targetUser.schoolName || changeRequest.currentSchoolName,
        role: targetUser.role,
        title: "School Change Request Rejected",
        message: `Your school change request to join ${changeRequest.requestedSchoolName} has been rejected. You remain associated with your current school (${changeRequest.currentSchoolName}).`,
        category: "General",
        link: "",
        metadata: { requestId: changeRequest._id }
      });

      return res.json({
        message: "School change request rejected successfully",
        request: changeRequest
      });
    }

    if (action === "approve") {
      const oldSchoolName = targetUser.schoolName || changeRequest.currentSchoolName;

      // 1. CRITICAL: Preserve user.role ("student" or "teacher"), clear active school fields
      targetUser.schoolName = "";
      targetUser.requestedSchool = "";
      targetUser.requestedRole = targetUser.role; // Preserved ("student" or "teacher")
      targetUser.requestStatus = "";
      if (targetUser.role === "student") {
        targetUser.classId = null;
      }
      await targetUser.save();

      // 2. Notify Student/Teacher
      await createAppNotification({
        recipient: targetUser._id,
        schoolName: "System",
        role: targetUser.role,
        title: "School Change Request Approved 🎉",
        message: `Your school change request has been approved. You have been released from ${oldSchoolName}. You can now select and join a new school from the School Directory.`,
        category: "General",
        link: targetUser.role === "teacher" ? "/teacher/schools" : "/student/schools",
        metadata: { requestId: changeRequest._id }
      });

      // 3. Notify Current School Admin (INFORMATIONAL ONLY)
      await notifySchoolAdmins({
        schoolName: oldSchoolName,
        title: "Student/Teacher School Release Info",
        message: `Super Admin has approved the release of ${targetUser.name} (${targetUser.role.toUpperCase()}) from ${oldSchoolName}.`,
        category: "General",
        link: "/admin/dashboard",
        metadata: { userId: targetUser._id, role: targetUser.role }
      }).catch(err => console.error("Error sending informational notification to old school admin:", err.message));

      return res.json({
        message: "School change approved and user released from current school successfully",
        request: changeRequest,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          role: targetUser.role,
          schoolName: targetUser.schoolName
        }
      });
    }

  } catch (error) {
    console.error("Error processing super admin action on school change request:", error);
    res.status(500).json({ message: error.message });
  }
};
