const StudentMark = require("../models/StudentMark");
const StudentResult = require("../models/StudentResult");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const {
  calculateSubjectGrade,
  calculateStudentResultSummary
} = require("../utils/resultCalculator");
const { createAppNotification } = require("../utils/notificationHelper");

// Helper: Resolve effective schoolName from authenticated context or request
const getEffectiveSchoolName = (req) => {
  if (req.user.role === "superadmin") {
    return req.query.schoolName || req.body.schoolName || req.user.schoolName || "";
  }
  return req.user.schoolName || "";
};

// Helper: Verify subject is associated with class
const isSubjectLinkedToClass = (subjectDoc, classId) => {
  if (!subjectDoc || !classId) return false;
  const cIdStr = classId.toString();
  const classArray = Array.isArray(subjectDoc.class) ? subjectDoc.class : [];
  const classesArray = Array.isArray(subjectDoc.classes) ? subjectDoc.classes : [];
  
  const matchesClass = classArray.some(c => (c._id || c).toString() === cIdStr);
  const matchesClasses = classesArray.some(c => (c._id || c).toString() === cIdStr);
  return matchesClass || matchesClasses;
};

// Helper: Teacher authorization check for class + subject
const isTeacherAuthorizedForClassAndSubject = (reqUser, classDoc, subjectDoc) => {
  if (reqUser.role !== "teacher") return true;

  const teacherId = reqUser.id.toString();
  const isSubjectTeacher = subjectDoc?.teacher?.toString() === teacherId;
  const isClassTeacher = classDoc?.teacher?.toString() === teacherId ||
    (Array.isArray(classDoc?.teachers) && classDoc.teachers.some(t => t.toString() === teacherId));

  // If subject explicitly has a teacher assigned, only that subject teacher is authorized.
  if (subjectDoc?.teacher) {
    return isSubjectTeacher;
  }
  // Otherwise, fallback to class teacher if subject has no assigned teacher.
  return isClassTeacher;
};


