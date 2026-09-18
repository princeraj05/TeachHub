const mongoose = require("mongoose");

const helpArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Article title is required"],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: [
      "Login",
      "School Joining",
      "Student",
      "Teacher",
      "Admin",
      "Fees",
      "Attendance",
      "Exams",
      "Technical Issues",
      "General"
    ],
    default: "General",
    index: true
  },
  summary: {
    type: String,
    default: "",
    trim: true
  },
  content: {
    type: String,
    required: [true, "Article content is required"]
  },
  status: {
    type: String,
    enum: ["published", "draft", "archived"],
    default: "published",
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: String,
    default: "95%"
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

helpArticleSchema.index({ title: "text", summary: "text", content: "text" });

module.exports = mongoose.model("HelpArticle", helpArticleSchema);
