// backend/services/school/admissionSettingsService.js
const School = require("../../models/School");
const { measureDatabaseOperation } = require("../../utils/databaseDiagnostics");
const { resolveSchoolForAdmin } = require("./schoolResolverService");

const ADMISSION_SETTINGS_PROJECTION = "schoolCategoriesList admissionProcess schoolBoardType workingDays openingTime closingTime shortBreakStartTime shortBreakDuration lunchBreakStartTime lunchBreakDuration holidays admissionExam directAdmission schoolTypes adminId name";

const getAdmissionSettings = async ({ adminUserId, targetSchoolName, adminEmail, reqId }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });
  if (!school) return null;

  const admissionData = await measureDatabaseOperation("School.findAdmissionSettings", reqId, async () => {
    return await School.findById(school._id)
      .select(ADMISSION_SETTINGS_PROJECTION)
      .lean();
  });

  return admissionData;
};

const updateAdmissionSettings = async ({ adminUserId, targetSchoolName, adminEmail, reqId, updateData }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });

  if (!school) {
    const { normalizeName } = require("./schoolResolverService");
    const name = targetSchoolName || "My School";
    school = await School.create({
      adminId: adminUserId,
      name: name,
      normalizedName: normalizeName(name),
      status: "Active"
    });
  }

  const updateFields = {};

  const getVal = (field, fallbackField) => {
    if (updateData[field] !== undefined) return updateData[field];
    if (fallbackField && updateData.admission && updateData.admission[fallbackField] !== undefined) return updateData.admission[fallbackField];
    if (fallbackField && updateData.availability && updateData.availability[fallbackField] !== undefined) return updateData.availability[fallbackField];
    return undefined;
  };

  const cats = getVal("schoolCategoriesList", "categories");
  if (cats !== undefined && Array.isArray(cats)) updateFields.schoolCategoriesList = cats;

  const proc = getVal("admissionProcess", "processes");
  if (proc !== undefined) {
    updateFields.admissionProcess = Array.isArray(proc) ? proc : (proc ? [proc] : []);
  }

  const board = getVal("schoolBoardType", "schoolType");
  if (board !== undefined) updateFields.schoolBoardType = board;

  const days = getVal("workingDays", "workingDays");
  if (days !== undefined && Array.isArray(days)) updateFields.workingDays = days;

  const openT = getVal("openingTime", "openingTime");
  if (openT !== undefined) updateFields.openingTime = openT;

  const closeT = getVal("closingTime", "closingTime");
  if (closeT !== undefined) updateFields.closingTime = closeT;

  const shortStart = getVal("shortBreakStartTime", "shortBreakStartTime");
  if (shortStart !== undefined) updateFields.shortBreakStartTime = shortStart;

  const shortDur = getVal("shortBreakDuration", "shortBreakDuration");
  if (shortDur !== undefined) {
    const dur = Number(shortDur);
    updateFields.shortBreakDuration = isNaN(dur) ? 30 : dur;
  }

  const lunchStart = getVal("lunchBreakStartTime", "lunchBreakStartTime");
  if (lunchStart !== undefined) updateFields.lunchBreakStartTime = lunchStart;

  const lunchDur = getVal("lunchBreakDuration", "lunchBreakDuration");
  if (lunchDur !== undefined) {
    const dur = Number(lunchDur);
    updateFields.lunchBreakDuration = isNaN(dur) ? 60 : dur;
  }

  const hols = getVal("holidays", "holidays");
  if (hols !== undefined && Array.isArray(hols)) updateFields.holidays = hols;

  if (updateData.admissionExam !== undefined) updateFields.admissionExam = updateData.admissionExam;
  if (updateData.directAdmission !== undefined) updateFields.directAdmission = updateData.directAdmission;
  if (updateData.schoolTypes !== undefined && Array.isArray(updateData.schoolTypes)) updateFields.schoolTypes = updateData.schoolTypes;

  const updatedSchool = await measureDatabaseOperation("School.updateAdmissionSettings", reqId, async () => {
    return await School.findByIdAndUpdate(
      school._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select(ADMISSION_SETTINGS_PROJECTION);
  });

  return updatedSchool;
};

module.exports = {
  getAdmissionSettings,
  updateAdmissionSettings
};

