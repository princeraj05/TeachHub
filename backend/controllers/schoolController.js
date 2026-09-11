const School = require("../models/School");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Helper to normalize name
const normalizeName = (name) => {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
};

// GET /api/schools
exports.getSchools = async (req, res) => {
  try {
    const Event = require("../models/Event");

    // Self-cleaning duplicate check: Clean up misspelled G.D Accedmy and migrate to correct G.D Academy
    await School.deleteOne({ name: { $in: ["G.D Accedmy", "G.D Accedmy ", "G.D Accedmy"] } });
    await School.deleteOne({ normalizedName: "g.d accedmy" });
    
    // Migrate users/classes/subjects referencing the misspelled school
    await User.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });
    await User.updateMany({ requestedSchool: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { requestedSchool: "G.D Academy" });
    await Class.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });
    await Subject.updateMany({ schoolName: { $in: ["G.D Accedmy", "G.D Accedmy "] } }, { schoolName: "G.D Academy" });

    const rawSchools = await School.find({ name: { $not: /demo school/i } }).sort({ name: 1 }).lean();

    const schools = await Promise.all(
      rawSchools.map(async (school) => {
        const escName = escapeRegex(school.name);
        const schoolRegex = new RegExp("^" + escName + "$", "i");

        const [totalStudents, totalTeachers, totalClasses, totalEvents, totalSubjects] = await Promise.all([
          User.countDocuments({ schoolName: schoolRegex, role: "student" }),
          User.countDocuments({ schoolName: schoolRegex, role: "teacher" }),
          Class.countDocuments({ schoolName: schoolRegex }),
          Event.countDocuments({ schoolName: schoolRegex }),
          Subject.countDocuments({ schoolName: schoolRegex })
        ]);

        return {
          ...school,
          totalStudents,
          totalTeachers,
          totalClasses,
          totalEvents,
          totalSubjects
        };
      })
    );

    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to calculate Profile Completion percentage (0-100%)
const calculateProfileCompletion = (s) => {
  if (!s) return 0;
  
  const isBasicFilled = Boolean(
    (s.email && s.email.trim()) ||
    (s.phoneNumber && s.phoneNumber.trim()) ||
    (s.address && s.address.trim()) ||
    (s.affiliation && s.affiliation.trim()) ||
    (s.code && s.code.trim()) ||
    (s.established && s.established.trim())
  );

  const isMediaFilled = Boolean(
    (s.principalName && s.principalName.trim()) ||
    (s.principalEmail && s.principalEmail.trim()) ||
    (s.principalPhone && s.principalPhone.trim()) ||
    (s.principalPhoto && s.principalPhoto.trim()) ||
    (s.coverImage && s.coverImage.trim()) ||
    (s.schoolPhotos && s.schoolPhotos.length > 0)
  );

  const isAdmissionFilled = Boolean(
    (s.workingDays && s.workingDays.length > 0) ||
    (s.openingTime && s.openingTime.trim()) ||
    (s.closingTime && s.closingTime.trim()) ||
    (s.schoolBoardType && s.schoolBoardType.trim()) ||
    (s.admissionProcess && s.admissionProcess.length > 0)
  );

  const isDescriptionFilled = Boolean(
    s.description && s.description.replace(/<[^>]*>/g, "").trim().length > 20
  );

  const filledCount =
    (isBasicFilled ? 1 : 0) +
    (isMediaFilled ? 1 : 0) +
    (isAdmissionFilled ? 1 : 0) +
    (isDescriptionFilled ? 1 : 0);

  return filledCount * 25;
};

// Helper to fetch dynamic real counts from DB collections
const getSchoolStatistics = async (schoolName) => {
  if (!schoolName) return { totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalSubjects: 0 };
  const trimmed = schoolName.trim();
  const schoolRegex = new RegExp("^" + escapeRegex(trimmed) + "$", "i");
  const matchFilter = { $in: [trimmed, schoolRegex] };

  const [totalStudents, totalTeachers, totalClasses, totalSubjects] = await Promise.all([
    User.countDocuments({ schoolName: matchFilter, role: "student" }),
    User.countDocuments({ schoolName: matchFilter, role: "teacher" }),
    Class.countDocuments({ schoolName: matchFilter }),
    Subject.countDocuments({ schoolName: matchFilter })
  ]);
  return { totalStudents, totalTeachers, totalClasses, totalSubjects };
};

