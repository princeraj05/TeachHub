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
    const schools = await School.find({}).sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/my-school
exports.getMySchool = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can access their school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      // Create dynamically if not found
      school = new School({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    }

    // Auto-seed example data if not filled (matching the mockup image example)
    let modified = false;
    if (!school.principalName) { school.principalName = "Banny Thapar"; modified = true; }
    if (!school.email) { school.email = "gdaccedmy@gmail.com"; modified = true; }
    if (!school.phoneNumber) { school.phoneNumber = "+91 98765 43210"; modified = true; }
    if (!school.address) { school.address = "Near Sadar Hospital, Siwan, Bihar - 841226, India"; modified = true; }
    if (!school.established) { school.established = "2010"; modified = true; }
    if (!school.code) { school.code = "GDAC2026"; modified = true; }
    if (!school.affiliation) { school.affiliation = "CBSE"; modified = true; }
    if (!school.academicYear) { school.academicYear = "2026 - 2027"; modified = true; }
    if (!school.medium) { school.medium = "English"; modified = true; }
    if (!school.website) { school.website = "www.gdaccedmy.edu.in"; modified = true; }
    if (!school.status) { school.status = "Active"; modified = true; }
    if (!school.registrationNumber) { school.registrationNumber = "GD/REG/2010/4125"; modified = true; }
    if (!school.category) { school.category = "Secondary"; modified = true; }
    if (!school.motto) { school.motto = "Learn • Grow • Succeed"; modified = true; }
    if (!school.photo) { school.photo = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"; modified = true; }
    
    // Categories / Facilities
    if (!school.academicLevel) { school.academicLevel = "Secondary"; modified = true; }
    if (!school.coEducational) { school.coEducational = "Co-Educational"; modified = true; }
    if (!school.schoolOperationType) { school.schoolOperationType = "Day School"; modified = true; }
    if (!school.admissionType) { school.admissionType = "Direct Admission"; modified = true; }
    if (!school.transportation) { school.transportation = "Available"; modified = true; }
    if (!school.hostelFacility) { school.hostelFacility = "Not Available"; modified = true; }
    if (!school.availableClasses) { school.availableClasses = "Class 1 to 10"; modified = true; }

    if (modified || school.isNew) {
      await school.save();
    }

    // Fetch dynamic counts directly from database to show real, non-dummy statistics
    const dynamicStudentsCount = await User.countDocuments({ role: "student", schoolName });
    const dynamicTeachersCount = await User.countDocuments({ role: "teacher", schoolName });
    const dynamicClassesCount = await Class.countDocuments({ schoolName });
    const dynamicSubjectsCount = await Subject.countDocuments({ schoolName });

    // Return school with dynamic live statistics injected
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
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only School Admins can update school details" });
    }

    const schoolName = adminUser.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "No school is assigned to this administrator" });
    }

    const normalized = normalizeName(schoolName);
    let school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      school = new School({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    }

    const {
      principalName,
      availableClasses,
      schoolTypes,
      schoolType,
      teacherAppointmentBooking,
      appointmentMode,
      appointmentDetails,
      admissionExam,
      directAdmission,
      description,
      
      // Extended fields
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
      hostelFacility
    } = req.body;

    if (principalName !== undefined) school.principalName = principalName;
    if (availableClasses !== undefined) school.availableClasses = availableClasses;
    if (schoolTypes !== undefined) school.schoolTypes = schoolTypes;
    if (schoolType !== undefined) school.schoolType = schoolType;
    
    if (teacherAppointmentBooking !== undefined) school.teacherAppointmentBooking = Boolean(teacherAppointmentBooking);
    if (appointmentMode !== undefined) school.appointmentMode = appointmentMode;
    if (appointmentDetails !== undefined) school.appointmentDetails = String(appointmentDetails).slice(0, 1000);
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
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/:name
exports.getSchoolDetails = async (req, res) => {
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const school = await School.findOne({ normalizedName: normalized });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
