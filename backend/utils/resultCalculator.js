/**
 * Result & Grade Calculation Utility for TeachHub School Result System
 */

// Calculate individual subject grade
const calculateSubjectGrade = (marksObtained, maxMarks, isAbsent = false) => {
  if (isAbsent) return "AB";
  if (!maxMarks || maxMarks <= 0) return "F";
  const pct = (marksObtained / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 33) return "D";
  return "F";
};

// Check if a single subject mark passes (>= 33% and not absent)
const isSubjectPassed = (marksObtained, maxMarks, isAbsent = false) => {
  if (isAbsent) return false;
  if (!maxMarks || maxMarks <= 0) return false;
  const pct = (marksObtained / maxMarks) * 100;
  return pct >= 33;
};

// Calculate overall summary from array of StudentMark objects
const calculateStudentResultSummary = (marksList = []) => {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  let hasFailedSubject = false;

  for (const item of marksList) {
    const obtained = item.isAbsent ? 0 : (Number(item.marksObtained) || 0);
    const max = Number(item.maxMarks) || 100;
    
    totalMarksObtained += obtained;
    totalMaxMarks += max;

    if (!isSubjectPassed(obtained, max, item.isAbsent)) {
      hasFailedSubject = true;
    }
  }

  const percentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
  const overallResult = (marksList.length > 0 && !hasFailedSubject) ? "PASS" : "FAIL";

  let overallGrade = "F";
  if (overallResult === "PASS") {
    if (percentage >= 90) overallGrade = "A+";
    else if (percentage >= 80) overallGrade = "A";
    else if (percentage >= 70) overallGrade = "B+";
    else if (percentage >= 60) overallGrade = "B";
    else if (percentage >= 50) overallGrade = "C";
    else overallGrade = "D";
  }

  return {
    totalMarksObtained,
    totalMaxMarks,
    percentage,
    overallGrade,
    overallResult
  };
};

module.exports = {
  calculateSubjectGrade,
  isSubjectPassed,
  calculateStudentResultSummary
};
