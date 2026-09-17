const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const AdmissionExam = require("../models/AdmissionExam");
const Timetable = require("../models/Timetable");


const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ================= GET TEACHERS =================

exports.getTeachers = async (req,res)=>{

try{

if (!req.user || !req.user.schoolName) {
  return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
}

const schoolRegex = new RegExp(`^${escapeRegex(req.user.schoolName)}$`, "i");

const teachers = await User.find({
  role: { $regex: /^teacher$/i },
  $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }]
})
.select("-password")
.lean();

for (let teacher of teachers) {
  const timetableClassIds = await Timetable.distinct("class", { teacher: teacher._id });
  const classes = await Class.find({
    $or: [{ teacher: teacher._id }, { _id: { $in: timetableClassIds } }],
    schoolName: schoolRegex
  }).select("name section");

  const timetableSubjectIds = await Timetable.distinct("subject", { teacher: teacher._id });
  const subjects = await Subject.find({
    $or: [{ teacher: teacher._id }, { _id: { $in: timetableSubjectIds } }],
    schoolName: schoolRegex
  }).select("name");

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
const schoolRegex = new RegExp("^" + escapeRegex(school) + "$", "i");

// Auto-restore students if role was wrongly set to unassigned
await User.updateMany(
  {
    $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }],
    role: "unassigned",
    requestedRole: "student",
    requestStatus: "approved"
  },
  { $set: { role: "student" } }
);