// GET /api/schools/my-school
exports.getMySchool = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const adminUser = await User.findById(userId).select("role schoolName email").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized: Only School Admins can access school details" });
    }

    let school = await School.findOne({ adminId: adminUser._id });

    // Fallback: If school doesn't have adminId set yet, match by schoolName
    if (!school && adminUser.schoolName) {
      const normalized = normalizeName(adminUser.schoolName);
      const escName = escapeRegex(adminUser.schoolName);
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escName + "$", "i") }
        ]
      });

      if (school) {
        school.adminId = adminUser._id;
        await school.save();
      }
    }

    // If still not found, auto-create initial school for this Admin
    if (!school) {
      const name = adminUser.schoolName ? adminUser.schoolName.trim() : "My School";
      const normalizedName = normalizeName(name);
      school = await School.create({
        adminId: adminUser._id,
        name: name,
        normalizedName: normalizedName,
        status: "Active",
        profileCompletion: 0
      });
    }

    const profileCompletion = calculateProfileCompletion(school);
    school.profileCompletion = profileCompletion;
    if (school.isModified()) {
      await school.save();
    }

    const statistics = await getSchoolStatistics(school.name);
    const schoolObj = school.toObject();
    schoolObj.profileCompletion = profileCompletion;

    return res.json({
      success: true,
      school: schoolObj,
      statistics
    });
  } catch (error) {
    console.error("Error in getMySchool:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load school profile" });
  }
};

// PUT /api/schools/my-school
exports.updateMySchool = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const adminUser = await User.findById(userId).select("role schoolName").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized: Only School Admins can update school details" });
    }

    let school = await School.findOne({ adminId: adminUser._id });
    if (!school && adminUser.schoolName) {
      const normalized = normalizeName(adminUser.schoolName);
      const escName = escapeRegex(adminUser.schoolName);
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escName + "$", "i") }
        ]
      });
      if (school) {
        school.adminId = adminUser._id;
      }
    }

    if (!school) {
      const name = adminUser.schoolName ? adminUser.schoolName.trim() : "My School";
      const normalizedName = normalizeName(name);
      school = new School({
        adminId: adminUser._id,
        name: name,
        normalizedName: normalizedName
      });
    }

    const b = req.body;
    const basic = b.basicInfo || {};
    const media = b.media || {};
    const principal = b.principal || {};
    const admission = b.admission || {};
    const availability = b.availability || {};

    // Basic Info fields
    if (b.principalName !== undefined || principal.name !== undefined) school.principalName = b.principalName ?? principal.name;
    if (b.affiliation !== undefined || basic.affiliation !== undefined) school.affiliation = b.affiliation ?? basic.affiliation;
    if (b.academicYear !== undefined || basic.academicYear !== undefined) school.academicYear = b.academicYear ?? basic.academicYear;
    if (b.email !== undefined || basic.schoolEmail !== undefined) school.email = b.email ?? basic.schoolEmail;
    if (b.medium !== undefined || basic.medium !== undefined) school.medium = b.medium ?? basic.medium;
    if (b.phoneNumber !== undefined || basic.phoneNumber !== undefined) school.phoneNumber = b.phoneNumber ?? basic.phoneNumber;
    if (b.address !== undefined || basic.schoolAddress !== undefined) school.address = b.address ?? basic.schoolAddress;
    if (b.latitude !== undefined || basic.latitude !== undefined) school.latitude = b.latitude ?? basic.latitude;
    if (b.longitude !== undefined || basic.longitude !== undefined) school.longitude = b.longitude ?? basic.longitude;
    if (b.established !== undefined || basic.established !== undefined) school.established = b.established ?? basic.established;
    if (b.status !== undefined || basic.schoolStatus !== undefined) school.status = b.status ?? basic.schoolStatus;
    if (b.schoolType !== undefined || basic.schoolType !== undefined) school.schoolType = b.schoolType ?? basic.schoolType;
    if (b.registrationNumber !== undefined || basic.registrationNumber !== undefined) school.registrationNumber = b.registrationNumber ?? basic.registrationNumber;
    if (b.code !== undefined || basic.schoolCode !== undefined) school.code = b.code ?? basic.schoolCode;
    if (b.category !== undefined) school.category = b.category;
    if (b.motto !== undefined || basic.schoolMotto !== undefined) school.motto = b.motto ?? basic.schoolMotto;
    if (b.website !== undefined || basic.website !== undefined) school.website = b.website ?? basic.website;
    if (b.availableClasses !== undefined || basic.availableClasses !== undefined) {
      const ac = b.availableClasses ?? basic.availableClasses;
      school.availableClasses = Array.isArray(ac) ? ac.join(", ") : ac;
    }
    if (b.photo !== undefined || basic.logo !== undefined) school.photo = b.photo ?? basic.logo;

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
    if (b.description !== undefined) school.description = b.description;

    school.profileCompletion = calculateProfileCompletion(school);
    await school.save();

    const statistics = await getSchoolStatistics(school.name);
    const schoolObj = school.toObject();

    return res.json({
      success: true,
      message: "School details saved successfully!",
      school: schoolObj,
      statistics
    });
  } catch (error) {
    console.error("Error updating school profile:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update school profile" });
  }
};

