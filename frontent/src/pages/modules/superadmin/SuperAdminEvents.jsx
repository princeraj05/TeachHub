import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaImage, FaVideo, FaEye, FaTimes, FaSchool } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SuperAdminEvents() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const getMediaUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API}${url}`;
  };

  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, completed
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [loading, setLoading] = useState(false);

  // Gallery view Modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [activeTab, selectedSchool]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchools(res.data || []);
    } catch (err) {
      console.error("Error loading schools list:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "upcoming" ? "/api/events/upcoming" : "/api/events/completed";
      const params = selectedSchool !== "all" ? { schoolName: selectedSchool } : {};
      
      const res = await axios.get(`${API}${endpoint}`, {
        params,
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="font-sans space-y-6" style={{ fontFamily: SORA }}>
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-white/10 pb-4 gap-4 select-none">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Cross-School Events</h2>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Audit upcoming calendars & event galleries across all schools</p>
        </div>

        {/* School filter dropdown */}
        <div className="flex items-center gap-2">
          <FaSchool className="text-slate-400 text-xs shrink-0" />
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Schools</option>
            {schools.map((school, i) => (
              <option key={i} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex bg-white dark:bg-[#0B132A] p-1.5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm w-fit gap-1 select-none">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-md shadow-[#7C3AED]/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "completed"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-md shadow-[#7C3AED]/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Completed Events
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center select-none flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-xs font-bold">Synchronizing cross-school events database...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center select-none bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
            <FaCalendarAlt />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">No events scheduled</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            There are currently no {activeTab} events listed matching the filter criteria.
          </p>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {events.map((ev) => {
            const hasCover = ev.photos && ev.photos.length > 0;
            const coverUrl = hasCover ? getMediaUrl(ev.photos[0].url) : null;

            return (
              <div 
                key={ev._id}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  {activeTab === "completed" && (
                    <div className="h-44 bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b border-slate-150 dark:border-white/5">
                      {coverUrl ? (
                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-400 dark:text-slate-500">
                          <FaImage className="text-3xl mb-2 opacity-50 mx-auto" />
                          <p className="text-[10px] font-bold">No Photos Uploaded</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded-md mb-3">
                      <FaSchool className="text-[10px]" /> {ev.schoolName}
                    </span>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h3>
                    {ev.subtitle && (
                      <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-1 uppercase tracking-wider">{ev.subtitle}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-4 border-t border-slate-100 dark:border-white/5 pt-3">
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-slate-400" /> {getFormattedDate(ev.eventDate)}</span>
                      <span className="flex items-center gap-1.5"><FaClock className="text-slate-400" /> {ev.eventTime}</span>
                    </div>

                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-4 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {ev.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {activeTab === "completed" && (
                  <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] select-none">
                    <button
                      onClick={() => openGallery(ev)}
                      className="w-full bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#7C3AED]/15 hover:opacity-95 transition"
                    >
                      <FaEye /> View Gallery
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= GALLERY DISPLAY MODAL ================= */}
      {showGalleryModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full" />
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800 dark:text-white">{selectedEvent.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 rounded">
                      {selectedEvent.schoolName}
                    </span>
                  </div>
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
                <p className="text-xs text-slate-755 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              {/* Photos Grid */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 mb-8">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Photos ({selectedEvent.photos?.length || 0})</h4>
                {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedEvent.photos.map((photo) => (
                      <div 
                        key={photo._id} 
                        onClick={() => window.open(getMediaUrl(photo.url), "_blank")}
                        className="relative aspect-video rounded-xl overflow-hidden cursor-zoom-in bg-slate-900 border border-slate-200/50 dark:border-white/10 group"
                      >
                        <img src={getMediaUrl(photo.url)} alt={photo.filename} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                          View Fullscreen
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold select-none italic">No photos uploaded to this event gallery yet.</p>
                )}
              </div>

              {/* Videos Grid */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Videos ({selectedEvent.videos?.length || 0})</h4>
                {selectedEvent.videos && selectedEvent.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.videos.map((video) => (
                      <div key={video._id} className="relative rounded-2xl overflow-hidden bg-black border border-slate-200/50 dark:border-white/10">
                        <video src={getMediaUrl(video.url)} controls className="w-full aspect-video object-cover" />
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-[9px] font-bold text-slate-455 truncate">
                          {video.filename}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold select-none italic">No videos uploaded to this event gallery yet.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminEvents;
