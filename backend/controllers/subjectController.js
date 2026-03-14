const Subject = require("../models/Subject");


// ================= ADD SUBJECT =================

exports.addSubject = async (req, res) => {

  try {

    const { name, classId } = req.body;

    const subject = await Subject.create({
      name,
      class: classId
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

    const subjects = await Subject
      .find()
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