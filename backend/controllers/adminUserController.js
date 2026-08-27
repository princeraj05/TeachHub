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
      // Retain the outcome for audit/UI purposes, but clear the requested
      // school so the person is free to submit a new application later.
      candidate.requestedSchool = "";
      candidate.requestedRole = "";
      candidate.requestStatus = "rejected";
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

    if (student.schoolName !== req.user.schoolName && student.requestedSchool !== req.user.schoolName) {
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
    student.schoolName = req.user.schoolName;
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

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const Class = require("../models/Class");
    const Subject = require("../models/Subject");
    const Attendance = require("../models/Attendance");

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user belongs to the admin's school
    if (user.schoolName !== req.user.schoolName && user.requestedSchool !== req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You can only delete users from your own school" });
    }

    if (user.role === "superadmin" || user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete administrators via this endpoint" });
    }

    const userId = user._id;

    // Clean up references
    await Class.updateMany({ students: userId }, { $pull: { students: userId } });
    await Class.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Subject.updateMany({ teacher: userId }, { $unset: { teacher: "" } });
    await Attendance.deleteMany({ student: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DIRECT ADD STUDENT =================
exports.addStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber = "", classId } = req.body;
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: "Name and email are required" });
    const normalizedEmail = email.trim().toLowerCase();
    let student = await User.findOne({ email: normalizedEmail });
    if (student && (student.schoolName && student.schoolName !== req.user.schoolName || student.requestedSchool && student.requestedSchool !== req.user.schoolName)) return res.status(409).json({ message: "This email is already associated with another school" });
    if (student && student.role !== "unassigned" && student.role !== "student") return res.status(409).json({ message: "This email already belongs to another user role" });
    let targetClass = null;
    if (classId) {
      targetClass = await Class.findOne({ _id: classId, schoolName: req.user.schoolName });
      if (!targetClass) return res.status(400).json({ message: "Class does not belong to your school" });
    }
    const isNewStudent = !student;
    if (!student) student = new User({ name: name.trim(), email: normalizedEmail });
    if (phoneNumber && !/^[0-9+()\-\s]{7,20}$/.test(phoneNumber)) return res.status(400).json({ message: "Mobile number is invalid" });
    const previousClassId = student.classId;
    student.name = name.trim(); student.phoneNumber = phoneNumber; student.role = "student"; student.schoolName = req.user.schoolName;
    student.requestedSchool = ""; student.requestedRole = ""; student.requestStatus = "approved"; student.classId = targetClass?._id || null;
    await student.save();
    if (previousClassId && String(previousClassId) !== String(targetClass?._id || "")) await Class.updateOne({ _id: previousClassId }, { $pull: { students: student._id } });
    if (targetClass && !targetClass.students.some(id => String(id) === String(student._id))) { targetClass.students.push(student._id); await targetClass.save(); }
    res.status(isNewStudent ? 201 : 200).json({ message: "Student added to your school", student: await User.findById(student._id).populate("classId", "name section").select("-password") });
  } catch (error) { res.status(500).json({ message: "Could not add student" }); }
};

// ================= TEACHER PROFILE & GALLERY CONTROLLERS =================
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName }).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    
    const classes = await Class.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name section");
    const subjects = await Subject.find({ teacher: teacher._id, schoolName: req.user.schoolName }).select("name");
    
    res.json({
      ...teacher.toObject(),
      classes,
      subjects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeacherProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, dob, gender, qualification, experience, joiningDate, employeeId } = req.body;
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (phoneNumber) teacher.phoneNumber = phoneNumber;
    if (dob !== undefined) teacher.dob = dob;
    if (gender !== undefined) teacher.gender = gender;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    if (joiningDate !== undefined) teacher.joiningDate = joiningDate;
    if (employeeId !== undefined) teacher.employeeId = employeeId;

    await teacher.save();
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeacherPhoto = async (req, res) => {
  try {
    const { url, filename } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });
    
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    
    if (teacher.galleryPhotos.length >= 5) {
      return res.status(400).json({ message: "Maximum photo limit (5) reached" });
    }

    teacher.galleryPhotos.push({ url, filename: filename || `IMG_${Date.now()}.jpg`, uploadedAt: new Date() });
    await teacher.save();
    res.json(teacher.galleryPhotos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTeacherPhoto = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    
    teacher.galleryPhotos = teacher.galleryPhotos.filter(photo => String(photo._id) !== String(req.params.photoId));
    await teacher.save();
    res.json(teacher.galleryPhotos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reorderTeacherPhotos = async (req, res) => {
  try {
    const { photos } = req.body;
    if (!Array.isArray(photos)) return res.status(400).json({ message: "Photos array is required" });

    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.galleryPhotos = photos;
    await teacher.save();
    res.json(teacher.galleryPhotos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
