const Class = require("../models/Class");


// ================= ADD CLASS =================

exports.addClass = async (req, res) => {

  try {

    const { name, section } = req.body;
    
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const newClass = await Class.create({
      name,
      section,
      schoolName: req.user.schoolName
    });

    res.json({
      message: "Class added",
      newClass
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= GET CLASSES =================

exports.getClasses = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const classes = await Class.find({ schoolName: req.user.schoolName });

    classes.sort((a, b) => {
      const numA = parseInt(String(a.name).replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.name).replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return String(a.section || "").localeCompare(String(b.section || ""));
    });

    res.json(classes);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= DELETE CLASS =================

exports.deleteClass = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    // Verify ownership before deleting
    const cls = await Class.findOne({ _id: req.params.id, schoolName: req.user.schoolName });
    if (!cls) {
      return res.status(403).json({ message: "Access Denied: Class does not belong to your school" });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      message: "Class deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= UPDATE CLASS =================

exports.updateClass = async (req, res) => {
  try {
    const { name, section } = req.body;
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const cls = await Class.findOne({ _id: req.params.id, schoolName: req.user.schoolName });
    if (!cls) {
      return res.status(403).json({ message: "Access Denied: Class does not belong to your school" });
    }

    if (name !== undefined) cls.name = name;
    if (section !== undefined) cls.section = section;

    await cls.save();

    res.json({
      message: "Class updated successfully",
      cls
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};