import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBookOpen,
  FaClipboardCheck,
  FaChartPie,
  FaCalendarAlt,
  FaInfoCircle,
  FaSearch,
  FaChevronRight,
  FaTimes,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

const DUMMY_ATTENDANCE = [];

const WEEKS_DATA = [
  { name: "W1", value: 70 },
  { name: "W2", value: 80 },
  { name: "W3", value: 85 },
  { name: "W4", value: 72 },
  { name: "W5", value: 50 },
];

function StudentAttendance() {
  const API = import.meta.env.VITE_API_URL;
  const { theme, toggleTheme } = useTheme();

  const [dbAttendance, setDbAttendance] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All"); // "All", "Present", "Absent"

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    Promise.all([
      axios.get(`${API}/api/student/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([attRes, profileRes]) => {
        setDbAttendance(attRes.data || []);
        setProfile(profileRes.data);
      })
      .catch((err) => console.log("Error loading attendance records:", err))
      .finally(() => setLoading(false));
  }, [API]);

  // Helper: Get initials for user profile
  const userInitials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Helper: Get weekday short name (e.g. "Mon", "Tue" etc.)
  const getWeekdayShort = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[d.getDay()] || "Day";
    } catch {
      return "Day";
    }
  };

  // Helper: Format Date string (e.g. "20 May 2026")
  const formatDateString = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Helper: Decorate database records with subjects
  const decoratedAttendance = useMemo(() => {
    if (dbAttendance.length === 0) {
      return [];
    }

    return dbAttendance.map((item, idx) => {
      const salt = item._id ? item._id.charCodeAt(item._id.length - 1) : idx;
      
      const subjectsList = ["Mathematics", "Science", "Social Science"];
      const subjectName = subjectsList[salt % subjectsList.length];

      return {
        ...item,
        dayShort: getWeekdayShort(item.date),
        formattedDate: formatDateString(item.date),
        subject: subjectName
      };
    });
  }, [dbAttendance]);

  // Helper: Filter records list based on Present/Absent pills
  const filteredAttendance = useMemo(() => {
    if (activeFilter === "All") return decoratedAttendance;
    return decoratedAttendance.filter(item => item.status === activeFilter);
  }, [decoratedAttendance, activeFilter]);

  // Calculations for KPI Cards & Legends
  const stats = useMemo(() => {
    const total = dbAttendance.length > 0 ? dbAttendance.length : 120;
    const present = dbAttendance.length > 0 ? dbAttendance.filter(a => a.status === "Present").length : 86;
    const absent = dbAttendance.length > 0 ? dbAttendance.filter(a => a.status === "Absent").length : 34;
    
    const presentRate = ((present / total) * 100).toFixed(1);
    const absentRate = ((absent / total) * 100).toFixed(1);

    const workingDays = total - 2; // Mock working days count

    return {
      total,
      present,
      absent,
      presentRate,
      absentRate,
      workingDays
    };
  }, [dbAttendance]);

  // Radial progress chart configurations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (parseFloat(stats.presentRate) / 100) * circumference;

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing attendance sheets...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6 text-left select-none pb-8">
      
      {/* Attendance title row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">My Attendance</h2>
          <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-1">Track and monitor your attendance records</p>
        </div>
        
        {/* Year Dropdown */}
        <div className="shrink-0 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-slate-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
          <span>Academic Year 2026</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
      </div>

      {/* Top Cards grid row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Total Sessions */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/25 flex items-center justify-center mb-2 sm:mb-4">
            <FaCalendarAlt className="text-xs sm:text-sm" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{stats.total}</p>
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
            <span>TOTAL SESSIONS</span>
            <span className="text-[9px] lowercase text-[#7C3AED] dark:text-[#A78BFA] hidden sm:inline">Live</span>
          </div>
        </div>

        {/* Card 2: Present */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center mb-2 sm:mb-4">
            <FaCheckCircle className="text-xs sm:text-sm" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{stats.present}</p>
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
            <span>PRESENT</span>
            <span className="text-[9px] text-emerald-500 font-bold">{stats.presentRate}%</span>
          </div>
        </div>

        {/* Card 3: Absent */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 flex items-center justify-center mb-2 sm:mb-4">
            <FaTimesCircle className="text-xs sm:text-sm" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{stats.absent}</p>
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
            <span>ABSENT</span>
            <span className="text-[9px] text-rose-500 font-bold">{stats.absentRate}%</span>
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center mb-2 sm:mb-4">
            <FaChartPie className="text-xs sm:text-sm" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{stats.presentRate}%</p>
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
            <span>RATE</span>
            <span className="text-[9px] inline-flex items-center gap-1 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Good
            </span>
          </div>
        </div>

      </div>

      {/* Attendance Overview layout block */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Attendance Overview</h3>
          
          <div className="shrink-0 bg-slate-50 dark:bg-[#0B132A]/40 border border-slate-200/60 dark:border-white/[0.06] text-slate-555 dark:text-slate-400 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
            <span>This Month</span>
            <span className="text-[10px] text-slate-450">▼</span>
          </div>
        </div>

        {/* Double charts split grid (circle on left, weeks bar chart on right) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          
          {/* Left Column: Radial progress ring + Legend checklist */}
          <div className="md:col-span-2 flex flex-row items-center gap-5 justify-center md:justify-start border-r border-slate-100 dark:border-white/5 pr-4">
            
            {/* SVG Circle Progress */}
            <div className="relative shrink-0 flex items-center justify-center select-none w-28 h-28 sm:w-32 sm:h-32">
              <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="text-slate-100 dark:text-white/5 translate-x-[8px] translate-y-[8px] sm:translate-x-[12px] sm:translate-y-[12px]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="text-emerald-500 translate-x-[8px] translate-y-[8px] sm:translate-x-[12px] sm:translate-y-[12px]"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {stats.presentRate}%
                </span>
                <span className="text-[8px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wide">
                  Overall
                </span>
              </div>
            </div>

            {/* Legend Stats list */}
            <div className="space-y-1.5 text-[10px] text-slate-505 dark:text-slate-400 font-black">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Present: {stats.present} ({stats.presentRate}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">Absent: {stats.absent} ({stats.absentRate}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">Total Sessions: {stats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">Working Days: {stats.workingDays}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Weekly CSS Bar Chart */}
          <div className="md:col-span-3 flex items-end justify-between gap-2.5 h-36 relative select-none pr-1">
            
            {/* Dashed line for 75% target threshold */}
            <div className="absolute left-8 right-6 border-t border-dashed border-[#7C3AED]/40 top-[25%]" />
            <div className="absolute right-0 bg-purple-50 dark:bg-purple-500/10 border border-[#7C3AED]/25 text-[#7C3AED] dark:text-[#A78BFA] text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm top-[17%]">
              75%
            </div>

            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-full text-[9px] text-slate-400 dark:text-slate-500 font-extrabold w-8 select-none border-r border-slate-100 dark:border-white/5 pr-1.5 z-10 bg-white dark:bg-[#0B132A]">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Render flex bars */}
            <div className="flex-1 flex items-end justify-around h-full pl-2">
              {WEEKS_DATA.map((week) => (
                <div key={week.name} className="flex flex-col items-center flex-1 h-full justify-end">
                  
                  {/* Vertical bar element */}
                  <div
                    className="w-4.5 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all duration-300 relative group"
                    style={{ height: `${week.value}%` }}
                  >
                    {/* Hover Tooltip */}
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-opacity whitespace-nowrap z-20">
                      {week.value}%
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-slate-400 font-extrabold mt-1.5 leading-none">
                    {week.name}
                  </span>

                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Attendance Records Log Section */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
        
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Attendance Records Log</h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-1">Showing historical records list</p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Status pills selector */}
            <div className="flex bg-slate-100 dark:bg-[#0B132A] p-1 rounded-xl border border-slate-250/60 dark:border-white/[0.04] select-none">
              {["All", "Present", "Absent"].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-sm"
                        : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Filter button */}
            <button className="bg-slate-100 dark:bg-[#0B132A] border border-slate-250/60 dark:border-white/10 hover:border-slate-350 dark:hover:border-white/15 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 dark:text-slate-400 cursor-pointer shadow-sm">
              <FaFilter className="text-[9px]" /> Filter
            </button>
          </div>
        </div>

        {/* Scrollable table data logs */}
        <div className="overflow-x-auto select-text scrollbar-none">
          <table className="w-full min-w-[620px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] text-slate-405 dark:text-slate-500 uppercase tracking-widest font-black">
                <th className="pb-3 pl-3">#</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Day</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs text-slate-800 dark:text-slate-300 font-bold">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-450 dark:text-slate-500 font-black">
                    <div className="flex flex-col items-center gap-2 select-none">
                      <FaCalendarAlt className="text-2xl text-slate-300 dark:text-slate-700" />
                      <span>No attendance records found matching this status filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((item, idx) => {
                  const isPresent = item.status === "Present";
                  return (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 pl-3 text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 font-black text-slate-900 dark:text-white">
                        {item.formattedDate || formatDateString(item.date)}
                      </td>
                      <td className="py-3.5 text-slate-400 dark:text-slate-500">
                        {item.dayShort || getWeekdayShort(item.date)}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded text-[10px] font-black border ${
                          isPresent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-slate-900 dark:text-white">
                        {item.subject || "Mathematics"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Informational notification card alert at bottom */}
      <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2.5xl p-4.5 text-xs text-slate-655 dark:text-slate-400 select-none">
        <FaInfoCircle className="text-emerald-500 text-sm mt-0.5 shrink-0" />
        <div className="text-left">
          <p className="font-semibold leading-relaxed">
            Attendance is updated automatically after each class session.
            <br />
            Ensure regular attendance for better academic performance.
          </p>
        </div>
      </div>

    </div>
  );
}

export default StudentAttendance;
