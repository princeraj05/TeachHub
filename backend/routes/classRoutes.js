const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  addClass,
  getClasses,
  deleteClass,
  updateClass
} = require("../controllers/classController");

router.use(protect);
router.use(authorize("admin"));

router.post("/", addClass);

router.get("/", getClasses);

router.put("/:id", updateClass);

router.delete("/:id", deleteClass);

module.exports = router;