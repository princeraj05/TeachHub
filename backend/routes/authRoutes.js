const express = require("express");
const { register, login, firebaseSync } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-sync", firebaseSync);

module.exports = router;