// GET /api/schools/:name
exports.getSchoolDetails = async (req, res) => {
  try {
    const Event = require("../models/Event");
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const escName = escapeRegex(searchName);
    const schoolRegex = new RegExp("^" + escName + "$", "i");

    let school = await School.findOne({
      $or: [
        { normalizedName: normalized },
        { name: schoolRegex }
      ]
    });
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const exactRegex = new RegExp("^" + escapeRegex(school.name) + "$", "i");
    const [totalStudents, totalTeachers, totalClasses, totalEvents, totalSubjects, adminUser] = await Promise.all([
      User.countDocuments({ schoolName: exactRegex, role: "student" }),
      User.countDocuments({ schoolName: exactRegex, role: "teacher" }),
      Class.countDocuments({ schoolName: exactRegex }),
      Event.countDocuments({ schoolName: exactRegex }),
      Subject.countDocuments({ schoolName: exactRegex }),
      User.findOne({ role: "admin", schoolName: exactRegex }).select("_id name email role schoolName avatar").lean()
    ]);

    const schoolObj = school.toObject();
    schoolObj.totalStudents = totalStudents;
    schoolObj.totalTeachers = totalTeachers;
    schoolObj.totalClasses = totalClasses;
    schoolObj.totalEvents = totalEvents;
    schoolObj.totalSubjects = totalSubjects;
    schoolObj.adminUser = adminUser || null;

    res.json(schoolObj);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/:name/teachers
exports.getSchoolTeachers = async (req, res) => {
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const teachers = await User.find({ role: "teacher", schoolName: school.name })
      .select("-password")
      .lean();

    for (let teacher of teachers) {
      const classes = await Class.find({ teacher: teacher._id, schoolName: school.name }).select("name section");
      const subjects = await Subject.find({ teacher: teacher._id, schoolName: school.name }).select("name");
      teacher.classes = classes;
      teacher.subjects = subjects;
    }

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/schools/upload
exports.uploadSchoolPhoto = async (req, res) => {
  const fs = require("fs");
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const userId = req.user.id || req.user._id;

    // Find the school associated with this admin
    let school = await School.findOne({ adminId: userId });
    if (!school && req.user.schoolName) {
      const normalized = normalizeName(req.user.schoolName);
      const escName = escapeRegex(req.user.schoolName);
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escName + "$", "i") }
        ]
      });
      if (school) {
        school.adminId = userId;
        await school.save();
      }
    }

    const schoolFolderId = school ? school._id.toString() : userId.toString();
    const cloudinary = require("../config/cloudinary");

    let finalUrl = "";
    let publicId = "";

    try {
      // Upload to Cloudinary folder teachhub/schools/{schoolFolderId}
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `teachhub/schools/${schoolFolderId}`,
        resource_type: "image"
      });

      if (result && result.secure_url) {
        finalUrl = result.secure_url;
        publicId = result.public_id;
      }
    } catch (cErr) {
      console.error("Cloudinary school photo upload error, falling back to base64 encoding:", cErr.message);
      // Fallback: Convert file buffer to base64 Data URL if Cloudinary fails
      const fileBuffer = fs.readFileSync(req.file.path);
      const mimeType = req.file.mimetype || "image/jpeg";
      finalUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    if (!finalUrl) {
      return res.status(500).json({ success: false, message: "Failed to process image upload." });
    }

    return res.json({
      success: true,
      url: finalUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to upload image" });
  } finally {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Failed to unlink temporary file:", e.message);
      }
    }
  }
};
