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

    const rawSchools = await School.find({}).sort({ name: 1 }).lean();

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

// GET /api/schools/my-school
exports.getMySchool = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).select("role schoolName").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can access their school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school;
    try {
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }
        ]
      });
    } catch (bsonErr) {
      console.warn("BSON size error detected during School fetch, resetting oversized photo fields raw:", bsonErr.message);
      await School.collection.updateMany(
        { $or: [{ normalizedName: normalized }, { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }] },
        { $set: { photo: "", coverImage: "", principalPhoto: "", schoolPhotos: [] } }
      );
      school = await School.findOne({
        $or: [
          { normalizedName: normalized },
          { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }
        ]
      });
    }

    if (!school) {
      school = await School.create({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    } else if (!school.normalizedName) {
      school.normalizedName = normalized;
      await school.save();
    }

    let modified = false;

    // Self-clean legacy dummy seed data previously saved in MongoDB
    if (school.principalName === "Banny Thapar") { school.principalName = ""; modified = true; }
    if (school.email === "gdaccedmy@gmail.com") { school.email = ""; modified = true; }
    if (school.phoneNumber === "+91 98765 43210") { school.phoneNumber = ""; modified = true; }
    if (school.address && school.address.includes("Near Sadar Hospital")) { school.address = ""; modified = true; }
    if (school.established === "2010") { school.established = ""; modified = true; }
    if (school.code === "GDAC2026") { school.code = ""; modified = true; }
    if (school.registrationNumber === "GD/REG/2010/4125") { school.registrationNumber = ""; modified = true; }
    if (school.website === "www.gdaccedmy.edu.in") { school.website = ""; modified = true; }
    if (school.motto === "Learn • Grow • Succeed") { school.motto = ""; modified = true; }
    if (school.principalEmail === "banny.thapar@gdaccedmy.edu.in") { school.principalEmail = ""; modified = true; }
    if (school.principalPhone === "+91 98765 43210") { school.principalPhone = ""; modified = true; }
    if (school.principalDesignation === "Head of Institution") { school.principalDesignation = ""; modified = true; }
    if (school.principalIntroduction && school.principalIntroduction.includes("With over 20 years of experience")) { school.principalIntroduction = ""; modified = true; }
    if (school.description && (school.description.includes("G.D Academy") || school.description.includes("reputed educational institution"))) { school.description = ""; modified = true; }
    if (school.affiliation === "CBSE") { school.affiliation = ""; modified = true; }
    if (school.academicYear === "2026 - 2027") { school.academicYear = ""; modified = true; }
    if (school.medium === "English") { school.medium = ""; modified = true; }

    // Clean Tab 3 (Admission & Settings) legacy dummy defaults
    if (Array.isArray(school.schoolCategoriesList) && (
      (school.schoolCategoriesList.length === 4 && school.schoolCategoriesList.includes("Primary") && school.schoolCategoriesList.includes("Residential")) ||
      (school.schoolCategoriesList.length === 3 && school.schoolCategoriesList.includes("Primary") && school.schoolCategoriesList.includes("Co-Educational"))
    )) {
      school.schoolCategoriesList = [];
      modified = true;
    }
    if (Array.isArray(school.admissionProcess) && school.admissionProcess.length === 1 && school.admissionProcess[0] === "Direct Admission") {
      school.admissionProcess = [];
      modified = true;
    }
    if (school.schoolBoardType === "Private") {
      school.schoolBoardType = "";
      modified = true;
    }
    if (Array.isArray(school.workingDays) && school.workingDays.length === 5 && school.workingDays.includes("Mon") && school.workingDays.includes("Fri")) {
      school.workingDays = [];
      modified = true;
    }
    if (school.openingTime === "08:00 AM") {
      school.openingTime = "";
      modified = true;
    }
    if (school.closingTime === "04:00 PM") {
      school.closingTime = "";
      modified = true;
    }
    if (school.shortBreakStartTime === "11:00 AM") {
      school.shortBreakStartTime = "";
      modified = true;
    }
    if (school.lunchBreakStartTime === "12:30 PM") {
      school.lunchBreakStartTime = "";
      modified = true;
    }
    if (Array.isArray(school.holidays) && school.holidays.some(h => h.name === "Independence Day" || h.name === "Teachers' Day" || h.name === "Gandhi Jayanti")) {
      school.holidays = [];
      modified = true;
    }

    // Strip out legacy Base64 Data URIs to prevent BSON > 16MB document limit crash
    if (school.photo && typeof school.photo === "string" && school.photo.startsWith("data:image")) {
      school.photo = "";
      modified = true;
    }
    if (school.coverImage && typeof school.coverImage === "string" && school.coverImage.startsWith("data:image")) {
      school.coverImage = "";
      modified = true;
    }
    if (school.principalPhoto && typeof school.principalPhoto === "string" && school.principalPhoto.startsWith("data:image")) {
      school.principalPhoto = "";
      modified = true;
    }
    if (Array.isArray(school.schoolPhotos)) {
      const cleanPhotos = school.schoolPhotos.filter(p => !(p && typeof p === "string" && p.startsWith("data:image")));
      if (cleanPhotos.length !== school.schoolPhotos.length) {
        school.schoolPhotos = cleanPhotos;
        modified = true;
      }
    }

    // Self-clean legacy dummy seed URLs that may have broken previously
    if (school.photo && school.photo.includes("/uploads/schoolPhotos-")) {
      school.photo = "";
      modified = true;
    }
    if (school.coverImage && school.coverImage.includes("/uploads/schoolPhotos-")) {
      school.coverImage = "";
      modified = true;
    }
    if (school.principalPhoto && school.principalPhoto.includes("/uploads/schoolPhotos-")) {
      school.principalPhoto = "";
      modified = true;
    }

    if (modified || school.isNew) {
      await school.save();
    }

    // Fetch dynamic counts in parallel
    const [
      dynamicStudentsCount,
      dynamicTeachersCount,
      dynamicClassesCount,
      dynamicSubjectsCount
    ] = await Promise.all([
      User.countDocuments({ role: "student", schoolName }),
      User.countDocuments({ role: "teacher", schoolName }),
      Class.countDocuments({ schoolName }),
      Subject.countDocuments({ schoolName })
    ]);

    const schoolObj = school.toObject();
    schoolObj.totalStudents = dynamicStudentsCount || 0;
    schoolObj.totalTeachers = dynamicTeachersCount || 0;
    schoolObj.totalClasses = dynamicClassesCount || 0;
    schoolObj.totalSubjects = dynamicSubjectsCount || 0;

    res.json(schoolObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/schools/my-school
exports.updateMySchool = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).select("role schoolName").lean();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can update school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school = await School.findOne({
      $or: [
        { normalizedName: normalized },
        { name: new RegExp("^" + escapeRegex(schoolName.trim()) + "$", "i") }
      ]
    });
    if (!school) {
      school = new School({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    } else if (!school.normalizedName) {
      school.normalizedName = normalized;
    }

    const {
      principalName,
      availableClasses,
      schoolTypes,
      schoolType,
      admissionExam,
      directAdmission,
      description,
      
      email,
      phoneNumber,
      address,
      established,
      code,
      affiliation,
      academicYear,
      medium,
      website,
      status,
      registrationNumber,
      category,
      motto,
      photo,
      academicLevel,
      coEducational,
      schoolOperationType,
      admissionType,
      transportation,
      hostelFacility,

      // Multi-tab fields
      coverImage,
      schoolPhotos,
      principalPhoto,
      principalDesignation,
      principalEmail,
      principalPhone,
      principalLeadershipSince,
      principalIntroduction,
      schoolCategoriesList,
      admissionProcess,
      schoolBoardType,
      workingDays,
      openingTime,
      closingTime,
      shortBreakStartTime,
      shortBreakDuration,
      lunchBreakStartTime,
      lunchBreakDuration,
      holidays
    } = req.body;

    if (principalName !== undefined) school.principalName = principalName;
    if (availableClasses !== undefined) school.availableClasses = availableClasses;
    if (schoolTypes !== undefined) school.schoolTypes = schoolTypes;
    if (schoolType !== undefined) school.schoolType = schoolType;
    if (admissionExam !== undefined) school.admissionExam = admissionExam;
    if (directAdmission !== undefined) school.directAdmission = directAdmission;
    if (description !== undefined) school.description = description;

    // Save extended fields
    if (email !== undefined) school.email = email;
    if (phoneNumber !== undefined) school.phoneNumber = phoneNumber;
    if (address !== undefined) school.address = address;
    if (established !== undefined) school.established = established;
    if (code !== undefined) school.code = code;
    if (affiliation !== undefined) school.affiliation = affiliation;
    if (academicYear !== undefined) school.academicYear = academicYear;
    if (medium !== undefined) school.medium = medium;
    if (website !== undefined) school.website = website;
    if (status !== undefined) school.status = status;
    if (registrationNumber !== undefined) school.registrationNumber = registrationNumber;
    if (category !== undefined) school.category = category;
    if (motto !== undefined) school.motto = motto;
    if (photo !== undefined) school.photo = photo;

    // School Categories / Facilities
    if (academicLevel !== undefined) school.academicLevel = academicLevel;
    if (coEducational !== undefined) school.coEducational = coEducational;
    if (schoolOperationType !== undefined) school.schoolOperationType = schoolOperationType;
    if (admissionType !== undefined) school.admissionType = admissionType;
    if (transportation !== undefined) school.transportation = transportation;
    if (hostelFacility !== undefined) school.hostelFacility = hostelFacility;

    // Multi-tab fields
    if (coverImage !== undefined) school.coverImage = coverImage;
    if (schoolPhotos !== undefined) school.schoolPhotos = schoolPhotos;
    if (principalPhoto !== undefined) school.principalPhoto = principalPhoto;
    if (principalDesignation !== undefined) school.principalDesignation = principalDesignation;
    if (principalEmail !== undefined) school.principalEmail = principalEmail;
    if (principalPhone !== undefined) school.principalPhone = principalPhone;
    if (principalLeadershipSince !== undefined) school.principalLeadershipSince = principalLeadershipSince;
    if (principalIntroduction !== undefined) school.principalIntroduction = principalIntroduction;
    if (schoolCategoriesList !== undefined) school.schoolCategoriesList = schoolCategoriesList;
    if (admissionProcess !== undefined) school.admissionProcess = admissionProcess;
    if (schoolBoardType !== undefined) school.schoolBoardType = schoolBoardType;
    if (workingDays !== undefined) school.workingDays = workingDays;
    if (openingTime !== undefined) school.openingTime = openingTime;
    if (closingTime !== undefined) school.closingTime = closingTime;
    if (shortBreakStartTime !== undefined) school.shortBreakStartTime = shortBreakStartTime;
    if (shortBreakDuration !== undefined && !isNaN(shortBreakDuration)) school.shortBreakDuration = Number(shortBreakDuration);
    if (lunchBreakStartTime !== undefined) school.lunchBreakStartTime = lunchBreakStartTime;
    if (lunchBreakDuration !== undefined && !isNaN(lunchBreakDuration)) school.lunchBreakDuration = Number(lunchBreakDuration);
    if (holidays !== undefined) school.holidays = holidays;

    await school.save();

    // Re-query counts to return matching shape
    const dynamicStudentsCount = await User.countDocuments({ role: "student", schoolName });
    const dynamicTeachersCount = await User.countDocuments({ role: "teacher", schoolName });
    const dynamicClassesCount = await Class.countDocuments({ schoolName });
    const dynamicSubjectsCount = await Subject.countDocuments({ schoolName });

    const schoolObj = school.toObject();
    schoolObj.totalStudents = dynamicStudentsCount || 0;
    schoolObj.totalTeachers = dynamicTeachersCount || 0;
    schoolObj.totalClasses = dynamicClassesCount || 0;
    schoolObj.totalSubjects = dynamicSubjectsCount || 0;

    res.json({ message: "School information updated successfully", school: schoolObj });
  } catch (error) {
    console.error("Error updating school profile:", error);
    res.status(500).json({ message: error.message || "Failed to update school profile" });
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
      return res.status(404).json({ message: "School not found" });
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
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/:name/teachers
exports.getSchoolTeachers = async (req, res) => {
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
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
    res.status(500).json({ message: error.message });
  }
};


// POST /api/schools/upload
exports.uploadSchoolPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fs = require("fs");

    const hasCloudinary = process.env.CLOUDINARY_URL ||
      ( (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) && 
        (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY) && 
        (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET) );

    if (hasCloudinary) {
      try {
        const cloudinary = require("../config/cloudinary");
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "teachhub_schools",
          resource_type: "image"
        });
        if (fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        return res.json({ url: result.secure_url });
      } catch (cErr) {
        console.error("Cloudinary upload failed, falling back to permanent base64 Data URI:", cErr.message);
      }
    }

    // Return lightweight relative file URL (/uploads/filename) to keep MongoDB document size small
    const path = require("path");
    const filename = req.file.filename || (req.file.path ? path.basename(req.file.path) : "");
    const relativeUrl = `/uploads/${filename}`;

    return res.json({ url: relativeUrl });
  } catch (error) {
    const fs = require("fs");
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: error.message });
  }
};
