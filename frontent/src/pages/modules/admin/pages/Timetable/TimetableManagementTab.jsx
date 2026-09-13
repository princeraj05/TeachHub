import React, { useState, useMemo } from "react";
import {
  FaCalendarAlt,
  FaBook,
  FaSchool,
  FaChalkboardTeacher,
  FaClock,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaInfoCircle,
  FaSyncAlt,
  FaExclamationTriangle
} from "react-icons/fa";

const DAYS_LIST = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper to parse any time string into minutes since midnight
const parseMins = (tStr) => {
  if (!tStr) return 0;
  const clean = String(tStr).trim().toUpperCase();
  const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
  if (!match) {
    const parts = clean.split(":");
    let h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    if (h >= 1 && h <= 6) h += 12; // 01:00 -> 13:00 (1 PM) in school context
    return h * 60 + m;
  }
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm) {
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
  } else {
    if (h >= 1 && h <= 6) h += 12;
  }
  return h * 60 + m;
};

// Helper to format 24h or 12h time string to 12h format
const formatTime12h = (timeStr) => {
  if (!timeStr) return "";
  const clean = String(timeStr).trim().toUpperCase();
  if (clean.includes("AM") || clean.includes("PM")) return clean;
  const [hStr, mStr] = clean.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;
  if (h >= 1 && h <= 6) h += 12; // 01:00 -> 13:00 (1 PM) in school context
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  const displayM = String(m).padStart(2, "0");
  return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
};

import axios from "axios";

const formatMinutesTo12h = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  const displayM = String(m).padStart(2, "0");
  return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
};

const buildTimeSlots = (lunchStartStr = "12:00 PM", lunchMins = 60) => {
  let lunchStart = parseMins(lunchStartStr);
  // Ensure lunch start is in a valid school daytime range (11:00 AM to 02:30 PM = 660 to 870 mins)
  if (lunchStart < 660 || lunchStart > 870) {
    lunchStart = 12 * 60; // default 12:00 PM (720 mins)
  }
  const lunchDuration = Number(lunchMins) || 60;
  const lunchEnd = lunchStart + lunchDuration;

  const slots = [];

  // 1. Morning period slots up to Lunch Break (starting from 08:00 AM)
  let currentMins = 8 * 60; // 480 mins

  while (currentMins < lunchStart) {
    let nextMins = currentMins + 60;
    if (nextMins > lunchStart) {
      nextMins = lunchStart; // exact boundary before lunch break
    }
    slots.push({
      label: `${formatMinutesTo12h(currentMins)} - ${formatMinutesTo12h(nextMins)}`,
      start: formatMinutesTo12h(currentMins),
      end: formatMinutesTo12h(nextMins),
      isBreak: false,
      type: "period"
    });
    currentMins = nextMins;
  }

  // 2. Add Lunch Break
  slots.push({
    label: `${formatMinutesTo12h(lunchStart)} - ${formatMinutesTo12h(lunchEnd)}`,
    start: formatMinutesTo12h(lunchStart),
    end: formatMinutesTo12h(lunchEnd),
    isBreak: true,
    type: "lunch",
    name: `Lunch Break (${lunchDuration} Mins)`
  });

  // 3. Afternoon period slots after Lunch Break up to 04:30 PM (990 mins)
  currentMins = lunchEnd;
  const maxDayEndMins = 16 * 60 + 30; // 04:30 PM

  while (currentMins < maxDayEndMins) {
    let nextMins = currentMins + 60;
    if (nextMins > maxDayEndMins) {
      nextMins = maxDayEndMins;
    }
    slots.push({
      label: `${formatMinutesTo12h(currentMins)} - ${formatMinutesTo12h(nextMins)}`,
      start: formatMinutesTo12h(currentMins),
      end: formatMinutesTo12h(nextMins),
      isBreak: false,
      type: "period"
    });
    currentMins = nextMins;
  }

  return slots;
};

// Color mapping for subjects
const SUBJECT_COLORS = {
  Mathematics: "bg-purple-950/60 border-purple-800/80 text-purple-200",
  Science: "bg-emerald-950/60 border-emerald-800/80 text-emerald-200",
  English: "bg-blue-950/60 border-blue-800/80 text-blue-200",
  Hindi: "bg-orange-950/60 border-orange-800/80 text-orange-200",
  "Social Science": "bg-cyan-950/60 border-cyan-800/80 text-cyan-200",
  Sanskrit: "bg-teal-950/60 border-teal-800/80 text-teal-200",
  Computer: "bg-sky-950/60 border-sky-800/80 text-sky-200",
  "Physical Education": "bg-indigo-950/60 border-indigo-800/80 text-indigo-200",
  "Art & Craft": "bg-pink-950/60 border-pink-800/80 text-pink-200"
};

