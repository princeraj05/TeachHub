import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaSchool,
  FaSearch,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimes,
  FaImage,
  FaVideo,
  FaCheckCircle
} from "react-icons/fa";
import EventGallery from "../../../../components/EventGallery";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function GlobalEvents() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, completed
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchGlobalEvents();
  }, []);

  const fetchGlobalEvents = async () => {
    try {
      setLoading(true);
      const [upRes, compRes] = await Promise.all([
        axios.get(`${API}/api/events/upcoming?global=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API}/api/events/completed?global=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      const upData = upRes.data || [];
      const compData = compRes.data || [];

      setUpcomingEvents(upData);
      setCompletedEvents(compData);
      setUpcomingCount(upData.length);
      setCompletedCount(compData.length);
    } catch (err) {
      console.error("Error fetching global events:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getSchoolLocation = (schoolName) => {
    const name = (schoolName || "").toLowerCase();
    if (name.includes("prince")) return "Noida, Uttar Pradesh";
    if (name.includes("bright")) return "Patna, Bihar";
    if (name.includes("gd academy") || name.includes("g.d") || name.includes("academy")) return "Siwan, Bihar";
    return "Siwan, Bihar";
  };

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

  const getEventThumbnail = (ev) => {
    if (!ev) return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
    if (ev.coverPhoto) return getMediaUrl(ev.coverPhoto);
    if (ev.image) return getMediaUrl(ev.image);
    if (ev.photos && ev.photos.length > 0 && ev.photos[0]?.url) {
      return getMediaUrl(ev.photos[0].url);
    }
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
  };

  const currentTabEvents = activeTab === "upcoming" ? upcomingEvents : completedEvents;

  const filteredEvents = currentTabEvents.filter((ev) => {
    return searchQuery.trim() === "" ||
      (ev.title && ev.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.schoolName && ev.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getSchoolLocation(ev.schoolName).toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading && upcomingEvents.length === 0 && completedEvents.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm font-sans">Synchronizing events database...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-5xl mx-auto text-left select-none pb-12">
      {/* Title Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">GLOBAL FEED</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Events Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed max-w-xl font-sans">
            Explore school happenings, upcoming celebrations, and completed event gallery on TeachHub.
          </p>
        </div>
      </div>

      {/* Navigation Header (Tabs + Search) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 select-none">
        {/* Tabs switcher with live count badges */}
        <div className="flex bg-white dark:bg-[#0B132A] p-1.5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm gap-1 select-none">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === "upcoming"
                ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-md shadow-[#7C3AED]/10"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span>Upcoming Events</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "upcoming"
                ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#090F1C]"
                : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
            }`}>
              {upcomingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === "completed"
                ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-md shadow-[#7C3AED]/10"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <span>Completed / Gallery</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "completed"
                ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#090F1C]"
                : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
            }`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search input field */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
          />
          <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-xs" />
        </div>
      </div>

      {/* Event Cards Listing */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev._id}
              onClick={() => setSelectedEvent(ev)}
              className="group relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 rounded-3xl p-4.5 sm:p-5 flex flex-col md:flex-row gap-5 hover:shadow-xl dark:hover:shadow-2xl/20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-full md:w-[35%] aspect-[1.4] relative rounded-2.5xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                <img
                  src={getEventThumbnail(ev)}
                  alt={ev.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                
                {/* Status Badge */}
                {activeTab === "completed" ? (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500/90 text-white text-[9px] font-extrabold rounded-full backdrop-blur-md shadow-sm flex items-center gap-1">
                    <FaCheckCircle className="text-[9px]" /> Completed
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#7C3AED]/90 text-white text-[9px] font-extrabold rounded-full backdrop-blur-md shadow-sm flex items-center gap-1">
                    <FaClock className="text-[9px]" /> Upcoming
                  </span>
                )}

                {/* Media counts for completed tab */}
                {activeTab === "completed" && (
                  <>
                    <div className="absolute bottom-3.5 left-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <FaImage className="text-xs" />
                      <span>{ev.photos ? ev.photos.length : (ev.photosCount || 0)}</span>
                    </div>
                    
                    <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <FaVideo className="text-xs" />
                      <span>{ev.videos ? ev.videos.length : (ev.videosCount || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <FaSchool className="text-xs" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{ev.schoolName}</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <FaMapMarkerAlt className="text-[9px] shrink-0 text-slate-400" />
                          <span className="truncate">{ev.location || getSchoolLocation(ev.schoolName)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mt-4 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] transition-colors line-clamp-1">
                    {ev.title}
                  </h3>

                  <p className="text-[11px] text-slate-655 dark:text-slate-400 font-medium leading-relaxed mt-2.5 line-clamp-2 md:line-clamp-3">
                    {ev.description || "No description provided. Experience this event through our portal highlights."}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-505 dark:text-slate-400 font-black mt-5 pt-3.5 border-t border-slate-100 dark:border-white/5">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[11px] text-slate-400" />
                    {formatDate(ev.eventDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-[11px] text-slate-400" />
                    {ev.eventTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-8 select-none">
          <FaCalendarAlt className="text-slate-300 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <p className="text-xs text-slate-450 dark:text-slate-400 font-black">
            No {activeTab === "upcoming" ? "upcoming" : "completed"} events match your query.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}



      {/* Detail / Gallery Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-scaleUp text-slate-800 dark:text-white my-auto">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-left relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer z-10"
                aria-label="Close modal"
              >
                <FaTimes className="text-sm" />
              </button>

              {/* Cover Banner inside modal */}
              <div className="w-full h-44 sm:h-56 rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-950 relative">
                <img
                  src={getEventThumbnail(selectedEvent)}
                  alt={selectedEvent.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
                  }}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-black rounded-full backdrop-blur-md text-white shadow-sm flex items-center gap-1 ${
                  (selectedEvent.status === "completed" || activeTab === "completed") ? "bg-emerald-500/90" : "bg-[#7C3AED]/90"
                }`}>
                  {(selectedEvent.status === "completed" || activeTab === "completed") ? <><FaCheckCircle /> Completed Event</> : <><FaClock /> Upcoming Event</>}
                </span>
              </div>

              <div className="mb-4 pr-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <FaCalendarAlt /> {formatDate(selectedEvent.eventDate)} at {selectedEvent.eventTime}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight text-slate-900 dark:text-white">{selectedEvent.title}</h2>
                <p className="text-xs text-[#7C3AED] dark:text-[#38BDF8] font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
                  <FaSchool /> {selectedEvent.schoolName}
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/40 dark:border-white/5 mb-4">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description || "No detailed description provided for this event."}
                </p>
              </div>

              {(selectedEvent.status === "completed" || activeTab === "completed") && (
                <div className="border-t border-slate-150 dark:border-white/5 pt-4">
                  <EventGallery event={selectedEvent} api={API} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalEvents;

