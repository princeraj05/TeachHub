const express = require("express");
const { login, firebaseSync, sendOTP, verifyOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/firebase-sync", firebaseSync);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;