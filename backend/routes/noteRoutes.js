const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/authMiddleware");
const noteController = require("../controllers/noteController");

// Multer storage for temporary uploads
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
    const cleanOriginalName = (file.originalname || "file").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const uploadSingleFile = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Invalid file upload" });
    }
    next();
  });
};

router.post("/", protect, authorize("teacher", "admin", "superadmin"), uploadSingleFile, noteController.createNote);
router.get("/subject/:subjectId", protect, noteController.getSubjectNotes);
router.delete("/:noteId", protect, authorize("teacher", "admin", "superadmin"), noteController.deleteNote);

module.exports = router;
