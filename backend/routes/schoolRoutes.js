// backend/routes/schoolRoutes.js
const express = require("express");
const router = express.Router();

const profileRoutes = require("./school/profileRoutes");
const mediaRoutes = require("./school/mediaRoutes");
const publicRoutes = require("./school/publicRoutes");

// Register specific profile & media routes first
router.use("/", profileRoutes);
router.use("/", mediaRoutes);

// Register list and parameterized public routes last
router.use("/", publicRoutes);

module.exports = router;
