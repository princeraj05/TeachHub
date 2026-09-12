// backend/services/school/mediaPrincipalService.js
const School = require("../../models/School");
const { measureDatabaseOperation } = require("../../utils/databaseDiagnostics");
const { resolveSchoolForAdmin } = require("./schoolResolverService");

const MEDIA_PRINCIPAL_PROJECTION = "coverImage coverPosition schoolPhotos principalPhoto principalName principalDesignation principalEmail principalPhone principalLeadershipSince principalIntroduction adminId name";

const getMediaPrincipal = async ({ adminUserId, targetSchoolName, adminEmail, reqId }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });
  if (!school) return null;

  const mediaData = await measureDatabaseOperation("School.findMediaPrincipal", reqId, async () => {
    return await School.findById(school._id)
      .select(MEDIA_PRINCIPAL_PROJECTION)
      .lean();
  });

  return mediaData;
};

const updateMediaPrincipal = async ({ adminUserId, targetSchoolName, adminEmail, reqId, updateData }) => {
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
    if (fallbackField && updateData.media && updateData.media[fallbackField] !== undefined) return updateData.media[fallbackField];
    if (fallbackField && updateData.principal && updateData.principal[fallbackField] !== undefined) return updateData.principal[fallbackField];
    return undefined;
  };

  const coverImage = getVal("coverImage", "coverImage");
  if (coverImage !== undefined) updateFields.coverImage = coverImage;

  const coverPosVal = getVal("coverPosition", "coverPosition");
  if (coverPosVal !== undefined) {
    const pos = Number(coverPosVal);
    updateFields.coverPosition = isNaN(pos) ? 50 : pos;
  }

  const photosVal = getVal("schoolPhotos", "schoolPhotos");
  if (photosVal !== undefined) {
    if (Array.isArray(photosVal)) {
      if (photosVal.length > 5) {
        throw new Error("Maximum 5 school photos allowed.");
      }
      updateFields.schoolPhotos = photosVal;
    }
  }

  const pPhoto = getVal("principalPhoto", "photo");
  if (pPhoto !== undefined) updateFields.principalPhoto = pPhoto;

  const pName = getVal("principalName", "name");
  if (pName !== undefined) updateFields.principalName = pName;

  const pDesignation = getVal("principalDesignation", "designation");
  if (pDesignation !== undefined) updateFields.principalDesignation = pDesignation;

  const pEmail = getVal("principalEmail", "email");
  if (pEmail !== undefined) updateFields.principalEmail = pEmail;

  const pPhone = getVal("principalPhone", "phoneNumber");
  if (pPhone !== undefined) updateFields.principalPhone = pPhone;

  const pLeadershipSince = getVal("principalLeadershipSince", "leadershipSince");
  if (pLeadershipSince !== undefined) updateFields.principalLeadershipSince = pLeadershipSince;

  const pIntroduction = getVal("principalIntroduction", "introduction");
  if (pIntroduction !== undefined) updateFields.principalIntroduction = pIntroduction;

  const updatedSchool = await measureDatabaseOperation("School.updateMediaPrincipal", reqId, async () => {
    return await School.findByIdAndUpdate(
      school._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select(MEDIA_PRINCIPAL_PROJECTION);
  });

  return updatedSchool;
};

module.exports = {
  getMediaPrincipal,
  updateMediaPrincipal
};

