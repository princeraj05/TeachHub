const User = require("../models/User");


// ================= GET ADMIN PROFILE =================

const getAdminProfile = async (req, res) => {

  try {

    const admin = await User
      .findOne({ role: "admin" })
      .select("name email role");

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

    if (!name || !email) {

      return res.status(400).json({
        success: false,
        message: "Name and Email are required"
      });

    }

    const admin = await User.findOneAndUpdate(

      { role: "admin" },

      { name, email },

      {
        new: true,
        runValidators: true
      }

    ).select("name email role");


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