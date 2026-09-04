const MasterSyllabus = require("../models/MasterSyllabus");
const SubjectSyllabus = require("../models/SubjectSyllabus");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// Helper: Seed default 10 chapters if no MasterSyllabus exists
const getDefaultChaptersForSubject = (subjectName) => {
  const isHindi = (subjectName || "").toLowerCase().includes("hindi");
  const isMath = (subjectName || "").toLowerCase().includes("math");
  const isScience = (subjectName || "").toLowerCase().includes("science");

  if (isHindi) {
    return [
      { chapterNo: 1, title: "कबीरदास - साखी (Kabirdas Sakhi)", description: "पद, दोहे एवं भावार्थ", topics: [{ title: "साखी पठन एवं अर्थ", completed: true }, { title: "कठिन शब्द एवं प्रश्न-उत्तर", completed: true }] },
      { chapterNo: 2, title: "सूरदास - पद (Surdas Pada)", description: "भक्ति काल एवं वात्सल्य रस", topics: [{ title: "पद व्याख्या", completed: true }, { title: "अभ्यास प्रश्न", completed: false }] },
      { chapterNo: 3, title: "तुलसीदास - राम-लक्ष्मण-परशुराम संवाद", description: "रामचरितमानस बालकांड अंश", topics: [{ title: "चौपाई एवं दोहा अर्थ", completed: false }] },
      { chapterNo: 4, title: "जयशंकर प्रसाद - आत्मकथ्य", description: "छायावादी काव्य संग्रह", topics: [{ title: "कविता वाचन एवं भाव", completed: false }] },
      { chapterNo: 5, title: "सूर्यकांत त्रिपाठी 'निराला' - उत्साह और अत नहीं रही", description: "प्रकृति सौंदर्य एवं क्रांति चेतना", topics: [{ title: "काव्य बोध", completed: false }] },
      { chapterNo: 6, title: "नेताजी का चश्मा (Netaji Ka Chashma)", description: "देशभक्ति एवं सामाजिक संदेश", topics: [{ title: "कहानी सार एवं पात्र परिचय", completed: false }] },
      { chapterNo: 7, title: "बालगोबिन भगत (Balgobin Bhagat)", description: "रामवृक्ष बेनीपुरी रचित रेखाचित्र", topics: [{ title: "चरित्र चित्रण", completed: false }] },
      { chapterNo: 8, title: "लखनवी अंदाज (Lakhnavi Andaz)", description: "यशपाल द्वारा रचित व्यंग्य", topics: [{ title: "व्यंग्यात्मक शैली विश्लेषण", completed: false }] },
      { chapterNo: 9, title: "हिंदी व्याकरण - समास एवं वाक्य भेद", description: "संधि, समास, पदबंध एवं वाक्य रचना", topics: [{ title: "समास भेद", completed: false }, { title: "वाक्य रूपांतरण", completed: false }] },
      { chapterNo: 10, title: "अपठित गद्यांश एवं निबंध लेखन", description: "रचनात्मक लेखन एवं अनुच्छेद", topics: [{ title: "निबंध लेखन अभ्यास", completed: false }] }
    ];
  }

  if (isMath) {
    return [
      { chapterNo: 1, title: "Real Numbers", description: "Euclid's division lemma & Fundamental Theorem of Arithmetic", topics: [{ title: "Prime Factorization", completed: true }] },
      { chapterNo: 2, title: "Polynomials", description: "Zeros of polynomial & division algorithm", topics: [{ title: "Quadratic Polynomials", completed: true }] },
      { chapterNo: 3, title: "Pair of Linear Equations in Two Variables", description: "Graphical & Algebraic methods", topics: [{ title: "Substitution & Elimination Method", completed: false }] },
      { chapterNo: 4, title: "Quadratic Equations", description: "Standard form & quadratic formula", topics: [{ title: "Factorization & Discriminant", completed: false }] },
      { chapterNo: 5, title: "Arithmetic Progressions", description: "nth term & sum of first n terms", topics: [{ title: "AP Formulae", completed: false }] },
      { chapterNo: 6, title: "Triangles & Geometry", description: "Similarity of triangles & Pythagoras theorem", topics: [{ title: "BPT Theorem", completed: false }] },
      { chapterNo: 7, title: "Coordinate Geometry", description: "Distance & section formulas", topics: [{ title: "Distance Formula", completed: false }] },
      { chapterNo: 8, title: "Introduction to Trigonometry", description: "Trigonometric ratios & identities", topics: [{ title: "Sin/Cos/Tan Ratios", completed: false }] },
      { chapterNo: 9, title: "Circles & Areas Related to Circles", description: "Tangents & Sector Areas", topics: [{ title: "Area of Segment", completed: false }] },
      { chapterNo: 10, title: "Statistics & Probability", description: "Mean, Median, Mode & basic probability", topics: [{ title: "Grouped Data Statistics", completed: false }] }
    ];
  }

  // Generic fallback for any other subject
  return Array.from({ length: 10 }, (_, i) => ({
    chapterNo: i + 1,
    title: `${subjectName || "Subject"} - Chapter ${i + 1}`,
    description: `Fundamental overview and exercises for Unit ${i + 1}`,
    topics: [
      { title: `Introduction to Unit ${i + 1}`, completed: i < 3 },
      { title: `Core Concepts & Applications`, completed: i < 2 }
    ]
  }));
};

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
      const firstClassName = subjectObj.classes && subjectObj.classes.length > 0 ? subjectObj.classes[0].name : "10";
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
        initialChapters = getDefaultChaptersForSubject(subjectObj.name);
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
