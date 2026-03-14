const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

exports.getAdminDashboard = async (req, res) => {

  try {

    const students = await User.countDocuments({ role: "student" });

    const teachers = await User.countDocuments({ role: "teacher" });

    const classes = await Class.countDocuments();

    const subjects = await Subject.countDocuments();

    const recentStudents = await User
      .find({ role: "student" })
      .select("name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      students,
      teachers,
      classes,
      subjects,
      recentStudents
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};