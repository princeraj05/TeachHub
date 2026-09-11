const AboutApp = require("../models/AboutApp");
const User = require("../models/User");
const School = require("../models/School");

// GET /api/about-app
exports.getAboutInfo = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");

    let info = await AboutApp.findOne().lean();
    if (!info) {
      const created = await AboutApp.create({});
      info = created.toObject();
    }

    const [studentCount, teacherCount, approvedAdminCount, schoolCount, publicSchools] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin", requestStatus: "approved" }),
      School.countDocuments({ name: { $not: /demo school/i } }),
      School.find({ name: { $not: /demo school/i } })
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

    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
