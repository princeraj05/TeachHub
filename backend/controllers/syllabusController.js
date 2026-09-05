const MasterSyllabus = require("../models/MasterSyllabus");
const SubjectSyllabus = require("../models/SubjectSyllabus");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// Helper: Seed default chapters if no MasterSyllabus exists (returns empty array so syllabus starts clean)
const getDefaultChaptersForSubject = () => [];

// Helper: Extract base class name (e.g. "Class 1" from "Class 1 - A" or "1")
const extractBaseClassName = (str) => {
  if (!str) return "Class 1";
  const numMatch = String(str).match(/\d+/);
  if (numMatch) {
    return `Class ${numMatch[0]}`;
  }
  return String(str).trim();
};

// 1. Get Teacher Subject Syllabus (Auto-clone from Master or default for specific class)
exports.getSubjectSyllabus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.user.id;

    // Find subject details first to know default class if className is missing
    const subjectObj = await Subject.findById(subjectId).populate("classes", "name section").lean();
    if (!subjectObj) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Determine target className (e.g. "Class 1")
    const rawClassName = req.query.className || (subjectObj.classes?.[0] ? `Class ${subjectObj.classes[0].name}` : "Class 1");
    const targetClassName = extractBaseClassName(rawClassName);

    let syllabus = await SubjectSyllabus.findOne({
      subject: subjectId,
      $or: [
        { className: targetClassName },
        { className: rawClassName },
        { className: targetClassName.replace("Class ", "") }
      ]
    })
      .populate("subject", "name code classes")
      .lean();

    // Check master syllabus template with multi-tier fallback matching
    const escapeRegex = (str) => String(str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const classCandidates = [targetClassName, rawClassName, targetClassName.replace("Class ", ""), "Class " + targetClassName.replace("Class ", ""), "1"];
    
    let master = null;
    if (req.user.schoolName) {
      master = await MasterSyllabus.findOne({
        schoolName: new RegExp("^" + escapeRegex(req.user.schoolName) + "$", "i"),
        className: { $in: classCandidates },
        subjectName: new RegExp("^" + escapeRegex(subjectObj.name) + "$", "i")
      }).lean();
    }

    if (!master) {
      master = await MasterSyllabus.findOne({
        subjectName: new RegExp("^" + escapeRegex(subjectObj.name) + "$", "i"),
        className: { $in: classCandidates }
      }).lean();
    }

    if (!master) {
      master = await MasterSyllabus.findOne({
        subjectName: new RegExp("^" + escapeRegex(subjectObj.name) + "$", "i")
      }).lean();
    }

    const masterChapters = (master && master.chapters && master.chapters.length > 0)
      ? master.chapters.map(ch => ({
          chapterNo: ch.chapterNo,
          title: ch.title,
          description: ch.description || "",
          status: "Not Started",
          isMasterChapter: true,
          topics: (ch.defaultTopics || []).map(t => ({ title: typeof t === 'string' ? t : (t.title || ""), completed: false }))
        }))
      : [];

    if (!syllabus) {
      // Create new SubjectSyllabus doc for this class
      const newSyllabusDoc = await SubjectSyllabus.create({
        subject: subjectId,
        className: targetClassName,
        teacher: teacherId,
        schoolName: req.user.schoolName || "",
        chapters: masterChapters
      });

      syllabus = await SubjectSyllabus.findById(newSyllabusDoc._id)
        .populate("subject", "name code classes")
        .lean();
    } else {
      let updated = false;
      const currentChs = syllabus.chapters || [];
      
      if (currentChs.length === 0 && masterChapters.length > 0) {
        await SubjectSyllabus.updateOne(
          { _id: syllabus._id },
          { $set: { chapters: masterChapters } }
        );
        updated = true;
      } else if (masterChapters.length > 0) {
        const existingTitles = new Set(currentChs.map(c => c.title.trim().toLowerCase()));
        const missingMasterChs = masterChapters.filter(ch => !existingTitles.has(ch.title.trim().toLowerCase()));
        
        if (missingMasterChs.length > 0) {
          await SubjectSyllabus.updateOne(
            { _id: syllabus._id },
            { $push: { chapters: { $each: missingMasterChs } } }
          );
          updated = true;
        }
      }

      if (updated) {
        syllabus = await SubjectSyllabus.findById(syllabus._id)
          .populate("subject", "name code classes")
          .lean();
      }
    }

    // Calculate progression stats
    const totalChapters = (syllabus.chapters || []).length;
    const completedChapters = (syllabus.chapters || []).filter(ch => ch.status === "Completed").length;
    const inProgressChapters = (syllabus.chapters || []).filter(ch => ch.status === "In Progress").length;
    const notStartedChapters = (syllabus.chapters || []).filter(ch => ch.status === "Not Started").length;

    let progressPercentage = 0;
    if (totalChapters > 0) {
      const chapterWeight = 100 / totalChapters;
      progressPercentage = Math.round(
        completedChapters * chapterWeight + inProgressChapters * (chapterWeight * 0.4)
      );
    }

    res.json({
      ...syllabus,
      className: targetClassName,
      stats: {
        totalChapters,
        completedChapters,
        inProgressChapters,
        notStartedChapters,
        progressPercentage
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Update Chapter Status (Not Started | In Progress | Completed)
exports.updateChapterStatus = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.params;
    const { status, className } = req.body;
    const targetClassName = extractBaseClassName(className || req.query.className);

    if (!["Not Started", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let syllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: targetClassName });
    if (!syllabus) {
      syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
    }
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus record not found" });
    }

    const chapter = syllabus.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found in syllabus" });
    }

    chapter.status = status;
    if (status === "Completed") {
      chapter.completedDate = new Date();
      // Auto-mark topics completed if chapter completed
      chapter.topics.forEach(t => { t.completed = true; });
    } else if (status === "Not Started") {
      chapter.completedDate = null;
    }

    await syllabus.save();
    res.json({ success: true, message: "Chapter status updated", syllabus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Add Sub-Topic to Chapter
exports.addSubTopic = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.params;
    const { topicTitle, className } = req.body;
    const targetClassName = extractBaseClassName(className || req.query.className);

    if (!topicTitle || !topicTitle.trim()) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    let syllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: targetClassName });
    if (!syllabus) {
      syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
    }
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus record not found" });
    }

    const chapter = syllabus.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    chapter.topics.push({
      title: topicTitle.trim(),
      completed: false
    });

    if (chapter.status === "Not Started") {
      chapter.status = "In Progress";
    }

    await syllabus.save();
    res.json({ success: true, message: "Sub-topic added", syllabus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Toggle Topic Completion State
exports.toggleTopicStatus = async (req, res) => {
  try {
    const { subjectId, chapterId, topicId } = req.params;
    const targetClassName = extractBaseClassName(req.query.className || req.body.className);

    let syllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: targetClassName });
    if (!syllabus) {
      syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
    }
    if (!syllabus) return res.status(404).json({ message: "Syllabus record not found" });

    const chapter = syllabus.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const topic = chapter.topics.id(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.completed = !topic.completed;

    // Recalculate chapter status
    const allCompleted = chapter.topics.length > 0 && chapter.topics.every(t => t.completed);
    const anyCompleted = chapter.topics.some(t => t.completed);

    if (allCompleted) {
      chapter.status = "Completed";
      chapter.completedDate = new Date();
    } else if (anyCompleted) {
      chapter.status = "In Progress";
    }

    await syllabus.save();
    res.json({ success: true, message: "Topic status updated", syllabus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Add Custom Chapter (Teacher Level)
exports.addCustomChapter = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { title, description, topics, className } = req.body;
    const targetClassName = extractBaseClassName(className || req.query.className);

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Chapter title is required" });
    }

    let syllabus = await SubjectSyllabus.findOne({ subject: subjectId, className: targetClassName });
    if (!syllabus) {
      syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
    }
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus record not found" });
    }

    const nextChapterNo = syllabus.chapters.length + 1;
    const formattedTopics = (topics || []).filter(t => t && t.trim()).map(t => ({
      title: t.trim(),
      completed: false
    }));

    syllabus.chapters.push({
      chapterNo: nextChapterNo,
      title: title.trim(),
      description: description || "",
      status: "Not Started",
      isMasterChapter: false,
      topics: formattedTopics
    });

    await syllabus.save();
    res.json({ success: true, message: "Custom chapter added to syllabus", syllabus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Admin Create or Update Master Syllabus Template
exports.createMasterSyllabus = async (req, res) => {
  try {
    const { className, subjectName, chapters } = req.body;

    if (!className || !subjectName || !Array.isArray(chapters)) {
      return res.status(400).json({ message: "className, subjectName, and chapters array required" });
    }

    const targetClassName = extractBaseClassName(className);
    const cleanSubjectName = subjectName.trim();
    const schoolName = req.user.schoolName || "";

    const master = await MasterSyllabus.findOneAndUpdate(
      {
        schoolName: new RegExp("^" + schoolName.trim() + "$", "i"),
        className: { $in: [targetClassName, className, targetClassName.replace("Class ", "")] },
        subjectName: new RegExp("^" + cleanSubjectName + "$", "i")
      },
      {
        schoolName: schoolName,
        className: targetClassName,
        subjectName: cleanSubjectName,
        chapters,
        createdBy: req.user.id
      },
      { new: true, upsert: true }
    );

    // Auto-update any existing or new SubjectSyllabus for this school + subjectName + className
    const initialChapters = chapters.map(ch => ({
      chapterNo: ch.chapterNo,
      title: ch.title,
      description: ch.description || "",
      status: "Not Started",
      isMasterChapter: true,
      topics: (ch.defaultTopics || []).map(t => ({ title: typeof t === 'string' ? t : (t.title || ""), completed: false }))
    }));

    const subjectQuery = { schoolName: new RegExp("^" + schoolName.trim() + "$", "i") };
    if (cleanSubjectName) {
      subjectQuery.name = new RegExp("^" + cleanSubjectName + "$", "i");
    }
    const matchingSubjects = await Subject.find(subjectQuery);

    for (const subObj of matchingSubjects) {
      let subSyllabus = await SubjectSyllabus.findOne({
        subject: subObj._id,
        $or: [
          { className: targetClassName },
          { className: className },
          { className: targetClassName.replace("Class ", "") }
        ]
      });

      if (!subSyllabus) {
        await SubjectSyllabus.create({
          subject: subObj._id,
          className: targetClassName,
          teacher: subObj.teacher || req.user.id,
          schoolName: schoolName,
          chapters: initialChapters
        });
      } else {
        // Sync master chapters into existing SubjectSyllabus
        const currentChs = subSyllabus.chapters || [];
        const masterNos = new Set(initialChapters.map(c => c.chapterNo));
        const masterTitles = new Set(initialChapters.map(c => c.title.trim().toLowerCase()));

        // Update titles & descriptions or add new chapters from master
        initialChapters.forEach(mCh => {
          const matchIdx = currentChs.findIndex(c => c.chapterNo === mCh.chapterNo || c.title.trim().toLowerCase() === mCh.title.trim().toLowerCase());
          if (matchIdx !== -1) {
            currentChs[matchIdx].title = mCh.title;
            if (mCh.description) currentChs[matchIdx].description = mCh.description;
          } else {
            currentChs.push(mCh);
          }
        });

        currentChs.sort((a, b) => a.chapterNo - b.chapterNo);
        subSyllabus.chapters = currentChs;
        await subSyllabus.save();
      }
    }

    res.json({ success: true, message: "Master syllabus saved and synced across classes", master });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Get Master Syllabus for specific className and subjectName
exports.getMasterSyllabus = async (req, res) => {
  try {
    const { className, subjectName } = req.query;
    if (!className || !subjectName) {
      return res.status(400).json({ message: "className and subjectName query parameters required" });
    }

    const targetClassName = extractBaseClassName(className);

    const master = await MasterSyllabus.findOne({
      schoolName: new RegExp("^" + (req.user.schoolName || "").trim() + "$", "i"),
      className: { $in: [targetClassName, className, targetClassName.replace("Class ", "")] },
      subjectName: new RegExp("^" + subjectName.trim() + "$", "i")
    }).lean();

    if (!master) {
      return res.json({ className: targetClassName, subjectName, chapters: [], isDefault: true });
    }

    res.json(master);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
