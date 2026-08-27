const Subject = require("../models/Subject");
const Class = require("../models/Class");

const cleanName = value => String(value || "").trim().replace(/\s+/g, " ");
const normalize = value => cleanName(value).toLocaleLowerCase();
const serialize = subject => {
  const item = subject.toObject();
  item.classes = (item.classes || []).filter(Boolean);
  delete item.class;
  return item;
};

async function validateClasses(input, schoolName) {
  const ids = [...new Set((Array.isArray(input) ? input : [input]).filter(Boolean).map(String))];
  if (!ids.length) return null;
  const classes = await Class.find({ _id: { $in: ids }, schoolName }).select("_id");
  return classes.length === ids.length ? ids : null;
}

// Move legacy one-class rows to the new multi-class mapping once per read.
async function migrateLegacySubjects(schoolName) {
  const records = await Subject.find({ schoolName });
  const groups = new Map();
  records.forEach(subject => {
    const key = normalize(subject.name);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(subject);
  });
  for (const group of groups.values()) {
    const primary = group[0];
    const ids = new Set();
    group.forEach(subject => {
      (subject.classes || []).forEach(id => ids.add(String(id)));
      (Array.isArray(subject.class) ? subject.class : [subject.class]).filter(Boolean).forEach(id => ids.add(String(id)));
    });
    primary.name = cleanName(primary.name);
    primary.classes = [...ids];
    // Keep a primary mapping for older timetable/exam records while all new
    // class membership is represented by `classes`.
    primary.class = primary.classes;
    await primary.save();
    if (group.length > 1) await Subject.deleteMany({ _id: { $in: group.slice(1).map(subject => subject._id) } });
  }
}

exports.addSubject = async (req, res) => {
  try {
    if (!req.user?.schoolName) return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    const name = cleanName(req.body.name);
    const classIds = await validateClasses(req.body.classIds ?? req.body.classId, req.user.schoolName);
    if (!name || !classIds) return res.status(400).json({ message: "Subject name and one or more classes from your school are required" });

    const candidates = await Subject.find({ schoolName: req.user.schoolName });
    let subject = candidates.find(item => normalize(item.name) === normalize(name));
    if (subject) {
      const ids = new Set([...(subject.classes || []).map(String), ...(Array.isArray(subject.class) ? subject.class : [subject.class]).filter(Boolean).map(String), ...classIds]);
      subject.classes = [...ids];
      subject.class = subject.classes;
      await subject.save();
    } else {
      subject = await Subject.create({ name, class: classIds, classes: classIds, schoolName: req.user.schoolName });
    }
    await subject.populate({ path: "classes", select: "name section" });
    res.status(201).json({ message: "Subject classes updated", subject: serialize(subject) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getSubjects = async (req, res) => {
  try {
    if (!req.user?.schoolName) return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    await migrateLegacySubjects(req.user.schoolName);
    const subjects = await Subject.find({ schoolName: req.user.schoolName }).populate({ path: "classes", select: "name section" }).sort({ name: 1 });
    res.json(subjects.map(serialize));
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteSubject = async (req, res) => {
  try {
    if (!req.user?.schoolName) return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, schoolName: req.user.schoolName });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateSubject = async (req, res) => {
  try {
    if (!req.user?.schoolName) return res.status(403).json({ message: "Forbidden: You are not assigned to a school" });
    const { name, classIds } = req.body;
    const { id } = req.params;
    const subject = await Subject.findOne({ _id: id, schoolName: req.user.schoolName });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    
    const cleanedName = cleanName(name);
    const validatedClassIds = await validateClasses(classIds, req.user.schoolName);
    if (!cleanedName || !validatedClassIds) {
      return res.status(400).json({ message: "Subject name and one or more classes from your school are required" });
    }
    
    subject.name = cleanedName;
    subject.classes = validatedClassIds;
    subject.class = validatedClassIds;
    await subject.save();
    await subject.populate({ path: "classes", select: "name section" });
    res.json({ message: "Subject updated successfully", subject: serialize(subject) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
