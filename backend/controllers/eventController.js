const Event = require("../models/Event");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

// Helper to get user's authoritative school name
const getAuthoritativeSchool = async (userId) => {
  const user = await User.findById(userId).select("role schoolName requestedSchool").lean();
  if (!user) return null;
  // If user is pending/unassigned, use requestedSchool
  if (user.role === "unassigned") {
    return { schoolName: user.requestedSchool || "", role: user.role };
  }
  return { schoolName: user.schoolName || "", role: user.role };
};

// Helper to delete physical file from disk
const deletePhysicalFile = (filename) => {
  try {
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted physical file: ${filename}`);
    } else {
      console.warn(`Physical file not found: ${filename}`);
    }
  } catch (err) {
    console.error(`Failed to delete physical file ${filename}:`, err);
  }
};

const cleanupTemporaryUploads = (files = []) => files.forEach((file) => {
  try { if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch (_) { /* best-effort cleanup */ }
});

const cleanupCloudinaryUploads = async (publicIds, resourceType) => {
  await Promise.all(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => null)));
};

// 1. Create Event (Admin only)
exports.createEvent = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || authUser.role !== "admin") {
      return res.status(403).json({ message: "Only School Admins can create events" });
    }

    const { title, subtitle, description, eventDate, eventTime } = req.body;
    if (!title || !eventDate || !eventTime) {
      return res.status(400).json({ message: "Title, eventDate, and eventTime are required" });
    }

    if (!authUser.schoolName) {
      return res.status(400).json({ message: "Your account is not assigned to a school" });
    }

    // Automatically determine status based on eventDate
    const inputDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    const status = inputDate < today ? "completed" : "upcoming";

    const event = await Event.create({
      schoolName: authUser.schoolName,
      title,
      subtitle: subtitle || "",
      description: description || "",
      eventDate,
      eventTime,
      status,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(550).json({ message: err.message });
  }
};

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 2. Get Events (Filtered by School Name for standard users, all for Super Admin)
exports.getEvents = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser) {
      return res.status(401).json({ message: "User profile not found" });
    }

    let query = {};
    const { schoolName, global } = req.query;
    if (global === "true") {
      // Global feed: no schoolName restriction
    } else if (schoolName) {
      query.schoolName = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    } else if (authUser.role === "superadmin") {
      // Superadmin default: no restriction
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = new RegExp("^" + escapeRegex(authUser.schoolName) + "$", "i");
    }

    const events = await Event.find(query).sort({ eventDate: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get Upcoming Events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser) {
      return res.status(401).json({ message: "User profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = { 
      status: "upcoming",
      eventDate: { $gte: today }
    };
    const { schoolName, global } = req.query;
    if (global === "true") {
      // Global feed: no schoolName restriction
    } else if (schoolName) {
      query.schoolName = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    } else if (authUser.role === "superadmin") {
      // Superadmin default: no restriction
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = new RegExp("^" + escapeRegex(authUser.schoolName) + "$", "i");
    }

    const events = await Event.find(query).sort({ eventDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Get Completed Events
exports.getCompletedEvents = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      $or: [
        { status: "completed" },
        { eventDate: { $lt: today } }
      ]
    };
    const { schoolName, global } = req.query;
    if (global === "true") {
      // Global feed: no schoolName restriction
    } else if (schoolName) {
      query.schoolName = new RegExp("^" + escapeRegex(schoolName) + "$", "i");
    } else if (authUser.role === "superadmin") {
      // Superadmin default: no restriction
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = new RegExp("^" + escapeRegex(authUser.schoolName) + "$", "i");
    }

    const events = await Event.find(query).sort({ eventDate: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Get Single Event By ID (School Isolated)
exports.getEventById = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Verify school isolation
    if (authUser.role !== "superadmin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Access Denied: Cross-school view unauthorized" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Update Event (Admin or Super Admin only)
exports.updateEvent = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized to update event details" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // School Admin cannot update different school's event
    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school modification unauthorized" });
    }

    const { title, subtitle, description, eventDate, eventTime, status } = req.body;
    if (title) event.title = title;
    if (subtitle !== undefined) event.subtitle = subtitle;
    if (description !== undefined) event.description = description;
    if (eventDate) {
      event.eventDate = eventDate;
      // Recalculate status based on the new date
      const inputDate = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      inputDate.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        event.status = "completed";
      } else {
        event.status = "upcoming";
      }
    }
    if (eventTime) event.eventTime = eventTime;
    if (status) event.status = status;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Complete Event (Transition and add gallery text info)
exports.completeEvent = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized to mark event as completed" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school action unauthorized" });
    }

    const { title, subtitle, description } = req.body;
    if (title) event.title = title;
    if (subtitle) event.subtitle = subtitle;
    if (description) event.description = description;
    
    event.status = "completed";
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 8. Upload Photos to Event
exports.uploadPhotos = async (req, res) => {
  const uploadedIds = [];
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school action unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (req.files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))) {
      return res.status(400).json({ message: "Photos must be JPG, PNG, or WEBP images" });
    }
    if ((event.photos?.length || 0) + req.files.length > 10) return res.status(400).json({ message: "An event can contain a maximum of 10 photos" });

    const hasCloudinary = process.env.CLOUDINARY_URL ||
      ( (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) && 
        (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY) && 
        (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET) );

    const newPhotos = [];
    for (const file of req.files) {
      let photoUrl = "";
      let filename = file.filename;

      if (hasCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "teachhub/events/photos",
            resource_type: "image"
          });
          uploadedIds.push(result.public_id);
          photoUrl = result.secure_url;
          filename = result.public_id;
          deletePhysicalFile(file.filename);
        } catch (cErr) {
          console.error("Cloudinary photo upload error, falling back to data URL:", cErr.message);
        }
      }

      if (!photoUrl) {
        try {
          if (fs.existsSync(file.path)) {
            const fileBuffer = fs.readFileSync(file.path);
            const base64Str = fileBuffer.toString("base64");
            photoUrl = `data:${file.mimetype};base64,${base64Str}`;
            deletePhysicalFile(file.filename);
          }
        } catch (fErr) {
          console.error("Failed to convert image to base64 Data URL:", fErr);
        }
      }

      if (photoUrl) {
        newPhotos.push({
          url: photoUrl,
          filename: filename,
          mimeType: file.mimetype,
          size: file.size
        });
      }
    }

    const isCover = req.query.isCover === "true" || req.body.isCover === "true";
    if (isCover) {
      event.photos = [...newPhotos, ...(event.photos || [])];
    } else {
      event.photos.push(...newPhotos);
    }
    await event.save();

    res.json(event);
  } catch (err) {
    console.error("uploadPhotos error:", err);
    res.status(500).json({ message: err.message || "Could not upload photos" });
  }
};

// 9. Upload Videos to Event
exports.uploadVideos = async (req, res) => {
  const uploadedIds = [];
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school action unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (req.files.some((file) => {
      const cleanMime = (file.mimetype || "").split(";")[0].toLowerCase().trim();
      return !cleanMime.startsWith("video/") && !["video/mp4", "video/webm", "video/quicktime", "video/mov", "application/octet-stream"].includes(cleanMime);
    })) {
      return res.status(400).json({ message: "Videos must be MP4, WEBM, or MOV files" });
    }
    if ((event.videos?.length || 0) + req.files.length > 5) return res.status(400).json({ message: "An event can contain a maximum of 5 videos" });

    const hasCloudinary = process.env.CLOUDINARY_URL ||
      ( (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) && 
        (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY) && 
        (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET) );

    const newVideos = [];
    for (const file of req.files) {
      let videoUrl = "";
      let filename = file.filename;

      if (hasCloudinary) {
        // Try upload_large first with 6MB chunks and 10min (600,000ms) timeout
        try {
          const result = await cloudinary.uploader.upload_large(file.path, {
            folder: "teachhub/events/videos",
            resource_type: "video",
            chunk_size: 6000000,
            timeout: 600000
          });
          uploadedIds.push(result.public_id);
          videoUrl = result.secure_url;
          filename = result.public_id;
          deletePhysicalFile(file.filename);
        } catch (cErr) {
          console.error("Cloudinary video upload_large error:", cErr.message);
          // Fallback to standard upload with 10min timeout
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "teachhub/events/videos",
              resource_type: "video",
              timeout: 600000
            });
            uploadedIds.push(result.public_id);
            videoUrl = result.secure_url;
            filename = result.public_id;
            deletePhysicalFile(file.filename);
          } catch (cErr2) {
            console.error("Cloudinary video upload error fallback failed:", cErr2.message);
          }
        }
      }

      // If Cloudinary failed or isn't configured, fallback to serving physical file path /uploads/filename
      if (!videoUrl && fs.existsSync(file.path)) {
        videoUrl = `/uploads/${file.filename}`;
      }

      if (videoUrl) {
        newVideos.push({
          url: videoUrl,
          filename: filename,
          mimeType: file.mimetype,
          size: file.size
        });
      }
    }

    event.videos.push(...newVideos);
    await event.save();

    res.json(event);
  } catch (err) {
    console.error("uploadVideos error:", err);
    res.status(500).json({ message: err.message || "Could not upload videos" });
  }
};

// 10. Delete Single Photo
exports.deletePhoto = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school action unauthorized" });
    }

    const { photoId } = req.params;
    const photo = event.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found in event gallery" });
    }

    // Delete the file from Cloudinary (photo.filename contains public_id)
    try {
      await cloudinary.uploader.destroy(photo.filename);
    } catch (err) {
      console.error("Failed to delete photo from Cloudinary:", err);
    }

    // Remove reference from array
    event.photos.pull(photoId);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(550).json({ message: err.message });
  }
};

// 11. Delete Single Video
exports.deleteVideo = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school action unauthorized" });
    }

    const { videoId } = req.params;
    const video = event.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found in event gallery" });
    }

    if (video.filename) {
      if (video.url && video.url.startsWith("/uploads/")) {
        deletePhysicalFile(video.filename);
      } else {
        try {
          await cloudinary.uploader.destroy(video.filename, { resource_type: "video" });
        } catch (err) {
          console.error("Failed to delete video from Cloudinary:", err);
        }
      }
    }

    // Remove reference from array
    event.videos.pull(videoId);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(550).json({ message: err.message });
  }
};

// 12. Delete Event (Wipes event and all associated physical media files)
exports.deleteEvent = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Unauthorized to delete events" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (authUser.role === "admin" && event.schoolName !== authUser.schoolName) {
      return res.status(403).json({ message: "Cross-school modification unauthorized" });
    }

    // 1. Delete all photo files from Cloudinary
    if (event.photos && event.photos.length > 0) {
      for (const photo of event.photos) {
        try {
          await cloudinary.uploader.destroy(photo.filename);
        } catch (err) {
          console.error("Failed to delete photo from Cloudinary:", err);
        }
      }
    }

    // 2. Delete all video files from Cloudinary
    if (event.videos && event.videos.length > 0) {
      for (const video of event.videos) {
        try {
          await cloudinary.uploader.destroy(video.filename, { resource_type: "video" });
        } catch (err) {
          console.error("Failed to delete video from Cloudinary:", err);
        }
      }
    }

    // 3. Remove Document from DB
    await Event.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Event and all associated media files deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
