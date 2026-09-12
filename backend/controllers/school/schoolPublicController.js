// backend/controllers/school/schoolPublicController.js
const School = require("../../models/School");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const Event = require("../../models/Event");
const { createPerformanceLogger } = require("../../utils/performanceLogger");
const { normalizeName } = require("../../services/school/schoolResolverService");

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/schools
const getSchools = async (req, res) => {
  const logger = createPerformanceLogger("getSchools");
  try {
    logger.start("fetchSchoolsList");
    const rawSchools = await School.find({ name: { $not: /demo school/i } }).sort({ name: 1 }).lean();
    logger.end("fetchSchoolsList");

    logger.start("aggregateStats");
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
    logger.end("aggregateStats");

    logger.summary();
    res.json(schools);
  } catch (error) {
    console.error(`[getSchools:${logger.reqId}] Error:`, error);
    logger.summary();
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schools/:name
const getSchoolDetails = async (req, res) => {
  const logger = createPerformanceLogger("getSchoolDetails");
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);
    const escName = escapeRegex(searchName);
    const schoolRegex = new RegExp("^" + escName + "$", "i");

    logger.start("findSchool");
    let school = await School.findOne({
      $or: [
        { normalizedName: normalized },
        { name: schoolRegex }
      ]
    });
    logger.end("findSchool");

    if (!school) {
      logger.summary();
      return res.status(404).json({ success: false, message: "School not found" });
    }

    logger.start("aggregateSchoolStats");
    const exactRegex = new RegExp("^" + escapeRegex(school.name) + "$", "i");
    const [totalStudents, totalTeachers, totalClasses, totalEvents, totalSubjects, adminUser] = await Promise.all([
      User.countDocuments({ schoolName: exactRegex, role: "student" }),
      User.countDocuments({ schoolName: exactRegex, role: "teacher" }),
      Class.countDocuments({ schoolName: exactRegex }),
      Event.countDocuments({ schoolName: exactRegex }),
      Subject.countDocuments({ schoolName: exactRegex }),
      User.findOne({ role: "admin", schoolName: exactRegex }).select("_id name email role schoolName avatar").lean()
    ]);
    logger.end("aggregateSchoolStats");

    const schoolObj = school.toObject();
    schoolObj.totalStudents = totalStudents;
    schoolObj.totalTeachers = totalTeachers;
    schoolObj.totalClasses = totalClasses;
    schoolObj.totalEvents = totalEvents;
    schoolObj.totalSubjects = totalSubjects;
    schoolObj.adminUser = adminUser || null;

    logger.summary();
    res.json(schoolObj);
  } catch (error) {
    console.error(`[getSchoolDetails:${logger.reqId}] Error:`, error);
    logger.summary();
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/schools/:name/teachers
const getSchoolTeachers = async (req, res) => {
  const logger = createPerformanceLogger("getSchoolTeachers");
  try {
    const searchName = req.params.name;
    const normalized = normalizeName(searchName);

    logger.start("findSchool");
    const school = await School.findOne({ normalizedName: normalized });
    logger.end("findSchool");

    if (!school) {
      logger.summary();
      return res.status(404).json({ success: false, message: "School not found" });
    }

    logger.start("findTeachers");
    const teachers = await User.find({ role: "teacher", schoolName: school.name })
      .select("-password")
      .lean();
    logger.end("findTeachers");

    logger.start("enrichTeachers");
    for (let teacher of teachers) {
      const classes = await Class.find({ teacher: teacher._id, schoolName: school.name }).select("name section");
      const subjects = await Subject.find({ teacher: teacher._id, schoolName: school.name }).select("name");
      teacher.classes = classes;
      teacher.subjects = subjects;
    }
    logger.end("enrichTeachers");

    logger.summary();
    res.json(teachers);
  } catch (error) {
    console.error(`[getSchoolTeachers:${logger.reqId}] Error:`, error);
    logger.summary();
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSchools,
  getSchoolDetails,
  getSchoolTeachers
};
