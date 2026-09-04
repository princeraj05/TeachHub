const MasterSyllabus = require("../models/MasterSyllabus");
const SubjectSyllabus = require("../models/SubjectSyllabus");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// Helper: Seed default chapters if no MasterSyllabus exists (returns empty array so syllabus starts clean)
const getDefaultChaptersForSubject = () => [];

// 1. Get Teacher Subject Syllabus (Auto-clone from Master or default)
exports.getSubjectSyllabus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.user.id;

    let syllabus = await SubjectSyllabus.findOne({ subject: subjectId })
      .populate("subject", "name code classes")
      .lean();

    if (!syllabus) {
      // Find subject details
      const subjectObj = await Subject.findById(subjectId).populate("classes", "name section").lean();
      if (!subjectObj) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Check if MasterSyllabus exists for school & subject
      const master = await MasterSyllabus.findOne({
        schoolName: req.user.schoolName || "",
        subjectName: new RegExp("^" + subjectObj.name.trim() + "$", "i")
      }).lean();

      let initialChapters = [];
      if (master && master.chapters && master.chapters.length > 0) {
        initialChapters = master.chapters.map(ch => ({
          chapterNo: ch.chapterNo,
          title: ch.title,
          description: ch.description || "",
          status: "Not Started",
          isMasterChapter: true,
          topics: (ch.defaultTopics || []).map(t => ({ title: t, completed: false }))
        }));
      } else {
        initialChapters = getDefaultChaptersForSubject();
      }

      // Create new SubjectSyllabus doc
      const newSyllabusDoc = await SubjectSyllabus.create({
        subject: subjectId,
        teacher: teacherId,
        schoolName: req.user.schoolName || "",
        chapters: initialChapters
      });

      syllabus = await SubjectSyllabus.findById(newSyllabusDoc._id)
        .populate("subject", "name code classes")
        .lean();
    }

    // Calculate progression stats
    const totalChapters = syllabus.chapters.length;
    const completedChapters = syllabus.chapters.filter(ch => ch.status === "Completed").length;
    const inProgressChapters = syllabus.chapters.filter(ch => ch.status === "In Progress").length;
    const notStartedChapters = syllabus.chapters.filter(ch => ch.status === "Not Started").length;

    let progressPercentage = 0;
    if (totalChapters > 0) {
      const chapterWeight = 100 / totalChapters;
      progressPercentage = Math.round(
        completedChapters * chapterWeight + inProgressChapters * (chapterWeight * 0.4)
      );
    }

    res.json({
      ...syllabus,
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
    const { status } = req.body;

    if (!["Not Started", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
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
    const { topicTitle } = req.body;

    if (!topicTitle || !topicTitle.trim()) {
      return res.status(400).json({ message: "Topic title is required" });
    }

    const syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
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

    const syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
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
    const { title, description, topics } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Chapter title is required" });
    }

    const syllabus = await SubjectSyllabus.findOne({ subject: subjectId });
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

    const master = await MasterSyllabus.findOneAndUpdate(
      {
        schoolName: req.user.schoolName || "",
        className,
        subjectName
      },
      {
        schoolName: req.user.schoolName || "",
        className,
        subjectName,
        chapters,
        createdBy: req.user.id
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Master syllabus saved", master });
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

    const master = await MasterSyllabus.findOne({
      schoolName: req.user.schoolName || "",
      className,
      subjectName: new RegExp("^" + subjectName.trim() + "$", "i")
    }).lean();

    if (!master) {
      return res.json({ className, subjectName, chapters: [], isDefault: true });
    }

    res.json(master);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
