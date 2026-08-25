import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaImage, 
  FaVideo, 
  FaEye, 
  FaTimes, 
  FaExpand,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaInfoCircle
} from "react-icons/fa";
import EventGallery from "../../../../components/EventGallery";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

const MOCK_UPCOMING = [
  {
    _id: "mock-upcoming-1",
    title: "Independence Day Celebration",
    description: "Join us in celebrating 78th Independence Day with flag hoisting, cultural programs and more.",
    subtitle: "Celebration",
    eventDate: "2026-08-15T00:00:00.000Z",
    eventTime: "9:00 AM",
    location: "School Ground",
    category: "Celebration",
    daysLeftStatic: 5,
    themeColor: "purple",
    avatarBg: "bg-purple-950/15 border border-purple-500/20 text-purple-500",
    badgeBg: "bg-purple-950/20 text-purple-400 border border-purple-500/20",
    illustration: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="2" width="2" height="32" rx="1" fill="#94A3B8" />
        <rect x="8" y="4" width="22" height="4" fill="#FF9933" />
        <rect x="8" y="8" width="22" height="4" fill="#FFFFFF" />
        <rect x="8" y="12" width="22" height="4" fill="#138808" />
        <circle cx="19" cy="10" r="1.5" stroke="#000080" strokeWidth="0.5" fill="none" />
      </svg>
    )
  },
  {
    _id: "mock-upcoming-2",
    title: "Teacher's Day Celebration",
    description: "Honoring our teachers for their dedication and endless support.",
    subtitle: "Celebration",
    eventDate: "2026-09-05T00:00:00.000Z",
    eventTime: "10:30 AM",
    location: "Auditorium",
    category: "Celebration",
    daysLeftStatic: 26,
    themeColor: "emerald",
    avatarBg: "bg-emerald-950/15 border border-emerald-500/20 text-emerald-500",
    badgeBg: "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20",
    illustration: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="6" width="20" height="14" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <line x1="8" y1="10" x2="16" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="13" x2="20" y2="13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="16" x2="14" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="28" cy="18" r="3" fill="#E2E8F0" />
        <line x1="28" y1="21" x2="28" y2="30" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="23" x2="22" y2="14" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="25" x2="33" y2="28" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    _id: "mock-upcoming-3",
    title: "Annual Sports Day",
    description: "A day full of energy, sports, and team spirit. Let the games begin!",
    subtitle: "Sports",
    eventDate: "2026-09-20T00:00:00.000Z",
    eventTime: "8:00 AM",
    location: "Sports Field",
    category: "Sports",
    daysLeftStatic: 41,
    themeColor: "blue",
    avatarBg: "bg-blue-950/15 border border-blue-500/20 text-blue-500",
    badgeBg: "bg-blue-950/20 text-blue-400 border border-blue-500/20",
    illustration: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="8" r="3" fill="#0EA5E9" />
        <path d="M15 11l5 4-2 6" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 14l3-3 4 2" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 21l-3 5 4 4" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 21l3-2 4 4" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    _id: "mock-upcoming-4",
    title: "Diwali Celebration",
    description: "Festival of lights celebration with cultural performances and activities.",
    subtitle: "Celebration",
    eventDate: "2026-11-10T00:00:00.000Z",
    eventTime: "4:00 PM",
    location: "School Campus",
    category: "Celebration",
    daysLeftStatic: 62,
    themeColor: "amber",
    avatarBg: "bg-amber-955/15 border border-amber-500/20 text-amber-500",
    badgeBg: "bg-amber-955/20 text-amber-400 border border-amber-500/20",
    illustration: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 36 36" fill="none">
        <path d="M6 18c0 7.732 6.268 10 12 10s12-2.268 12-10H6z" fill="#D97706" />
        <path d="M18 6c-2.5 4-3 7-3 9 0 2.21 1.79 3.5 3 3.5s3-1.29 3-3.5c0-2-0.5-5-3-9z" fill="#F59E0B" />
        <path d="M18 9c-1.25 2.5-1.5 4.5-1.5 5.5 0 1.1.9 1.75 1.5 1.75s1.5-.65 1.5-1.75c0-1-0.25-3-1.5-5.5z" fill="#EF4444" />
      </svg>
    )
  }
];

