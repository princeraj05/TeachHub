// backend/controllers/schoolController.js
// Backward-compatibility wrapper exporting modular school controllers & services

const { getMySchool, updateMySchool } = require("./school/schoolProfileController");
const { uploadSchoolPhoto } = require("./school/schoolMediaController");
const { getSchools, getSchoolDetails, getSchoolTeachers } = require("./school/schoolPublicController");

const { resolveSchoolForAdmin, findTargetSchool, normalizeName } = require("../services/school/schoolResolverService");
const { getSchoolStatistics } = require("../services/school/schoolStatisticsService");
const { calculateProfileCompletion, normalizeSchoolData } = require("../services/school/schoolProfileService");

module.exports = {
  // Controller functions
  getMySchool,
  updateMySchool,
  uploadSchoolPhoto,
  getSchools,
  getSchoolDetails,
  getSchoolTeachers,

  // Helper/Service functions (preserved for backward compatibility)
  findTargetSchool,
  resolveSchoolForAdmin,
  getSchoolStatistics,
  calculateProfileCompletion,
  normalizeSchoolData,
  normalizeName
};
