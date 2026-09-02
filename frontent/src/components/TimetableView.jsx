import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper to format time to "12:00-12:50 PM" style
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
    const startPart = start.replace(/\s*(AM|PM)$/i, "");
    return `${startPart}-${end}`;
  }
  return start || end || "12:00-12:50 PM";
};

// Helper to format class card details matching design
const formatCardDetails = (entry) => {
  if (entry.notes && entry.notes.includes("C:") && entry.notes.includes("R:")) {
    const parts = entry.notes.split("/");
    if (parts.length >= 2) {
      return {
        line1: parts.slice(0, parts.length - 2).join("/") + "/",
        line2: parts.slice(parts.length - 2).join("/")
      };
    }
  }

  const type = entry.classType || "Lecture";
  const group = entry.class?.section ? `G:${entry.class.section}` : "G:All";
  const subjectName = entry.subject?.name || "INT253";
  const room = entry.room || "33-507Y";
  const code = entry.notes || (entry.teacher?.name ? `S:${entry.teacher.name.replace(/\s+/g, '')}` : "S:K2P23GM");

  const cleanCode = code.startsWith("S:") ? code : `S:${code}`;

  return {
    line1: `${type} / ${group} C:${subjectName} /`,
    line2: `R: ${room} / ${cleanCode}`
  };
};

// Mock fallback sample data matching screenshots if backend has no entries yet
const MOCK_ENTRIES_BY_DAY = {
  Monday: [
    { _id: "m1", startTime: "12:50 PM", endTime: "01:40 PM", classType: "Lecture", room: "33-507Y", notes: "S:K2P23GM", subject: { name: "INT253" }, class: { section: "All" } },
    { _id: "m2", startTime: "01:40 PM", endTime: "02:30 PM", classType: "Lecture", room: "33-507Y", notes: "S:K2P23GM", subject: { name: "INT253" }, class: { section: "All" } },
    { _id: "m3", startTime: "03:20 PM", endTime: "04:10 PM", classType: "Practical", room: "38-806", notes: "S:K4O2338", subject: { name: "IXD803" }, class: { section: "0" } }
  ],
  Wednesday: [
    { _id: "w1", startTime: "12:00 PM", endTime: "12:50 PM", classType: "Guidance", room: "34-102A", notes: "S:K4C0165", subject: { name: "CSE339" }, class: { section: "All" } },
    { _id: "w2", startTime: "12:50 PM", endTime: "01:40 PM", classType: "Practical", room: "33-512", notes: "S:K2P23GM", subject: { name: "INT253" }, class: { section: "0" } },
    { _id: "w3", startTime: "01:40 PM", endTime: "02:30 PM", classType: "Practical", room: "33-512", notes: "S:K2P23GM", subject: { name: "INT253" }, class: { section: "0" } },
    { _id: "w4", startTime: "03:20 PM", endTime: "04:10 PM", classType: "Practical", room: "38-902", notes: "S:K4O2338", subject: { name: "IXD803" }, class: { section: "0" } }
  ],
  Friday: [
    { _id: "f1", startTime: "12:50 PM", endTime: "01:40 PM", classType: "Lecture", room: "33-505X", notes: "S:K2P23GM", subject: { name: "INT402" }, class: { section: "All" } }
  ]
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
  const [error, setError] = useState("");

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
        setError("Could not load timetable");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimetable();
  }, [API]);

  // Combine backend entries with sample fallback if empty for selected day
  const dayEntries = useMemo(() => {
    const realDayEntries = allEntries.filter(
      (e) => e.day?.toLowerCase() === selectedDay.toLowerCase()
    );

    if (realDayEntries.length > 0) {
      return [...realDayEntries].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      );
    }

    // Fallback sample data if no entries created yet by admin for this day
    return MOCK_ENTRIES_BY_DAY[selectedDay] || [];
  }, [allEntries, selectedDay]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#090F1C] text-slate-800 dark:text-white select-none -m-4 md:-m-6 pb-12">
      
      {/* 1. Dark Top Header Bar */}
      <header className="bg-[#2D2D2D] dark:bg-[#1E1E1E] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="text-white p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
          aria-label="Back"
        >
          <FaArrowLeft className="text-base sm:text-lg" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold tracking-wide text-center flex-1 pr-8">
          TimeTable
        </h1>
      </header>

      {/* 2. Horizontal Scrollable Day Selector Tab Bar */}
      <div className="bg-white dark:bg-[#0B132A] border-b border-slate-200 dark:border-white/10 px-3 py-3 shadow-xs">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none max-w-3xl mx-auto px-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-[#FF6F61] via-[#FF8A65] to-[#FFB74D] text-[#2C2C2E] shadow-sm font-bold border border-amber-300/40"
                    : "bg-[#F8F9FA] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Body Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4">
        
        {/* Selected Day Subheading */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1E1E1E] dark:text-white text-center my-5 sm:my-6">
          {selectedDay}
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#FF7A59] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-medium">Loading timetable...</p>
          </div>
        ) : dayEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#0B132A] rounded-2xl p-10 text-center shadow-sm border border-slate-200 dark:border-white/10 my-4">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              No classes are scheduled for {selectedDay}.
            </p>
          </div>
        ) : (
          /* 4. Timetable Cards Grid (2 Columns on Mobile / Tablet) */
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-8">
            {dayEntries.map((entry, idx) => {
              const timeRange = formatTimeRange(entry.startTime, entry.endTime);
              const details = formatCardDetails(entry);

              return (
                <div
                  key={entry._id || idx}
                  className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col min-h-[160px]"
                >
                  {/* Top Dark Header for Time */}
                  <div className="bg-[#2D2D2D] text-white py-2 px-2.5 text-center font-semibold text-xs sm:text-sm tracking-tight rounded-t-xl shrink-0">
                    {timeRange}
                  </div>

                  {/* White Card Body for Class Details */}
                  <div className="p-3.5 flex-1 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111827] rounded-b-xl">
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed tracking-tight">
                      {details.line1}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed tracking-tight mt-0.5">
                      {details.line2}
                    </p>
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
