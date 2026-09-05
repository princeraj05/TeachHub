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
    return `${start} - ${end}`;
  }
  return start || end || "";
};

export default function TimetableView() {
  const API = import.meta.env.VITE_API_URL;
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
    <div className="w-full text-slate-800 dark:text-white select-none pb-12 font-sans">
      
      {/* 1. Header Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none bg-white dark:bg-[#0B132A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Class Schedule
            </h1>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-auto">
          <FaSchool className="text-xs text-purple-500 dark:text-purple-400" />
          <span>Academic Timetable</span>
        </div>
      </div>

      {/* 2. Horizontal Scrollable Day Selector Tab Bar */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 p-3 sm:p-3.5 rounded-2xl shadow-sm mb-6">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none max-w-4xl mx-auto px-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const dayCount = allEntries.filter(e => e.day?.toLowerCase() === day.toLowerCase()).length;
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20 border border-purple-400/30 scale-[1.02]"
                    : "bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span>{day}</span>
                {dayCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
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
      <main className="max-w-4xl mx-auto text-left">
        
        {/* Selected Day Subheading */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4 mb-6 gap-2">
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
            <div className="w-9 h-9 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Loading Schedule...</p>
          </div>
        ) : dayEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#0B132A] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-850 shadow-xl my-6 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl">
              <FaCalendarAlt />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">No Classes Scheduled</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm">
              There are no classes scheduled for {selectedDay}. Please check another day of the week.
            </p>
          </div>
        ) : (
          /* 4. Timetable Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
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
                  className={`rounded-2xl border ${theme.border} ${theme.bg} shadow-md dark:shadow-xl hover:scale-[1.01] transition-all duration-200 overflow-hidden flex flex-col justify-between`}
                >
                  {/* Top Time Header Banner */}
                  <div className={`px-4 py-2.5 flex items-center justify-between ${theme.headerBg}`}>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-xs opacity-90" />
                      <span className="text-xs font-black tracking-wide">{timeRange}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20 tracking-widest">
                      {classType}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3.5">
                    
                    {/* Subject Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                          {subjectName}
                        </h4>
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 ${theme.badge}`}>
                          {section}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <FaBook className="text-sm" />
                      </div>
                    </div>

                    {/* Teacher & Location Info */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      
                      {/* Teacher */}
                      <div className="flex items-center gap-2">
                        <FaChalkboardTeacher className={`${theme.accent} text-xs shrink-0`} />
                        <span className="truncate text-slate-700 dark:text-slate-300">{teacherName}</span>
                      </div>

                      {/* Room */}
                      <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400 text-xs shrink-0" />
                          <span>{room}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
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
