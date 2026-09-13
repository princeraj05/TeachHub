const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const resultController = require("../controllers/resultController");

// ================= ROSTER FOR MARKS ENTRY =================
router.get(
  "/roster",
  protect,
  authorize("admin", "superadmin", "teacher"),
  resultController.getRoster
);

// ================= SAVE MARKS (SINGLE OR BULK) =================
router.post(
  "/marks",
  protect,
  authorize("admin", "superadmin", "teacher"),
  resultController.saveMarks
);

// ================= CLASS RESULT SUMMARY (ADMIN REVIEW) =================
router.get(
  "/class-summary",
  protect,
  authorize("admin", "superadmin", "teacher"),
  resultController.getClassSummary
);

// ================= PUBLISH RESULTS =================
router.post(
  "/publish",
  protect,
  authorize("admin", "superadmin"),
  resultController.publishResults
);

// ================= UNPUBLISH RESULTS =================
router.post(
  "/unpublish",
  protect,
  authorize("admin", "superadmin"),
  resultController.unpublishResults
);

module.exports = router;
