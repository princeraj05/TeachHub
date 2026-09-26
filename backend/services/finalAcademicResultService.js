// backend/services/finalAcademicResultService.js
const StudentResult = require("../models/StudentResult");
const StudentMark = require("../models/StudentMark");
const StudentEnrollment = require("../models/StudentEnrollment");

/**
 * Calculates Final Academic Result for a student (Read-Only)
 * Rule: Final Year Examination = 100% of Final Academic Result.
 * 3-Month, 6-Month, and 9-Month exam results remain independent term records.
 */
const calculateFinalAcademicResult = async ({ studentId, schoolName, academicYear }) => {
  // Query Published Final Year Result (or legacy Annual)
  const finalYearResult = await StudentResult.findOne({
    student: studentId,
    schoolName,
    academicYear,
    examTerm: { $in: ["FINAL_YEAR", "Annual"] }
  }).lean();

  const finalYearMarks = await StudentMark.find({
    student: studentId,
    schoolName,
    academicYear,
    examTerm: { $in: ["FINAL_YEAR", "Annual"] }
  }).populate("exam").lean();

  if (!finalYearResult && finalYearMarks.length === 0) {
    return {
      studentId,
      schoolName,
      academicYear,
      isFinalYearPublished: false,
      finalAcademicPercentage: 0,
      finalAcademicGrade: "N/A",
      rawTotalMarks: 0,
      status: "FINAL_YEAR_NOT_COMPLETED",
      promotionEligible: false
    };
  }

  const finalAcademicPercentage = finalYearResult?.percentage ?? (
    finalYearMarks.length > 0
      ? (finalYearMarks.reduce((sum, m) => sum + (m.marksObtained || 0), 0) /
         finalYearMarks.reduce((sum, m) => sum + (m.maxMarks || 100), 0)) * 100
      : 0
  );

  const rawTotalMarks = finalYearResult?.marksObtained ?? finalYearMarks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
  const finalAcademicGrade = finalYearResult?.grade || "N/A";
  const isFinalYearPublished = Boolean(finalYearResult?.isPublished);

  return {
    studentId,
    schoolName,
    academicYear,
    isFinalYearPublished,
    finalAcademicPercentage,
    finalAcademicGrade,
    rawTotalMarks,
    status: isFinalYearPublished ? "FINAL_YEAR_PUBLISHED" : "FINAL_YEAR_PENDING_PUBLICATION",
    promotionEligible: isFinalYearPublished
  };
};

/**
 * Dry-run preview of final academic calculations for an entire class based strictly on Final Year exam
 */
const previewFinalAcademicResultsForClass = async ({ schoolName, academicYear, classId }) => {
  const enrollments = await StudentEnrollment.find({
    schoolName,
    academicYear,
    ...(classId ? { class: classId } : {})
  }).populate("student", "name rollNo admissionNo").lean();

  const previews = [];
  for (const enrollment of enrollments) {
    const calc = await calculateFinalAcademicResult({
      studentId: enrollment.student?._id || enrollment.student,
      schoolName,
      academicYear
    });
    previews.push({
      enrollmentId: enrollment._id,
      studentName: enrollment.student?.name || "Unknown",
      rollNo: enrollment.rollNo,
      calculation: calc
    });
  }

  return previews;
};

module.exports = {
  calculateFinalAcademicResult,
  previewFinalAcademicResultsForClass
};
