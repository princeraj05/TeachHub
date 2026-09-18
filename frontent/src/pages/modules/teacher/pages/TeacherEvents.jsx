import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaImage, FaVideo, FaEye, FaTimes, FaExpand } from "react-icons/fa";
import EventGallery from "../../../../components/EventGallery";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function TeacherEvents() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    return `${API}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);

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

  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, completed
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gallery view Modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="font-sans space-y-4 sm:space-y-6" style={{ fontFamily: SORA }}>
      {/* Page Title Header */}
      <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 sm:pb-4 select-none">
        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">School Events</h2>
        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Explore upcoming calendar schedule & event galleries</p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap bg-white dark:bg-[#0B132A] p-1.5 border border-slate-200/50 dark:border-white/10 rounded-2.5xl sm:rounded-3xl shadow-sm w-full sm:w-fit gap-1 select-none">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center ${
            activeTab === "upcoming"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-md shadow-[#7C3AED]/10"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center ${
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
          <p className="text-slate-400 text-xs font-bold">Synchronizing school events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center select-none bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-6 sm:p-8 animate-fadeIn">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2.5xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-xl sm:text-2xl mx-auto mb-4 animate-bounce">
            <FaCalendarAlt />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">No events scheduled</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            There are currently no {activeTab} events listed for your school.
          </p>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-fadeIn">
          {events.map((ev) => {
            const hasCover = ev.photos && ev.photos.length > 0 && ev.photos[0]?.url;
            const coverUrl = ev.coverPhoto ? getMediaUrl(ev.coverPhoto) : (hasCover ? getMediaUrl(ev.photos[0].url) : null);

            return (
              <div 
                key={ev._id}
                className="group bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] hover:border-[#7C3AED]/40 dark:hover:border-white/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 sm:h-48 w-full bg-slate-100 dark:bg-white/5 relative overflow-hidden flex items-center justify-center border-b border-slate-150 dark:border-white/5">
                    {coverUrl ? (
                      <img 
                        src={coverUrl} 
                        alt={ev.title || "Cover"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <FaImage className="text-3xl mb-1.5 opacity-50 text-[#7C3AED]" />
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">No Photos Uploaded</p>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      {activeTab === "completed" ? "Completed" : "Upcoming"}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-1">{ev.title}</h3>
                      {ev.subtitle && (
                        <p className="text-[10px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] mt-1 uppercase tracking-wider">{ev.subtitle}</p>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed line-clamp-2">
                        {ev.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                        <FaCalendarAlt className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" /> 
                        {getFormattedDate(ev.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200/60 dark:border-white/10">
                        <FaClock className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" /> 
                        {ev.eventTime}
                      </span>
                    </div>
                  </div>
                </div>

                {activeTab === "completed" && (
                  <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] select-none">
                    <button
                      type="button"
                      onClick={() => openGallery(ev)}
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-slate-950 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15 transition"
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
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-slideUp my-auto">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full shrink-0" />
            <div className="p-5 sm:p-8 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">{selectedEvent.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Event Date: {getFormattedDate(selectedEvent.eventDate)}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowGalleryModal(false)} 
                  className="text-slate-450 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-2 rounded-xl"
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

              <EventGallery event={selectedEvent} api={API} userRole="teacher" />

              {/* Legacy media markup retained only for backwards-compatible state handling. */}
              <div className="hidden border-t border-slate-100 dark:border-white/5 pt-6 mb-8">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Photos ({selectedEvent.photos?.length || 0})</h4>
                {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedEvent.photos.map((photo) => (
                      <div 
                        key={photo._id} 
                        onClick={() => openLightbox('photo', photo.url, photo.filename)}
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
              <div className="hidden border-t border-slate-100 dark:border-white/5 pt-6">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Videos ({selectedEvent.videos?.length || 0})</h4>
                {selectedEvent.videos && selectedEvent.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.videos.map((video) => (
                      <div key={video._id} className="relative rounded-2xl overflow-hidden bg-black border border-slate-200/50 dark:border-white/10 flex flex-col justify-between">
                        <video src={getMediaUrl(video.url)} controls className="w-full aspect-video object-cover" />
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-455 truncate max-w-[65%]">{video.filename}</span>
                          <button
                            type="button"
                            onClick={() => openLightbox('video', video.url, video.filename)}
                            className="text-[#7C3AED] dark:text-[#38BDF8] hover:underline text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <FaExpand className="text-[8px]" /> Fullscreen
                          </button>
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

      {/* 5. LIGHTBOX / FULLSCREEN MEDIA VIEWER */}
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

export default TeacherEvents;
