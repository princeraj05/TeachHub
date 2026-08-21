const Subject = require("../models/Subject");


// ================= ADD SUBJECT =================

exports.addSubject = async (req, res) => {

  try {

    const { name, classId } = req.body;
    
    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const subject = await Subject.create({
      name,
      class: classId,
      schoolName: req.user.schoolName
    });

    res.json({
      message: "Subject added",
      subject
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= GET SUBJECTS =================

exports.getSubjects = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    const subjects = await Subject
      .find({ schoolName: req.user.schoolName })
      .populate({
        path: "class",
        select: "name section"
      });

    res.json(subjects);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= DELETE SUBJECT =================

exports.deleteSubject = async (req, res) => {

  try {

    if (!req.user || !req.user.schoolName) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    }

    // Verify ownership before deleting
    const subj = await Subject.findOne({ _id: req.params.id, schoolName: req.user.schoolName });
    if (!subj) {
      return res.status(403).json({ message: "Access Denied: Subject does not belong to your school" });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({
      message: "Subject deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};