import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, FaClock, FaPlus, FaTrash, FaEdit, 
  FaCheckCircle, FaTimes, FaImage, FaVideo, FaEye 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminEvents() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming, completed
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Form input states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);

  // File upload state trackers
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime) return;

    try {
      const res = await axios.post(
        `${API}/api/events`,
        { title, subtitle, description, eventDate, eventTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create event");
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      await axios.put(
        `${API}/api/events/${selectedEvent._id}`,
        { title, subtitle, description, eventDate, eventTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update event");
    }
  };

  const handleCompleteEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      await axios.post(
        `${API}/api/events/${selectedEvent._id}/complete`,
        { title, subtitle, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompleteModal(false);
      setSelectedEvent(null);
      resetForm();
      setActiveTab("completed");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark event completed");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This will permanently remove the event and all associated media.")) return;

    try {
      await axios.delete(`${API}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      if (showGalleryModal && selectedEvent?._id === eventId) {
        setShowGalleryModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedEvent) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    try {
      const res = await axios.post(
        `${API}/api/events/${selectedEvent._id}/photos`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        }
      );
      setSelectedEvent(res.data);
      // Update local event in state
      setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload photo(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedEvent) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("videos", files[i]);
    }

    try {
      const res = await axios.post(
        `${API}/api/events/${selectedEvent._id}/videos`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        }
      );
      setSelectedEvent(res.data);
      setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload video(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const res = await axios.delete(
        `${API}/api/events/${selectedEvent._id}/photos/${photoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedEvent(res.data);
      setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete photo");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      const res = await axios.delete(
        `${API}/api/events/${selectedEvent._id}/videos/${videoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedEvent(res.data);
      setEvents(prev => prev.map(ev => ev._id === res.data._id ? res.data : ev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete video");
    }
  };

  const openEdit = (ev) => {
    setSelectedEvent(ev);
    setTitle(ev.title);
    setSubtitle(ev.subtitle || "");
    setDescription(ev.description || "");
    setEventDate(ev.eventDate ? ev.eventDate.substring(0, 10) : "");
    setEventTime(ev.eventTime);
    setShowEditModal(true);
  };

  const openComplete = (ev) => {
    setSelectedEvent(ev);
    setTitle(ev.title);
    setSubtitle("");
    setDescription(ev.description || "");
    setShowCompleteModal(true);
  };

  const openGallery = (ev) => {
    setSelectedEvent(ev);
    setUploadError("");
    setShowGalleryModal(true);
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="font-sans space-y-6" style={{ fontFamily: SORA }}>
      {/* Page Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4 select-none">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Events Desk</h2>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Manage school happenings & event gallery</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 hover:opacity-95 active:scale-95 transition shadow-md shadow-[#7C3AED]/10 cursor-pointer"
        >
          <FaPlus className="text-[10px]" /> Add Event
        </button>
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
          Completed / Gallery
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center select-none flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-xs font-bold">Synchronizing events database...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center select-none bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8">
          <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-2xl mx-auto mb-4">
            <FaCalendarAlt />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">No events found</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            There are currently no {activeTab} school events in the schedule. Use the "Add Event" button to create one.
          </p>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const hasCover = ev.photos && ev.photos.length > 0;
            const coverUrl = hasCover ? `${API}${ev.photos[0].url}` : null;

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
                          <FaImage className="text-3xl mx-auto mb-2 opacity-50" />
                          <p className="text-[10px] font-bold">No Photos Uploaded</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
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

                {/* Event Actions Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-2 select-none">
                  {activeTab === "upcoming" ? (
                    <>
                      <button
                        onClick={() => openComplete(ev)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-extrabold text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-green-600/10"
                      >
                        <FaCheckCircle /> Complete Event
                      </button>
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl cursor-pointer border border-slate-200 dark:border-white/10"
                        title="Edit Details"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl cursor-pointer transition border border-rose-500/15"
                        title="Delete Event"
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openGallery(ev)}
                        className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white font-extrabold text-[10px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FaEye /> View / Add Media
                      </button>
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl cursor-pointer border border-slate-200 dark:border-white/10"
                        title="Edit Details"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl cursor-pointer transition border border-rose-500/15"
                        title="Delete Event"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* 1. ADD EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddEvent} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slideUp">
            <div className="h-1 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" />
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-5">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Create School Event</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-450 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Republic Day Celebration"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Time</label>
                    <input
                      type="text"
                      required
                      placeholder="09:00 AM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the event venue, instructions, or agenda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-250 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Event
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 2. EDIT EVENT MODAL */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleEditEvent} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slideUp">
            <div className="h-1 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" />
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-5">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Edit Event Details</h3>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-450 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>

                {selectedEvent.status === "completed" && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Subtitle / Secondary Text</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Annual Celebrations 2027"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Event Time</label>
                    <input
                      type="text"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-250 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. MARK COMPLETED / COMPLETE EVENT MODAL */}
      {showCompleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleCompleteEvent} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slideUp">
            <div className="h-1 bg-gradient-to-r from-green-500 to-[#7C3AED]" />
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-5">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Transition Event to Completed</h3>
                <button type="button" onClick={() => setShowCompleteModal(false)} className="text-slate-450 hover:text-slate-700 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Completed Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Completed Subtitle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Republic Day Celebration 2027"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Detailed Report / Event Description</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe how the event went down, performances, chief guests, attendee sizes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2.5 border border-slate-250 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save as Completed
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 4. COMPLETED EVENT GALLERY / MEDIA ADD AND VIEW MODAL */}
      {showGalleryModal && selectedEvent && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slideUp">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full" />
            <div className="p-8">
              {/* Modal Header */}
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

              {/* Upload Section Controls */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 mb-8">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Add Gallery Assets</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image input */}
                  <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
                    <FaImage className="text-2xl text-slate-400 mb-2" />
                    <label className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline cursor-pointer block">
                      Choose Photos
                      <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[9px] text-slate-400 mt-1 font-medium">Supports JPG, JPEG, PNG, WEBP (Max 100MB)</span>
                  </div>

                  {/* Video input */}
                  <div className="bg-slate-50/50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
                    <FaVideo className="text-2xl text-slate-400 mb-2" />
                    <label className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline cursor-pointer block">
                      Choose Videos
                      <input 
                        type="file" 
                        multiple 
                        accept="video/mp4,video/webm,video/mov" 
                        onChange={handleVideoUpload} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[9px] text-slate-400 mt-1 font-medium">Supports MP4, WEBM, MOV (Max 100MB)</span>
                  </div>
                </div>

                {uploading && (
                  <div className="mt-4 text-xs font-bold text-[#7C3AED] flex items-center gap-2 animate-pulse">
                    <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                    Uploading gallery assets, please wait...
                  </div>
                )}
                {uploadError && (
                  <div className="mt-4 text-xs font-black text-rose-500">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Photos Gallery Viewer */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 mb-8">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Photos ({selectedEvent.photos?.length || 0})</h4>
                {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedEvent.photos.map((photo) => (
                      <div key={photo._id} className="relative aspect-video rounded-xl overflow-hidden group bg-slate-900 border border-slate-200/50 dark:border-white/10">
                        <img src={`${API}${photo.url}`} alt={photo.filename} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <button
                          onClick={() => handleDeletePhoto(photo._id)}
                          className="absolute top-2 right-2 bg-rose-600/90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500 cursor-pointer shadow transition"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold select-none italic">No photos uploaded to this event gallery yet.</p>
                )}
              </div>

              {/* Videos Gallery Viewer */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Videos ({selectedEvent.videos?.length || 0})</h4>
                {selectedEvent.videos && selectedEvent.videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.videos.map((video) => (
                      <div key={video._id} className="relative rounded-2xl overflow-hidden bg-black border border-slate-200/50 dark:border-white/10 group flex flex-col justify-between">
                        <video src={`${API}${video.url}`} controls className="w-full aspect-video object-cover" />
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[8px] font-bold text-slate-400 truncate max-w-[70%]">{video.filename}</span>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="bg-rose-550/10 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg cursor-pointer transition shadow border border-rose-500/15"
                            title="Delete Video"
                          >
                            <FaTrash className="text-xs" />
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

    </div>
  );
}

export default AdminEvents;
