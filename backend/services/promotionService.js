// backend/services/promotionService.js
const { resolveTargetClass } = require("./targetClassService");
const StudentEnrollment = require("../models/StudentEnrollment");
const { calculateFinalAcademicResult } = require("./finalAcademicResultService");

/**
 * Evaluates individual student promotion status based on published Final Year Examination result (Read-Only)
 */
const evaluateStudentPromotion = ({
  studentId,
  currentClassName,
  isFinalYearPublished,
  finalAcademicPercentage,
  passThreshold = 33
}) => {
  if (!isFinalYearPublished) {
    return {
      studentId,
      currentClassName,
      finalPercentage: finalAcademicPercentage,
      status: "BLOCKED_FINAL_YEAR_NOT_PUBLISHED",
      targetClassName: currentClassName,
      isGraduation: false
    };
  }

  const isPassed = finalAcademicPercentage >= passThreshold;
  const isRetained = !isPassed;

  const resolution = resolveTargetClass({
    currentClassName,
    isRetained
  });

  return {
    studentId,
    currentClassName,
    finalPercentage: finalAcademicPercentage,
    status: resolution.status,
    targetClassName: resolution.targetClassName,
    isGraduation: resolution.isGraduation
  };
};

/**
 * Generates a read-only promotion preview for an entire class or school year strictly driven by Final Year results
 */
const previewClassPromotion = async ({
  schoolName,
  sourceAcademicYear,
  targetAcademicYear,
  classId,
  passThreshold = 33
}) => {
  const query = { schoolName, academicYear: sourceAcademicYear };
  if (classId) query.class = classId;

  const enrollments = await StudentEnrollment.find(query)
    .populate("student", "name rollNo admissionNo")
    .populate("class", "name section")
    .lean();

  const evaluations = [];
  for (const enrollment of enrollments) {
    const currentClassName = enrollment.classNameSnapshot || (enrollment.class ? `Class ${enrollment.class.name}` : "Class 1");

    // Perform read-only result computation based strictly on Final Year exam
    const resultCalc = await calculateFinalAcademicResult({
      studentId: enrollment.student?._id || enrollment.student,
      schoolName,
      academicYear: sourceAcademicYear
    });

    const evalResult = evaluateStudentPromotion({
      studentId: enrollment.student?._id || enrollment.student,
      currentClassName,
      isFinalYearPublished: resultCalc.isFinalYearPublished,
      finalAcademicPercentage: resultCalc.finalAcademicPercentage,
      passThreshold
    });

    evaluations.push({
      enrollmentId: enrollment._id,
      studentName: enrollment.student?.name || "Unknown",
      admissionNo: enrollment.admissionNoSnapshot || enrollment.student?.admissionNo,
      currentClass: currentClassName,
      section: enrollment.section,
      targetClass: evalResult.targetClassName,
      targetAcademicYear,
      status: evalResult.status,
      calculatedPercentage: resultCalc.finalAcademicPercentage,
      calculatedGrade: resultCalc.finalAcademicGrade,
      isFinalYearPublished: resultCalc.isFinalYearPublished
    });
  }

  return {
    schoolName,
    sourceAcademicYear,
    targetAcademicYear,
    totalEvaluated: evaluations.length,
    promotedCount: evaluations.filter(e => e.status === "PROMOTED").length,
    retainedCount: evaluations.filter(e => e.status === "RETAINED").length,
    graduatedCount: evaluations.filter(e => e.status === "GRADUATED").length,
    blockedCount: evaluations.filter(e => e.status === "BLOCKED_FINAL_YEAR_NOT_PUBLISHED").length,
    evaluations
  };
};

module.exports = {
  evaluateStudentPromotion,
  previewClassPromotion
};
