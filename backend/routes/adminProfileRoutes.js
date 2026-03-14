const express = require("express");
const router = express.Router();

const {
  getAdminProfile,
  updateAdminProfile
} = require("../controllers/adminProfileController");


router.get("/", getAdminProfile);

router.put("/update", updateAdminProfile);

module.exports = router;