import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

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

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toUpperCase();
  const match = str.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm) {
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    if (hours >= 1 && hours <= 6) hours += 12;
  }

  return hours * 60 + minutes;
};

export default function TodayTimetableWidget() {
  const API = API_URL;
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
    const sorted = [...entries].sort((a, b) => {
      const timeA = parseTimeToMinutes(a.startTime);
      const timeB = parseTimeToMinutes(b.startTime);
      if (timeA !== timeB) return timeA - timeB;
      const pA = Number(a.periodNumber) || 0;
      const pB = Number(b.periodNumber) || 0;
      return pA - pB;
    });

    return sorted.map((e) => ({
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
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Today's Timetable
        </h2>
        <button
          type="button"
          onClick={() => navigate("/student/showtimetable")}
          className="text-xs font-extrabold text-[#7C3AED] dark:text-[#38BDF8] hover:underline cursor-pointer"
        >
          View All →
        </button>
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
              className="w-52 sm:w-60 shrink-0 rounded-3xl shadow-sm dark:shadow-md border border-slate-200/80 dark:border-white/[0.08] overflow-hidden flex flex-col bg-white dark:bg-[#0B132A] hover:border-[#7C3AED]/40 dark:hover:border-[#38BDF8]/40 transition-all duration-300 group cursor-pointer active:scale-[0.98]"
            >
              {/* Top Card Section */}
              <div className="p-4 sm:p-5 flex flex-col gap-2 text-left flex-1 justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-1">
                    {card.subjectCode}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                    Room {card.room}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-xl border ${
                    isAbsent 
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" 
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
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
              <div className="bg-slate-100 dark:bg-white/[0.04] text-[#7C3AED] dark:text-[#38BDF8] py-2.5 px-3.5 text-center text-xs font-black tracking-wide flex items-center justify-center gap-1.5 border-t border-slate-200/60 dark:border-white/5">
                <FaClock className="text-xs text-[#7C3AED] dark:text-[#38BDF8]" />
                <span>{timeText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
