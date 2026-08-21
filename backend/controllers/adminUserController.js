const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");


// ================= GET TEACHERS =================

exports.getTeachers = async (req,res)=>{

try{

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const teachers = await User
.find({ role:"teacher", schoolName: req.user.schoolName })
.select("-password")
.lean();

for (let teacher of teachers) {
  const classes = await Class.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name section");
  const subjects = await Subject.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name");
  teacher.classes = classes;
  teacher.subjects = subjects;
}

res.json(teachers);

}catch(error){

res.status(500).json({
message:error.message
})

}

};



// ================= GET STUDENTS =================

exports.getStudents = async (req,res)=>{

try{

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const students = await User
.find({ role:"student", schoolName: req.user.schoolName })
.populate("classId", "name section")
.select("-password");

res.json(students);

}catch(error){

res.status(500).json({
message:error.message
})

}

};

// ================= GET JOIN REQUESTS =================
exports.getJoinRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const requests = await User.find({
      requestedSchool: req.user.schoolName,
      requestStatus: "pending"
    }).select("-password");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PROCESS JOIN REQUEST =================
exports.processJoinRequest = async (req, res) => {
  try {
    const { userId, action, examDate, examMode } = req.body;

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!userId || !action || !["approved", "rejected"].includes(action)) {
      return res.status(400).json({ message: "UserId and valid action (approved/rejected) are required" });
    }

    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "User not found" });
    }

    if (candidate.requestedSchool !== req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You can only process requests for your own school" });
    }

    if (action === "approved") {
      candidate.role = candidate.requestedRole;
      candidate.schoolName = candidate.requestedSchool;
      candidate.requestStatus = "approved";

      if (candidate.role === "student") {
        if (!examDate || !examMode) {
          return res.status(400).json({ message: "Exam date and mode are required for student approval" });
        }
        candidate.admissionExamDate = new Date(examDate);
        candidate.admissionExamMode = examMode;
      }
    } else {
      candidate.requestStatus = "rejected";
    }

    // Reset requested fields upon processing so they can apply again if rejected
    if (action === "rejected") {
      candidate.requestedSchool = "";
      candidate.requestedRole = "";
      candidate.requestStatus = "";
    }

    await candidate.save();

    res.json({
      message: `Join request ${action} successfully`,
      user: {
        _id: candidate._id,
        name: candidate.name,
        role: candidate.role,
        schoolName: candidate.schoolName,
        admissionExamDate: candidate.admissionExamDate,
        admissionExamMode: candidate.admissionExamMode
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};