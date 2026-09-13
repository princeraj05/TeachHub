const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  submitDeletionRequest,
  getDeletionRequests,
  updateDeletionRequestStatus
} = require("../controllers/accountDeletionController");

// Public endpoint for submitting account deletion requests
router.post("/", submitDeletionRequest);

// Protected endpoints for SuperAdmin monitoring
router.get("/", protect, authorize("superadmin"), getDeletionRequests);
router.put("/:id", protect, authorize("superadmin"), updateDeletionRequestStatus);

module.exports = router;
