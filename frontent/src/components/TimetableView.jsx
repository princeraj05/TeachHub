import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaChalkboardTeacher,
  FaMapMarkerAlt,
  FaBook,
  FaCalendarAlt,
  FaSchool
} from "react-icons/fa";
import axios from "axios";
import API_URL from "../config/api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SUBJECT_THEMES = {
  Mathematics: {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-purple-200 dark:border-purple-500/30",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
    headerBg: "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white dark:from-purple-950 dark:via-purple-900 dark:to-indigo-950 dark:text-purple-200 border-b border-purple-200 dark:border-purple-800/40",
    accent: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
  },
  Science: {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-emerald-200 dark:border-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    headerBg: "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white dark:from-emerald-950 dark:via-emerald-900 dark:to-teal-950 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800/40",
    accent: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
  },
  English: {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-blue-200 dark:border-blue-500/30",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    headerBg: "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white dark:from-blue-950 dark:via-blue-900 dark:to-cyan-950 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800/40",
    accent: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
  },
  Hindi: {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-orange-200 dark:border-orange-500/30",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30",
    headerBg: "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white dark:from-orange-950 dark:via-amber-900 dark:to-orange-950 dark:text-orange-200 border-b border-orange-200 dark:border-orange-800/40",
    accent: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
  },
  "Social Science": {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-cyan-200 dark:border-cyan-500/30",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
    headerBg: "bg-gradient-to-r from-cyan-600 via-cyan-700 to-teal-700 text-white dark:from-cyan-950 dark:via-cyan-900 dark:to-teal-950 dark:text-cyan-200 border-b border-cyan-200 dark:border-cyan-800/40",
    accent: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
  },
  Computer: {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-sky-200 dark:border-sky-500/30",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30",
    headerBg: "bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 text-white dark:from-sky-950 dark:via-sky-900 dark:to-blue-950 dark:text-sky-200 border-b border-sky-200 dark:border-sky-800/40",
    accent: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
  },
  "Physical Education": {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-indigo-200 dark:border-indigo-500/30",
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
    headerBg: "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white dark:from-indigo-950 dark:via-indigo-900 dark:to-purple-950 dark:text-indigo-200 border-b border-indigo-200 dark:border-indigo-800/40",
    accent: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
  }
};

const getSubjectTheme = (subjectName) => {
  if (!subjectName) return SUBJECT_THEMES.Mathematics;
  for (let key in SUBJECT_THEMES) {
    if (subjectName.toLowerCase().includes(key.toLowerCase())) {
      return SUBJECT_THEMES[key];
    }
  }
  return {
    bg: "bg-white dark:bg-[#0D1326]",
    border: "border-purple-200 dark:border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
    headerBg: "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 dark:text-purple-200 border-b border-slate-200 dark:border-slate-800",
    accent: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
  };
};

// Helper to format time to "12:00 PM - 01:00 PM" style
const formatTimeRange = (startTime, endTime) => {
  const format12h = (tStr) => {
    if (!tStr) return "";
    const clean = String(tStr).trim().toUpperCase();
    if (clean.includes("AM") || clean.includes("PM")) {
      return clean;
    }
    const parts = clean.split(":");
    let h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m)) return tStr;
    if (h >= 1 && h <= 6) h += 12;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    const displayM = String(m).padStart(2, "0");
    return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
  };

  const start = format12h(startTime);
  const end = format12h(endTime);

  if (start && end) {
    return `${start} - ${end}`;
  }
  return start || end || "";
};

export default function TimetableView() {
  const API = API_URL;
  const navigate = useNavigate();
  
  const currentDayName = useMemo(() => {
    const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
    return DAYS_OF_WEEK.includes(day) ? day : "Monday";
  }, []);

  const [selectedDay, setSelectedDay] = useState(currentDayName);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTimetable = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API}/api/timetable`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllEntries(res.data);
        }
      })
      .catch((err) => {
        console.error("Timetable load error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimetable();
  }, [API]);

  // Filter real entries for selected day
  const dayEntries = useMemo(() => {
    const realDayEntries = allEntries.filter(
      (e) => e.day?.toLowerCase() === selectedDay.toLowerCase()
    );

    return [...realDayEntries].sort((a, b) =>
      (a.startTime || "").localeCompare(b.startTime || "")
    );
  }, [allEntries, selectedDay]);

  return (
    <div className="w-full text-slate-800 dark:text-white select-none pb-12 font-sans px-1 sm:px-0">
      
      {/* Horizontal Scrollable Day Selector Tab Bar with Back Button */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] p-2 sm:p-3 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-4xl mx-auto px-1 py-0.5">
          
          {/* Back Button before Monday */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
          >
            <FaArrowLeft className="text-xs text-[#7C3AED] dark:text-[#38BDF8]" />
            <span>Back</span>
          </button>

          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const dayCount = allEntries.filter(e => e.day?.toLowerCase() === day.toLowerCase()).length;
            
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25 border border-purple-400/30 scale-[1.02]"
                    : "bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                <span>{day}</span>
                {dayCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                  }`}>
                    {dayCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content Container */}
      <main className="max-w-4xl mx-auto text-left space-y-4">
        
        {/* Selected Day Subheading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-4 mb-4 gap-1 select-none">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              {selectedDay}'s Classes
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              {dayEntries.length > 0 ? `${dayEntries.length} class periods scheduled for today.` : "No periods scheduled."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-9 h-9 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Loading Schedule...</p>
          </div>
        ) : dayEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl p-10 sm:p-12 text-center border border-slate-200/80 dark:border-white/[0.08] shadow-sm my-6 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 flex items-center justify-center text-2xl">
              <FaCalendarAlt />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">No Classes Scheduled</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              There are no classes scheduled for {selectedDay}. Please check another day of the week.
            </p>
          </div>
        ) : (
          /* 4. Timetable Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 sm:gap-5 pb-12">
            {dayEntries.map((entry, idx) => {
              const timeRange = formatTimeRange(entry.startTime, entry.endTime);
              const subjectName = entry.subject?.name || "Subject";
              const theme = getSubjectTheme(subjectName);
              const teacherName = entry.teacher?.name || "Teacher Not Assigned";
              const room = entry.room || "Room 101";
              const section = entry.class?.section ? `Section ${entry.class.section}` : `Class ${entry.class?.name || ""}`;
              const classType = entry.classType || "Regular Class";

              return (
                <div
                  key={entry._id || idx}
                  className={`group rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] shadow-sm hover:shadow-md hover:border-[#7C3AED]/30 transition-all duration-300 overflow-hidden flex flex-col justify-between`}
                >
                  {/* Top Time Header Banner */}
                  <div className={`px-4 py-3 flex items-center justify-between ${theme.headerBg}`}>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-xs opacity-90" />
                      <span className="text-xs font-black tracking-wide">{timeRange}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/20 tracking-wider">
                      {classType}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    
                    {/* Subject Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors">
                          {subjectName}
                        </h4>
                        <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border mt-1.5 ${theme.badge}`}>
                          {section}
                        </span>
                      </div>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}>
                        <FaBook className="text-base" />
                      </div>
                    </div>

                    {/* Teacher & Location Info */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      
                      {/* Teacher */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                          <FaChalkboardTeacher className="text-xs" />
                        </div>
                        <span className="truncate text-slate-800 dark:text-slate-200 font-extrabold">{teacherName}</span>
                      </div>

                      {/* Room & Period */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                          <FaMapMarkerAlt className="text-[#7C3AED] dark:text-[#38BDF8] text-xs shrink-0" />
                          <span>Room {room}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Period {idx + 1}
                        </span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
