const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  getUsers, 
  assignRole, 
  getSchools, 
  deleteUser, 
  getDashboardStats, 
  getSchoolsDetail, 
  createSchool, 
  updateSchool, 
  deleteSchool,
  getSupportTeam,
  createSupportAgent,
  toggleSupportStatus,
  revokeSupportRole
} = require("../controllers/superAdminController");

const {
  getSuperAdminRequests,
  processSuperAdminAction
} = require("../controllers/schoolChangeController");

router.use(protect);
router.use(authorize("superadmin"));

router.get("/users", getUsers);
router.post("/assign-role", assignRole);
router.get("/schools", getSchools);
router.delete("/users/:id", deleteUser);
router.get("/dashboard-stats", getDashboardStats);
router.get("/schools-detail", getSchoolsDetail);

// School Change Requests Routes (Super Admin Only)
router.get("/school-change-requests", getSuperAdminRequests);
router.post("/school-change-requests/:id/action", processSuperAdminAction);

// Support Team Management Routes
router.get("/support-team", getSupportTeam);
router.post("/support-team/create", createSupportAgent);
router.patch("/support-team/:id/status", toggleSupportStatus);
router.delete("/support-team/:id", revokeSupportRole);

router.post("/schools", createSchool);
router.put("/schools/:id", updateSchool);
router.delete("/schools/:id", deleteSchool);

module.exports = router;
