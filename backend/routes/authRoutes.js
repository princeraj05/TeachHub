const express = require("express");
const { login, firebaseSync, sendOTP, verifyOTP, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/firebase-sync", firebaseSync);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;