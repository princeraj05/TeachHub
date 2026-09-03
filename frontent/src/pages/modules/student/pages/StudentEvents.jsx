import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaImage, 
  FaEye, 
  FaTimes, 
  FaSearch, 
  FaFilter, 
  FaMapMarkerAlt, 
  FaInfoCircle,
  FaCheckCircle
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import EventGallery from "../../../../components/EventGallery";

const SORA = "'Sora', sans-serif";

const MOCK_UPCOMING = [];
const MOCK_COMPLETED = [];

function StudentEvents() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "Student";
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, completed
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Lightbox overlay states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Gallery view Modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [galleryTab, setGalleryTab] = useState("photos"); // photos, videos

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const userInitials = useMemo(() => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `${API}${url}`;
  };

  const openLightbox = (type, url, filename) => {
    setLightboxMedia({ type, url: getMediaUrl(url), filename });
    setLightboxOpen(true);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "upcoming" ? "/api/events/upcoming" : "/api/events/completed";
      const res = await axios.get(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const openGallery = (ev) => {
    setSelectedEvent(ev);
    setGalleryTab("photos");
    setShowGalleryModal(true);
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Days Left dynamic calculation
  const getDaysLeft = (eventDateStr, staticBackup) => {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    eventDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = eventDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return days;
    return staticBackup || 0;
  };

  // Combine real database events with fallback mockup entries
  const displayEvents = useMemo(() => {
    let combined = [...events];

    // Filter local search and category match
    return combined.filter(ev => {
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || 
        (ev.category || "").toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [events, activeTab, searchQuery, categoryFilter]);

  // Gallery view mock photos loading
  const galleryPhotos = useMemo(() => {
    if (!selectedEvent) return [];
    
    if (selectedEvent._id === "mock-upcoming-1" || selectedEvent._id === "mock-completed-1") {
      return [
        { _id: "gp-1", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80", filename: "photo1.jpg" },
        { _id: "gp-2", url: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&auto=format&fit=crop&q=80", filename: "photo2.jpg" },
        { _id: "gp-3", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80", filename: "photo3.jpg" },
        { _id: "gp-4", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80", filename: "photo4.jpg" },
        { _id: "gp-5", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80", filename: "photo5.jpg" },
        { _id: "gp-6", url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80", filename: "photo6.jpg" },
        { _id: "gp-7", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80", filename: "photo7.jpg" },
        { _id: "gp-8", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80", filename: "photo8.jpg" },
        { _id: "gp-9", url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80", filename: "photo9.jpg" },
        { _id: "gp-10", url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80", filename: "photo10.jpg" },
        { _id: "gp-11", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80", filename: "photo11.jpg" },
        { _id: "gp-12", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80", filename: "photo12.jpg" }
      ];
    }

    if (selectedEvent.photos && selectedEvent.photos.length > 0) {
      return selectedEvent.photos;
    }

    return [
      { _id: "gp-1", url: selectedEvent.coverPhoto || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", filename: "photo1.jpg" }
    ];
  }, [selectedEvent]);

  // Gallery view mock videos loading
  const galleryVideos = useMemo(() => {
    if (!selectedEvent) return [];

    if (selectedEvent._id === "mock-upcoming-1" || selectedEvent._id === "mock-completed-1") {
      return [
        {
          _id: "gv-1",
          title: "Flag Hoisting Ceremony",
          description: "The flag hoisting ceremony by our students and teachers.",
          duration: "02:35",
          time: "9:00 AM",
          thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
          url: "https://assets.mixkit.co/videos/preview/mixkit-flag-flapping-in-the-wind-against-blue-sky-42542-large.mp4",
          filename: "flag_hoisting.mp4"
        },
        {
          _id: "gv-2",
          title: "Cultural Dance Performance",
          description: "Students performed a beautiful dance on patriotic songs.",
          duration: "03:12",
          time: "10:15 AM",
          thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80",
          url: "https://assets.mixkit.co/videos/preview/mixkit-kids-playing-in-a-park-on-sunny-day-42358-large.mp4",
          filename: "cultural_dance.mp4"
        },
        {
          _id: "gv-3",
          title: "Speech by Students",
          description: "Inspiring speech on freedom and our responsibilities.",
          duration: "01:48",
          time: "11:30 AM",
          thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
          url: "https://assets.mixkit.co/videos/preview/mixkit-speaker-at-a-business-conference-seminar-34282-large.mp4",
          filename: "student_speech.mp4"
        }
      ];
    }

    return selectedEvent.videos || [];
  }, [selectedEvent]);

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">

      {/* Connect Subtitle / Headers */}
      <div className="select-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] px-1">SCHOOL EVENTS</p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
          {activeTab === "upcoming" ? "Upcoming Events" : "Completed Events"}
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
          {activeTab === "upcoming" 
            ? "Explore and stay updated with all upcoming events and celebrations."
            : "Explore past events and celebrations from your school."}
        </p>
      </div>

      {/* Tabs list (Pills Selector) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl select-none max-w-md">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaCalendarAlt className="text-xs shrink-0" />
          <span>Upcoming Events</span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
            activeTab === "completed"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaImage className="text-xs shrink-0" />
          <span>Completed Events</span>
        </button>
      </div>

      {/* Search and Filters row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder={activeTab === "upcoming" ? "Search events..." : "Search completed events..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
        
        <div className="relative shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
          >
            <option value="All">All Events</option>
            <option value="Celebration">Celebration</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Others">Others</option>
          </select>
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        </div>
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="py-24 text-center select-none flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-xs font-bold">Synchronizing school events...</p>
        </div>
      ) : displayEvents.length === 0 ? (
        <div className="py-20 text-center select-none bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
            <FaCalendarAlt />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">No events scheduled</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            There are currently no {categoryFilter !== "All" ? `${categoryFilter} ` : ""}events found matching details.
          </p>
        </div>
      ) : (
        /* Events cards list */
        <div className="space-y-4">
          {displayEvents.map((ev) => {
            
            // Render upcoming card
            if (activeTab === "upcoming") {
              const daysLeft = getDaysLeft(ev.eventDate, ev.daysLeftStatic);
              const coverUrl = ev.coverPhoto || (ev.photos && ev.photos.length > 0 ? getMediaUrl(ev.photos[0].url) : null);
              let dotBg = "bg-purple-500";
              let cardGlow = "hover:border-purple-550/30";
              if (ev.themeColor === "emerald") {
                dotBg = "bg-emerald-500";
                cardGlow = "hover:border-emerald-555/30";
              } else if (ev.themeColor === "blue") {
                dotBg = "bg-[#0EA5E9]";
                cardGlow = "hover:border-blue-555/30";
              } else if (ev.themeColor === "amber") {
                dotBg = "bg-amber-500";
                cardGlow = "hover:border-amber-555/30";
              }

              return (
                <div 
                  key={ev._id}
                  className={`bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] ${cardGlow} rounded-2.5xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm relative`}
                >
                  {coverUrl && (
                    <div className="h-44 w-full bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b border-slate-150 dark:border-white/5">
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      {!coverUrl && (
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2.5xl flex items-center justify-center shrink-0 ${
                          ev.avatarBg || "bg-purple-950/15 border border-purple-500/20 text-purple-500"
                        }`}>
                          {ev.illustration || <FaCalendarAlt className="text-xl" />}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 select-none">
                          <span className={`w-2 h-2 rounded-full ${dotBg}`} />
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                            {ev.title}
                          </h3>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1 line-clamp-2">
                          {ev.description || "No description provided."}
                        </p>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-455 dark:text-slate-400 font-extrabold mt-3 select-none">
                          <span className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-slate-400 text-[11px]" />
                            {getFormattedDate(ev.eventDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FaClock className="text-slate-400 text-[11px]" />
                            {ev.eventTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-slate-400 text-[11px]" />
                            {ev.location || "School Ground"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Countdown Badge (Right) */}
                    <div className={`shrink-0 ml-3 py-3 px-4.5 rounded-2xl flex flex-col items-center justify-center text-center border select-none ${
                      ev.badgeBg || "bg-purple-955/20 text-purple-400 border border-purple-500/20"
                    }`}>
                      <span className="text-lg font-black tracking-tight">{daysLeft}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Days Left</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Render completed events layout card
            const coverUrl = ev.coverPhoto || (ev.photos && ev.photos.length > 0 ? getMediaUrl(ev.photos[0].url) : null);
            
            let dotBg = "bg-emerald-500";
            let calendarColor = "text-emerald-500";
            let clockColor = "text-emerald-555";
            let cardGlow = "hover:border-emerald-555/30";
            if (ev.themeColor === "blue") {
              dotBg = "bg-blue-500";
              calendarColor = "text-blue-500";
              clockColor = "text-blue-500";
              cardGlow = "hover:border-blue-555/30";
            } else if (ev.themeColor === "purple") {
              dotBg = "bg-purple-500";
              calendarColor = "text-[#7C3AED]";
              clockColor = "text-[#7C3AED]";
              cardGlow = "hover:border-purple-555/30";
            } else if (ev.themeColor === "amber") {
              dotBg = "bg-amber-500";
              calendarColor = "text-amber-500";
              clockColor = "text-amber-500";
              cardGlow = "hover:border-amber-555/30";
            }

            return (
              <div 
                key={ev._id}
                className={`bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] ${cardGlow} rounded-2.5xl overflow-hidden flex flex-col sm:flex-row shadow-sm transition-all duration-200`}
              >
                {/* Cover Image left/top */}
                <div className="w-full sm:w-44 h-40 shrink-0 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200/50 dark:border-white/10 select-none">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FaImage className="text-2xl mb-1.5 opacity-55 mx-auto" />
                      <p className="text-[9px] font-black">No Cover Uploaded</p>
                    </div>
                  )}
                </div>

                {/* Details main body */}
                <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 select-none">
                      <span className={`w-2 h-2 rounded-full ${dotBg}`} />
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                        {ev.title}
                      </h3>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1 line-clamp-2">
                      {ev.description || "No description provided."}
                    </p>

                    {/* Metadata badge parameters */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-455 dark:text-slate-400 font-extrabold mt-3.5 select-none">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className={`${calendarColor} text-[11px]`} /> 
                        {getFormattedDate(ev.eventDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaClock className={`${clockColor} text-[11px]`} /> 
                        {ev.eventTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completed Details (Right) */}
                <div className="p-5 sm:border-l border-slate-100 dark:border-white/5 flex flex-col justify-between items-center sm:items-end justify-center shrink-0 gap-3 text-center sm:text-right select-none bg-slate-50/20 dark:bg-white/[0.005]">
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                      ev.badgeBg || "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}>
                      <FaCheckCircle className="text-[10px]" /> Completed
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold mt-1">
                      Completed on {getFormattedDate(ev.eventDate)}
                    </span>
                  </div>

                  <button
                    onClick={() => openGallery(ev)}
                    className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 dark:border-[#38BDF8]/20 font-black text-[10px] py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FaEye /> View Gallery
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom information note */}
      <div className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
        <FaInfoCircle className="text-base text-[#38BDF8] shrink-0 mt-0.5" />
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          {activeTab === "upcoming"
            ? "Event details are subject to change. Please check regularly for latest updates."
            : "Completed events and galleries are stored for your reference. You can revisit photos and videos anytime."}
        </p>
      </div>

      {/* ================= GALLERY DISPLAY MODAL ================= */}
      {showGalleryModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-slideUp my-auto">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full shrink-0" />
            <div className="p-5 sm:p-8 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{selectedEvent.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Event Date: {getFormattedDate(selectedEvent.eventDate)}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowGalleryModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-2 rounded-xl"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Subtitle & Description */}
              {(selectedEvent.subtitle || selectedEvent.description) && (
                <div className="space-y-3 mb-8 bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200/40 dark:border-white/5">
                  {selectedEvent.subtitle && (
                    <h4 className="text-xs font-extrabold text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wider">
                      {selectedEvent.subtitle}
                    </h4>
                  )}
                  {selectedEvent.description && (
                    <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>
              )}

              <EventGallery event={selectedEvent} api={API} />
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX / FULLSCREEN MEDIA VIEWER */}
      {lightboxOpen && lightboxMedia && (
        <div className="fixed inset-0 bg-[#070b13]/95 backdrop-blur-sm z-[80] flex flex-col items-center justify-center p-4">
          {/* Top Control Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent text-white select-none z-10">
            <div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                ← Back
              </button>
            </div>
            {lightboxMedia.filename && (
              <span className="text-[10px] font-bold text-slate-400 hidden sm:block truncate max-w-xs">{lightboxMedia.filename}</span>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="text-white hover:text-slate-300 bg-white/10 p-2 rounded-xl cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Media Container */}
          <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center relative animate-scaleUp">
            {lightboxMedia.type === "photo" ? (
              <img
                src={lightboxMedia.url}
                alt="Fullscreen Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            ) : (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentEvents;
