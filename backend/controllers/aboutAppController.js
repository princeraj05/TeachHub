const AboutApp = require("../models/AboutApp");

// GET /api/about-app
exports.getAboutInfo = async (req, res) => {
  try {
    let info = await AboutApp.findOne();
    if (!info) {
      info = await AboutApp.create({});
    }
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/about-app
exports.updateAboutInfo = async (req, res) => {
  try {
    let info = await AboutApp.findOne();
    if (!info) {
      info = new AboutApp();
    }
    
    const fields = [
      "platformName", "tagline", "version", "platformWebsite", "logoUrl",
      "developerName", "developerAddress", "developerEmail", "developerPhone",
      "supportEmail", "supportPhone", "supportWhatsapp", "supportHours",
      "privacyPolicyUrl", "cookiePolicyUrl", "termsOfServiceUrl", "disclaimerUrl",
      "refundPolicyUrl", "aboutUsUrl", "playStoreLink", "appStoreLink",
      "socialFacebook", "socialTwitter", "socialInstagram", "socialYoutube", "socialLinkedin"
    ];

    for (const key of fields) {
      if (req.body[key] !== undefined) {
        info[key] = req.body[key];
      }
    }

    await info.save();
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

    const cloudinary = require("../config/cloudinary");
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "teachhub/platform",
      resource_type: "image"
    });

    const fs = require("fs");
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error("Local file delete error:", err);
    }

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
