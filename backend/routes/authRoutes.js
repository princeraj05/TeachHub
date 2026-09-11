const express = require("express");
const { login, firebaseSync, sendOTP, verifyOTP, getProfile, updateProfile, getSchools, submitJoinRequest, logout, getSessions, logoutSession, logoutAllOtherSessions, getOnboardingStatus, submitAdminOnboarding } = require("../controllers/authController");
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
router.get("/onboarding-status", protect, getOnboardingStatus);
router.post("/submit-onboarding", protect, submitAdminOnboarding);

// Session endpoints
router.get("/sessions", protect, getSessions);
router.post("/sessions/:id/logout", protect, logoutSession);
router.post("/sessions/logout-others", protect, logoutAllOtherSessions);

module.exports = router;