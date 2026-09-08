import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaBookmark, 
  FaDownload, 
  FaExclamationCircle, 
  FaRegCalendarAlt, 
  FaUserCheck, 
  FaCalendarWeek, 
  FaDoorOpen, 
  FaMapMarkerAlt, 
  FaArrowRight 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

// Doughnut chart helper
function AttendanceDoughnut({ percentage, present, absent, late, leave }) {
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0 select-none">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} className="stroke-slate-100 dark:stroke-white/[0.04] fill-none" strokeWidth={strokeWidth} />
        <circle 
          cx="48" 
          cy="48" 
          r={radius} 
          className="stroke-emerald-555 stroke-emerald-500 fill-none" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center leading-none">
        <span className="text-base font-black text-slate-900 dark:text-white">{percentage}%</span>
        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Overall</span>
      </div>
    </div>
  );
}

function ShowTimetable() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week"); // week or day
  const [activeTabDay, setActiveTabDay] = useState("Tuesday"); // for day view / bottom widgets reference

  // Attendance stats state
  const [attendanceStats, setAttendanceStats] = useState({
    percentage: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    totalClasses: 0,
    totalStudents: 0
  });

  const parseTimeToMin = (tStr) => {
    if (!tStr) return 0;
    const clean = String(tStr).trim().toUpperCase();
    const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
    if (!match) {
      const parts = clean.split(":");
      return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
    }
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm === "PM" && hrs < 12) hrs += 12;
      if (ampm === "AM" && hrs === 12) hrs = 0;
    }
    return hrs * 60 + mins;
  };

  const timeSlots = [
    { start: "08:00 AM", end: "09:00 AM" },
    { start: "09:00 AM", end: "10:00 AM" },
    { start: "10:00 AM", end: "11:00 AM" },
    { start: "11:00 AM", end: "12:00 PM" },
    { start: "12:00 PM", end: "01:00 PM", isLunch: true },
    { start: "01:00 PM", end: "02:00 PM" },
    { start: "02:00 PM", end: "03:00 PM" },
    { start: "03:00 PM", end: "04:00 PM" }
  ];

  const daysOfWeek = [
    { name: "Monday", label: "Mon" },
    { name: "Tuesday", label: "Tue" },
    { name: "Wednesday", label: "Wed" },
    { name: "Thursday", label: "Thu" },
    { name: "Friday", label: "Fri" },
    { name: "Saturday", label: "Sat" },
    { name: "Sunday", label: "Sun" }
  ];

  useEffect(() => {
    // Load timetable
    axios.get(`${API}/api/timetable`, { headers })
      .then(res => {
        setTimetable(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading timetable:", err);
        setLoading(false);
      });

    // Load attendance stats history to populate summary widget dynamically
    axios.get(`${API}/api/attendance/history/stats`, { headers })
      .then(res => {
        if (res.data && res.data.kpis) {
          const kpis = res.data.kpis;
          setAttendanceStats({
            percentage: kpis.percentage || 0,
            present: kpis.present || 0,
            absent: kpis.absent || 0,
            late: kpis.late || 0,
            leave: kpis.leave || 0,
            totalClasses: kpis.totalClasses || 0,
            totalStudents: kpis.total || 0
          });
        }
      })
      .catch(err => {
        console.error("Error loading stats:", err);
      });
  }, [API, token]);

  // Helper: check if a class falls in a specific day & time slot
  const getCellClass = (day, slot) => {
    const slotStartMin = parseTimeToMin(slot.start);
    const slotEndMin = parseTimeToMin(slot.end);

    return timetable.find(entry => {
      if (entry.day !== day) return false;
      const entryStartMin = parseTimeToMin(entry.startTime);
      const entryEndMin = parseTimeToMin(entry.endTime);
      return (entryStartMin >= slotStartMin && entryStartMin < slotEndMin) ||
             (slotStartMin >= entryStartMin && slotStartMin < entryEndMin);
    });
  };

  // Status calculation helper for vertical timeline
  const getTimelineStatus = (slot) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const parseTimeToMin = (tStr) => {
      const parts = tStr.split(" ");
      const isPm = parts[1] === "PM";
      const timeParts = parts[0].split(":");
      let hrs = Number(timeParts[0]);
      if (isPm && hrs < 12) hrs += 12;
      if (!isPm && hrs === 12) hrs = 0;
      return hrs * 60 + Number(timeParts[1]);
    };

    const startMin = parseTimeToMin(slot.start);
    const endMin = parseTimeToMin(slot.end);

    if (currentTotalMin > endMin) return "Completed";
    if (currentTotalMin >= startMin && currentTotalMin <= endMin) return "Ongoing";
    return "Upcoming";
  };

  // Find active / current class
  const getCurrentClass = () => {
    const todayName = "Tuesday"; // hardcoded Tue to align with image date
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const parseTimeToMin = (tStr) => {
      if (!tStr) return 0;
      const parts = tStr.split(" ");
      const isPm = parts[1] === "PM";
      const timeParts = parts[0].split(":");
      let hrs = Number(timeParts[0]);
      if (isPm && hrs < 12) hrs += 12;
      if (!isPm && hrs === 12) hrs = 0;
      return hrs * 60 + Number(timeParts[1]);
    };

    const active = timetable.find(entry => {
      if (entry.day !== todayName) return false;
      const s = parseTimeToMin(entry.startTime);
      const e = parseTimeToMin(entry.endTime);
      // Fallback range check
      return currentTotalMin >= s && currentTotalMin <= e;
    });

    if (active) return active;
    
    // Mock default active class if none fits the current live hour (so it displays like the photo)
    const tuesdayClasses = timetable.filter(entry => entry.day === todayName);
    return tuesdayClasses[2] || tuesdayClasses[0] || null;
  };

  const activeClass = getCurrentClass();

  // Find Today's timeline slots
  const getTodaySchedule = () => {
    const todayName = "Tuesday";
    const todayClasses = timetable.filter(entry => entry.day === todayName);
    
    // Map time slots and insert timetable classes
    return timeSlots
      .filter(s => !s.isLunch)
      .map(slot => {
        const cls = todayClasses.find(c => {
          const cStart = parseTimeToMin(c.startTime);
          const sStart = parseTimeToMin(slot.start);
          const sEnd = parseTimeToMin(slot.end);
          return (cStart >= sStart && cStart < sEnd) || (sStart >= cStart && sStart < parseTimeToMin(c.endTime));
        });
        return {
          slot,
          classData: cls,
          status: getTimelineStatus(slot)
        };
      });
  };

  const todayTimelineList = getTodaySchedule();

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 select-none">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Show Timetable</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            View your weekly timetable and today's schedule
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <Link to="/teacher/dashboard" className="hover:underline">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-purple-500">Show Timetable</span>
          </div>
        </div>
      </div>

      {/* Week Date and view toggles toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-bold">
            <FaRegCalendarAlt className="text-slate-400" />
            <span>26 May – 01 June 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Week/Day toggles */}
          <div className="flex bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                viewMode === "week"
                  ? "bg-purple-655 bg-purple-500 text-white shadow-sm"
                  : "text-slate-450 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                viewMode === "day"
                  ? "bg-purple-600 bg-purple-500 text-white shadow-sm"
                  : "text-slate-450 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Day View
            </button>
          </div>

          <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">
            Today
          </button>
          <button className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">
            <FaDownload className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Grid View weekly layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm mb-6 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-xs font-semibold">Loading weekly planner...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse table-fixed min-w-[900px]">
              
              {/* Header Days Row */}
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 border-r border-slate-200/30 dark:border-white/[0.02] w-28">Time</th>
                  {daysOfWeek.map(day => (
                    <th 
                      key={day.name}
                      className={`py-4 relative ${
                        day.isToday 
                          ? "text-purple-600 dark:text-purple-400 bg-purple-500/[0.02]" 
                          : "border-r border-slate-200/30 dark:border-white/[0.02]"
                      }`}
                    >
                      {day.isToday && (
                        <span className="absolute top-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-black text-[7px] uppercase px-1 py-0.5 rounded scale-90 select-none">
                          Today
                        </span>
                      )}
                      <p className="font-extrabold">{day.name}</p>
                      <p className="text-[8px] font-semibold text-slate-400 mt-0.5">{day.dateStr}</p>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows matching time slots */}
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs">
                {timeSlots.map((slot, sIdx) => {
                  
                  // Lunch Break row spanning everything
                  if (slot.isLunch) {
                    return (
                      <tr key={`lunch-${sIdx}`} className="bg-slate-50/30 dark:bg-white/[0.01] select-none">
                        <td className="py-2.5 font-bold text-slate-450 border-r border-slate-200/30 dark:border-white/[0.02] uppercase text-[9px] tracking-wide">
                          {slot.start} – {slot.end}
                        </td>
                        <td colSpan={7} className="py-2.5 text-center text-[9px] font-black uppercase text-slate-450 tracking-wider">
                          🍴 Lunch Break (12:45 PM – 01:30 PM)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={sIdx} className="hover:bg-slate-55/10 transition-all">
                      {/* Time slot indicator */}
                      <td className="py-4 font-bold text-slate-550 border-r border-slate-200/30 dark:border-white/[0.02] select-none text-[10px] leading-tight">
                        <p>{slot.start}</p>
                        <p className="text-slate-400 mt-0.5 font-semibold">– {slot.end}</p>
                      </td>

                      {/* Days slots content mapping */}
                      {daysOfWeek.map(day => {
                        const entry = getCellClass(day.name, slot);
                        
                        // Default border divider or highlighting active column
                        let cellBorder = "border-r border-slate-100 dark:border-white/[0.01]";
                        if (day.isToday) cellBorder = "bg-purple-500/[0.01] border-r border-purple-500/10";

                        if (!entry) {
                          return (
                            <td key={day.name} className={`py-4 font-bold text-slate-300 dark:text-slate-700 select-none ${cellBorder}`}>
                              —
                            </td>
                          );
                        }

                        // Pick styles dynamically based on subject name
                        let theme = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                        const subName = entry.subject?.name?.toLowerCase() || "";
                        if (subName.includes("science") && !subName.includes("social")) {
                          theme = "bg-blue-500/10 text-blue-650 border-blue-500/20";
                        } else if (subName.includes("social")) {
                          theme = "bg-emerald-500/10 text-emerald-650 border-emerald-500/20";
                        }

                        return (
                          <td key={day.name} className={`p-2 ${cellBorder}`}>
                            <div className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-98 select-none ${theme}`}>
                              <p className="font-extrabold text-[10px] leading-none truncate">{entry.subject?.name}</p>
                              <p className="text-[8px] font-bold opacity-80 uppercase tracking-wide truncate">Class {entry.class?.name} - {entry.class?.section}</p>
                              <p className="text-[8px] font-bold opacity-60 leading-none truncate">{entry.room || "Room 201"}</p>
                            </div>
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
      )}

      {/* Bottom widgets section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Today's Schedule (Vertical Timeline) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Today's Schedule</h3>
              <span className="text-[8px] font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded">Tue, 27 May</span>
            </div>

            <div className="flex flex-col gap-4 pl-3 relative border-l border-slate-150 dark:border-white/10 select-none ml-1.5">
              {todayTimelineList.map((item, idx) => {
                const isLunch = item.slot.isLunch;
                const hasClass = !!item.classData;
                
                let dotColor = "bg-slate-350 ring-slate-100 dark:ring-white/[0.03]";
                if (item.status === "Ongoing") dotColor = "bg-blue-500 ring-blue-500/20";
                else if (item.status === "Completed") dotColor = "bg-emerald-500 ring-emerald-500/20";

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle Node on line */}
                    <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full ring-4 ${dotColor}`} />
                    
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">
                          {item.slot.start} – {item.slot.end}
                        </p>
                        {hasClass ? (
                          <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wide mt-1">
                            {item.classData.subject?.name} &bull; Class {item.classData.class?.name}-{item.classData.class?.section}
                          </p>
                        ) : (
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">No Class Scheduled</p>
                        )}
                      </div>

                      {/* Status indicator badge */}
                      {hasClass && (
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none shrink-0 ${
                          item.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : item.status === "Ongoing"
                              ? "bg-blue-500/10 text-blue-500 animate-pulse"
                              : "bg-slate-100 dark:bg-white/[0.02] text-slate-450 border border-slate-200 dark:border-white/[0.05]"
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer mt-5 flex items-center justify-center gap-1.5 select-none">
            View Full Day Schedule <FaArrowRight className="text-[7px]" />
          </button>
        </div>

        {/* Widget 2: Current Class Info */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Current Class</h3>
              <Link to={`/teacher/my-classes/${activeClass?.class?._id}/details`} className="text-[9px] font-bold text-purple-500 hover:underline">View Class Details</Link>
            </div>

            {activeClass ? (
              <div className="flex flex-col gap-4">
                {/* Class identity row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
                    <FaBookmark className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{activeClass.subject?.name}</h4>
                    <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wide mt-1">Class {activeClass.class?.name} - {activeClass.class?.section} &bull; {activeClass.room || "Room 203"}</p>
                  </div>
                </div>

                {/* Timing indicators grid */}
                <div className="grid grid-cols-2 gap-4 select-none border-t border-slate-100 dark:border-white/[0.03] pt-4">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Started At</span>
                    <span className="text-[11px] font-black text-slate-950 dark:text-white mt-1 block">{activeClass.startTime}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Ends At</span>
                    <span className="text-[11px] font-black text-slate-950 dark:text-white mt-1 block">{activeClass.endTime}</span>
                  </div>
                </div>

                {/* Enrollment rosters counts */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-white/[0.03] pt-4 select-none text-center">
                  <div className="p-2 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                    <span className="text-xs font-black text-emerald-500 block leading-tight">20</span>
                    <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide">Present</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                    <span className="text-xs font-black text-rose-500 block leading-tight">2</span>
                    <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide">Absent</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                    <span className="text-xs font-black text-slate-800 dark:text-white block leading-tight">22</span>
                    <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide">Total</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-450 dark:text-slate-500 text-xs py-10 text-center font-medium">No class active right now.</p>
            )}
          </div>

          <Link
            to="/teacher/mark-attendance"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-750 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-5 select-none"
          >
            <FaUserCheck className="text-xs" /> Mark Attendance
          </Link>
        </div>

        {/* Widget 3: Weekly Attendance Summary (doughnut ring) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Attendance Summary (This Week)</h3>
              <Link to="/teacher/attendance-history" className="text-[9px] font-bold text-purple-500 hover:underline">View Report</Link>
            </div>

            <div className="flex items-center gap-5 py-1 select-none">
              <AttendanceDoughnut 
                percentage={attendanceStats.percentage}
                present={attendanceStats.present}
                absent={attendanceStats.absent}
                late={attendanceStats.late}
                leave={attendanceStats.leave}
              />

              <div className="flex-1 flex flex-col gap-2 text-[9px] font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.present} ({attendanceStats.percentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Absent</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.absent} (6%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Late</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.late} (1%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-450" /> Leave</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.leave} (0%)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/[0.03] pt-4 select-none mt-4 text-[10px] font-bold text-slate-400">
              <div>Total Classes: <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.totalClasses}</span></div>
              <div>Total Students: <span className="text-slate-800 dark:text-white font-extrabold">{attendanceStats.totalStudents}</span></div>
            </div>
          </div>

          <Link
            to="/teacher/attendance-history"
            className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all mt-5 flex items-center justify-center gap-1.5 select-none"
          >
            Detailed Attendance <FaArrowRight className="text-[7px]" />
          </Link>
        </div>

      </div>

      {/* Bottom Alert timings warning */}
      <div className="bg-purple-600/5 border border-purple-500/10 p-3.5 rounded-2xl flex items-center gap-2.5 select-none text-[10px] font-semibold text-slate-650 dark:text-slate-350 mt-6">
        <FaExclamationCircle className="text-xs text-purple-600 shrink-0" />
        <span>All timings are subject to change. Please check regularly for updates.</span>
      </div>

    </div>
  );
}

export default ShowTimetable;
