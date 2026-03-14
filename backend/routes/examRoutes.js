const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");


// ================= CREATE EXAM =================

router.post(
"/",
protect,
authorize("admin"),
examController.createExam
);


// ================= GET EXAMS =================

router.get(
"/",
protect,
examController.getAllExams
);


// ================= DELETE EXAM =================

router.delete(
"/:id",
protect,
authorize("admin"),
examController.deleteExam
);


module.exports = router;