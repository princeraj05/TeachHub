import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaTimes,
  FaVolumeMute,
  FaVolumeUp,
  FaPlay,
  FaPaperPlane,
  FaSchool,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";

export default function ReelsVideoViewer({
  isOpen,
  onClose,
  videos = [],
  initialIndex = 0,
  userRole = "student"
}) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = API_URL;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [statsMap, setStatsMap] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [doubleTapAnimation, setDoubleTapAnimation] = useState(false);

  const containerRef = useRef(null);
  const videoRefs = useRef({});

  // Reset index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      // Fetch stats for all videos in batch
      fetchBatchStats();
    }
  }, [isOpen, initialIndex, videos]);

  // Fetch stats for current videos
  const fetchBatchStats = async () => {
    if (!videos || videos.length === 0) return;
    try {
      const eventId = videos[0]?.eventId;
      const videoUrls = videos.map((v) => v.url);
      if (!eventId) return;

      const res = await axios.post(
        `${API}/api/events/videos/stats`,
        { eventId, videoUrls },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.statsMap) {
        setStatsMap(res.data.statsMap);
      }
    } catch (err) {
      console.error("Error fetching reels stats:", err);
    }
  };

  // Scroll to current video on index change
  useEffect(() => {
    if (containerRef.current) {
      const targetChild = containerRef.current.children[currentIndex];
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  // Manage video play/pause on current index change
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key, idx) => {
      const videoEl = videoRefs.current[key];
      if (videoEl) {
        if (idx === currentIndex) {
          videoEl.currentTime = 0;
          videoEl.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoEl.pause();
        }
      }
    });
  }, [currentIndex]);

  if (!isOpen || !videos || videos.length === 0) return null;

  const currentVideo = videos[currentIndex] || {};
  const currentStats = statsMap[currentVideo.url] || {
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    isSaved: false
  };

  // Handle Like
  const handleToggleLike = async () => {
    if (!currentVideo.eventId || !currentVideo.url) return;

    // Instant optimistic UI update
    setStatsMap((prev) => {
      const existing = prev[currentVideo.url] || { likesCount: 0, isLiked: false };
      const nextIsLiked = !existing.isLiked;
      const nextCount = nextIsLiked ? existing.likesCount + 1 : Math.max(0, existing.likesCount - 1);
      return {
        ...prev,
        [currentVideo.url]: {
          ...existing,
          isLiked: nextIsLiked,
          likesCount: nextCount
        }
      };
    });

    try {
      const res = await axios.post(
        `${API}/api/events/videos/like`,
        { eventId: currentVideo.eventId, videoUrl: currentVideo.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setStatsMap((prev) => ({
          ...prev,
          [currentVideo.url]: {
            ...prev[currentVideo.url],
            isLiked: res.data.isLiked,
            likesCount: res.data.likesCount
          }
        }));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      fetchBatchStats();
    }
  };

  // Double tap to like animation
  const handleVideoClick = () => {
    const videoEl = videoRefs.current[currentVideo.url];
    if (videoEl) {
      if (videoEl.paused) {
        videoEl.play();
        setIsPlaying(true);
      } else {
        videoEl.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleDoubleTap = () => {
    setDoubleTapAnimation(true);
    setTimeout(() => setDoubleTapAnimation(false), 800);
    if (!currentStats.isLiked) {
      handleToggleLike();
    }
  };

  // Handle Save
  const handleToggleSave = async () => {
    if (!currentVideo.eventId || !currentVideo.url) return;

    // Optimistic update
    setStatsMap((prev) => {
      const existing = prev[currentVideo.url] || { isSaved: false };
      return {
        ...prev,
        [currentVideo.url]: {
          ...existing,
          isSaved: !existing.isSaved
        }
      };
    });

    try {
      const res = await axios.post(
        `${API}/api/events/videos/save`,
        { eventId: currentVideo.eventId, videoUrl: currentVideo.url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setStatsMap((prev) => ({
          ...prev,
          [currentVideo.url]: {
            ...prev[currentVideo.url],
            isSaved: res.data.isSaved
          }
        }));
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      fetchBatchStats();
    }
  };

  // Handle Comments Open
  const handleOpenComments = async () => {
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await axios.get(`${API}/api/events/videos/comments`, {
        params: { eventId: currentVideo.eventId, videoUrl: currentVideo.url },
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentsList(res.data.comments || []);
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    setSubmittingComment(true);

    try {
      const res = await axios.post(
        `${API}/api/events/videos/comments`,
        {
          eventId: currentVideo.eventId,
          videoUrl: currentVideo.url,
          text: commentText
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.comment) {
        setCommentsList((prev) => [...prev, res.data.comment]);
        setNewCommentText("");

        // Update comment count
        setStatsMap((prev) => {
          const existing = prev[currentVideo.url] || { commentsCount: 0 };
          return {
            ...prev,
            [currentVideo.url]: {
              ...existing,
              commentsCount: res.data.commentsCount || (existing.commentsCount + 1)
            }
          };
        });
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Navigate to School Directory
  const handleSchoolClick = (e) => {
    e.stopPropagation();
    onClose();
    // Route to appropriate directory based on user role
    const schoolTarget = currentVideo.schoolName || "";
    if (userRole === "teacher") {
      navigate(`/teacher/schools?school=${encodeURIComponent(schoolTarget)}`);
    } else if (userRole === "admin") {
      navigate(`/admin/about-school`);
    } else {
      navigate(`/student/schools?school=${encodeURIComponent(schoolTarget)}`);
    }
  };

  // Up / Down Navigation
  const handleNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Top Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md cursor-pointer"
        aria-label="Close Reels Viewer"
      >
        <FaTimes className="text-xl" />
      </button>

      {/* Up/Down Scroll Navigation Buttons for Desktop */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrevVideo}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md cursor-pointer ${
            currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-100"
          }`}
          title="Previous Reel"
        >
          <FaChevronUp className="text-lg" />
        </button>
        <button
          type="button"
          disabled={currentIndex === videos.length - 1}
          onClick={handleNextVideo}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md cursor-pointer ${
            currentIndex === videos.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-100"
          }`}
          title="Next Reel"
        >
          <FaChevronDown className="text-lg" />
        </button>
      </div>

      {/* Main Reels Viewport */}
      <div className="w-full max-w-[420px] h-full sm:h-[92vh] sm:rounded-3xl overflow-hidden relative bg-black shadow-2xl flex flex-col justify-center">
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col"
          onWheel={(e) => {
            if (e.deltaY > 50 && currentIndex < videos.length - 1) {
              handleNextVideo();
            } else if (e.deltaY < -50 && currentIndex > 0) {
              handlePrevVideo();
            }
          }}
        >
          {videos.map((vid, idx) => {
            const isCurrent = idx === currentIndex;
            const fullUrl = vid.url.startsWith("http") ? vid.url : `${API}/${vid.url}`;

            return (
              <div
                key={vid.url + idx}
                className="w-full h-full shrink-0 snap-start relative flex items-center justify-center bg-black overflow-hidden"
                onDoubleClick={handleDoubleTap}
              >
                {/* Video Element */}
                <video
                  ref={(el) => (videoRefs.current[vid.url] = el)}
                  src={fullUrl}
                  className="w-full h-full object-cover cursor-pointer"
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={handleVideoClick}
                />

                {/* Double Tap Heart Pop Animation */}
                {doubleTapAnimation && isCurrent && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                    <FaHeart className="text-red-500 text-7xl drop-shadow-lg" />
                  </div>
                )}

                {/* Pause Indicator overlay */}
                {!isPlaying && isCurrent && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
                    onClick={handleVideoClick}
                  >
                    <div className="p-4 rounded-full bg-black/60 text-white text-3xl">
                      <FaPlay />
                    </div>
                  </div>
                )}

                {/* Top Overlay: Mute / Unmute */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md cursor-pointer hover:bg-black/60 transition"
                >
                  {isMuted ? <FaVolumeMute className="text-base" /> : <FaVolumeUp className="text-base" />}
                </button>

                {/* Bottom Left Overlay: School Logo & Info */}
                <div className="absolute bottom-6 left-4 right-16 z-30 flex flex-col gap-2 text-white drop-shadow-md">
                  {/* School Profile Tag */}
                  <div
                    onClick={handleSchoolClick}
                    className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full w-fit cursor-pointer hover:bg-black/60 transition border border-white/10 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white shrink-0 border border-white/30">
                      {vid.schoolLogo ? (
                        <img
                          src={vid.schoolLogo.startsWith("http") || vid.schoolLogo.startsWith("data:") ? vid.schoolLogo : `${API}/${vid.schoolLogo.replace(/^\/+/, "")}`}
                          alt="School Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaSchool className="text-xs" />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black truncate max-w-[150px] group-hover:text-purple-300 transition">
                        {vid.schoolName || "School Event"}
                      </span>
                      <span className="text-[9px] text-slate-300 font-semibold">View School Profile &rarr;</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="text-left px-1">
                    <h3 className="text-sm font-bold truncate leading-snug">{vid.eventTitle || "Event Video"}</h3>
                    {vid.eventDate && (
                      <p className="text-[10px] text-slate-300 font-medium">
                        {new Date(vid.eventDate).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Bar (Instagram Reels Icons: Like, Comment, Save) */}
                <div className="absolute right-3 bottom-12 z-30 flex flex-col items-center gap-5 text-white">
                  {/* Like Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={handleToggleLike}
                      className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:scale-110 active:scale-95 transition cursor-pointer"
                    >
                      {currentStats.isLiked ? (
                        <FaHeart className="text-2xl text-red-500 animate-bounce" />
                      ) : (
                        <FaRegHeart className="text-2xl text-white" />
                      )}
                    </button>
                    <span className="text-[11px] font-extrabold drop-shadow">
                      {currentStats.likesCount || 0}
                    </span>
                  </div>

                  {/* Comment Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={handleOpenComments}
                      className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:scale-110 active:scale-95 transition cursor-pointer"
                    >
                      <FaComment className="text-2xl text-white hover:text-purple-300" />
                    </button>
                    <span className="text-[11px] font-extrabold drop-shadow">
                      {currentStats.commentsCount || 0}
                    </span>
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={handleToggleSave}
                      className="p-3 rounded-full bg-black/40 backdrop-blur-md hover:scale-110 active:scale-95 transition cursor-pointer"
                    >
                      {currentStats.isSaved ? (
                        <FaBookmark className="text-2xl text-amber-400" />
                      ) : (
                        <FaRegBookmark className="text-2xl text-white" />
                      )}
                    </button>
                    <span className="text-[10px] font-bold drop-shadow">
                      {currentStats.isSaved ? "Saved" : "Save"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment Drawer Modal */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 top-1/3 z-50 bg-[#0F172A] rounded-t-3xl border-t border-white/10 flex flex-col shadow-2xl animate-slideUp">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FaComment className="text-purple-400" /> Comments ({commentsList.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <FaTimes />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingComments ? (
                <p className="text-center text-xs text-slate-400 py-10">Loading comments...</p>
              ) : commentsList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-1">
                  <p className="text-xs font-bold text-slate-300">No comments yet</p>
                  <p className="text-[10px]">Be the first to comment on this video!</p>
                </div>
              ) : (
                commentsList.map((c) => {
                  const avatarUrl = c.user?.avatar
                    ? c.user.avatar.startsWith("http")
                      ? c.user.avatar
                      : `${API}/${c.user.avatar}`
                    : null;

                  return (
                    <div key={c._id} className="flex items-start gap-2.5 text-left bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                        ) : (
                          c.user?.name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{c.user?.name}</span>
                          <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            {c.user?.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5 break-words">{c.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-white/10 bg-[#0B132A] flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddComment(e);
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 bg-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={submittingComment || !newCommentText.trim()}
                className="p-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 disabled:opacity-50 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                title="Post Comment"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
