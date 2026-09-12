// backend/controllers/school/schoolDescriptionController.js
const User = require("../../models/User");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { getSchoolDescription, updateSchoolDescription } = require("../../services/school/schoolDescriptionService");

// GET /api/schools/my-school/description
const getDescriptionInfo = async (req, res) => {
  const logger = createPerformanceLogger("getDescriptionInfo");
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

    logger.start("fetchDescription");
    const descInfo = await getSchoolDescription({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("fetchDescription");

    logger.summary();
    return res.json({
      success: true,
      description: descInfo?.description || ""
    });
  } catch (error) {
    console.error(`[getDescriptionInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to load school description" });
  }
};

// PUT /api/schools/my-school/description
const updateDescriptionInfo = async (req, res) => {
  const logger = createPerformanceLogger("updateDescriptionInfo");
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

    logger.start("saveDescription");
    const updated = await updateSchoolDescription({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId,
      updateData: req.body
    });
    logger.end("saveDescription");

    logger.summary();
    return res.json({
      success: true,
      message: "School description saved successfully!",
      description: updated?.description || ""
    });
  } catch (error) {
    console.error(`[updateDescriptionInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to update school description" });
  }
};

module.exports = {
  getDescriptionInfo,
  updateDescriptionInfo
};
