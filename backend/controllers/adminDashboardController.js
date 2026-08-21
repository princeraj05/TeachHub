const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

exports.getAdminDashboard = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const schoolName = req.user.schoolName;

    const students = await User.countDocuments({ role: "student", schoolName });

    const teachers = await User.countDocuments({ role: "teacher", schoolName });

    const classes = await Class.countDocuments({ schoolName });

    const subjects = await Subject.countDocuments({ schoolName });

    const recentStudents = await User
      .find({ role: "student", schoolName })
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