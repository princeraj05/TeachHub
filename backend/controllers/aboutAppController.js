const AboutApp = require("../models/AboutApp");
const User = require("../models/User");
const School = require("../models/School");

let cachedAboutApp = null;
let lastCacheTime = 0;

// GET /api/about-app
exports.getAboutInfo = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60, s-maxage=120");
    const now = Date.now();

    // Serve 10-second in-memory cache to eliminate MongoDB query bottlenecks and prevent 504 Gateway Timeouts
    if (cachedAboutApp && (now - lastCacheTime < 10000)) {
      return res.json(cachedAboutApp);
    }

    let info = await AboutApp.findOne().lean();
    if (!info) {
      info = { platformName: "TeachHub Portal", tagline: "Learn • Grow • Succeed" };
    }

    const [studentCount, teacherCount, approvedAdminCount, schoolCount, publicSchools] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      School.countDocuments({ status: { $ne: "Disabled" } }),
      School.find({ status: { $ne: "Disabled" } })
        .select("name photo coverImage motto address coverPosition")
        .lean()
    ]);

    info.stats = {
      schools: schoolCount || 0,
      students: studentCount || 0,
      teachers: teacherCount || 0,
      admins: approvedAdminCount || 0
    };
    info.publicSchools = publicSchools || [];

    cachedAboutApp = info;
    lastCacheTime = Date.now();

    return res.json(info);
  } catch (error) {
    console.error("Error in getAboutInfo:", error);
    if (cachedAboutApp) return res.json(cachedAboutApp);
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/about-app
exports.updateAboutInfo = async (req, res) => {
  try {
    const fields = [
      "platformName", "tagline", "version", "platformWebsite", "logoUrl",
      "developerName", "developerAddress", "developerEmail", "developerPhone",
      "supportEmail", "supportPhone", "supportWhatsapp", "supportHours",
      "privacyPolicyUrl", "cookiePolicyUrl", "termsOfServiceUrl", "disclaimerUrl",
      "refundPolicyUrl", "aboutUsUrl", "playStoreLink", "appStoreLink",
      "socialFacebook", "socialTwitter", "socialInstagram", "socialYoutube", "socialLinkedin"
    ];

    const updateData = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const info = await AboutApp.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ message: "About App configuration updated successfully", info });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/about-app/logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    const fs = require("fs");
    let logoUrl = "";
    try {
      const cloudinary = require("../config/cloudinary");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "teachhub/platform",
        resource_type: "image"
      });
      logoUrl = result.secure_url;
    } catch (cErr) {
      console.error("Cloudinary logo upload error, using base64 fallback:", cErr.message);
      const fileData = fs.readFileSync(req.file.path);
      const mimeType = req.file.mimetype || "image/png";
      logoUrl = `data:${mimeType};base64,${fileData.toString("base64")}`;
    }

    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error("Local file delete error:", err);
    }

    res.json({ url: logoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
