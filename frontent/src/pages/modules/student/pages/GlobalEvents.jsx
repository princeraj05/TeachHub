import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaSchool,
  FaSearch,
  FaSlidersH,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimes,
  FaImage,
  FaVideo
} from "react-icons/fa";
import EventGallery from "../../../../components/EventGallery";

const SORA = "'Sora', sans-serif";

const DUMMY_EVENTS = [
  {
    _id: "dummy-1",
    schoolName: "G.D Accedmy School",
    title: "Independence Day Celebration 🇮🇳",
    subtitle: "Celebration",
    description: "A proud celebration of India's 78th Independence Day with cultural programs, flag hoisting, and students' performances.",
    eventDate: "2025-08-15T00:00:00.000Z",
    eventTime: "10:00 AM",
    status: "completed",
    photosCount: 15,
    videosCount: 2,
    location: "Siwan, Bihar",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    photos: [
      { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80", filename: "photo1.jpg", mimeType: "image/jpeg", size: 100000 },
      { url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80", filename: "photo2.jpg", mimeType: "image/jpeg", size: 100000 },
      { url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80", filename: "photo3.jpg", mimeType: "image/jpeg", size: 100000 }
    ],
    videos: [
      { url: "https://www.w3schools.com/html/mov_bbb.mp4", filename: "video1.mp4", mimeType: "video/mp4", size: 5000000 }
    ]
  },
  {
    _id: "dummy-2",
    schoolName: "Prince School",
    title: "Inter School Science Quiz 2025 🧠",
    subtitle: "Academic",
    description: "An engaging science quiz competition where students showcased their knowledge and problem-solving skills.",
    eventDate: "2025-08-10T00:00:00.000Z",
    eventTime: "11:00 AM",
    status: "completed",
    photosCount: 12,
    videosCount: 1,
    location: "Noida, Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    photos: [
      { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80", filename: "photo1.jpg", mimeType: "image/jpeg", size: 100000 },
      { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80", filename: "photo2.jpg", mimeType: "image/jpeg", size: 100000 }
    ],
    videos: [
      { url: "https://www.w3schools.com/html/movie.mp4", filename: "video1.mp4", mimeType: "video/mp4", size: 5000000 }
    ]
  },
  {
    _id: "dummy-3",
    schoolName: "Bright Future School",
    title: "Annual Sports Meet 2025 ⚽",
    subtitle: "Sports",
    description: "A day full of energy, teamwork, and sportsmanship. Students participated in various track and field events.",
    eventDate: "2025-08-05T00:00:00.000Z",
    eventTime: "09:00 AM",
    status: "completed",
    photosCount: 18,
    videosCount: 3,
    location: "Patna, Bihar",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
    photos: [
      { url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80", filename: "photo1.jpg", mimeType: "image/jpeg", size: 100000 },
      { url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80", filename: "photo2.jpg", mimeType: "image/jpeg", size: 100000 }
    ],
    videos: [
      { url: "https://www.w3schools.com/html/mov_bbb.mp4", filename: "video1.mp4", mimeType: "video/mp4", size: 5000000 }
    ]
  }
];

const CATEGORIES = [
  { name: "All Events", label: "All Events" },
  { name: "Celebration", label: "Celebration 🎉" },
  { name: "Academic", label: "Academic 🎓" },
  { name: "Sports", label: "Sports 🏃" },
  { name: "Others", label: "Others 🔢" }
];

function GlobalEvents() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchGlobalEvents();
  }, []);

  const fetchGlobalEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/events/completed?global=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDbEvents(res.data || []);
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
    if (name.includes("gd accedmy") || name.includes("g.d") || name.includes("accedmy")) return "Siwan, Bihar";
    return "Siwan, Bihar";
  };

  const getEventCategory = (ev) => {
    if (ev.subtitle && CATEGORIES.some(c => c.name.toLowerCase() === ev.subtitle.toLowerCase())) {
      return ev.subtitle;
    }
    const sub = (ev.subtitle || "").toLowerCase();
    const title = (ev.title || "").toLowerCase();
    if (sub.includes("celebration") || title.includes("celebration") || title.includes("independence") || title.includes("republic") || title.includes("day")) {
      return "Celebration";
    }
    if (sub.includes("academic") || sub.includes("quiz") || title.includes("quiz") || title.includes("science") || title.includes("exam") || title.includes("test")) {
      return "Academic";
    }
    if (sub.includes("sports") || sub.includes("meet") || title.includes("sports") || title.includes("football") || title.includes("cricket") || title.includes("athletics")) {
      return "Sports";
    }
    return "Others";
  };

  const getCategoryPillStyle = (cat) => {
    switch (cat) {
      case "Celebration":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
      case "Academic":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400";
      case "Sports":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
      default:
        return "bg-slate-500/10 text-slate-655 border-slate-500/20 dark:text-slate-400";
    }
  };

  const getEventThumbnail = (ev) => {
    if (ev.image) return ev.image;
    if (ev.photos && ev.photos.length > 0 && ev.photos[0].url) {
      return ev.photos[0].url.startsWith("http") ? ev.photos[0].url : `${API}${ev.photos[0].url}`;
    }
    const cat = getEventCategory(ev);
    if (cat === "Celebration") return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
    if (cat === "Academic") return "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80";
    if (cat === "Sports") return "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80";
    return "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80";
  };

  const allMergedEvents = [
    ...dbEvents,
    ...DUMMY_EVENTS.filter(dummy => !dbEvents.some(db => db.title.toLowerCase() === dummy.title.toLowerCase()))
  ];

  const filteredEvents = allMergedEvents.filter((ev) => {
    const searchMatch = searchQuery.trim() === "" ||
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getSchoolLocation(ev.schoolName).toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = activeCategory === "All Events" || getEventCategory(ev) === activeCategory;

    return searchMatch && categoryMatch;
  });

  if (loading && dbEvents.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm font-sans">Loading completed events...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto text-left select-none pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">GLOBAL FEED</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Completed School Events
          </h1>
          <p className="text-xs text-slate-505 dark:text-slate-400 font-medium mt-1 leading-relaxed max-w-xl font-sans">
            Look back at celebrations, academic events, and achievements conducted by different schools on TeachHub.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              searchOpen 
                ? "bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]"
                : "bg-white dark:bg-[#0B132A] border-slate-200 dark:border-white/[0.08] text-slate-450 dark:text-slate-400 hover:border-slate-350 dark:hover:border-white/15"
            }`}
            aria-label="Search events"
          >
            <FaSearch className="text-sm" />
          </button>

          <button
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-450 dark:text-slate-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Filter configuration"
          >
            <FaSlidersH className="text-sm" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="relative mb-6 animate-fadeIn">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-405 dark:text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search by title, school name, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10 pr-10 py-3 text-xs font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none select-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/15"
                  : "bg-white dark:bg-[#0B132A] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-605 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                
                <div className="absolute bottom-3.5 left-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <FaImage className="text-xs" />
                  <span>{ev.photos ? ev.photos.length : (ev.photosCount || 0)}</span>
                </div>
                
                <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <FaVideo className="text-xs" />
                  <span>{ev.videos ? ev.videos.length : (ev.videosCount || 0)}</span>
                </div>
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

                    <span className={`shrink-0 inline-flex items-center text-[10px] font-extrabold px-3 py-1 rounded-full border ${getCategoryPillStyle(getEventCategory(ev))}`}>
                      {getEventCategory(ev)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mt-4 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] transition-colors line-clamp-1">
                    {ev.title}
                  </h3>

                  <p className="text-[11px] text-slate-655 dark:text-slate-400 font-medium leading-relaxed mt-2.5 line-clamp-2 md:line-clamp-3">
                    {ev.description || "No description provided. Experience this wonderful event through our media gallery highlights."}
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
          <p className="text-xs text-slate-450 dark:text-slate-400 font-black">No completed events match your filters.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("All Events"); }}
            className="mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="flex items-center justify-between bg-blue-500/5 dark:bg-blue-500/5 border border-blue-500/10 dark:border-blue-500/15 rounded-2xl p-4 text-xs mt-6 select-none">
        <div className="flex items-center gap-2 text-slate-655 dark:text-slate-400">
          <FaInfoCircle className="text-[#38BDF8] text-sm shrink-0" />
          <span>Events are submitted and managed by schools.</span>
        </div>
        <button className="text-[#38BDF8] hover:underline font-extrabold shrink-0 cursor-pointer">Learn more</button>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scaleUp text-slate-800 dark:text-white p-5 sm:p-6 text-left">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-5 pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded border ${getCategoryPillStyle(getEventCategory(selectedEvent))}`}>
                  {getEventCategory(selectedEvent)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{formatDate(selectedEvent.eventDate)} at {selectedEvent.eventTime}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight text-slate-900 dark:text-white">{selectedEvent.title}</h2>
              <p className="text-xs text-[#7C3AED] dark:text-[#38BDF8] font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5">
                <FaSchool /> {selectedEvent.schoolName}
              </p>
            </div>

            <div className="border-t border-slate-150 dark:border-white/5 pt-4">
              <EventGallery event={selectedEvent} api={API} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalEvents;
