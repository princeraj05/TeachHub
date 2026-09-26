// backend/controllers/academicYearController.js
const AcademicYear = require("../models/AcademicYear");
const { DEFAULT_TERM_WEIGHTAGES, MISSING_TERM_POLICIES } = require("../utils/examTermConstants");

// Helper: resolve effective school name
const getEffectiveSchoolName = (req) => {
  if (req.user.role === "superadmin") {
    return req.query.schoolName || req.body.schoolName || req.user.schoolName || "";
  }
  return req.user.schoolName || "";
};

// ================= GET ALL ACADEMIC YEARS FOR SCHOOL =================
exports.getAcademicYears = async (req, res) => {
  try {
    const schoolName = getEffectiveSchoolName(req);
    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    let years = await AcademicYear.find({ schoolName }).sort({ yearString: -1 }).lean();

    // Auto-seed current session (2026-2027) if school has no records
    if (years.length === 0 && schoolName) {
      const defaultYear = new AcademicYear({
        schoolName,
        yearString: "2026-2027",
        status: "active",
        isCurrent: true,
        termWeightages: DEFAULT_TERM_WEIGHTAGES,
        missingTermPolicy: MISSING_TERM_POLICIES.PROPORTIONAL_REDISTRIBUTION
      });
      await defaultYear.save();
      years = [defaultYear.toObject()];
    }

    res.json({
      success: true,
      schoolName,
      activeYear: years.find(y => y.isCurrent)?.yearString || "2026-2027",
      academicYears: years
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE NEW ACADEMIC YEAR =================
exports.createAcademicYear = async (req, res) => {
  try {
    const schoolName = getEffectiveSchoolName(req);
    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const { yearString, startDate, endDate, termWeightages, missingTermPolicy } = req.body;

    if (!yearString || typeof yearString !== "string" || !yearString.trim()) {
      return res.status(400).json({ message: "yearString is required (e.g. '2026-2027')" });
    }

    const existing = await AcademicYear.findOne({ schoolName, yearString: yearString.trim() });
    if (existing) {
      return res.status(400).json({ message: `Academic Year '${yearString}' already exists for this school` });
    }

    const weightages = Array.isArray(termWeightages) && termWeightages.length > 0 
      ? termWeightages 
      : DEFAULT_TERM_WEIGHTAGES;

    const totalWeight = weightages.reduce((sum, item) => sum + (Number(item.weightagePercentage) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ message: `Term weightage percentages must sum to 100%. Provided sum: ${totalWeight}%` });
    }

    const newYear = new AcademicYear({
      schoolName,
      yearString: yearString.trim(),
      status: "active",
      isCurrent: false, // Must be explicitly activated
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      termWeightages: weightages,
      missingTermPolicy: missingTermPolicy || MISSING_TERM_POLICIES.PROPORTIONAL_REDISTRIBUTION
    });

    await newYear.save();

    res.status(201).json({
      message: "Academic Year created successfully",
      academicYear: newYear
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ACTIVATE ACADEMIC YEAR (ATOMIC TRANSITION) =================
exports.activateAcademicYear = async (req, res) => {
  try {
    const schoolName = getEffectiveSchoolName(req);
    if (!schoolName && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const { id } = req.params;
    const targetYear = await AcademicYear.findOne({ _id: id, schoolName });

    if (!targetYear) {
      return res.status(404).json({ message: "Academic Year not found" });
    }

    // Atomic session transition: set all other sessions to archived and not current
    await AcademicYear.updateMany(
      { schoolName },
      { $set: { isCurrent: false, status: "archived" } }
    );

    targetYear.isCurrent = true;
    targetYear.status = "active";
    await targetYear.save();

    res.json({
      message: `Academic Year '${targetYear.yearString}' activated successfully`,
      activeYear: targetYear
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
