const EventVideoInteraction = require("../models/EventVideoInteraction");
const Event = require("../models/Event");
const User = require("../models/User");

// Helper to normalize video URL for robust matching
const normalizeUrl = (rawUrl) => {
  if (!rawUrl) return "";
  let clean = String(rawUrl).trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    try {
      const parsed = new URL(clean);
      clean = parsed.pathname;
    } catch (e) {}
  }
  return clean.replace(/^\/+/, "");
};

// Helper to find or create interaction doc
const getOrCreateInteraction = async (eventId, rawVideoUrl) => {
  const videoUrl = normalizeUrl(rawVideoUrl);
  let doc = await EventVideoInteraction.findOne({ eventId, videoUrl });
  if (!doc) {
    doc = await EventVideoInteraction.create({
      eventId,
      videoUrl,
      likes: [],
      savedBy: [],
      comments: []
    });
  }
  return doc;
};

// Fetch stats for video(s)
exports.getVideoStats = async (req, res) => {
  try {
    const { eventId, videoUrls } = req.body;
    const userId = req.user._id;

    if (!eventId || !Array.isArray(videoUrls)) {
      return res.status(400).json({ error: "eventId and videoUrls array are required" });
    }

    const normalizedUrls = videoUrls.map(normalizeUrl);

    const interactions = await EventVideoInteraction.find({
      eventId,
      videoUrl: { $in: normalizedUrls }
    }).lean();

    const statsMap = {};
    videoUrls.forEach((rawUrl) => {
      const norm = normalizeUrl(rawUrl);
      const match = interactions.find((i) => i.videoUrl === norm);
      if (match) {
        statsMap[rawUrl] = {
          likesCount: (match.likes || []).length,
          commentsCount: (match.comments || []).length,
          isLiked: (match.likes || []).some((id) => id.toString() === userId.toString()),
          isSaved: (match.savedBy || []).some((id) => id.toString() === userId.toString())
        };
      } else {
        statsMap[rawUrl] = {
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          isSaved: false
        };
      }
    });

    return res.json({ statsMap });
  } catch (error) {
    console.error("Error fetching video stats:", error);
    return res.status(500).json({ error: "Failed to fetch video stats" });
  }
};

// Toggle Like
exports.toggleLikeVideo = async (req, res) => {
  try {
    const { eventId, videoUrl: rawVideoUrl } = req.body;
    const userId = req.user._id;

    if (!eventId || !rawVideoUrl) {
      return res.status(400).json({ error: "eventId and videoUrl are required" });
    }

    const interaction = await getOrCreateInteraction(eventId, rawVideoUrl);
    const userIdStr = userId.toString();
    const alreadyLiked = interaction.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      interaction.likes = interaction.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      interaction.likes.push(userId);
    }

    await interaction.save();

    return res.json({
      success: true,
      isLiked: !alreadyLiked,
      likesCount: interaction.likes.length
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};

// Toggle Save
exports.toggleSaveVideo = async (req, res) => {
  try {
    const { eventId, videoUrl: rawVideoUrl } = req.body;
    const userId = req.user._id;

    if (!eventId || !rawVideoUrl) {
      return res.status(400).json({ error: "eventId and videoUrl are required" });
    }

    const interaction = await getOrCreateInteraction(eventId, rawVideoUrl);
    const userIdStr = userId.toString();
    const alreadySaved = interaction.savedBy.some((id) => id.toString() === userIdStr);

    if (alreadySaved) {
      interaction.savedBy = interaction.savedBy.filter((id) => id.toString() !== userIdStr);
    } else {
      interaction.savedBy.push(userId);
    }

    await interaction.save();

    return res.json({
      success: true,
      isSaved: !alreadySaved
    });
  } catch (error) {
    console.error("Error toggling save:", error);
    return res.status(500).json({ error: "Failed to toggle save" });
  }
};

// Get Video Comments
exports.getVideoComments = async (req, res) => {
  try {
    const { eventId, videoUrl: rawVideoUrl } = req.query;

    if (!eventId || !rawVideoUrl) {
      return res.status(400).json({ error: "eventId and videoUrl are required" });
    }

    const videoUrl = normalizeUrl(rawVideoUrl);

    const interaction = await EventVideoInteraction.findOne({ eventId, videoUrl })
      .populate("comments.user", "name role profileImage photo")
      .lean();

    const comments = (interaction?.comments || []).map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      user: {
        _id: c.user?._id,
        name: c.user?.name || "User",
        role: c.user?.role || "student",
        avatar: c.user?.profileImage || c.user?.photo || ""
      }
    }));

    return res.json({ comments });
  } catch (error) {
    console.error("Error fetching video comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Add Comment
exports.addVideoComment = async (req, res) => {
  try {
    const { eventId, videoUrl: rawVideoUrl, text } = req.body;
    const userId = req.user._id;

    if (!eventId || !rawVideoUrl || !text || !text.trim()) {
      return res.status(400).json({ error: "eventId, videoUrl and non-empty text are required" });
    }

    const interaction = await getOrCreateInteraction(eventId, rawVideoUrl);
    
    const newCommentObj = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };

    interaction.comments.push(newCommentObj);
    await interaction.save();

    // Populate the newly added user details
    const userDoc = await User.findById(userId).select("name role profileImage photo").lean();

    const addedComment = {
      _id: interaction.comments[interaction.comments.length - 1]._id,
      text: newCommentObj.text,
      createdAt: newCommentObj.createdAt,
      user: {
        _id: userDoc._id,
        name: userDoc?.name || "User",
        role: userDoc?.role || "student",
        avatar: userDoc?.profileImage || userDoc?.photo || ""
      }
    };

    return res.json({
      success: true,
      comment: addedComment,
      commentsCount: interaction.comments.length
    });
  } catch (error) {
    console.error("Error adding video comment:", error);
    return res.status(500).json({ error: "Failed to add comment" });
  }
};
