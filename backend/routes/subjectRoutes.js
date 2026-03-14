const express = require("express");
const router = express.Router();

const {
  addSubject,
  getSubjects,
  deleteSubject
} = require("../controllers/subjectController");

router.post("/", addSubject);

router.get("/", getSubjects);

router.delete("/:id", deleteSubject);

module.exports = router;