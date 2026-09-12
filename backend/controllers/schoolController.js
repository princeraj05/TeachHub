// backend/controllers/schoolController.js
// Backward-compatibility wrapper exporting modular school controllers & services

const { getMySchool, getCompletionBreakdown, updateMySchool } = require("./school/schoolProfileController");
const { uploadSchoolPhoto } = require("./school/schoolMediaController");
const { getSchools, getSchoolDetails, getSchoolTeachers } = require("./school/schoolPublicController");

const { getBasicInfo, updateBasicInfo } = require("./school/basicInformationController");
const { getMediaPrincipalInfo, updateMediaPrincipalInfo } = require("./school/mediaPrincipalController");
const { getAdmissionSettingsInfo, updateAdmissionSettingsInfo } = require("./school/admissionSettingsController");
const { getDescriptionInfo, updateDescriptionInfo } = require("./school/schoolDescriptionController");

const { resolveSchoolForAdmin, findTargetSchool, normalizeName } = require("../services/school/schoolResolverService");
const { getSchoolStatistics } = require("../services/school/schoolStatisticsService");
const { calculateProfileCompletion, calculateCompletionBreakdown, normalizeSchoolData } = require("../services/school/schoolProfileService");

module.exports = {
  // Controller functions
  getMySchool,
  getCompletionBreakdown,
  updateMySchool,
  uploadSchoolPhoto,
  getSchools,
  getSchoolDetails,
  getSchoolTeachers,

  // Modular controller exports
  getBasicInfo,
  updateBasicInfo,
  getMediaPrincipalInfo,
  updateMediaPrincipalInfo,
  getAdmissionSettingsInfo,
  updateAdmissionSettingsInfo,
  getDescriptionInfo,
  updateDescriptionInfo,

  // Helper/Service functions (preserved for backward compatibility)
  findTargetSchool,
  resolveSchoolForAdmin,
  getSchoolStatistics,
  calculateProfileCompletion,
  calculateCompletionBreakdown,
  normalizeSchoolData,
  normalizeName
};
