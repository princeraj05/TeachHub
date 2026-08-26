const express = require("express");
const { login, firebaseSync, sendOTP, verifyOTP, getProfile, updateProfile, getSchools, submitJoinRequest, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/firebase-sync", firebaseSync);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", protect, logout);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/schools", protect, getSchools);
router.put("/join-request", protect, submitJoinRequest);

module.exports = router;