const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Class = require("../models/Class");


// ================= MARK ATTENDANCE =================

exports.markAttendance = async (req, res) => {

  try {

    const { student, status } = req.body;

    const teacherId = req.user.id;

    // check student exists
    const studentData = await User.findById(student);

    if (!studentData) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // find class from Class collection
    const classData = await Class.findOne({
      students: student
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
      date: { $gte: today }
    });

    if (existing) {

      existing.status = status;
      await existing.save();

      return res.json({
        message: "Attendance updated"
      });

    }

    const attendance = new Attendance({

      student,
      class: classId,
      teacher: teacherId,
      status

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

    const data = await Attendance.find()

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