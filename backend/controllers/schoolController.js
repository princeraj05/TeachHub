const School = require("../models/School");
const User = require("../models/User");

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
      // Create dynamically if not found (super admin assigned but check hasn't run)
      school = await School.create({
        name: schoolName.trim(),
        normalizedName: normalized
      });
    }
    res.json(school);
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
      totalTeachers,
      totalStudents,
      totalClasses,
      availableClasses,
      schoolTypes,
      admissionExam,
      directAdmission,
      description
    } = req.body;

    // Strict validation: do not allow admin to change the name, normalizedName, or owner relationship fields from this endpoint
    if (principalName !== undefined) school.principalName = principalName;
    if (totalTeachers !== undefined) school.totalTeachers = totalTeachers;
    if (totalStudents !== undefined) school.totalStudents = totalStudents;
    if (totalClasses !== undefined) school.totalClasses = totalClasses;
    if (availableClasses !== undefined) school.availableClasses = availableClasses;
    if (schoolTypes !== undefined) school.schoolTypes = schoolTypes;
    if (admissionExam !== undefined) school.admissionExam = admissionExam;
    if (directAdmission !== undefined) school.directAdmission = directAdmission;
    if (description !== undefined) school.description = description;

    await school.save();
    res.json({ message: "School information updated successfully", school });
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
