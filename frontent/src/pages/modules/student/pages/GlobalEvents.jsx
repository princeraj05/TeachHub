import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaSchool } from "react-icons/fa";
import EventGallery from "../../../../components/EventGallery";

const SORA = "'Sora', sans-serif";

function GlobalEvents() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalEvents();
  }, []);

  const fetchGlobalEvents = async () => {
    try {
      setLoading(true);
      // Fetch completed events globally (across all schools)
      const res = await axios.get(`${API}/api/events/completed?global=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching global events:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading completed events...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6 text-left">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Global Feed</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Completed School Events
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5 font-sans">
          Look back at celebrations, academic events, and achievements conducted by different schools on TeachHub.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-lg relative overflow-hidden transition-all duration-200">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[60px] pointer-events-none" />
              
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4 gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h3>
                  {ev.subtitle && <p className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-0.5 uppercase tracking-wide">{ev.subtitle}</p>}
                </div>
                
                {/* School Association Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-teal-500/10 to-[#7C3AED]/10 border border-teal-500/20 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black uppercase tracking-wider rounded-xl">
                  <FaSchool /> School: {ev.schoolName}
                </div>
              </div>

              {/* Event Dates & details */}
              <div className="flex items-center gap-4 text-[10px] text-slate-450 dark:text-slate-455 font-bold mb-4">
                <span className="flex items-center gap-1.5"><FaCalendarAlt /> {new Date(ev.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><FaClock /> {ev.eventTime}</span>
              </div>

              {/* Description */}
              {ev.description && (
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium mb-6 whitespace-pre-line">
                  {ev.description}
                </p>
              )}

              <EventGallery event={ev} api={API} />

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-3xl">
          <FaCalendarAlt className="text-slate-350 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold italic">No completed events reported yet.</p>
        </div>
      )}
    </div>
  );
}

export default GlobalEvents;
