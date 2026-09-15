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
  FaCheckCircle
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import EventGallery from "../../../../components/EventGallery";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

const MOCK_UPCOMING = [];
const MOCK_COMPLETED = [];

function StudentEvents() {
  const API = API_URL;
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
    let fullUrl = (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:"))
      ? url
      : `${API}${url.startsWith("/") ? "" : "/"}${url}`;
    if (fullUrl.startsWith("http")) {
      return encodeURI(fullUrl);
    }
    return fullUrl;
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

    return combined.filter(ev => {
      return (ev.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [events, activeTab, searchQuery]);

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

      {/* Search row */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          placeholder={activeTab === "upcoming" ? "Search events..." : "Search completed events..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
        />
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
            There are currently no events found matching details.
          </p>
        </div>
      ) : (
          /* Events cards list */
          <div className={`grid grid-cols-1 ${activeTab === "upcoming" ? "md:grid-cols-2 lg:grid-cols-2" : "gap-4"} gap-5`}>
            {displayEvents.map((ev) => {
              
              // Render upcoming card
              if (activeTab === "upcoming") {
                const daysLeft = getDaysLeft(ev.eventDate, ev.daysLeftStatic);
                const coverUrl = ev.coverPhoto || (ev.photos && ev.photos.length > 0 ? getMediaUrl(ev.photos[0].url) : null);
                let dotBg = "bg-purple-500";
                let cardGlow = "hover:border-[#7C3AED]/40 hover:shadow-xl hover:shadow-[#7C3AED]/5";
                if (ev.themeColor === "emerald") {
                  dotBg = "bg-emerald-500";
                } else if (ev.themeColor === "blue") {
                  dotBg = "bg-[#0EA5E9]";
                } else if (ev.themeColor === "amber") {
                  dotBg = "bg-amber-500";
                }

                return (
                  <div 
                    key={ev._id}
                    className={`group bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] ${cardGlow} rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-sm relative`}
                  >
                    {/* Cover Banner Image */}
                    <div className="h-44 sm:h-52 w-full bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b border-slate-150 dark:border-white/5">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={ev.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-indigo-600/10 to-slate-900 flex items-center justify-center">
                          <FaCalendarAlt className="text-4xl text-[#7C3AED] opacity-40" />
                        </div>
                      )}

                      {/* Gradient overlay on bottom of image for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

                      {/* Top Left Event Tag */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        Upcoming Event
                      </div>

                      {/* Top Right Floating Days Left Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 shadow-lg select-none">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-black text-amber-300">{daysLeft}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-200">Days Left</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotBg} shrink-0`} />
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-1">
                            {ev.title}
                          </h3>
                        </div>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-2 line-clamp-2">
                          {ev.description || "Join us for this exciting school event!"}
                        </p>
                      </div>

                      {/* Metadata Chips (Date, Time, Location) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                          <FaCalendarAlt className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" />
                          {getFormattedDate(ev.eventDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                          <FaClock className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" />
                          {ev.eventTime}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                          <FaMapMarkerAlt className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" />
                          {ev.location || "School Ground"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Render completed events layout card
              const coverUrl = ev.coverPhoto || (ev.photos && ev.photos.length > 0 ? getMediaUrl(ev.photos[0].url) : null);
              
              let cardGlow = "hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5";

              return (
                <div 
                  key={ev._id}
                  className={`group bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] ${cardGlow} rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm transition-all duration-300`}
                >
                  {/* Cover Image left/top */}
                  <div className="w-full md:w-64 lg:w-72 h-44 md:h-auto shrink-0 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-white/10 select-none">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600/20 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <FaImage className="text-3xl mb-1.5 opacity-55 text-emerald-400" />
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">No Cover Image</p>
                      </div>
                    )}
                    
                    {/* Floating Completed Badge over image */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <FaCheckCircle className="text-xs" /> Completed
                    </div>
                  </div>

                  {/* Details main body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-500 transition-colors line-clamp-1">
                          {ev.title}
                        </h3>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-2 line-clamp-2">
                        {ev.description || "Explore photos and videos from this past school event."}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                        <FaCalendarAlt className="text-emerald-500 text-xs" /> 
                        {getFormattedDate(ev.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                        <FaClock className="text-emerald-500 text-xs" /> 
                        {ev.eventTime}
                      </span>
                    </div>
                  </div>

                  {/* Completed Action Area (Right / Bottom) */}
                  <div className="p-4 sm:p-5 md:border-l border-slate-100 dark:border-white/10 flex flex-col justify-between items-stretch md:items-end justify-center shrink-0 gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                        Held on {getFormattedDate(ev.eventDate)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openGallery(ev)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-slate-950 font-extrabold text-xs shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer"
                    >
                      <FaEye className="text-sm" /> View Gallery
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}



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