function StudentEvents() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
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

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const userInitials = useMemo(() => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  const getMediaUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API}${url}`;
  };

  const openLightbox = (type, url, filename) => {
    setLightboxMedia({ type, url: getMediaUrl(url), filename });
    setLightboxOpen(true);
  };

  const getDownloadUrl = (url) => {
    if (!url) return "";
    if (url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
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
    setShowGalleryModal(true);
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

  // Combine real database events with fallback mockup entries for upcoming
  const displayEvents = useMemo(() => {
    let combined = [...events];
    
    if (activeTab === "upcoming" && combined.length === 0) {
      combined = MOCK_UPCOMING;
    }

    // Filter local search and category match
    return combined.filter(ev => {
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || 
        (ev.category || "").toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [events, activeTab, searchQuery, categoryFilter]);

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Workspace
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-1">
            LEARNER CONSOLE
          </p>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Connect Subtitle / Headers */}
      <div className="select-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] px-1">SCHOOL EVENTS</p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
          {activeTab === "upcoming" ? "Upcoming Events" : "Completed Events"}
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
          Explore and stay updated with all upcoming events and celebrations.
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
              ? "bg-[#7C3AED] text-white shadow-[#7C3AED]/15"
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
            placeholder="Search events..."
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
            const isMock = ev._id.startsWith("mock-upcoming-");
            
            // Render upcoming card
            if (activeTab === "upcoming") {
              const daysLeft = getDaysLeft(ev.eventDate, ev.daysLeftStatic);
              
              // Colors configuration
              let colorClass = "purple";
              let dotBg = "bg-purple-500";
              let cardGlow = "hover:border-purple-550/30";
              if (ev.themeColor === "emerald") {
                colorClass = "emerald";
                dotBg = "bg-emerald-500";
                cardGlow = "hover:border-emerald-550/30";
              } else if (ev.themeColor === "blue") {
                colorClass = "blue";
                dotBg = "bg-[#0EA5E9]";
                cardGlow = "hover:border-blue-550/30";
              } else if (ev.themeColor === "amber") {
                colorClass = "amber";
                dotBg = "bg-amber-500";
                cardGlow = "hover:border-amber-550/30";
              }

              return (
                <div 
                  key={ev._id}
                  className={`bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] ${cardGlow} rounded-2.5xl p-5 flex items-center justify-between transition-all duration-200 shadow-sm relative`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Illustration box */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2.5xl flex items-center justify-center shrink-0 ${
                      ev.avatarBg || "bg-purple-950/15 border border-purple-500/20 text-purple-500"
                    }`}>
                      {ev.illustration || <FaCalendarAlt className="text-xl" />}
                    </div>

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
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-450 dark:text-slate-400 font-extrabold mt-3 select-none">
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
                    ev.badgeBg || "bg-purple-950/20 text-purple-400 border border-purple-500/20"
                  }`}>
                    <span className="text-lg font-black tracking-tight">{daysLeft}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Days Left</span>
                  </div>
                </div>
              );
            }

            // Render completed events layout card
            const hasCover = ev.photos && ev.photos.length > 0;
            const coverUrl = hasCover ? getMediaUrl(ev.photos[0].url) : null;
            return (
              <div 
                key={ev._id}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/20 rounded-3xl overflow-hidden flex flex-col sm:flex-row shadow-sm transition-all duration-200"
              >
                {/* Cover Image left/top */}
                <div className="w-full sm:w-44 h-40 shrink-0 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-200/50 dark:border-white/10 select-none">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FaImage className="text-2xl mb-1.5 opacity-50 mx-auto" />
                      <p className="text-[9px] font-black">No Cover Uploaded</p>
                    </div>
                  )}
                </div>

                {/* Details main body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{ev.title}</h3>
                    {ev.subtitle && (
                      <p className="text-[9px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] mt-1 uppercase tracking-wider">{ev.subtitle}</p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {ev.description || "No description provided."}
                    </p>
                  </div>

                  {/* Footer metadata and View gallery CTA */}
                  <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-white/5 select-none">
                    <div className="flex items-center gap-3 text-[10px] text-slate-450 dark:text-slate-550 font-bold">
                      <span className="flex items-center gap-1"><FaCalendarAlt /> {getFormattedDate(ev.eventDate)}</span>
                      <span className="flex items-center gap-1"><FaClock /> {ev.eventTime}</span>
                    </div>

                    <button
                      onClick={() => openGallery(ev)}
                      className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 dark:hover:bg-[#38BDF8]/20 font-black text-[10px] py-1.5 px-4 rounded-xl transition cursor-pointer"
                    >
                      View Gallery
                    </button>
                  </div>
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
          Event details are subject to change. Please check regularly for latest updates.
        </p>
      </div>

      {/* ================= GALLERY DISPLAY MODAL ================= */}
      {showGalleryModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full" />
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{selectedEvent.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Event Date: {getFormattedDate(selectedEvent.eventDate)}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowGalleryModal(false)} 
                  className="text-slate-400 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-2 rounded-xl"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Subtitle & Description */}
              <div className="space-y-4 mb-8 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/40 dark:border-white/5">
                {selectedEvent.subtitle && (
                  <h4 className="text-xs font-extrabold text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wider">{selectedEvent.subtitle}</h4>
                )}
                <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              <EventGallery event={selectedEvent} api={API} />
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX / FULLSCREEN MEDIA VIEWER */}
      {lightboxOpen && lightboxMedia && (
        <div className="fixed inset-0 bg-[#070b13]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
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
              <a
                href={getDownloadUrl(lightboxMedia.url)}
                download
                target="_blank"
                rel="noreferrer"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                Download / Save
              </a>
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
          <div className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center relative">
            {lightboxMedia.type === "photo" ? (
              <img
                src={lightboxMedia.url}
                alt="Fullscreen Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-scaleUp"
              />
            ) : (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-scaleUp"
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentEvents;
