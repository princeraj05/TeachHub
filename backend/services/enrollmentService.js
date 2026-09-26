// backend/services/enrollmentService.js
const StudentEnrollment = require("../models/StudentEnrollment");
const Class = require("../models/Class");
const User = require("../models/User");

/**
 * Calculates next available roll number for a student added mid-session by Admin.
 * Rule: current highest roll number in class/section + 1.
 * Existing students' roll numbers are NOT recalculated.
 */
const getNextAvailableRollNo = async ({ schoolName, academicYear, classId, section }) => {
  const existingEnrollments = await StudentEnrollment.find({
    schoolName,
    academicYear,
    class: classId,
    section
  }).lean();

  let maxRoll = 0;
  for (const e of existingEnrollments) {
    const roll = parseInt(e.rollNo, 10);
    if (!isNaN(roll) && roll > maxRoll) {
      maxRoll = roll;
    }
  }

  return maxRoll + 1;
};

/**
 * Non-destructive helper to create or update canonical StudentEnrollment record
 */
const syncStudentEnrollment = async ({
  studentId,
  schoolName,
  academicYear,
  classId,
  section,
  rollNo,
  reason = "Class/Section Update"
}) => {
  if (!studentId || !schoolName || !academicYear || !classId) {
    throw new Error("studentId, schoolName, academicYear, and classId are required to sync enrollment");
  }

  const studentUser = await User.findById(studentId).lean();
  if (!studentUser) {
    throw new Error(`Student ${studentId} not found`);
  }

  const classDoc = await Class.findById(classId).lean();
  if (!classDoc) {
    throw new Error(`Class ${classId} not found`);
  }

  const targetSection = section || studentUser.section || classDoc.section || "A";

  // If rollNo is not provided for a new enrollment, assign highest roll + 1
  let targetRoll = rollNo !== undefined ? rollNo : studentUser.rollNo;
  if (!targetRoll) {
    targetRoll = await getNextAvailableRollNo({
      schoolName,
      academicYear,
      classId,
      section: targetSection
    });
  }

  const classNameSnapshot = `Class ${classDoc.name}`;

  let enrollment = await StudentEnrollment.findOne({
    student: studentId,
    schoolName,
    academicYear
  });

  if (enrollment) {
    // Movement check within same academic year
    const classChanged = enrollment.class.toString() !== classId.toString();
    const sectionChanged = enrollment.section !== targetSection;

    if (classChanged || sectionChanged) {
      enrollment.enrollmentAuditHistory.push({
        movedFromClass: enrollment.classNameSnapshot,
        movedFromSection: enrollment.section,
        movedToClass: classNameSnapshot,
        movedToSection: targetSection,
        movedAt: new Date(),
        reason
      });

      enrollment.class = classId;
      enrollment.classNameSnapshot = classNameSnapshot;
      enrollment.section = targetSection;
    }

    if (targetRoll !== undefined && targetRoll !== null) {
      enrollment.rollNo = targetRoll;
    }

    await enrollment.save();
    return enrollment;
  }

  // Create new canonical enrollment record
  enrollment = new StudentEnrollment({
    student: studentId,
    schoolName,
    academicYear,
    class: classId,
    classNameSnapshot,
    section: targetSection,
    rollNo: targetRoll || null,
    admissionNoSnapshot: studentUser.admissionNo || "",
    status: "Active"
  });

  await enrollment.save();
  return enrollment;
};

/**
 * Fetch all canonical enrollments for a student
 */
const getStudentEnrollmentHistory = async (studentId, schoolName) => {
  const query = { student: studentId };
  if (schoolName) query.schoolName = schoolName;

  return await StudentEnrollment.find(query)
    .populate("class", "name section")
    .sort({ academicYear: -1 })
    .lean();
};

module.exports = {
  getNextAvailableRollNo,
  syncStudentEnrollment,
  getStudentEnrollmentHistory
};
