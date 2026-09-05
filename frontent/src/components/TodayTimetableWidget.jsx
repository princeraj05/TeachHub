import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Helper to format time range e.g. "12:00-12:50 PM"
const formatTimeRange = (startTime, endTime) => {
  const format12h = (tStr) => {
    if (!tStr) return "";
    const clean = String(tStr).trim().toUpperCase();
    if (clean.includes("AM") || clean.includes("PM")) return clean;
    const parts = clean.split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return tStr;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    const displayM = String(m).padStart(2, "0");
    return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
  };

  const start = format12h(startTime);
  const end = format12h(endTime);
  if (start && end) {
    const startPart = start.replace(/\s*(AM|PM)$/i, "");
    return `${startPart}-${end}`;
  }
  return start || end || "";
};

export default function TodayTimetableWidget() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayDay = useMemo(() => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()), []);

  useEffect(() => {
    axios
      .get(`${API}/api/timetable?day=${todayDay}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setEntries(response.data);
        }
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [API, todayDay, token]);

  const cardsToDisplay = useMemo(() => {
    return entries.map((e) => ({
      _id: e._id,
      subjectCode: e.subject?.name || "Subject",
      room: e.room || "Classroom",
      status: e.teacherAttendance || "Present",
      startTime: e.startTime,
      endTime: e.endTime
    }));
  }, [entries]);

  if (!loading && cardsToDisplay.length === 0) {
    return (
      <section className="my-5 select-none text-left">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Today's Timetable
        </h2>
        <p className="text-xs text-slate-400 font-semibold italic py-2">
          No classes scheduled for today ({todayDay}).
        </p>
      </section>
    );
  }

  return (
    <section className="my-5 select-none text-left">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Today's Timetable
        </h2>
      </div>

      {/* Horizontally Scrollable Today Timetable Cards */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none pt-1">
        {cardsToDisplay.map((card) => {
          const isAbsent = card.status?.toLowerCase() === "absent";
          const timeText = formatTimeRange(card.startTime, card.endTime);

          return (
            <div
              key={card._id}
              onClick={() => navigate("/student/showtimetable")}
              className="w-48 sm:w-56 shrink-0 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-purple-500/25 overflow-hidden flex flex-col bg-white dark:bg-[#0D1326] hover:border-purple-500/60 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
            >
              {/* Top Card Section - App Theme Matching Gradient */}
              <div className="bg-gradient-to-br from-purple-500/10 via-indigo-50/50 to-slate-50 dark:from-[#7C3AED]/20 dark:via-[#131B35] dark:to-[#0B132A] p-4 flex flex-col gap-1.5 text-left border-b border-slate-200/60 dark:border-purple-500/20">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  {card.subjectCode}
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-purple-300/70">
                  {card.room}
                </p>

                {/* Status Badge */}
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isAbsent 
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" 
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  }`}>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAbsent ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    {isAbsent ? "Absent" : "Present"}
                  </span>
                </div>
              </div>

              {/* Bottom Time Bar */}
              <div className="bg-slate-50 dark:bg-[#070B18] text-purple-700 dark:text-purple-300 py-2.5 px-3 text-center text-xs font-black tracking-wide flex items-center justify-center gap-1.5 border-t border-slate-200/60 dark:border-purple-500/20">
                <FaClock className="text-[11px] text-purple-500 dark:text-purple-400" />
                <span>{timeText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
