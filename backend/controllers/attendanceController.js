const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Class = require("../models/Class");


// ================= MARK ATTENDANCE =================

exports.markAttendance = async (req, res) => {

  try {

    const { student, status } = req.body;

    const teacherId = req.user.id;
    
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    // check student exists
    const studentData = await User.findOne({ _id: student, schoolName: req.user.schoolName });

    if (!studentData) {
      return res.status(404).json({
        message: "Student not found in your school"
      });
    }

    // find class from Class collection
    const classData = await Class.findOne({
      students: student,
      schoolName: req.user.schoolName
    });

    if (!classData) {
      return res.status(400).json({
        message: "Student class not assigned"
      });
    }

    const classId = classData._id;

    // today date
    const today = new Date();
    today.setHours(0,0,0,0);

    // check existing attendance
    const existing = await Attendance.findOne({
      student,
      date: { $gte: today },
      schoolName: req.user.schoolName
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance has already been marked for today and cannot be updated"
      });
    }

    const attendance = new Attendance({

      student,
      class: classId,
      teacher: teacherId,
      status,
      schoolName: req.user.schoolName

    });

    await attendance.save();

    res.json({
      message: "Attendance marked successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET ATTENDANCE REPORT =================

exports.getAttendanceReport = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const data = await Attendance.find({ schoolName: req.user.schoolName })

      .populate("student","name email")
      .populate("class","name section")
      .populate("teacher","name email")

      .sort({ date:-1 });

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// ================= GET TODAY'S ATTENDANCE =================

exports.getTodayAttendance = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const teacherId = req.user.id;

    const records = await Attendance.find({
      teacher: teacherId,
      date: { $gte: today },
      schoolName: req.user.schoolName
    });

    res.json(records);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};