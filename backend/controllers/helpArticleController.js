const mongoose = require("mongoose");
const HelpArticle = require("../models/HelpArticle");

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/support/help-articles
exports.getAllArticles = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const query = {};

    // Published-only restriction for non-SuperAdmin users
    if (req.user.role !== "superadmin") {
      query.status = "published";
    } else if (status) {
      query.status = status;
    }

    if (category && category.toLowerCase() !== "all") {
      const catRegex = new RegExp("^" + escapeRegex(category) + "$", "i");
      query.category = catRegex;
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { title: sRegex },
        { summary: sRegex },
        { category: sRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 50), 100);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total, categoriesCount] = await Promise.all([
      HelpArticle.find(query)
        .populate("author", "name email role")
        .sort({ isFeatured: -1, views: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HelpArticle.countDocuments(query),
      HelpArticle.aggregate([
        { $match: req.user.role !== "superadmin" ? { status: "published" } : {} },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ])
    ]);

    const statsMap = {};
    categoriesCount.forEach(c => {
      if (c._id) statsMap[c._id] = c.count;
    });

    res.json({
      articles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      },
      categoryStats: statsMap
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/support/help-articles/:id
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid article ID format." });
    }

    const article = await HelpArticle.findById(id)
      .populate("author", "name email role avatar")
      .populate("updatedBy", "name email role");

    if (!article) {
      return res.status(404).json({ message: "Help article not found." });
    }

    // Protection: draft/archived articles viewable only by SuperAdmin
    if (article.status !== "published" && req.user.role !== "superadmin") {
      return res.status(404).json({ message: "Help article not found." });
    }

    // Increment view count asynchronously
    HelpArticle.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(() => {});

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/support/help-articles (Super Admin ONLY)
exports.createArticle = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access Denied: Only Super Admin can create help articles." });
    }

    const { title, category, content, summary, status, isFeatured, rating } = req.body;

    if (!title || !title.trim() || !category || !content || !content.trim()) {
      return res.status(400).json({ message: "Title, category, and content are required fields." });
    }

    const validCategories = [
      "Login", "School Joining", "Student", "Teacher", "Admin", 
      "Fees", "Attendance", "Exams", "Technical Issues", "General"
    ];
    const finalCategory = validCategories.includes(category) ? category : "General";

    const article = await HelpArticle.create({
      title: title.trim(),
      category: finalCategory,
      summary: (summary || "").trim(),
      content: content.trim(),
      status: ["published", "draft", "archived"].includes(status) ? status : "published",
      author: req.user.id,
      updatedBy: req.user.id,
      rating: rating || "95%",
      isFeatured: !!isFeatured
    });

    const populated = await HelpArticle.findById(article._id).populate("author", "name email role");

    res.status(201).json({
      message: "Help article created successfully",
      article: populated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/support/help-articles/:id (Super Admin ONLY)
exports.updateArticle = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access Denied: Only Super Admin can update help articles." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid article ID format." });
    }

    const article = await HelpArticle.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Help article not found." });
    }

    const { title, category, content, summary, status, isFeatured, rating } = req.body;

    if (title && title.trim()) article.title = title.trim();
    if (category) {
      const validCategories = [
        "Login", "School Joining", "Student", "Teacher", "Admin", 
        "Fees", "Attendance", "Exams", "Technical Issues", "General"
      ];
      if (validCategories.includes(category)) article.category = category;
    }
    if (summary !== undefined) article.summary = summary.trim();
    if (content && content.trim()) article.content = content.trim();
    if (status && ["published", "draft", "archived"].includes(status)) article.status = status;
    if (rating) article.rating = rating;
    if (isFeatured !== undefined) article.isFeatured = !!isFeatured;

    article.updatedBy = req.user.id;
    await article.save();

    const updated = await HelpArticle.findById(id)
      .populate("author", "name email role")
      .populate("updatedBy", "name email role");

    res.json({
      message: "Help article updated successfully",
      article: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/support/help-articles/:id (Super Admin ONLY)
exports.deleteArticle = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access Denied: Only Super Admin can delete help articles." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid article ID format." });
    }

    const article = await HelpArticle.findByIdAndDelete(id);
    if (!article) {
      return res.status(404).json({ message: "Help article not found." });
    }

    res.json({ success: true, message: "Help article deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
