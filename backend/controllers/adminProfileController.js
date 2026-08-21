const User = require("../models/User");


const getAdminProfile = async (req, res) => {

  try {

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admin = await User
      .findById(req.user.id)
      .select("name email role schoolName");

    if (!admin) {

      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });

    }

    res.json({
      success: true,
      admin
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// ================= UPDATE ADMIN PROFILE =================

const updateAdminProfile = async (req, res) => {

  try {

    const { name, email } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!name || !email) {

      return res.status(400).json({
        success: false,
        message: "Name and Email are required"
      });

    }

    const admin = await User.findByIdAndUpdate(

      req.user.id,

      { name, email },

      {
        new: true,
        runValidators: true
      }

    ).select("name email role schoolName");


    if (!admin) {

      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });

    }

    res.json({
      success: true,
      message: "Admin profile updated successfully",
      admin
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



module.exports = {
  getAdminProfile,
  updateAdminProfile
};