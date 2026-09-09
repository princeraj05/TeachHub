const AboutApp = require("../models/AboutApp");
const User = require("../models/User");
const School = require("../models/School");

// GET /api/about-app
exports.getAboutInfo = async (req, res) => {
  try {
    let info = await AboutApp.findOne();
    if (!info) {
      info = await AboutApp.create({});
    }

    // Clean legacy typo records (misspelled G.D Accedmy)
    await School.deleteMany({ name: { $in: ["G.D Accedmy", "G.D Accedmy "] } });
    await School.deleteMany({ normalizedName: "g.d accedmy" });

    // Sync any user's schoolName to School collection if missing
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

    const studentCount = await User.countDocuments({ role: "student" });
    const teacherCount = await User.countDocuments({ role: "teacher" });
    const adminCount = await User.countDocuments({ role: { $in: ["admin", "superadmin"] } });
    const schoolCount = await School.countDocuments({});

    const publicSchools = await School.find({})
      .select("name photo coverImage motto address coverPosition")
      .lean();

    const data = info.toObject ? info.toObject() : { ...info };
    data.stats = {
      schools: schoolCount || 0,
      students: studentCount || 0,
      teachers: teacherCount || 0,
      admins: adminCount || 0
    };
    data.publicSchools = publicSchools || [];

    res.json(data);
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
