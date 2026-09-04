const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const syllabusController = require("../controllers/syllabusController");

// Teacher Endpoints
router.get("/subject/:subjectId", protect, syllabusController.getSubjectSyllabus);
router.put("/subject/:subjectId/chapter/:chapterId/status", protect, authorize("teacher", "admin", "superadmin"), syllabusController.updateChapterStatus);
router.post("/subject/:subjectId/chapter/:chapterId/topic", protect, authorize("teacher", "admin", "superadmin"), syllabusController.addSubTopic);
router.patch("/subject/:subjectId/chapter/:chapterId/topic/:topicId", protect, authorize("teacher", "admin", "superadmin"), syllabusController.toggleTopicStatus);
router.post("/subject/:subjectId/custom-chapter", protect, authorize("teacher", "admin", "superadmin"), syllabusController.addCustomChapter);

// Admin Master Endpoint
router.get("/master", protect, authorize("admin", "superadmin"), syllabusController.getMasterSyllabus);
router.post("/master", protect, authorize("admin", "superadmin"), syllabusController.createMasterSyllabus);

module.exports = router;
