// backend/controllers/school/basicInformationController.js
const User = require("../../models/User");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { getBasicInformation, updateBasicInformation } = require("../../services/school/basicInformationService");

// GET /api/schools/my-school/basic-info
const getBasicInfo = async (req, res) => {
  const logger = createPerformanceLogger("getBasicInfo");
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

    logger.start("fetchBasicInfo");
    const basicInfo = await getBasicInformation({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("fetchBasicInfo");

    logger.summary();
    return res.json({
      success: true,
      basicInfo: basicInfo || {}
    });
  } catch (error) {
    console.error(`[getBasicInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to load basic information" });
  }
};

// PUT /api/schools/my-school/basic-info
const updateBasicInfo = async (req, res) => {
  const logger = createPerformanceLogger("updateBasicInfo");
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

    logger.start("saveBasicInfo");
    const updated = await updateBasicInformation({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId,
      updateData: req.body
    });
    logger.end("saveBasicInfo");

    logger.summary();
    return res.json({
      success: true,
      message: "Basic information saved successfully!",
      basicInfo: updated
    });
  } catch (error) {
    console.error(`[updateBasicInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to update basic information" });
  }
};

module.exports = {
  getBasicInfo,
  updateBasicInfo
};
