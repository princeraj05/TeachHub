const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

// Reuse the same backend/uploads folder
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

// Enforce type checking for images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/mov"];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Please upload JPG, JPEG, PNG, WEBP images or MP4, WEBM, MOV videos."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per compressed upload
});

// Endpoints
router.post("/", protect, authorize("admin"), eventController.createEvent);
router.get("/", protect, eventController.getEvents);
router.get("/upcoming", protect, eventController.getUpcomingEvents);
router.get("/completed", protect, eventController.getCompletedEvents);
router.get("/:id", protect, eventController.getEventById);
router.put("/:id", protect, authorize("admin", "superadmin"), eventController.updateEvent);
router.delete("/:id", protect, authorize("admin", "superadmin"), eventController.deleteEvent);

router.post("/:id/complete", protect, authorize("admin", "superadmin"), eventController.completeEvent);

// Media uploads
router.post("/:id/photos", protect, authorize("admin", "superadmin"), upload.array("photos", 10), eventController.uploadPhotos);
router.post("/:id/videos", protect, authorize("admin", "superadmin"), upload.array("videos", 5), eventController.uploadVideos);

router.delete("/:id/photos/:photoId", protect, authorize("admin", "superadmin"), eventController.deletePhoto);
router.delete("/:id/videos/:videoId", protect, authorize("admin", "superadmin"), eventController.deleteVideo);

module.exports = router;
