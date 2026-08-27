const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  addSubject,
  getSubjects,
  deleteSubject,
  updateSubject
} = require("../controllers/subjectController");

router.use(protect);
router.use(authorize("admin"));

router.post("/", addSubject);

router.get("/", getSubjects);

router.put("/:id", updateSubject);

router.delete("/:id", deleteSubject);

module.exports = router;