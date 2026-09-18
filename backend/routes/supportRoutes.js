const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  sendMessage, 
  getHistory, 
  getContacts, 
  handleUpload, 
  addReaction, 
  deleteMessage, 
  getCallHistory,
  getActiveCall,
  getSupportShowcase,
  getSupportUsersList,
  getSupportSchoolsList
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
  if (!file) return cb(null, false);
  // Accept all images, videos, audio, documents, and standard file formats
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Public routes
router.get("/showcase", getSupportShowcase);

router.use(protect);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.get("/users", getContacts);
router.get("/contacts", getContacts);
router.get("/users-list", authorize("support", "superadmin"), getSupportUsersList);
router.get("/schools-list", authorize("support", "superadmin"), getSupportSchoolsList);
router.post("/upload", upload.single("file"), handleUpload);
router.post("/react", addReaction);
router.delete("/message/:id", deleteMessage);
router.get("/calls", getCallHistory);
router.get("/active-call", getActiveCall);

module.exports = router;
