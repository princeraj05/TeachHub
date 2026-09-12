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

  const allowedFields = [
    "coverImage", "coverPosition", "schoolPhotos", "principalPhoto",
    "principalName", "principalDesignation", "principalEmail",
    "principalPhone", "principalLeadershipSince", "principalIntroduction"
  ];

  const updateFields = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updateFields[field] = updateData[field];
    }
  }

  const media = updateData.media || {};
  const principal = updateData.principal || {};

  if (updateData.coverImage !== undefined || media.coverImage !== undefined) updateFields.coverImage = updateData.coverImage ?? media.coverImage;
  if (updateData.coverPosition !== undefined || media.coverPosition !== undefined) {
    const pos = Number(updateData.coverPosition ?? media.coverPosition);
    updateFields.coverPosition = isNaN(pos) ? 50 : pos;
  }
  if (updateData.schoolPhotos !== undefined || media.schoolPhotos !== undefined) {
    const photos = updateData.schoolPhotos ?? media.schoolPhotos;
    if (Array.isArray(photos)) {
      if (photos.length > 5) {
        throw new Error("Maximum 5 school photos allowed.");
      }
      updateFields.schoolPhotos = photos;
    }
  }
  if (updateData.principalName !== undefined || principal.name !== undefined) updateFields.principalName = updateData.principalName ?? principal.name;
  if (updateData.principalPhoto !== undefined || principal.photo !== undefined) updateFields.principalPhoto = updateData.principalPhoto ?? principal.photo;
  if (updateData.principalDesignation !== undefined || principal.designation !== undefined) updateFields.principalDesignation = updateData.principalDesignation ?? principal.designation;
  if (updateData.principalEmail !== undefined || principal.email !== undefined) updateFields.principalEmail = updateData.principalEmail ?? principal.email;
  if (updateData.principalPhone !== undefined || principal.phoneNumber !== undefined) updateFields.principalPhone = updateData.principalPhone ?? principal.phoneNumber;
  if (updateData.principalLeadershipSince !== undefined || principal.leadershipSince !== undefined) updateFields.principalLeadershipSince = updateData.principalLeadershipSince ?? principal.leadershipSince;
  if (updateData.principalIntroduction !== undefined || principal.introduction !== undefined) updateFields.principalIntroduction = updateData.principalIntroduction ?? principal.introduction;

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
