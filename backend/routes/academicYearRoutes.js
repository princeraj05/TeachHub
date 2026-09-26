// backend/routes/academicYearRoutes.js
const express = require("express");
const router = express.Router();
const academicYearController = require("../controllers/academicYearController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", academicYearController.getAcademicYears);
router.post("/", authorize("admin", "superadmin"), academicYearController.createAcademicYear);
router.put("/:id/activate", authorize("admin", "superadmin"), academicYearController.activateAcademicYear);

module.exports = router;