const LEGEND_COLORS = [
  { name: "Mathematics", color: "bg-purple-500" },
  { name: "Science", color: "bg-emerald-500" },
  { name: "English", color: "bg-blue-500" },
  { name: "Hindi", color: "bg-orange-500" },
  { name: "Social Science", color: "bg-cyan-500" },
  { name: "Sanskrit", color: "bg-teal-500" },
  { name: "Computer", color: "bg-sky-500" },
  { name: "Physical Education", color: "bg-indigo-500" },
  { name: "Art & Craft", color: "bg-pink-500" },
  { name: "Break", color: "bg-slate-655" },
  { name: "Lunch Break", color: "bg-amber-600" },
  { name: "Conflicting Time", color: "bg-rose-500" }
];

function TimetableManagementTab({
  classes,
  teachers,
  subjects,
  entries,
  remove,
  setActiveTab,
  selectedClassId,
  setSelectedClassId,
  breakSettings
}) {

  // Initial default class ID selection
  const initialClassId = selectedClassId || classes[0]?._id || "";

  // Filters state
  const [filterClass, setFilterClass] = useState(initialClassId);
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [showBreaks, setShowBreaks] = useState(true);
  const [showFullDay, setShowFullDay] = useState(false);

  // Break duration and timing states (configurable by Admin)
  const [shortBreakStartTime, setShortBreakStartTime] = useState(breakSettings?.shortBreakStartTime || "11:00 AM");
  const [shortBreakDuration, setShortBreakDuration] = useState(breakSettings?.shortBreakDuration !== undefined ? breakSettings.shortBreakDuration : 30);
  const [lunchBreakStartTime, setLunchBreakStartTime] = useState(breakSettings?.lunchBreakStartTime || "12:00 PM");
  const [lunchBreakDuration, setLunchBreakDuration] = useState(breakSettings?.lunchBreakDuration !== undefined ? breakSettings.lunchBreakDuration : 60);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [savingBreaks, setSavingBreaks] = useState(false);

  // Sync breakSettings prop whenever parent finishes loading
  React.useEffect(() => {
    if (breakSettings) {
      if (breakSettings.shortBreakStartTime) setShortBreakStartTime(breakSettings.shortBreakStartTime);
      if (breakSettings.shortBreakDuration !== undefined) setShortBreakDuration(breakSettings.shortBreakDuration);
      if (breakSettings.lunchBreakStartTime) setLunchBreakStartTime(breakSettings.lunchBreakStartTime);
      if (breakSettings.lunchBreakDuration !== undefined) setLunchBreakDuration(breakSettings.lunchBreakDuration);
    }
  }, [breakSettings]);

  // Filter active state
  const [activeFilters, setActiveFilters] = useState({
    classId: initialClassId,
    teacherId: "All",
    subjectId: "All"
  });

  // Synchronize class selection across tabs and props
  React.useEffect(() => {
    const targetClassId = selectedClassId || (classes.length > 0 ? classes[0]._id : "");
    if (targetClassId) {
      setFilterClass(targetClassId);
      setActiveFilters(prev => ({ ...prev, classId: targetClassId }));
      if (!selectedClassId && setSelectedClassId && classes.length > 0) {
        setSelectedClassId(targetClassId);
      }
    }
  }, [selectedClassId, classes]);

  // Load school break settings on mount
  React.useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "https://myschool-admin-panel.onrender.com";
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`${API}/api/schools/my-school`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data) {
            if (res.data.shortBreakStartTime) setShortBreakStartTime(res.data.shortBreakStartTime);
            if (res.data.shortBreakDuration !== undefined) setShortBreakDuration(res.data.shortBreakDuration);
            if (res.data.lunchBreakStartTime) setLunchBreakStartTime(res.data.lunchBreakStartTime);
            if (res.data.lunchBreakDuration !== undefined) setLunchBreakDuration(res.data.lunchBreakDuration);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveBreakSettings = async (e) => {
    e.preventDefault();
    setSavingBreaks(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/schools/my-school`, {
        shortBreakStartTime,
        shortBreakDuration: Number(shortBreakDuration),
        lunchBreakStartTime,
        lunchBreakDuration: Number(lunchBreakDuration)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowBreakModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save break settings");
    } finally {
      setSavingBreaks(false);
    }
  };

  const handleApplyFilters = () => {
    setActiveFilters({
      classId: filterClass,
      teacherId: filterTeacher,
      subjectId: filterSubject
    });
  };

  const handleResetFilters = () => {
    const defaultClassId = classes[0]?._id || "";
    setFilterClass(defaultClassId);
    setFilterTeacher("All");
    setFilterSubject("All");
    setActiveFilters({
      classId: defaultClassId,
      teacherId: "All",
      subjectId: "All"
    });
    if (setSelectedClassId) setSelectedClassId(defaultClassId);
  };

  // Filtered timetable entries based on active filters
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      // 1. Class filter
      if (activeFilters.classId) {
        const entryClassId = String(e.class?._id || e.class || "");
        if (entryClassId !== String(activeFilters.classId)) {
          return false;
        }
      }
      // 2. Teacher filter
      if (activeFilters.teacherId && activeFilters.teacherId !== "All") {
        const entryTeacherId = String(e.teacher?._id || e.teacher || "");
        if (entryTeacherId !== String(activeFilters.teacherId)) {
          return false;
        }
      }
      // 3. Subject filter
      if (activeFilters.subjectId && activeFilters.subjectId !== "All") {
        const entrySubjectId = String(e.subject?._id || e.subject || "");
        if (entrySubjectId !== String(activeFilters.subjectId)) {
          return false;
        }
      }
      return true;
    });
  }, [entries, activeFilters]);

  // Dynamic TIME_SLOTS: Only show time slots up to the scheduled classes
  const TIME_SLOTS = useMemo(() => {
    const rawSlots = buildTimeSlots(lunchBreakStartTime, lunchBreakDuration);

    if (showFullDay) {
      return rawSlots;
    }

    if (filteredEntries.length === 0) {
      // If no entries scheduled yet, show morning slots up to 11:00 AM
      return rawSlots.filter(s => parseMins(s.start) <= 660);
    }

    // Find the latest class end time among filtered entries
    const maxEndMins = Math.max(...filteredEntries.map(e => parseMins(e.endTime)));
    
    // Always include slots up to max end time (at least 11:00 AM)
    const cutoffMins = Math.max(maxEndMins, 660);

    return rawSlots.filter(s => {
      const slotStart = parseMins(s.start);
      return slotStart < cutoffMins;
    });
  }, [lunchBreakStartTime, lunchBreakDuration, filteredEntries, showFullDay]);

  // Check if a cell has an overlapping conflict (two or more entries at the same day/time range)
  const cellConflicts = useMemo(() => {
    const conflictMap = new Set();
    
    // Check conflicts among all active filtered entries
    for (let i = 0; i < filteredEntries.length; i++) {
      for (let j = i + 1; j < filteredEntries.length; j++) {
        const a = filteredEntries[i];
        const b = filteredEntries[j];
        
        if (a.day === b.day) {
          const startA = parseMins(a.startTime);
          const endA = parseMins(a.endTime);
          const startB = parseMins(b.startTime);
          const endB = parseMins(b.endTime);
          
          if (startA < endB && endA > startB) {
            conflictMap.add(a._id);
            conflictMap.add(b._id);
          }
        }
      }
    }
    return conflictMap;
  }, [filteredEntries]);

  // Find period matching day and time slot
  const getCellPeriod = (day, slot) => {
    const slotStartMins = parseMins(slot.start);
    const slotEndMins = parseMins(slot.end);

    return filteredEntries.find(e => {
      if (e.day !== day) return false;
      
      const entryStartMins = parseMins(e.startTime);

      // Period matches if its start time falls within this slot range [slotStartMins, slotEndMins)
      return entryStartMins >= slotStartMins && entryStartMins < slotEndMins;
    });
  };

  // Get Subject color class
  const getSubjectColor = (subjectName) => {
    return SUBJECT_COLORS[subjectName] || "bg-slate-900 border-slate-800 text-slate-200";
  };

  // Calculate stats summary dynamically
  const statsSummary = useMemo(() => {
    const uniqueSubjects = new Set();
    const uniqueTeachers = new Set();
    let periodsCount = 0;

    filteredEntries.forEach(e => {
      periodsCount++;
      if (e.subject?.name || e.subject) uniqueSubjects.add(e.subject?.name || String(e.subject));
      if (e.teacher?.name || e.teacher) uniqueTeachers.add(e.teacher?.name || String(e.teacher));
    });

    const breaksCount = showBreaks ? 12 : 0; // 2 breaks per day for 6 days = 12

    return {
      totalPeriods: periodsCount + breaksCount,
      teachingPeriods: periodsCount,
      breaks: showBreaks ? 6 : 0,
      lunch: showBreaks ? 6 : 0,
      subjects: uniqueSubjects.size,
      teachers: uniqueTeachers.size
    };
  }, [filteredEntries, showBreaks]);

  const selectedClass = classes.find(c => String(c._id) === String(activeFilters.classId));

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      
      {/* ── FILTER HEADER ── */}
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl select-none">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          
          {/* Class Filter */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Class</label>
            <select
              value={filterClass}
              onChange={(e) => {
                const val = e.target.value;
                setFilterClass(val);
                setActiveFilters(prev => ({ ...prev, classId: val }));
                if (setSelectedClassId) setSelectedClassId(val);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold cursor-pointer"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>Class {c.name} - Section {c.section}</option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Teacher</label>
            <select
              value={filterTeacher}
              onChange={(e) => {
                const val = e.target.value;
                setFilterTeacher(val);
                setActiveFilters(prev => ({ ...prev, teacherId: val }));
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Teachers</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Day View filter */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Day View</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold cursor-pointer"
            >
              <option>Weekly View</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => {
                const val = e.target.value;
                setFilterSubject(val);
                setActiveFilters(prev => ({ ...prev, subjectId: val }));
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Reset"
            >
              <FaSyncAlt className="text-xs" />
            </button>
          </div>

        </div>
      </div>

      {/* ── TIMETABLE BOARD GRID CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Grid Board (9 Cols) */}
        <div className="lg:col-span-9 bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">
                Weekly Timetable - {selectedClass ? `Class ${selectedClass.name} - Section ${selectedClass.section}` : "Timetable Grid"}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
              <label className="flex items-center gap-2 cursor-pointer" title="Toggle full day hours vs fit to scheduled periods">
                <span>Full Day Grid</span>
                <input
                  type="checkbox"
                  checked={showFullDay}
                  onChange={(e) => setShowFullDay(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-purple-600 focus:ring-purple-500/20"
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <span>Show Breaks</span>
                <input
                  type="checkbox"
                  checked={showBreaks}
                  onChange={(e) => setShowBreaks(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-purple-600 focus:ring-purple-500/20"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowBreakModal(true)}
                className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <FaClock className="text-[10px]" /> Break Settings
              </button>

              <button
                onClick={() => setActiveTab("basic")}
                className="flex items-center gap-1.5 text-purple-500 hover:underline cursor-pointer"
              >
                <FaPlus className="text-[10px]" /> Add Timetable
              </button>
            </div>
          </div>

          {/* Timetable Table Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/40 p-2">
            <table className="w-full text-center border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850">
                  <th className="text-[9px] font-black text-slate-500 uppercase tracking-widest py-2 w-28">Time / Day</th>
                  {DAYS_LIST.map(day => (
                    <th key={day} className="text-[9px] font-black text-slate-500 uppercase tracking-widest py-2 w-36">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, sIdx) => {
                  
                  // Hide breaks rows if unchecked
                  if (slot.isBreak && !showBreaks) return null;

                  // Render breaks spanned horizontally
                  if (slot.isBreak) {
                    let breakColor = "bg-slate-200/60 dark:bg-[#1E293B]/40 text-slate-700 dark:text-slate-400";
                    if (slot.type === "lunch") breakColor = "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-500";
                    return (
                      <tr key={sIdx} className="border-b border-slate-200 dark:border-slate-850/60 last:border-b-0">
                        <td className="text-[9px] font-bold text-slate-600 dark:text-slate-450 py-3 border-r border-slate-200 dark:border-slate-850">
                          {slot.label}
                        </td>
                        <td colSpan={6} className={`py-3 font-extrabold text-[10px] tracking-widest uppercase border-b border-slate-200 dark:border-slate-850/30 ${breakColor}`}>
                          🍴 &nbsp; {slot.name} &nbsp; 🍴
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={sIdx} className="border-b border-slate-200 dark:border-slate-850/60 last:border-b-0">
                      <td className="text-[9.5px] font-black text-purple-700 dark:text-purple-300/90 py-4 px-2 border-r border-slate-200 dark:border-slate-850/80 leading-snug whitespace-nowrap">
                        {slot.label}
                      </td>
                      {DAYS_LIST.map(day => {
                        const period = getCellPeriod(day, slot);
                        const hasConflict = period && cellConflicts.has(period._id);
                        
                        return (
                          <td key={day} className="py-2 px-1 border-r border-slate-200 dark:border-slate-850/30 last:border-r-0 relative group">
                            {period ? (
                              <div className={`border rounded-xl p-2.5 flex flex-col justify-between min-h-[96px] transition hover:scale-[1.01] hover:shadow-md ${
                                hasConflict 
                                  ? "bg-rose-950/50 border-rose-800 text-rose-200" 
                                  : getSubjectColor(period.subject?.name)
                              }`}>
                                <div className="flex items-start justify-between gap-1">
                                  <h5 className="text-[10px] font-black leading-tight truncate flex-1">{period.subject?.name || "Subject"}</h5>
                                  
                                  {/* Delete handler */}
                                  <button
                                    onClick={() => remove(period._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-[8px] text-rose-400 hover:text-rose-300 cursor-pointer shrink-0"
                                    title="Delete Period"
                                  >
                                    <FaTrashAlt />
                                  </button>
                                </div>
                                <span className="block text-[8.5px] font-bold text-slate-300/80 truncate mt-0.5">
                                  {period.teacher?.name || "Teacher"}
                                </span>
                                
                                {/* Timing badge - High visibility with clock icon */}
                                <div className="flex items-center gap-1 my-1 px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-[8.5px] font-extrabold text-cyan-300 tracking-tight whitespace-nowrap overflow-hidden select-none">
                                  <FaClock className="text-[7.5px] text-cyan-400 shrink-0" />
                                  <span className="truncate">{formatTime12h(period.startTime)} - {formatTime12h(period.endTime)}</span>
                                </div>
                                
                                {/* Room location & conflict indicator */}
                                <div className="flex items-center justify-between text-[8px] font-bold select-none mt-0.5">
                                  <span className="text-[8px] font-extrabold text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded border border-white/10 truncate max-w-[65px]">
                                    {period.room || "Room 101"}
                                  </span>
                                  {hasConflict && (
                                    <FaExclamationTriangle className="text-rose-400 animate-pulse text-[9.5px]" title="Conflict Alert!" />
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-800 text-[9px] font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Legend & Summary Column (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Legend Panel */}
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Legend</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 select-none">
              {LEGEND_COLORS.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timetable Summary Panel */}
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Timetable Summary</h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Total Periods / Week</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.totalPeriods}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Teaching Periods</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.teachingPeriods}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Breaks</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.breaks}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Lunch</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.lunch}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Subjects</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.subjects}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-bold">Teachers</span>
                <span className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded-lg text-slate-800 dark:text-white font-extrabold">
                  {statsSummary.teachers}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer hint */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-350 mt-4 flex items-center gap-2.5 select-none shadow-md">
        <FaInfoCircle className="text-purple-500 text-base" />
        <span>Note: Click on any period to edit or delete. Break duration and timings can be configured using Break Settings.</span>
      </div>

      {/* Break Settings Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowBreakModal(false)} />
          <div className="bg-white dark:bg-[#0D1326] rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative z-10 shadow-2xl text-left animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FaClock className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">Configure School Breaks</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Set break duration & start timings for timetable</p>
                </div>
              </div>
              <button onClick={() => setShowBreakModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-black text-sm cursor-pointer p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBreakSettings} className="space-y-4">
              
              {/* Lunch Break Settings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">🍱 Lunch Break</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Default: 60 Mins</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Start Time</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={lunchBreakStartTime}
                        onChange={(e) => setLunchBreakStartTime(e.target.value)}
                        className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold"
                        placeholder="12:30 PM"
                      />
                      <input
                        type="time"
                        id="lunch-time-picker"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [hStr, mStr] = e.target.value.split(":");
                            let h = parseInt(hStr, 10);
                            const ampm = h >= 12 ? "PM" : "AM";
                            const displayH = h % 12 || 12;
                            setLunchBreakStartTime(`${String(displayH).padStart(2, "0")}:${mStr} ${ampm}`);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const picker = document.getElementById("lunch-time-picker");
                          if (picker) {
                            if (typeof picker.showPicker === "function") {
                              picker.showPicker();
                            } else {
                              picker.focus();
                              picker.click();
                            }
                          }
                        }}
                        className="absolute right-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-xs p-1 cursor-pointer transition"
                        title="Click to select time"
                      >
                        <FaClock />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Lunch Duration</label>
                    <select
                      value={lunchBreakDuration}
                      onChange={(e) => setLunchBreakDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-bold cursor-pointer"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingBreaks}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingBreaks ? "Saving..." : "Save & Apply Breaks"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default TimetableManagementTab;
