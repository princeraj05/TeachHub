// backend/services/school/schoolStatisticsService.js
const User = require("../../models/User");
const Class = require("../../models/Class");
const Subject = require("../../models/Subject");

const statsCache = new Map();

const getSchoolStatistics = async (schoolName) => {
  if (!schoolName) return { totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalSubjects: 0 };
  const key = schoolName.trim().toLowerCase();
  const cached = statsCache.get(key);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }
  const trimmed = schoolName.trim();

  try {
    const data = await Promise.race([
      (async () => {
        const [totalStudents, totalTeachers, totalClasses, totalSubjects] = await Promise.all([
          User.countDocuments({ schoolName: trimmed, role: "student" }),
          User.countDocuments({ schoolName: trimmed, role: "teacher" }),
          Class.countDocuments({ schoolName: trimmed }),
          Subject.countDocuments({ schoolName: trimmed })
        ]);
        return { totalStudents, totalTeachers, totalClasses, totalSubjects };
      })(),
      new Promise((resolve) => setTimeout(() => resolve({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalSubjects: 0 }), 1000))
    ]);
    statsCache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    return cached ? cached.data : { totalStudents: 0, totalTeachers: 0, totalClasses: 0, totalSubjects: 0 };
  }
};

module.exports = {
  getSchoolStatistics
};
