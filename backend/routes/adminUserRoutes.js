const express = require("express");
const router = express.Router();

const {
getTeachers,
getStudents
} = require("../controllers/adminUserController");


router.get("/teachers",getTeachers);

router.get("/students",getStudents);


module.exports = router;