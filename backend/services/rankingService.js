// backend/services/rankingService.js

/**
 * Ranking Service for Class & Grade-wide Rank Computations (Read-Only)
 * Enforces strict Final Year performance ordering:
 * 1. Final Year percentage DESC (finalAcademicPercentage / finalYearPercentage)
 * 2. Final Year raw total marks DESC (rawTotalMarks)
 * 3. Student name ASC (final deterministic tie-break)
 */

/**
 * Comparator implementing canonical Final Year tie-breaker ordering
 */
const compareStudents = (a, b) => {
  // 1. Final Year percentage DESC
  const percA = Number(a.finalAcademicPercentage ?? a.finalYearPercentage ?? a.finalPercentage ?? 0);
  const percB = Number(b.finalAcademicPercentage ?? b.finalYearPercentage ?? b.finalPercentage ?? 0);
  if (percB !== percA) {
    return percB - percA;
  }

  // 2. Final Year raw total marks DESC
  const rawA = Number(a.rawTotalMarks ?? 0);
  const rawB = Number(b.rawTotalMarks ?? 0);
  if (rawB !== rawA) {
    return rawB - rawA;
  }

  // 3. Student name ASC (deterministic tie-break)
  const nameA = String(a.studentName ?? a.name ?? "").toLowerCase();
  const nameB = String(b.studentName ?? b.name ?? "").toLowerCase();
  return nameA.localeCompare(nameB);
};

/**
 * Calculates rank position within a list of student records based strictly on Final Year merit
 */
const computeRanks = (studentRecords) => {
  if (!Array.isArray(studentRecords) || studentRecords.length === 0) {
    return [];
  }

  const sorted = [...studentRecords].sort(compareStudents);

  let currentRank = 1;
  return sorted.map((record, index) => {
    if (index > 0) {
      const prev = sorted[index - 1];
      const isTie = (
        Number(record.finalAcademicPercentage ?? record.finalYearPercentage ?? record.finalPercentage ?? 0) ===
          Number(prev.finalAcademicPercentage ?? prev.finalYearPercentage ?? prev.finalPercentage ?? 0) &&
        Number(record.rawTotalMarks ?? 0) === Number(prev.rawTotalMarks ?? 0)
      );

      if (!isTie) {
        currentRank = index + 1;
      }
    }

    return {
      ...record,
      rank: currentRank
    };
  });
};

/**
 * Computes section-level rankings (school + academicYear + class + section)
 */
const calculateClassRanks = (studentScores) => {
  return computeRanks(studentScores);
};

/**
 * Computes overall grade-level rankings across sections (school + academicYear + class)
 */
const calculateGradeRanks = (studentScores) => {
  return computeRanks(studentScores);
};

module.exports = {
  compareStudents,
  computeRanks,
  calculateClassRanks,
  calculateGradeRanks
};
