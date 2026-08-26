const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getUsers, assignRole, getSchools, deleteUser, getDashboardStats } = require("../controllers/superAdminController");

router.use(protect);
router.use(authorize("superadmin"));

router.get("/users", getUsers);
router.post("/assign-role", assignRole);
router.get("/schools", getSchools);
router.delete("/users/:id", deleteUser);
router.get("/dashboard-stats", getDashboardStats);

module.exports = router;
