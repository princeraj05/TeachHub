const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getSchools, getSchoolDetails, getSchoolTeachers, getMySchool, updateMySchool, uploadSchoolPhoto } = require("../controllers/schoolController");

// Configure Multer storage to reuse the backend/uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Register specific routes first
router.get("/my-school", protect, authorize("admin"), getMySchool);
router.put("/my-school", protect, authorize("admin"), updateMySchool);
router.post("/upload", protect, authorize("admin"), upload.single("image"), uploadSchoolPhoto);

// Register list and parameterized routes last
router.get("/", protect, getSchools);
router.get("/:name", protect, getSchoolDetails);
router.get("/:name/teachers", protect, getSchoolTeachers);


module.exports = router;