// ================= GET STUDENT ROSTER FOR MARKS ENTRY =================
exports.getRoster = async (req, res) => {
  try {
    const { classId, section, subjectId, examTerm, academicYear } = req.query;
    const schoolName = getEffectiveSchoolName(req);

    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!classId || !subjectId || !examTerm || !academicYear) {
      return res.status(400).json({
        message: "classId, subjectId, examTerm, and academicYear query parameters are required"
      });
    }

    if (!["Half-Yearly", "Annual"].includes(examTerm)) {
      return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
    }

    const classDoc = await Class.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (schoolName && classDoc.schoolName !== schoolName) {
      return res.status(403).json({ message: "Access Denied: Class belongs to another school" });
    }

    const subjectDoc = await Subject.findById(subjectId).lean();
    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }
    if (schoolName && subjectDoc.schoolName && subjectDoc.schoolName !== schoolName) {
      return res.status(403).json({ message: "Access Denied: Subject belongs to another school" });
    }

    // Verify subject is linked to class
    if (!isSubjectLinkedToClass(subjectDoc, classDoc._id)) {
      return res.status(400).json({ message: "Subject is not associated with the specified class" });
    }

    // Teacher authorization check (Class + Subject)
    if (req.user.role === "teacher") {
      if (!isTeacherAuthorizedForClassAndSubject(req.user, classDoc, subjectDoc)) {
        return res.status(403).json({ message: "Access Denied: You are not authorized for this class and subject" });
      }
    }

    // Fetch students enrolled in this class
    const studentQuery = {
      role: "student",
      $or: [{ classId: classDoc._id }, { _id: { $in: classDoc.students || [] } }]
    };
    if (schoolName) studentQuery.schoolName = schoolName;

    let students = await User.find(studentQuery)
      .select("name rollNo section avatar classId admissionNo")
      .lean();

    if (section && section.toUpperCase() !== "ALL") {
      students = students.filter(s => (s.section || classDoc.section || "A").toUpperCase() === section.toUpperCase());
    }

    // Sort by rollNo ascending, then name
    students.sort((a, b) => {
      const rollA = Number(a.rollNo) || 999999;
      const rollB = Number(b.rollNo) || 999999;
      if (rollA !== rollB) return rollA - rollB;
      return (a.name || "").localeCompare(b.name || "");
    });

    // Fetch existing StudentMark records for this selection
    const existingMarks = await StudentMark.find({
      class: classDoc._id,
      subject: subjectDoc._id,
      examTerm,
      academicYear,
      ...(schoolName ? { schoolName } : {})
    }).lean();

    const marksMap = new Map();
    existingMarks.forEach(m => {
      marksMap.set(m.student.toString(), m);
    });

    const roster = students.map((student, idx) => {
      const sId = student._id.toString();
      const existing = marksMap.get(sId);
      const studentRoll = student.rollNo ? String(student.rollNo) : String(idx + 1).padStart(2, "0");

      return {
        studentId: student._id,
        studentName: student.name || "Student",
        rollNo: studentRoll,
        admissionNo: student.admissionNo || "",
        section: student.section || classDoc.section || "A",
        classId: classDoc._id,
        className: `Class ${classDoc.name}`,
        marksObtained: existing ? existing.marksObtained : 0,
        maxMarks: existing ? existing.maxMarks : 100,
        isAbsent: existing ? existing.isAbsent : false,
        grade: existing ? existing.grade : "",
        remarks: existing ? existing.remarks : "",
        isSaved: !!existing
      };
    });

    res.json({
      schoolName: classDoc.schoolName,
      classId: classDoc._id,
      className: `Class ${classDoc.name}`,
      section: section || classDoc.section || "A",
      subjectId: subjectDoc._id,
      subjectName: subjectDoc.name,
      examTerm,
      academicYear,
      studentsCount: roster.length,
      roster
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= SAVE SUBJECT MARKS (SINGLE OR BULK) =================
exports.saveMarks = async (req, res) => {
  try {
    const schoolName = getEffectiveSchoolName(req);
    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    let items = [];
    if (Array.isArray(req.body)) {
      items = req.body;
    } else if (Array.isArray(req.body.marks)) {
      items = req.body.marks;
    } else if (req.body && typeof req.body === "object") {
      items = [req.body];
    }

    if (items.length === 0) {
      return res.status(400).json({ message: "No mark records provided in request body" });
    }

    const savedMarks = [];
    for (const item of items) {
      const {
        studentId,
        classId,
        section,
        subjectId,
        examTerm,
        academicYear,
        marksObtained,
        maxMarks,
        isAbsent,
        remarks
      } = item;

      if (!studentId || !classId || !subjectId || !examTerm || !academicYear) {
        return res.status(400).json({
          message: "studentId, classId, subjectId, examTerm, and academicYear are required for each mark record"
        });
      }

      if (!["Half-Yearly", "Annual"].includes(examTerm)) {
        return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
      }

      const flagAbsent = !!isAbsent;
      const numObtained = flagAbsent ? 0 : Number(marksObtained);
      const numMax = Number(maxMarks) || 100;

      if (isNaN(numObtained) || numObtained < 0) {
        return res.status(400).json({ message: `Invalid marksObtained (${marksObtained}) for student ${studentId}` });
      }

      if (isNaN(numMax) || numMax <= 0) {
        return res.status(400).json({ message: `Invalid maxMarks (${maxMarks}) for student ${studentId}` });
      }

      if (numObtained > numMax) {
        return res.status(400).json({
          message: `marksObtained (${numObtained}) cannot exceed maxMarks (${numMax}) for student ${studentId}`
        });
      }

      // Fetch trusted database models for validation & snapshots
      const studentDoc = await User.findById(studentId).lean();
      if (!studentDoc || studentDoc.role !== "student") {
        return res.status(404).json({ message: `Student ${studentId} not found` });
      }
      if (schoolName && studentDoc.schoolName && studentDoc.schoolName !== schoolName) {
        return res.status(403).json({ message: `Access Denied: Student ${studentId} belongs to another school` });
      }

      const classDoc = await Class.findById(classId).lean();
      if (!classDoc) {
        return res.status(404).json({ message: `Class ${classId} not found` });
      }
      if (schoolName && classDoc.schoolName !== schoolName) {
        return res.status(403).json({ message: `Access Denied: Class ${classId} belongs to another school` });
      }

      // Verify student belongs to class
      const isStudentInClass = studentDoc.classId?.toString() === classId.toString() ||
        (Array.isArray(classDoc.students) && classDoc.students.some(s => s.toString() === studentId.toString()));
      if (!isStudentInClass) {
        return res.status(400).json({ message: `Student ${studentId} does not belong to Class ${classDoc.name}` });
      }

      const subjectDoc = await Subject.findById(subjectId).lean();
      if (!subjectDoc) {
        return res.status(404).json({ message: `Subject ${subjectId} not found` });
      }
      if (schoolName && subjectDoc.schoolName && subjectDoc.schoolName !== schoolName) {
        return res.status(403).json({ message: `Access Denied: Subject ${subjectId} belongs to another school` });
      }

      // Verify subject is associated with class
      if (!isSubjectLinkedToClass(subjectDoc, classDoc._id)) {
        return res.status(400).json({ message: `Subject ${subjectDoc.name} is not associated with Class ${classDoc.name}` });
      }

      // Check if term results are already published for this student
      const publishedResult = await StudentResult.findOne({
        student: studentId,
        examTerm,
        academicYear,
        ...(schoolName ? { schoolName } : {}),
        isPublished: true
      }).lean();

      if (publishedResult) {
        return res.status(400).json({
          message: `Cannot modify marks: Result for ${examTerm} ${academicYear} has already been published. Unpublish first to edit.`
        });
      }

      // Teacher permission check (Class + Subject)
      if (req.user.role === "teacher") {
        if (!isTeacherAuthorizedForClassAndSubject(req.user, classDoc, subjectDoc)) {
          return res.status(403).json({ message: `Access Denied: Teacher not authorized for Class ${classDoc.name} - ${subjectDoc.name}` });
        }
      }

      // Server-side authoritative grade calculation
      const calculatedGrade = calculateSubjectGrade(numObtained, numMax, flagAbsent);
      const targetSection = section || studentDoc.section || classDoc.section || "A";

      const markDoc = await StudentMark.findOneAndUpdate(
        {
          student: studentId,
          subject: subjectId,
          examTerm,
          academicYear
        },
        {
          $set: {
            student: studentId,
            class: classId,
            section: targetSection,
            subject: subjectId,
            examTerm,
            academicYear,
            marksObtained: numObtained,
            maxMarks: numMax,
            isAbsent: flagAbsent,
            grade: calculatedGrade,
            remarks: remarks || "",
            schoolName: classDoc.schoolName || schoolName,
            teacher: req.user.role === "teacher" ? req.user.id : null,
            studentNameSnapshot: studentDoc.name || "",
            classNameSnapshot: `Class ${classDoc.name}`,
            sectionSnapshot: targetSection,
            subjectNameSnapshot: subjectDoc.name || ""
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      savedMarks.push(markDoc);

      // Auto-recalculate StudentResult summary record for student
      const allStudentMarks = await StudentMark.find({
        student: studentId,
        class: classId,
        examTerm,
        academicYear,
        ...(schoolName ? { schoolName } : {})
      }).lean();

      const summary = calculateStudentResultSummary(allStudentMarks);

      await StudentResult.findOneAndUpdate(
        {
          student: studentId,
          examTerm,
          academicYear
        },
        {
          $set: {
            student: studentId,
            class: classId,
            section: targetSection,
            examTerm,
            academicYear,
            totalMarksObtained: summary.totalMarksObtained,
            totalMaxMarks: summary.totalMaxMarks,
            percentage: summary.percentage,
            overallGrade: summary.overallGrade,
            overallResult: summary.overallResult,
            schoolName: classDoc.schoolName || schoolName,
            studentNameSnapshot: studentDoc.name || "",
            classNameSnapshot: `Class ${classDoc.name}`,
            sectionSnapshot: targetSection,
            rollNoSnapshot: studentDoc.rollNo || "",
            admissionNoSnapshot: studentDoc.admissionNo || ""
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    res.json({
      message: "Marks saved successfully",
      count: savedMarks.length,
      marks: savedMarks
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= GET CLASS RESULT SUMMARY (ADMIN REVIEW) =================
exports.getClassSummary = async (req, res) => {
  try {
    const { classId, section, examTerm, academicYear } = req.query;
    const schoolName = getEffectiveSchoolName(req);

    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!classId || !examTerm || !academicYear) {
      return res.status(400).json({ message: "classId, examTerm, and academicYear are required" });
    }

    if (!["Half-Yearly", "Annual"].includes(examTerm)) {
      return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
    }

    const classDoc = await Class.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (schoolName && classDoc.schoolName !== schoolName) {
      return res.status(403).json({ message: "Access Denied: Class belongs to another school" });
    }

    // Teacher authorization check for class summary
    if (req.user.role === "teacher") {
      const teacherId = req.user.id.toString();
      const isClassTeacher = classDoc.teacher?.toString() === teacherId ||
        (Array.isArray(classDoc.teachers) && classDoc.teachers.some(t => t.toString() === teacherId));
      
      const isSubjectTeacher = await Subject.exists({
        $or: [{ class: classDoc._id }, { classes: classDoc._id }],
        teacher: req.user.id,
        ...(schoolName ? { schoolName } : {})
      });

      if (!isClassTeacher && !isSubjectTeacher) {
        return res.status(403).json({ message: "Access Denied: You are not assigned to this class" });
      }
    }

    // Fetch subjects assigned to class
    const subjects = await Subject.find({
      $or: [{ class: classDoc._id }, { classes: classDoc._id }],
      ...(schoolName ? { schoolName } : {})
    }).lean();

    // Fetch enrolled students
    const studentQuery = {
      role: "student",
      $or: [{ classId: classDoc._id }, { _id: { $in: classDoc.students || [] } }]
    };
    if (schoolName) studentQuery.schoolName = schoolName;

    let students = await User.find(studentQuery)
      .select("name rollNo section avatar classId admissionNo")
      .lean();

    if (section && section.toUpperCase() !== "ALL") {
      students = students.filter(s => (s.section || classDoc.section || "A").toUpperCase() === section.toUpperCase());
    }

    students.sort((a, b) => {
      const rollA = Number(a.rollNo) || 999999;
      const rollB = Number(b.rollNo) || 999999;
      if (rollA !== rollB) return rollA - rollB;
      return (a.name || "").localeCompare(b.name || "");
    });

    // Fetch all StudentMark records for class
    const allMarks = await StudentMark.find({
      class: classDoc._id,
      examTerm,
      academicYear,
      ...(schoolName ? { schoolName } : {})
    }).lean();

    // Fetch all StudentResult records for class
    const allResults = await StudentResult.find({
      class: classDoc._id,
      examTerm,
      academicYear,
      ...(schoolName ? { schoolName } : {})
    }).lean();

    const marksByStudent = new Map();
    allMarks.forEach(m => {
      const sId = m.student.toString();
      if (!marksByStudent.has(sId)) marksByStudent.set(sId, []);
      marksByStudent.get(sId).push(m);
    });

    const resultsByStudent = new Map();
    allResults.forEach(r => {
      resultsByStudent.set(r.student.toString(), r);
    });

    let publishedCount = 0;
    const summaryRoster = students.map((student, idx) => {
      const sId = student._id.toString();
      const studentMarks = marksByStudent.get(sId) || [];
      const resultDoc = resultsByStudent.get(sId);
      const isPublished = resultDoc ? resultDoc.isPublished : false;
      if (isPublished) publishedCount++;

      const summary = calculateStudentResultSummary(studentMarks);
      const studentRoll = student.rollNo ? String(student.rollNo) : String(idx + 1).padStart(2, "0");

      return {
        studentId: student._id,
        studentName: student.name || "Student",
        rollNo: studentRoll,
        admissionNo: student.admissionNo || "",
        section: student.section || classDoc.section || "A",
        subjectsExpected: subjects.length,
        subjectsCompleted: studentMarks.length,
        subjectsMissing: Math.max(0, subjects.length - studentMarks.length),
        totalMarksObtained: summary.totalMarksObtained,
        totalMaxMarks: summary.totalMaxMarks,
        percentage: summary.percentage,
        overallGrade: summary.overallGrade,
        overallResult: summary.overallResult,
        isPublished,
        publishedAt: resultDoc ? resultDoc.publishedAt : null
      };
    });

    res.json({
      schoolName: classDoc.schoolName,
      classId: classDoc._id,
      className: `Class ${classDoc.name}`,
      section: section || classDoc.section || "A",
      examTerm,
      academicYear,
      totalSubjects: subjects.length,
      totalStudents: summaryRoster.length,
      publishedCount,
      isClassPublished: summaryRoster.length > 0 && publishedCount === summaryRoster.length,
      roster: summaryRoster
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= PUBLISH CLASS TERM RESULTS =================
exports.publishResults = async (req, res) => {
  try {
    const { classId, section, examTerm, academicYear, studentId } = req.body;
    const schoolName = getEffectiveSchoolName(req);

    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!classId || !examTerm || !academicYear) {
      return res.status(400).json({ message: "classId, examTerm, and academicYear are required" });
    }

    if (!["Half-Yearly", "Annual"].includes(examTerm)) {
      return res.status(400).json({ message: "examTerm must be either 'Half-Yearly' or 'Annual'" });
    }

    const classDoc = await Class.findById(classId).lean();
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }
    if (schoolName && classDoc.schoolName !== schoolName) {
      return res.status(403).json({ message: "Access Denied: Class belongs to another school" });
    }

    // Fetch expected subjects assigned to class
    const expectedSubjects = await Subject.find({
      $or: [{ class: classDoc._id }, { classes: classDoc._id }],
      ...(schoolName ? { schoolName } : {})
    }).lean();

    if (expectedSubjects.length === 0) {
      return res.status(400).json({
        message: `Cannot publish: No subjects are associated with Class ${classDoc.name}`
      });
    }

    let students = [];
    if (studentId) {
      const singleStudent = await User.findById(studentId).lean();
      if (!singleStudent || singleStudent.role !== "student") {
        return res.status(404).json({ message: "Student not found" });
      }
      if (schoolName && singleStudent.schoolName && singleStudent.schoolName !== schoolName) {
        return res.status(403).json({ message: "Access Denied: Student belongs to another school" });
      }
      students = [singleStudent];
    } else {
      const studentQuery = {
        role: "student",
        $or: [{ classId: classDoc._id }, { _id: { $in: classDoc.students || [] } }]
      };
      if (schoolName) studentQuery.schoolName = schoolName;

      students = await User.find(studentQuery).select("name section classId rollNo admissionNo").lean();
      if (section && section.toUpperCase() !== "ALL") {
        students = students.filter(s => (s.section || classDoc.section || "A").toUpperCase() === section.toUpperCase());
      }
    }

    if (students.length === 0) {
      return res.status(400).json({ message: "No students found to publish results for" });
    }

    // Comprehensive Subject-Level Completeness Verification
    const expectedSubjectIds = new Set(expectedSubjects.map(s => s._id.toString()));
    const incompleteStudents = [];

    for (const student of students) {
      const sId = student._id.toString();
      const studentMarks = await StudentMark.find({
        student: student._id,
        class: classDoc._id,
        examTerm,
        academicYear,
        ...(schoolName ? { schoolName } : {})
      }).lean();

      const enteredSubjectIds = new Set(studentMarks.map(m => m.subject.toString()));
      const missingSubjectNames = expectedSubjects
        .filter(s => !enteredSubjectIds.has(s._id.toString()))
        .map(s => s.name);

      if (missingSubjectNames.length > 0) {
        incompleteStudents.push({
          studentId: student._id,
          studentName: student.name,
          rollNo: student.rollNo || "",
          expectedCount: expectedSubjects.length,
          enteredCount: studentMarks.length,
          missingCount: missingSubjectNames.length,
          missingSubjects: missingSubjectNames
        });
      }
    }

    // STRICT REJECTION: Reject publish if ANY student has incomplete subject marks
    if (incompleteStudents.length > 0) {
      return res.status(400).json({
        message: `Cannot publish: ${incompleteStudents.length} student(s) have incomplete subject marks. All expected subjects must have entered marks for every student.`,
        incompleteCount: incompleteStudents.length,
        incompleteStudents
      });
    }

    // Complete: Perform publish operation on StudentResult and StudentMark records
    const publishedResults = [];
    for (const student of students) {
      const studentMarks = await StudentMark.find({
        student: student._id,
        class: classDoc._id,
        examTerm,
        academicYear,
        ...(schoolName ? { schoolName } : {})
      }).lean();

      const summary = calculateStudentResultSummary(studentMarks);
      const targetSection = student.section || classDoc.section || "A";

      const resultDoc = await StudentResult.findOneAndUpdate(
        {
          student: student._id,
          examTerm,
          academicYear
        },
        {
          $set: {
            student: student._id,
            class: classDoc._id,
            section: targetSection,
            examTerm,
            academicYear,
            totalMarksObtained: summary.totalMarksObtained,
            totalMaxMarks: summary.totalMaxMarks,
            percentage: summary.percentage,
            overallGrade: summary.overallGrade,
            overallResult: summary.overallResult,
            isPublished: true,
            publishedAt: new Date(),
            publishedBy: req.user.id,
            schoolName: classDoc.schoolName || schoolName,
            studentNameSnapshot: student.name || "",
            classNameSnapshot: `Class ${classDoc.name}`,
            sectionSnapshot: targetSection,
            rollNoSnapshot: student.rollNo || "",
            admissionNoSnapshot: student.admissionNo || ""
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      publishedResults.push(resultDoc);

      // Update StudentMark isPublished flag to match
      await StudentMark.updateMany(
        {
          student: student._id,
          class: classDoc._id,
          examTerm,
          academicYear,
          ...(schoolName ? { schoolName } : {})
        },
        { $set: { isPublished: true } }
      );

      // Notify student about published academic result
      try {
        await createAppNotification({
          recipient: student._id,
          schoolName: classDoc.schoolName || schoolName,
          role: "student",
          title: `${examTerm} Academic Results Published`,
          message: `Your ${examTerm} examination results for Class ${classDoc.name} (${academicYear}) have been published.`,
          category: "Exams",
          link: "/student/results"
        });
      } catch (notifErr) {
        console.error("Result publish notification error:", notifErr);
      }
    }

    res.json({
      message: `${publishedResults.length} result(s) published successfully`,
      publishedCount: publishedResults.length,
      publishedResults
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= UNPUBLISH CLASS TERM RESULTS =================
exports.unpublishResults = async (req, res) => {
  try {
    const { classId, section, examTerm, academicYear, studentId } = req.body;
    const schoolName = getEffectiveSchoolName(req);

    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    if (!classId || !examTerm || !academicYear) {
      return res.status(400).json({ message: "classId, examTerm, and academicYear are required" });
    }

    const query = {
      class: classId,
      examTerm,
      academicYear,
      ...(schoolName ? { schoolName } : {})
    };

    if (studentId) {
      query.student = studentId;
    }

    const updateRes = await StudentResult.updateMany(query, { $set: { isPublished: false } });

    // Also update StudentMark isPublished flag
    await StudentMark.updateMany(query, { $set: { isPublished: false } });

    res.json({
      message: "Results unpublished successfully",
      count: updateRes.modifiedCount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= GET PUBLISHED RESULTS FOR LOGGED-IN STUDENT =================
exports.getStudentPublishedResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const schoolName = req.user.schoolName;

    if (!studentId) {
      return res.status(401).json({ message: "User ID missing from token" });
    }

    // Strict student self-access & published guard
    const results = await StudentResult.find({
      student: studentId,
      isPublished: true,
      ...(schoolName ? { schoolName } : {})
    })
      .sort({ academicYear: -1, examTerm: 1 })
      .lean();

    if (results.length === 0) {
      return res.json([]);
    }

    const formattedResults = [];
    for (const resDoc of results) {
      const marks = await StudentMark.find({
        student: studentId,
        examTerm: resDoc.examTerm,
        academicYear: resDoc.academicYear,
        ...(schoolName ? { schoolName } : {})
      })
        .populate("subject", "name")
        .lean();

      const subjectsList = marks.map(m => ({
        subjectId: m.subject?._id || m.subject,
        subjectName: m.subjectNameSnapshot || m.subject?.name || "Subject",
        marksObtained: m.marksObtained,
        maxMarks: m.maxMarks,
        isAbsent: m.isAbsent,
        grade: m.grade,
        remarks: m.remarks
      }));

      formattedResults.push({
        resultId: resDoc._id,
        examTerm: resDoc.examTerm,
        academicYear: resDoc.academicYear,
        className: resDoc.classNameSnapshot || "Class",
        section: resDoc.sectionSnapshot || "A",
        totalMarksObtained: resDoc.totalMarksObtained,
        totalMaxMarks: resDoc.totalMaxMarks,
        percentage: resDoc.percentage,
        overallGrade: resDoc.overallGrade,
        overallResult: resDoc.overallResult,
        publishedAt: resDoc.publishedAt,
        teacherRemarks: resDoc.teacherRemarks || "",
        subjects: subjectsList
      });
    }

    res.json(formattedResults);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

