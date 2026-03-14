const Class = require("../models/Class");


// ================= ADD CLASS =================

exports.addClass = async (req, res) => {

  try {

    const { name, section } = req.body;

    const newClass = await Class.create({
      name,
      section
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

    const classes = await Class.find();

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