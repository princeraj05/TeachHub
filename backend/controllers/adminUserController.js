const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const AdmissionExam = require("../models/AdmissionExam");


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

const school = req.user.schoolName;

// Auto-heal/migrate student candidates whose exam has not happened or who aren't fully approved:
const candidatesToHeal = await User.find({
  $or: [
    { schoolName: school },
    { requestedSchool: school }
  ],
  $or: [
    { role: "student" },
    { requestedRole: "student" }
  ],
  classId: { $exists: false },
  requestStatus: { $ne: "approved" }
});

for (let c of candidatesToHeal) {
  c.role = "unassigned";
  c.requestedRole = "student";
  c.requestedSchool = school;
  c.requestStatus = c.admissionExamDate ? "scheduled" : "pending";
  await c.save();
}

const students = await User
.find({ role:"student", schoolName: school, requestStatus: "approved" })
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

    const school = req.user.schoolName;

    // Run the auto-heal/migrate here too to keep both endpoints in sync
    const candidatesToHeal = await User.find({
      $or: [
        { schoolName: school },
        { requestedSchool: school }
      ],
      $or: [
        { role: "student" },
        { requestedRole: "student" }
      ],
      classId: { $exists: false },
      requestStatus: { $ne: "approved" }
    });

    for (let c of candidatesToHeal) {
      c.role = "unassigned";
      c.requestedRole = "student";
      c.requestedSchool = school;
      c.requestStatus = c.admissionExamDate ? "scheduled" : "pending";
      await c.save();
    }

    const requests = await User.find({
      requestedSchool: school,
      requestStatus: { $in: ["pending", "scheduled", "exam_completed"] }
    })
    .populate("admissionExamProctor", "name email role")
    .select("-password");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PROCESS JOIN REQUEST =================
exports.processJoinRequest = async (req, res) => {
  try {
    const { userId, action, examDate, examMode, proctorId } = req.body;

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
      if (candidate.requestedRole === "student") {
        if (!examDate || !examMode) {
          return res.status(400).json({ message: "Exam date and mode are required for student scheduling" });
        }
        candidate.schoolName = candidate.requestedSchool;
        candidate.requestStatus = "scheduled";
        candidate.admissionExamDate = new Date(examDate);
        candidate.admissionExamMode = examMode;
        candidate.admissionExamProctor = proctorId || req.user.id;
      } else {
        candidate.role = candidate.requestedRole;
        candidate.schoolName = candidate.requestedSchool;
        candidate.requestStatus = "approved";
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
      message: `Join request processed successfully`,
      user: {
        _id: candidate._id,
        name: candidate.name,
        role: candidate.role,
        schoolName: candidate.schoolName,
        requestStatus: candidate.requestStatus,
        admissionExamDate: candidate.admissionExamDate,
        admissionExamMode: candidate.admissionExamMode
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ADMISSION EXAM =================
exports.getAdmissionExam = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }
    let exam = await AdmissionExam.findOne({ schoolName: req.user.schoolName });
    if (!exam) {
      const defaultQuestions = require("../utils/defaultQuestions");
      exam = new AdmissionExam({
        schoolName: req.user.schoolName,
        negativeMarking: false,
        negativeMarkValue: 0.25,
        questions: defaultQuestions
      });
      await exam.save();
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE ADMISSION EXAM =================
exports.saveAdmissionExam = async (req, res) => {
  try {
    const { negativeMarking, negativeMarkValue, questions } = req.body;
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }
    
    let exam = await AdmissionExam.findOne({ schoolName: req.user.schoolName });
    if (!exam) {
      exam = new AdmissionExam({
        schoolName: req.user.schoolName,
        negativeMarking: !!negativeMarking,
        negativeMarkValue: negativeMarkValue || 0.25,
        questions: questions || []
      });
    } else {
      exam.negativeMarking = !!negativeMarking;
      exam.negativeMarkValue = negativeMarkValue || 0.25;
      exam.questions = questions || [];
    }
    await exam.save();
    res.json({ message: "Admission exam saved successfully", exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ASSIGN CLASS AND SECTION =================
exports.assignClass = async (req, res) => {
  try {
    const { userId, classId } = req.body;

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!userId || !classId) {
      return res.status(400).json({ message: "userId and classId are required" });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.schoolName !== req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: Student belongs to another school" });
    }

    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Add to class students list if not already present
    if (!targetClass.students.includes(student._id)) {
      targetClass.students.push(student._id);
      await targetClass.save();
    }

    student.role = "student";
    student.requestStatus = "approved";
    student.classId = targetClass._id;

    await student.save();

    res.json({
      message: "Student assigned to class successfully",
      student: {
        _id: student._id,
        name: student.name,
        role: student.role,
        requestStatus: student.requestStatus,
        classId: student.classId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};