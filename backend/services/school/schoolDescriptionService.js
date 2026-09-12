// backend/services/school/schoolDescriptionService.js
const School = require("../../models/School");
const { measureDatabaseOperation } = require("../../utils/databaseDiagnostics");
const { resolveSchoolForAdmin } = require("./schoolResolverService");

const DESCRIPTION_PROJECTION = "description adminId name";

const getSchoolDescription = async ({ adminUserId, targetSchoolName, adminEmail, reqId }) => {
  let school = await resolveSchoolForAdmin({ adminUserId, targetSchoolName, adminEmail, reqId });
  if (!school) return null;

  const descData = await measureDatabaseOperation("School.findDescription", reqId, async () => {
    return await School.findById(school._id)
      .select(DESCRIPTION_PROJECTION)
      .lean();
  });

  return descData;
};

const updateSchoolDescription = async ({ adminUserId, targetSchoolName, adminEmail, reqId, updateData }) => {
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

  const description = updateData.description !== undefined ? updateData.description : "";

  const updatedSchool = await measureDatabaseOperation("School.updateDescription", reqId, async () => {
    return await School.findByIdAndUpdate(
      school._id,
      { $set: { description } },
      { new: true, runValidators: true }
    ).select(DESCRIPTION_PROJECTION);
  });

  return updatedSchool;
};

module.exports = {
  getSchoolDescription,
  updateSchoolDescription
};
