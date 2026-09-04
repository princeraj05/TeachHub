const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  sendMessage, 
  getHistory, 
  getContacts, 
  handleUpload, 
  addReaction, 
  deleteMessage, 
  getCallHistory 
} = require("../controllers/supportController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/webm", "video/ogg", "video/quicktime",
    "audio/webm", "audio/wav", "audio/mpeg", "audio/ogg", "audio/mp4", "audio/aac",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip", "application/x-zip-compressed"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed for security reasons"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.use(protect);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.get("/users", getContacts);
router.get("/contacts", getContacts);
router.post("/upload", upload.single("file"), handleUpload);
router.post("/react", addReaction);
router.delete("/message/:id", deleteMessage);
router.get("/calls", getCallHistory);

module.exports = router;
