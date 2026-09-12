// backend/controllers/school/admissionSettingsController.js
const User = require("../../models/User");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { getAdmissionSettings, updateAdmissionSettings } = require("../../services/school/admissionSettingsService");

// GET /api/schools/my-school/admission-settings
const getAdmissionSettingsInfo = async (req, res) => {
  const logger = createPerformanceLogger("getAdmissionSettingsInfo");
  try {
    const userId = req.user.id || req.user._id;

    logger.start("loadAdminUser");
    const adminUser = await User.findById(userId).select("role requestedRole schoolName requestedSchool email").lean();
    logger.end("loadAdminUser");

    const isAllowed = adminUser && (
      adminUser.role === "admin" ||
      adminUser.role === "superadmin" ||
      adminUser.requestedRole === "admin" ||
      adminUser.role === "unassigned"
    );

    if (!isAllowed) {
      logger.summary();
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const targetSchoolName = adminUser.schoolName || adminUser.requestedSchool || "";

    logger.start("fetchAdmissionSettings");
    const admissionInfo = await getAdmissionSettings({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("fetchAdmissionSettings");

    logger.summary();
    return res.json({
      success: true,
      admissionSettings: admissionInfo || {}
    });
  } catch (error) {
    console.error(`[getAdmissionSettingsInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to load admission settings" });
  }
};

// PUT /api/schools/my-school/admission-settings
const updateAdmissionSettingsInfo = async (req, res) => {
  const logger = createPerformanceLogger("updateAdmissionSettingsInfo");
  try {
    const userId = req.user.id || req.user._id;

    logger.start("loadAdminUser");
    const adminUser = await User.findById(userId).select("role requestedRole schoolName requestedSchool email").lean();
    logger.end("loadAdminUser");

    const isAllowed = adminUser && (
      adminUser.role === "admin" ||
      adminUser.role === "superadmin" ||
      adminUser.requestedRole === "admin" ||
      adminUser.role === "unassigned"
    );

    if (!isAllowed) {
      logger.summary();
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const targetSchoolName = adminUser.schoolName || adminUser.requestedSchool || "";

    logger.start("saveAdmissionSettings");
    const updated = await updateAdmissionSettings({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId,
      updateData: req.body
    });
    logger.end("saveAdmissionSettings");

    logger.summary();
    return res.json({
      success: true,
      message: "Admission & Settings saved successfully!",
      admissionSettings: updated
    });
  } catch (error) {
    console.error(`[updateAdmissionSettingsInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to update admission settings" });
  }
};

module.exports = {
  getAdmissionSettingsInfo,
  updateAdmissionSettingsInfo
};
