// backend/controllers/school/schoolMediaController.js
const fs = require("fs");
const School = require("../../models/School");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { normalizeName } = require("../../services/school/schoolResolverService");

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/schools/upload
const uploadSchoolPhoto = async (req, res) => {
  const logger = createPerformanceLogger("uploadSchoolPhoto");
  let finalUrl = "";
  let publicId = "";

  try {
    if (!req.file) {
      logger.summary();
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const userId = req.user.id || req.user._id;

    logger.start("findSchoolForUpload");
    let school = await School.findOne({ adminId: userId });
    if (!school && req.user.schoolName) {
      const normalized = normalizeName(req.user.schoolName);
      const escName = escapeRegex(req.user.schoolName);
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escName + "$", "i") }
        ]
      });
      if (school) {
        school.adminId = userId;
        await school.save().catch(e => console.warn("Failed to set adminId on photo upload:", e.message));
      }
    }
    logger.end("findSchoolForUpload");

    const schoolFolderId = school ? school._id.toString() : userId.toString();
    const cloudinary = require("../../config/cloudinary");

    logger.start("cloudinaryUpload");
    try {
      // Upload to Cloudinary folder teachhub/schools/{schoolFolderId} with an 8s timeout
      const result = await Promise.race([
        cloudinary.uploader.upload(req.file.path, {
          folder: `teachhub/schools/${schoolFolderId}`,
          resource_type: "image"
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Cloudinary upload timeout (8s limit)")), 8000))
      ]);

      if (result && result.secure_url) {
        finalUrl = result.secure_url;
        publicId = result.public_id;
      }
    } catch (cErr) {
      console.warn(`[uploadSchoolPhoto:${logger.reqId}] Cloudinary upload bypassed/failed, using local static fallback:`, cErr.message);
      // Fast static fallback: Serve uploaded file from /uploads/
      finalUrl = `/uploads/${req.file.filename}`;
    }
    logger.end("cloudinaryUpload");

    if (!finalUrl) {
      logger.summary();
      return res.status(500).json({ success: false, message: "Failed to process image upload." });
    }

    logger.summary();
    return res.json({
      success: true,
      url: finalUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error(`[uploadSchoolPhoto:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to upload image" });
  } finally {
    // Only delete local temp file if Cloudinary upload succeeded
    if (finalUrl && (finalUrl.startsWith("http://") || finalUrl.startsWith("https://"))) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn("Failed to unlink temporary file:", e.message);
        }
      }
    }
  }
};

module.exports = {
  uploadSchoolPhoto
};
