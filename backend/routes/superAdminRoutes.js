const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getUsers, assignRole, getSchools } = require("../controllers/superAdminController");

router.use(protect);
router.use(authorize("superadmin"));

router.get("/users", getUsers);
router.post("/assign-role", assignRole);
router.get("/schools", getSchools);

module.exports = router;
