// backend/services/school/schoolResolverService.js
const mongoose = require("mongoose");
const School = require("../../models/School");
const { measureDatabaseOperation, getDatabaseState } = require("../../utils/databaseDiagnostics");

const normalizeName = (name) => {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

const resolveSchoolForAdmin = async ({ adminUserId, targetSchoolName, adminEmail, reqId = null }) => {
  const pid = process.pid;
  const requestId = reqId || `${pid}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const dbState = getDatabaseState();
  
  console.log(`[SchoolResolver:${requestId}] START | readyState=${dbState.stateName}, host=${dbState.host}, db=${dbState.dbName}`);
  let school = null;

  // 1. adminId lookup
  if (adminUserId) {
    let objId = adminUserId;
    if (typeof adminUserId === "string" && mongoose.Types.ObjectId.isValid(adminUserId)) {
      objId = new mongoose.Types.ObjectId(adminUserId);
    }
    console.log(`[SchoolResolver:${requestId}] adminId START`);
    const t0 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.adminId`, requestId, async () => {
        return await School.findOne({ adminId: objId })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] adminId lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] adminId END duration=${Date.now() - t0}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;
  }

  // 2. normalizedName lookup
  const normalized = targetSchoolName ? normalizeName(targetSchoolName) : "";
  if (normalized) {
    console.log(`[SchoolResolver:${requestId}] normalizedName START`);
    const t1 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.normalizedName`, requestId, async () => {
        return await School.findOne({ normalizedName: normalized })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] normalizedName lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] normalizedName END duration=${Date.now() - t1}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;

    // 2b. exact name lookup
    console.log(`[SchoolResolver:${requestId}] exactName START`);
    const t2 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.exactName`, requestId, async () => {
        return await School.findOne({ name: targetSchoolName })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] exactName lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] exactName END duration=${Date.now() - t2}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;
  }

  // 3. Email lookups
  if (adminEmail) {
    console.log(`[SchoolResolver:${requestId}] principalEmail START`);
    const t3 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.principalEmail`, requestId, async () => {
        return await School.findOne({ principalEmail: adminEmail })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] principalEmail lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] principalEmail END duration=${Date.now() - t3}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;

    console.log(`[SchoolResolver:${requestId}] email START`);
    const t4 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.email`, requestId, async () => {
        return await School.findOne({ email: adminEmail })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] email lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] email END duration=${Date.now() - t4}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;

    console.log(`[SchoolResolver:${requestId}] basicInfo.schoolEmail START`);
    const t5 = Date.now();
    try {
      school = await measureDatabaseOperation(`School.findOne.basicInfoSchoolEmail`, requestId, async () => {
        return await School.findOne({ "basicInfo.schoolEmail": adminEmail })
          .sort({ profileCompletion: -1, updatedAt: -1 })
          .maxTimeMS(5000)
          .lean();
      });
    } catch (err) {
      console.error(`[SchoolResolver:${requestId}] basicInfo.schoolEmail lookup failed: ${err.message}`);
    }
    console.log(`[SchoolResolver:${requestId}] basicInfo.schoolEmail END duration=${Date.now() - t5}ms result=${school ? "FOUND (" + school._id + ")" : "NOT FOUND"}`);
    if (school) return school;
  }

  return null;
};

module.exports = {
  resolveSchoolForAdmin,
  findTargetSchool: resolveSchoolForAdmin, // alias for backwards compatibility
  normalizeName
};
