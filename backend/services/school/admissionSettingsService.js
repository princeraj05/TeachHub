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

  const allowedFields = [
    "schoolCategoriesList", "admissionProcess", "schoolBoardType", "workingDays",
    "openingTime", "closingTime", "shortBreakStartTime", "shortBreakDuration",
    "lunchBreakStartTime", "lunchBreakDuration", "holidays", "admissionExam",
    "directAdmission", "schoolTypes"
  ];

  const updateFields = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updateFields[field] = updateData[field];
    }
  }

  const admission = updateData.admission || {};
  const availability = updateData.availability || {};

  if (updateData.schoolCategoriesList !== undefined || admission.categories !== undefined) updateFields.schoolCategoriesList = updateData.schoolCategoriesList ?? admission.categories;
  if (updateData.admissionProcess !== undefined || admission.processes !== undefined) updateFields.admissionProcess = updateData.admissionProcess ?? admission.processes;
  if (updateData.schoolBoardType !== undefined || admission.schoolType !== undefined) updateFields.schoolBoardType = updateData.schoolBoardType ?? admission.schoolType;

  if (updateData.workingDays !== undefined || availability.workingDays !== undefined) updateFields.workingDays = updateData.workingDays ?? availability.workingDays;
  if (updateData.openingTime !== undefined || availability.openingTime !== undefined) updateFields.openingTime = updateData.openingTime ?? availability.openingTime;
  if (updateData.closingTime !== undefined || availability.closingTime !== undefined) updateFields.closingTime = updateData.closingTime ?? availability.closingTime;
  if (updateData.shortBreakStartTime !== undefined) updateFields.shortBreakStartTime = updateData.shortBreakStartTime;
  if (updateData.shortBreakDuration !== undefined) updateFields.shortBreakDuration = Number(updateData.shortBreakDuration);
  if (updateData.lunchBreakStartTime !== undefined || availability.lunchBreakStartTime !== undefined) updateFields.lunchBreakStartTime = updateData.lunchBreakStartTime ?? availability.lunchBreakStartTime;
  if (updateData.lunchBreakDuration !== undefined || availability.lunchBreakDuration !== undefined) {
    const dur = Number(updateData.lunchBreakDuration ?? availability.lunchBreakDuration);
    updateFields.lunchBreakDuration = isNaN(dur) ? 60 : dur;
  }
  if (updateData.holidays !== undefined || availability.holidays !== undefined) updateFields.holidays = updateData.holidays ?? availability.holidays;

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
