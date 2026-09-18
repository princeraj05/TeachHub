const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/eventVideoInteractionController");

// All video interaction endpoints require authentication
router.post("/stats", protect, controller.getVideoStats);
router.post("/like", protect, controller.toggleLikeVideo);
router.post("/save", protect, controller.toggleSaveVideo);
router.get("/comments", protect, controller.getVideoComments);
router.post("/comments", protect, controller.addVideoComment);

module.exports = router;
