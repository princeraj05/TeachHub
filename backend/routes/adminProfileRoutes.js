const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getAdminProfile,
  updateAdminProfile
} = require("../controllers/adminProfileController");

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAdminProfile);

router.put("/update", updateAdminProfile);

module.exports = router;