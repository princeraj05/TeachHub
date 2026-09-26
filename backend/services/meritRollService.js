// backend/services/meritRollService.js
const { computeRanks } = require("./rankingService");

/**
 * Merit Roll Service (Read-Only)
 * Orders students strictly by Final Year Examination performance:
 * 1. Final Year percentage DESC
 * 2. Final Year raw total marks DESC
 * 3. Student name ASC
 *
 * Higher Final Year performance gets the earlier merit roll number in the new academic year.
 */

/**
 * Generates merit roll list and assigns proposed roll numbers for the next academic year
 */
const generateMeritRoll = (studentSummaries) => {
  if (!Array.isArray(studentSummaries) || studentSummaries.length === 0) {
    return [];
  }

  const rankedStudents = computeRanks(studentSummaries);

  return rankedStudents.map((student, index) => ({
    ...student,
    meritPosition: index + 1,
    proposedRollNo: index + 1
  }));
};

module.exports = {
  generateMeritRoll
};
