// backend/routes/schoolRoutes.js
const express = require("express");
const router = express.Router();

const basicInformationRoutes = require("./school/basicInformationRoutes");
const mediaPrincipalRoutes = require("./school/mediaPrincipalRoutes");
const admissionSettingsRoutes = require("./school/admissionSettingsRoutes");
const schoolDescriptionRoutes = require("./school/schoolDescriptionRoutes");
const profileRoutes = require("./school/profileRoutes");
const mediaRoutes = require("./school/mediaRoutes");
const publicRoutes = require("./school/publicRoutes");

// Register modular endpoints first
router.use("/", basicInformationRoutes);
router.use("/", mediaPrincipalRoutes);
router.use("/", admissionSettingsRoutes);
router.use("/", schoolDescriptionRoutes);
router.use("/", profileRoutes);
router.use("/", mediaRoutes);

// Register list and parameterized public routes last
router.use("/", publicRoutes);

module.exports = router;
