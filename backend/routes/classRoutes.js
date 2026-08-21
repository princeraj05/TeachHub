const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  addClass,
  getClasses,
  deleteClass
} = require("../controllers/classController");

router.use(protect);
router.use(authorize("admin"));

router.post("/", addClass);

router.get("/", getClasses);

router.delete("/:id", deleteClass);

module.exports = router;