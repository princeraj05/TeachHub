const AboutApp = require("../models/AboutApp");

// GET /api/about-app
exports.getAboutInfo = async (req, res) => {
  try {
    const info = await AboutApp.findOne();
    if (!info) {
      return res.status(404).json({ message: "About App configuration not found" });
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
    
    const { aboutDeveloper, aboutApp } = req.body;
    if (aboutDeveloper !== undefined) info.aboutDeveloper = aboutDeveloper;
    if (aboutApp !== undefined) info.aboutApp = aboutApp;

    await info.save();
    res.json({ message: "About App configuration updated successfully", info });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
