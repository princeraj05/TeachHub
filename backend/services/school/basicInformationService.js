// backend/services/school/basicInformationService.js
const School = require("../../models/School");
const User = require("../../models/User");
const { measureDatabaseOperation } = require("../../utils/databaseDiagnostics");
const { resolveSchoolForAdmin } = require("./schoolResolverService");

const BASIC_INFO_PROJECTION = "name code affiliation academicYear email phoneNumber address latitude longitude established status registrationNumber category motto photo availableClasses website adminId normalizedName profileCompletion principalName medium";

const getBasicInformation = async ({ adminUserId, targetSchoolName, adminEmail, reqId }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });
  if (!school) {
    return {
      name: targetSchoolName || ""
    };
  }

  const basicData = await measureDatabaseOperation("School.findBasicInfo", reqId, async () => {
    return await School.findById(school._id)
      .select(BASIC_INFO_PROJECTION)
      .lean();
  });

  if (basicData && !basicData.name && targetSchoolName) {
    basicData.name = targetSchoolName;
  }

  return basicData;
};

const updateBasicInformation = async ({ adminUserId, targetSchoolName, adminEmail, reqId, updateData }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });

  const rawUpdateName = updateData.name || (updateData.basicInfo && updateData.basicInfo.name);
  const resolvedName = (rawUpdateName && typeof rawUpdateName === "string" && rawUpdateName.trim()) || targetSchoolName || "";

  if (!school) {
    if (!resolvedName) {
      throw new Error("Validation failed: name: Path `name` is required.");
    }
    const { normalizeName } = require("./schoolResolverService");
    school = await School.create({
      adminId: adminUserId,
      name: resolvedName,
      normalizedName: normalizeName(resolvedName),
      status: "Active"
    });
  }

  const allowedFields = [
    "name", "code", "affiliation", "academicYear", "email", "phoneNumber",
    "address", "latitude", "longitude", "established", "status",
    "registrationNumber", "category", "motto", "photo", "availableClasses", "website", "medium"
  ];

  const updateFields = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      if (field === "name") {
        const val = updateData.name && typeof updateData.name === "string" && updateData.name.trim();
        if (val) {
          updateFields.name = val;
          const { normalizeName } = require("./schoolResolverService");
          updateFields.normalizedName = normalizeName(val);
        } else if (resolvedName) {
          updateFields.name = resolvedName;
          const { normalizeName } = require("./schoolResolverService");
          updateFields.normalizedName = normalizeName(resolvedName);
        }
      } else {
        updateFields[field] = updateData[field];
      }
    }
  }

  // Handle nested basicInfo fallback payload
  if (updateData.basicInfo) {
    const b = updateData.basicInfo;
    if (b.schoolEmail !== undefined && updateFields.email === undefined) updateFields.email = b.schoolEmail;
    if (b.phoneNumber !== undefined && updateFields.phoneNumber === undefined) updateFields.phoneNumber = b.phoneNumber;
    if (b.schoolAddress !== undefined && updateFields.address === undefined) updateFields.address = b.schoolAddress;
    if (b.established !== undefined && updateFields.established === undefined) updateFields.established = b.established;
    if (b.schoolCode !== undefined && updateFields.code === undefined) updateFields.code = b.schoolCode;
    if (b.affiliation !== undefined && updateFields.affiliation === undefined) updateFields.affiliation = b.affiliation;
    if (b.academicYear !== undefined && updateFields.academicYear === undefined) updateFields.academicYear = b.academicYear;
    if (b.medium !== undefined && updateFields.medium === undefined) updateFields.medium = b.medium;
    if (b.website !== undefined && updateFields.website === undefined) updateFields.website = b.website;
    if (b.logo !== undefined && updateFields.photo === undefined) updateFields.photo = b.logo;
  }

  if (!updateFields.name && resolvedName) {
    updateFields.name = resolvedName;
    const { normalizeName } = require("./schoolResolverService");
    updateFields.normalizedName = normalizeName(resolvedName);
  }

  const updatedSchool = await measureDatabaseOperation("School.updateBasicInfo", reqId, async () => {
    return await School.findByIdAndUpdate(
      school._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select(BASIC_INFO_PROJECTION);
  });

  if (updatedSchool && updatedSchool.name) {
    User.findByIdAndUpdate(adminUserId, {
      schoolName: updatedSchool.name,
      requestedSchool: updatedSchool.name
    }).catch(err => console.warn("Error syncing schoolName to User:", err.message));
  }

  return updatedSchool;
};

module.exports = {
  getBasicInformation,
  updateBasicInformation
};
