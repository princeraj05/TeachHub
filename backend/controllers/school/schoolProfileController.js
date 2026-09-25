// backend/controllers/school/schoolProfileController.js
const School = require("../../models/School");
const User = require("../../models/User");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { resolveSchoolForAdmin, normalizeName } = require("../../services/school/schoolResolverService");
const { getSchoolStatistics } = require("../../services/school/schoolStatisticsService");
const { calculateProfileCompletion, calculateCompletionBreakdown, normalizeSchoolData } = require("../../services/school/schoolProfileService");
const { sanitizeSchoolDescription } = require("../../utils/htmlSanitizer");

// GET /api/schools/my-school
const getMySchool = async (req, res) => {
  const logger = createPerformanceLogger("getMySchool");
  try {
    const userId = req.user.id || req.user._id;

    logger.start("loadAdminUser");
    const adminUser = await User.findById(userId).select("role requestedRole schoolName requestedSchool email").lean();
    logger.end("loadAdminUser");

    const isAllowed = adminUser && (
      adminUser.role === "admin" ||
      adminUser.role === "superadmin" ||
      adminUser.requestedRole === "admin" ||
      adminUser.role === "unassigned"
    );

    if (!isAllowed) {
      logger.summary();
      return res.status(403).json({ success: false, message: "Unauthorized: Only School Admins can access school details" });
    }

    const targetSchoolName = adminUser.schoolName || adminUser.requestedSchool || "";

    logger.start("resolveSchool");
    let school = await resolveSchoolForAdmin({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("resolveSchool");

    if (school && !school.adminId && adminUser.role !== "superadmin") {
      school.adminId = adminUser._id;
      try {
        await School.findByIdAndUpdate(school._id, { adminId: adminUser._id });
      } catch (sErr) {
        console.warn(`[getMySchool:${logger.reqId}] Warning setting adminId:`, sErr.message);
      }
    }

    // Auto-create initial school if not found
    if (!school) {
      logger.start("autoCreateSchool");
      const name = targetSchoolName ? targetSchoolName.trim() : "My School";
      const normalizedName = normalizeName(name);

      // Safety check: verify if admin already owns an existing school to prevent duplicates
      const existingSchoolForAdmin = await School.findOne({
        $or: [
          { adminId: adminUser._id },
          { email: adminUser.email },
          { principalEmail: adminUser.email }
        ]
      });

      if (existingSchoolForAdmin) {
        console.log(`[getMySchool:${logger.reqId}] Found existing school for admin during auto-create check: ${existingSchoolForAdmin._id}`);
        school = existingSchoolForAdmin;
      } else {
        try {
          school = await School.create({
            adminId: adminUser._id,
            name: name,
            normalizedName: normalizedName,
            status: "Active",
            profileCompletion: 0
          });
        } catch (cErr) {
          school = await resolveSchoolForAdmin({
            adminUserId: adminUser._id,
            targetSchoolName: name,
            adminEmail: adminUser.email,
            reqId: logger.reqId
          });

          if (!school) {
            school = await School.create({
              adminId: adminUser._id,
              name: name,
              normalizedName: `${normalizedName}-${Date.now()}`,
              status: "Active",
              profileCompletion: 0
            });
          }
        }
      }
      logger.end("autoCreateSchool");
    }

    if (!school) {
      school = new School({
        adminId: adminUser._id,
        name: targetSchoolName || "My School",
        status: "Active",
        profileCompletion: 0
      });
    }

    normalizeSchoolData(school);

    const profileCompletion = calculateProfileCompletion(school);
    school.profileCompletion = profileCompletion;

    if (typeof school.save === "function" && typeof school.isModified === "function" && school.isModified()) {
      try { await school.save(); } catch (sErr) {}
    }

    logger.start("getStatistics");
    const statistics = await getSchoolStatistics(school.name);
    logger.end("getStatistics");

    const schoolObj = typeof school.toObject === "function" ? school.toObject() : school;
    schoolObj.profileCompletion = profileCompletion;

    logger.summary();
    return res.json({
      success: true,
      school: schoolObj,
      statistics
    });
  } catch (error) {
    console.error(`[getMySchool:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to load school profile" });
  }
};

// GET /api/schools/my-school/completion
const getCompletionBreakdown = async (req, res) => {
  const logger = createPerformanceLogger("getCompletionBreakdown");
  try {
    const userId = req.user.id || req.user._id;
    const adminUser = await User.findById(userId).select("role requestedRole schoolName requestedSchool email").lean();
    const isAllowed = adminUser && (
      adminUser.role === "admin" ||
      adminUser.role === "superadmin" ||
      adminUser.requestedRole === "admin" ||
      adminUser.role === "unassigned"
    );

    if (!isAllowed) {
      logger.summary();
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const targetSchoolName = adminUser.schoolName || adminUser.requestedSchool || "";
    const school = await resolveSchoolForAdmin({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });

    const breakdown = calculateCompletionBreakdown(school);

    logger.summary();
    return res.json({
      success: true,
      breakdown
    });
  } catch (error) {
    console.error(`[getCompletionBreakdown:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to calculate profile completion" });
  }
};

// PUT /api/schools/my-school
const updateMySchool = async (req, res) => {
  const logger = createPerformanceLogger("updateMySchool");
  try {
    const userId = req.user.id || req.user._id;

    logger.start("loadAdminUser");
    const adminUser = await User.findById(userId).select("role requestedRole schoolName requestedSchool email").lean();
    logger.end("loadAdminUser");

    const isAllowed = adminUser && (
      adminUser.role === "admin" ||
      adminUser.role === "superadmin" ||
      adminUser.requestedRole === "admin" ||
      adminUser.role === "unassigned"
    );

    if (!isAllowed) {
      logger.summary();
      return res.status(403).json({ success: false, message: "Unauthorized: Only School Admins can update school details" });
    }

    const targetSchoolName = adminUser.schoolName || adminUser.requestedSchool || "";

    logger.start("resolveSchool");
    let school = await resolveSchoolForAdmin({
      adminUserId: adminUser._id,
      targetSchoolName,
      adminEmail: adminUser.email,
      reqId: logger.reqId
    });
    logger.end("resolveSchool");

    if (!school) {
      const name = targetSchoolName ? targetSchoolName.trim() : "My School";
      const normalizedName = normalizeName(name);
      try {
        school = new School({
          adminId: adminUser._id,
          name: name,
          normalizedName: normalizedName
        });
      } catch (cErr) {
        school = await resolveSchoolForAdmin({ adminUserId: adminUser._id, targetSchoolName: name });
      }
    } else if (typeof school.toObject === "function") {
      // already a Mongoose document
    } else {
      // If lean object was returned, re-query Mongoose document for save
      school = await School.findById(school._id);
    }

    const b = req.body;
    const basic = b.basicInfo || {};
    const media = b.media || {};
    const principal = b.principal || {};
    const admission = b.admission || {};
    const availability = b.availability || {};

    const getVal = (v1, v2) => {
      if (v1 !== undefined && v1 !== null && v1 !== "") return v1;
      if (v2 !== undefined && v2 !== null && v2 !== "") return v2;
      return v1 !== undefined ? v1 : v2;
    };

    // Basic Info fields
    if (b.principalName !== undefined || principal.name !== undefined) school.principalName = getVal(b.principalName, principal.name);
    if (b.affiliation !== undefined || basic.affiliation !== undefined) school.affiliation = getVal(b.affiliation, basic.affiliation);
    if (b.academicYear !== undefined || basic.academicYear !== undefined) school.academicYear = getVal(b.academicYear, basic.academicYear);
    if (b.email !== undefined || basic.schoolEmail !== undefined) school.email = getVal(b.email, basic.schoolEmail);
    if (b.medium !== undefined || basic.medium !== undefined) school.medium = getVal(b.medium, basic.medium);
    if (b.phoneNumber !== undefined || basic.phoneNumber !== undefined) school.phoneNumber = getVal(b.phoneNumber, basic.phoneNumber);
    if (b.address !== undefined || basic.schoolAddress !== undefined) school.address = getVal(b.address, basic.schoolAddress);
    if (b.latitude !== undefined || basic.latitude !== undefined) school.latitude = getVal(b.latitude, basic.latitude);
    if (b.longitude !== undefined || basic.longitude !== undefined) school.longitude = getVal(b.longitude, basic.longitude);
    if (b.established !== undefined || basic.established !== undefined) school.established = getVal(b.established, basic.established);
    if (b.status !== undefined || basic.schoolStatus !== undefined) school.status = getVal(b.status, basic.schoolStatus);
    if (b.schoolType !== undefined || basic.schoolType !== undefined) school.schoolType = getVal(b.schoolType, basic.schoolType);
    if (b.registrationNumber !== undefined || basic.registrationNumber !== undefined) school.registrationNumber = getVal(b.registrationNumber, basic.registrationNumber);
    if (b.code !== undefined || basic.schoolCode !== undefined) school.code = getVal(b.code, basic.schoolCode);
    if (b.category !== undefined) school.category = b.category;
    if (b.motto !== undefined || basic.schoolMotto !== undefined) school.motto = getVal(b.motto, basic.schoolMotto);
    if (b.website !== undefined || basic.website !== undefined) school.website = getVal(b.website, basic.website);
    if (b.availableClasses !== undefined || basic.availableClasses !== undefined) {
      const ac = getVal(b.availableClasses, basic.availableClasses);
      school.availableClasses = Array.isArray(ac) ? ac.join(", ") : ac;
    }
    if (b.photo !== undefined || basic.logo !== undefined) school.photo = getVal(b.photo, basic.logo);

    // Media & Principal fields
    if (b.coverImage !== undefined || media.coverImage !== undefined) school.coverImage = b.coverImage ?? media.coverImage;
    if (b.coverPosition !== undefined || media.coverPosition !== undefined) {
      const pos = Number(b.coverPosition ?? media.coverPosition);
      school.coverPosition = isNaN(pos) ? 50 : pos;
    }
    if (b.schoolPhotos !== undefined || media.schoolPhotos !== undefined) {
      const photos = b.schoolPhotos ?? media.schoolPhotos;
      if (Array.isArray(photos)) {
        if (photos.length > 5) {
          logger.summary();
          return res.status(400).json({ success: false, message: "Maximum 5 school photos allowed." });
        }
        school.schoolPhotos = photos;
      }
    }
    if (b.principalPhoto !== undefined || principal.photo !== undefined) school.principalPhoto = b.principalPhoto ?? principal.photo;
    if (b.principalDesignation !== undefined || principal.designation !== undefined) school.principalDesignation = b.principalDesignation ?? principal.designation;
    if (b.principalEmail !== undefined || principal.email !== undefined) school.principalEmail = b.principalEmail ?? principal.email;
    if (b.principalPhone !== undefined || principal.phoneNumber !== undefined) school.principalPhone = b.principalPhone ?? principal.phoneNumber;
    if (b.principalLeadershipSince !== undefined || principal.leadershipSince !== undefined) school.principalLeadershipSince = b.principalLeadershipSince ?? principal.leadershipSince;
    if (b.principalIntroduction !== undefined || principal.introduction !== undefined) school.principalIntroduction = b.principalIntroduction ?? principal.introduction;

    // Admission & Settings fields
    if (b.schoolCategoriesList !== undefined || admission.categories !== undefined) school.schoolCategoriesList = b.schoolCategoriesList ?? admission.categories;
    if (b.admissionProcess !== undefined || admission.processes !== undefined) school.admissionProcess = b.admissionProcess ?? admission.processes;
    if (b.schoolBoardType !== undefined || admission.schoolType !== undefined) school.schoolBoardType = b.schoolBoardType ?? admission.schoolType;
    if (b.admissionStartDate !== undefined) school.admissionStartDate = b.admissionStartDate;
    if (b.admissionLastDate !== undefined) school.admissionLastDate = b.admissionLastDate;
    if (b.alwaysOpenAdmission !== undefined) school.alwaysOpenAdmission = Boolean(b.alwaysOpenAdmission);

    // Availability fields
    if (b.workingDays !== undefined || availability.workingDays !== undefined) school.workingDays = b.workingDays ?? availability.workingDays;
    if (b.openingTime !== undefined || availability.openingTime !== undefined) school.openingTime = b.openingTime ?? availability.openingTime;
    if (b.closingTime !== undefined || availability.closingTime !== undefined) school.closingTime = b.closingTime ?? availability.closingTime;
    if (b.shortBreakStartTime !== undefined) school.shortBreakStartTime = b.shortBreakStartTime;
    if (b.shortBreakDuration !== undefined) school.shortBreakDuration = Number(b.shortBreakDuration);
    if (b.lunchBreakStartTime !== undefined || availability.lunchBreakStartTime !== undefined) school.lunchBreakStartTime = b.lunchBreakStartTime ?? availability.lunchBreakStartTime;
    if (b.lunchBreakDuration !== undefined || availability.lunchBreakDuration !== undefined) {
      const dur = Number(b.lunchBreakDuration ?? availability.lunchBreakDuration);
      school.lunchBreakDuration = isNaN(dur) ? 60 : dur;
    }
    if (b.holidays !== undefined || availability.holidays !== undefined) school.holidays = b.holidays ?? availability.holidays;

    // Description
    if (b.description !== undefined) school.description = sanitizeSchoolDescription(b.description);

    school.profileCompletion = calculateProfileCompletion(school);

    logger.start("saveSchool");
    await school.save();
    logger.end("saveSchool");

    if (school.name) {
      User.findByIdAndUpdate(userId, {
        schoolName: school.name,
        requestedSchool: school.name
      }).catch(err => console.error("Error syncing schoolName to User:", err));
    }

    const schoolObj = school.toObject();

    logger.summary();
    return res.json({
      success: true,
      message: "School details saved successfully!",
      school: schoolObj
    });
  } catch (error) {
    console.error(`[updateMySchool:${logger.reqId}] Error:`, error);
    logger.summary();
    return res.status(500).json({ success: false, message: error.message || "Failed to update school profile" });
  }
};

module.exports = {
  getMySchool,
  getCompletionBreakdown,
  updateMySchool
};
