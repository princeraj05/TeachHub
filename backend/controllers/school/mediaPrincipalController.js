// backend/controllers/school/mediaPrincipalController.js
const User = require("../../models/User");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { getMediaPrincipal, updateMediaPrincipal } = require("../../services/school/mediaPrincipalService");

// GET /api/schools/my-school/media-principal
const getMediaPrincipalInfo = async (req, res) => {
  const logger = createPerformanceLogger("getMediaPrincipalInfo");
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

    logger.start("fetchMediaPrincipal");
    const mediaInfo = await getMediaPrincipal({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("fetchMediaPrincipal");

    logger.summary();
    return res.json({
      success: true,
      mediaPrincipal: mediaInfo || {}
    });
  } catch (error) {
    console.error(`[getMediaPrincipalInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to load media and principal profile" });
  }
};

// PUT /api/schools/my-school/media-principal
const updateMediaPrincipalInfo = async (req, res) => {
  const logger = createPerformanceLogger("updateMediaPrincipalInfo");
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

    logger.start("saveMediaPrincipal");
    const updated = await updateMediaPrincipal({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId,
      updateData: req.body
    });
    logger.end("saveMediaPrincipal");

    logger.summary();
    return res.json({
      success: true,
      message: "Media & Principal profile saved successfully!",
      mediaPrincipal: updated
    });
  } catch (error) {
    console.error(`[updateMediaPrincipalInfo:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to update media and principal profile" });
  }
};

module.exports = {
  getMediaPrincipalInfo,
  updateMediaPrincipalInfo
};
