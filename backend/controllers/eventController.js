const Event = require("../models/Event");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

// Helper to get user's authoritative school name
const getAuthoritativeSchool = async (userId) => {
  const user = await User.findById(userId);
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

// 2. Get Events (Filtered by School Name for standard users, all for Super Admin)
exports.getEvents = async (req, res) => {
  try {
    const authUser = await getAuthoritativeSchool(req.user.id);
    if (!authUser) {
      return res.status(401).json({ message: "User profile not found" });
    }

    let query = {};
    const { schoolName } = req.query;
    if (authUser.role === "superadmin" || schoolName) {
      if (schoolName && schoolName !== "all") query.schoolName = schoolName;
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = authUser.schoolName;
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

    let query = { status: "upcoming" };
    const { schoolName } = req.query;
    if (authUser.role === "superadmin" || schoolName) {
      if (schoolName && schoolName !== "all") query.schoolName = schoolName;
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = authUser.schoolName;
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

    let query = { status: "completed" };
    if (authUser.role === "superadmin" || req.query.global === "true") {
      const { schoolName } = req.query;
      if (schoolName && schoolName !== "all") query.schoolName = schoolName;
    } else {
      if (!authUser.schoolName) return res.status(200).json([]);
      query.schoolName = authUser.schoolName;
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

    const newPhotos = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "teachhub/events/photos",
        resource_type: "image"
      });
      newPhotos.push({
        url: result.secure_url,
        filename: result.public_id,
        mimeType: file.mimetype,
        size: file.size
      });
      // Delete temporary local file
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error("Local file delete error:", err);
      }
    }

    event.photos.push(...newPhotos);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 9. Upload Videos to Event
exports.uploadVideos = async (req, res) => {
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

    const newVideos = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "teachhub/events/videos",
        resource_type: "video"
      });
      newVideos.push({
        url: result.secure_url,
        filename: result.public_id,
        mimeType: file.mimetype,
        size: file.size
      });
      // Delete temporary local file
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error("Local file delete error:", err);
      }
    }

    event.videos.push(...newVideos);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    // Delete the file from Cloudinary (video.filename contains public_id, and resource_type is video)
    try {
      await cloudinary.uploader.destroy(video.filename, { resource_type: "video" });
    } catch (err) {
      console.error("Failed to delete video from Cloudinary:", err);
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