// Auto-heal unassigned candidates whose exam has not happened or who aren't fully approved:
const candidatesToHeal = await User.find({
  $or: [
    { schoolName: schoolRegex },
    { requestedSchool: schoolRegex }
  ],
  role: "unassigned",
  requestedRole: "student",
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
.find({
  role: { $regex: /^student$/i },
  $or: [{ schoolName: schoolRegex }, { requestedSchool: schoolRegex }]
})
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
    if (!req.user || (!req.user.schoolName && !req.user.requestedSchool)) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const { resolveSchoolForAdmin, normalizeName } = require("../services/school/schoolResolverService");
    let schoolObj = null;
    try {
      schoolObj = await resolveSchoolForAdmin({
        adminUserId: req.user.id || req.user._id,
        targetSchoolName: req.user.schoolName || req.user.requestedSchool,
        adminEmail: req.user.email
      });
    } catch (rErr) {
      console.warn("schoolResolverService lookup in getJoinRequests warning:", rErr.message);
    }

    const canonicalSchoolName = schoolObj ? schoolObj.name : (req.user.schoolName || req.user.requestedSchool || "");

    // Auto-heal admin user's schoolName if it was mismatched
    if (schoolObj && schoolObj.name && req.user.schoolName !== schoolObj.name) {
      User.updateOne({ _id: req.user.id || req.user._id }, { schoolName: schoolObj.name, requestedSchool: schoolObj.name })
        .catch(hErr => console.warn("Error auto-healing admin schoolName:", hErr.message));
    }

    const matchNames = new Set();
    if (canonicalSchoolName) matchNames.add(canonicalSchoolName);
    if (req.user.schoolName) matchNames.add(req.user.schoolName);
    if (req.user.requestedSchool) matchNames.add(req.user.requestedSchool);

    const schoolRegexes = Array.from(matchNames).map(n => new RegExp("^" + escapeRegex(n) + "$", "i"));

    // Auto-heal unassigned candidates
    const candidatesToHeal = await User.find({
      $or: [
        { requestedSchool: { $in: schoolRegexes } },
        { schoolName: { $in: schoolRegexes } }
      ],
      role: "unassigned",
      requestedRole: "student",
      classId: { $exists: false },
      requestStatus: { $ne: "approved" }
    });

    for (let c of candidatesToHeal) {
      c.role = "unassigned";
      c.requestedRole = "student";
      c.requestedSchool = canonicalSchoolName || c.requestedSchool;
      c.requestStatus = c.admissionExamDate ? "scheduled" : "pending";
      await c.save();
    }

    const requests = await User.find({
      $or: [
        { requestedSchool: { $in: schoolRegexes } },
        { schoolName: { $in: schoolRegexes } }
      ],
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
    const { userId, action, examDate, examMode, proctorId, interviewDate, interviewTime, interviewMode, interviewVenue, interviewNotes } = req.body;

    if (!req.user || (!req.user.schoolName && !req.user.requestedSchool)) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!userId || !action || !["approved", "rejected", "schedule_interview"].includes(action)) {
      return res.status(400).json({ message: "UserId and valid action are required" });
    }

    const candidate = await User.findById(userId);
    if (!candidate) {
      return res.status(404).json({ message: "User not found" });
    }

    const { resolveSchoolForAdmin } = require("../services/school/schoolResolverService");
    let schoolObj = null;
    try {
      schoolObj = await resolveSchoolForAdmin({
        adminUserId: req.user.id || req.user._id,
        targetSchoolName: req.user.schoolName || req.user.requestedSchool,
        adminEmail: req.user.email
      });
    } catch (rErr) {
      console.warn("schoolResolverService lookup in processJoinRequest warning:", rErr.message);
    }

    const canonicalSchoolName = schoolObj ? schoolObj.name : (req.user.schoolName || req.user.requestedSchool || "");

    const matchNames = new Set();
    if (canonicalSchoolName) matchNames.add(canonicalSchoolName);
    if (req.user.schoolName) matchNames.add(req.user.schoolName);
    if (req.user.requestedSchool) matchNames.add(req.user.requestedSchool);

    const schoolRegexes = Array.from(matchNames).map(n => new RegExp("^" + escapeRegex(n) + "$", "i"));

    const matchesSchool = (candidate.requestedSchool && schoolRegexes.some(r => r.test(candidate.requestedSchool))) ||
                          (candidate.schoolName && schoolRegexes.some(r => r.test(candidate.schoolName)));

    if (!matchesSchool) {
      return res.status(403).json({ message: "Forbidden: You can only process requests for your own school" });
    }

    if (action === "approved" || action === "schedule_interview") {
      if (candidate.requestedRole === "student") {
        if (action === "schedule_interview" && (!examDate || !examMode)) {
          return res.status(400).json({ message: "Exam date and mode are required for student scheduling" });
        }
        candidate.schoolName = canonicalSchoolName || candidate.requestedSchool || req.user.schoolName;
        candidate.requestedSchool = canonicalSchoolName || candidate.requestedSchool;
        if (action === "approved") {
          candidate.role = "student";
          candidate.requestStatus = "approved";
          candidate.approvedAt = new Date();

          // Auto-link to matching class in new school if targetClass exists
          if (candidate.targetClass) {
            const rawTarget = String(candidate.targetClass).replace(/^class\s+/i, "").trim();
            const matchingClass = await Class.findOne({
              schoolName: candidate.schoolName,
              $or: [
                { name: candidate.targetClass },
                { name: rawTarget },
                { name: `Class ${rawTarget}` }
              ]
            });

            if (matchingClass) {
              candidate.classId = matchingClass._id;
              await Class.findByIdAndUpdate(matchingClass._id, {
                $addToSet: { students: candidate._id }
              });
            }
          }
        } else {
          candidate.requestStatus = "scheduled";
          candidate.admissionExamDate = new Date(examDate);
          candidate.admissionExamMode = examMode;
          candidate.admissionExamProctor = proctorId || req.user.id;
        }
      } else if (action === "schedule_interview" || (interviewMode && interviewMode !== "")) {
        candidate.schoolName = canonicalSchoolName || candidate.requestedSchool || req.user.schoolName;
        candidate.requestedSchool = canonicalSchoolName || candidate.requestedSchool;
        candidate.requestStatus = "scheduled";
        candidate.interviewDate = interviewDate ? new Date(interviewDate) : new Date();
        candidate.interviewTime = interviewTime || "";
        candidate.interviewMode = interviewMode || "Online";
        candidate.interviewVenue = interviewVenue || "";
        candidate.interviewNotes = interviewNotes || "";
        candidate.admissionExamDate = candidate.interviewDate;
        candidate.admissionExamMode = candidate.interviewMode;
      } else {
        candidate.role = candidate.requestedRole || "teacher";
        candidate.schoolName = canonicalSchoolName || candidate.requestedSchool || req.user.schoolName;
        candidate.requestedSchool = canonicalSchoolName || candidate.requestedSchool;
        candidate.requestStatus = "approved";
        candidate.approvedAt = new Date();
      }
    } else {
      candidate.requestStatus = "rejected";
    }

    // Reset requested fields upon processing so they can apply again if rejected
    if (action === "rejected") {
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
        admissionExamMode: candidate.admissionExamMode,
        interviewDate: candidate.interviewDate,
        interviewTime: candidate.interviewTime,
        interviewMode: candidate.interviewMode,
        interviewVenue: candidate.interviewVenue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Drop legacy unique index on schoolName if present
let hasDroppedLegacyAdmissionExamIndex = false;
const safeDropLegacyAdmissionIndex = async () => {
  if (hasDroppedLegacyAdmissionExamIndex) return;
  try {
    const indexes = await AdmissionExam.collection.indexes();
    const legacyIdx = indexes.find(idx => idx.name === "schoolName_1");
    if (legacyIdx && legacyIdx.unique) {
      await AdmissionExam.collection.dropIndex("schoolName_1");
    }
  } catch (err) {
    // Ignore index drop errors if index doesn't exist
  }
  hasDroppedLegacyAdmissionExamIndex = true;
};

// Helper: Normalize target class string (e.g., "5" -> "Class 5")
const normalizeTargetClassName = (rawName) => {
  if (!rawName) return "Class 1";
  const str = String(rawName).trim();
  if (/^class\s+/i.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return `Class ${str}`;
};

// ================= GET ADMISSION EXAM =================
exports.getAdmissionExam = async (req, res) => {
  try {
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }
    await safeDropLegacyAdmissionIndex();

    const { classId, targetClass: rawTargetClass } = req.query;
    let resolvedClassId = null;
    let targetClassName = "";

    if (classId) {
      const classDoc = await Class.findById(classId).lean();
      if (classDoc) {
        resolvedClassId = classDoc._id;
        targetClassName = normalizeTargetClassName(classDoc.name);
      }
    }

    if (!targetClassName && rawTargetClass) {
      targetClassName = normalizeTargetClassName(rawTargetClass);
    }

    if (!targetClassName) {
      const firstClass = await Class.findOne({ schoolName: req.user.schoolName }).sort({ name: 1 }).lean();
      if (firstClass) {
        resolvedClassId = firstClass._id;
        targetClassName = normalizeTargetClassName(firstClass.name);
      } else {
        targetClassName = "Class 1";
      }
    }

    let exam = await AdmissionExam.findOne({
      schoolName: req.user.schoolName,
      targetClass: targetClassName
    });

    if (!exam) {
      const defaultQuestions = require("../utils/defaultQuestions");
      exam = new AdmissionExam({
        schoolName: req.user.schoolName,
        class: resolvedClassId,
        targetClass: targetClassName,
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
    const { classId, targetClass: rawTargetClass, negativeMarking, negativeMarkValue, questions } = req.body;
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }
    await safeDropLegacyAdmissionIndex();

    let resolvedClassId = null;
    let targetClassName = "";

    if (classId) {
      const classDoc = await Class.findById(classId).lean();
      if (classDoc) {
        resolvedClassId = classDoc._id;
        targetClassName = normalizeTargetClassName(classDoc.name);
      }
    }

    if (!targetClassName && rawTargetClass) {
      targetClassName = normalizeTargetClassName(rawTargetClass);
    }

    if (!targetClassName) {
      return res.status(400).json({ message: "Target class is required to save an admission exam" });
    }

    let exam = await AdmissionExam.findOne({
      schoolName: req.user.schoolName,
      targetClass: targetClassName
    });

    if (!exam) {
      exam = new AdmissionExam({
        schoolName: req.user.schoolName,
        class: resolvedClassId,
        targetClass: targetClassName,
        negativeMarking: !!negativeMarking,
        negativeMarkValue: negativeMarkValue !== undefined ? negativeMarkValue : 0.25,
        questions: questions || []
      });
    } else {
      if (resolvedClassId) exam.class = resolvedClassId;
      exam.negativeMarking = !!negativeMarking;
      exam.negativeMarkValue = negativeMarkValue !== undefined ? negativeMarkValue : 0.25;
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
    const { userId, classId, rollNo } = req.body;

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

    let numericRoll = rollNo !== undefined && rollNo !== "" && rollNo !== null ? Number(rollNo) : null;
    
    // Auto-assign next roll number if rollNo is not provided
    if (numericRoll === null) {
      const classStudents = await User.find({ role: "student", schoolName: req.user.schoolName, classId: targetClass._id });
      const takenRolls = classStudents.map(s => s.rollNo).filter(Boolean);
      let nextAvailable = 1;
      while (takenRolls.includes(nextAvailable)) {
        nextAvailable++;
      }
      numericRoll = nextAvailable;
    }

    if (numericRoll !== null) {
      const existingRollStudent = await User.findOne({
        _id: { $ne: student._id },
        role: "student",
        schoolName: req.user.schoolName,
        classId: targetClass._id,
        rollNo: numericRoll
      });
      if (existingRollStudent) {
        const classStudents = await User.find({ role: "student", schoolName: req.user.schoolName, classId: targetClass._id });
        const takenRolls = classStudents.map(s => s.rollNo).filter(Boolean);
        let nextAvailable = 1;
        while (takenRolls.includes(nextAvailable)) {
          nextAvailable++;
        }
        return res.status(409).json({
          message: `Roll number ${numericRoll} is already assigned to ${existingRollStudent.name} in this class. Next available roll number is ${nextAvailable}.`,
          nextAvailable
        });
      }
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
    if (targetClass.name) {
      student.targetClass = targetClass.name.startsWith("Class") ? targetClass.name : `Class ${targetClass.name}`;
    }
    student.rollNo = numericRoll;

    await student.save();

    res.json({
      message: "Student assigned to class successfully",
      student: {
        _id: student._id,
        name: student.name,
        role: student.role,
        requestStatus: student.requestStatus,
        classId: student.classId,
        rollNo: student.rollNo
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
    const { name, email, phoneNumber = "", classId, rollNo } = req.body;
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

    // Roll number handling & validation
    let numericRoll = rollNo !== undefined && rollNo !== "" && rollNo !== null ? Number(rollNo) : null;
    
    // Auto-assign next roll number if class is selected and rollNo is not provided
    if (numericRoll === null && targetClass) {
      const classStudents = await User.find({ role: "student", schoolName: req.user.schoolName, classId: targetClass._id });
      const takenRolls = classStudents.map(s => s.rollNo).filter(Boolean);
      let nextAvailable = 1;
      while (takenRolls.includes(nextAvailable)) {
        nextAvailable++;
      }
      numericRoll = nextAvailable;
    }

    if (numericRoll !== null) {
      const rollQuery = {
        _id: { $ne: student?._id },
        role: "student",
        schoolName: req.user.schoolName,
        rollNo: numericRoll
      };
      if (targetClass) {
        rollQuery.classId = targetClass._id;
      }
      const existingRollStudent = await User.findOne(rollQuery);
      if (existingRollStudent) {
        const classStudents = await User.find({ role: "student", schoolName: req.user.schoolName, ...(targetClass ? { classId: targetClass._id } : {}) });
        const takenRolls = classStudents.map(s => s.rollNo).filter(Boolean);
        let nextAvailable = 1;
        while (takenRolls.includes(nextAvailable)) {
          nextAvailable++;
        }
        return res.status(409).json({
          message: `Roll number ${numericRoll} is already assigned to ${existingRollStudent.name}. Next available roll number is ${nextAvailable}.`,
          nextAvailable
        });
      }
    }

    const isNewStudent = !student;
    if (!student) student = new User({ name: name.trim(), email: normalizedEmail });
    if (phoneNumber && !/^[0-9+()\-\s]{7,20}$/.test(phoneNumber)) return res.status(400).json({ message: "Mobile number is invalid" });
    const previousClassId = student.classId;
    student.name = name.trim();
    student.phoneNumber = phoneNumber;
    student.role = "student";
    student.schoolName = req.user.schoolName;
    student.requestedSchool = "";
    student.requestedRole = "";
    student.requestStatus = "approved";
    student.classId = targetClass?._id || null;
    student.rollNo = numericRoll;

    await student.save();
    if (previousClassId && String(previousClassId) !== String(targetClass?._id || "")) await Class.updateOne({ _id: previousClassId }, { $pull: { students: student._id } });
    if (targetClass && !targetClass.students.some(id => String(id) === String(student._id))) { targetClass.students.push(student._id); await targetClass.save(); }
    res.status(isNewStudent ? 201 : 200).json({ message: "Student added to your school", student: await User.findById(student._id).populate("classId", "name section").select("-password") });
  } catch (error) { res.status(500).json({ message: error.message || "Could not add student" }); }
};

// ================= UPDATE STUDENT ROLL NUMBER =================
exports.updateStudentRollNo = async (req, res) => {
  try {
    const { id } = req.params;
    const { rollNo } = req.body;

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.schoolName !== req.user.schoolName && student.requestedSchool !== req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: Student belongs to another school" });
    }

    if (rollNo === "" || rollNo === null || rollNo === undefined) {
      student.rollNo = null;
      await student.save();
      return res.json({ message: "Roll number cleared successfully", student });
    }

    const numericRoll = Number(rollNo);
    if (isNaN(numericRoll) || numericRoll < 1) {
      return res.status(400).json({ message: "Roll number must be a positive number" });
    }

    // Check duplicate in same class & school
    const query = {
      _id: { $ne: student._id },
      role: "student",
      schoolName: req.user.schoolName,
      rollNo: numericRoll
    };
    if (student.classId) {
      query.classId = student.classId;
    }

    const existing = await User.findOne(query);
    if (existing) {
      const classStudents = await User.find({
        role: "student",
        schoolName: req.user.schoolName,
        ...(student.classId ? { classId: student.classId } : {})
      });
      const takenRolls = classStudents.map(s => s.rollNo).filter(Boolean);
      let nextAvailable = 1;
      while (takenRolls.includes(nextAvailable)) {
        nextAvailable++;
      }
      return res.status(409).json({
        message: `Roll number ${numericRoll} is already assigned to ${existing.name}. Next available roll number is ${nextAvailable}.`,
        nextAvailable,
        assignedTo: existing.name
      });
    }

    student.rollNo = numericRoll;
    await student.save();

    const updatedStudent = await User.findById(student._id).populate("classId", "name section").select("-password");

    res.json({
      message: `Roll number ${numericRoll} assigned successfully`,
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TEACHER PROFILE & GALLERY CONTROLLERS =================
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: "teacher", schoolName: req.user.schoolName }).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    
    const timetableClassIds = await Timetable.distinct("class", { teacher: teacher._id });
    const classes = await Class.find({
      $or: [{ teacher: teacher._id }, { _id: { $in: timetableClassIds } }],
      schoolName: req.user.schoolName
    }).select("name section");

    const timetableSubjectIds = await Timetable.distinct("subject", { teacher: teacher._id });
    const subjects = await Subject.find({
      $or: [{ teacher: teacher._id }, { _id: { $in: timetableSubjectIds } }],
      schoolName: req.user.schoolName
    }).select("name");
    
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
