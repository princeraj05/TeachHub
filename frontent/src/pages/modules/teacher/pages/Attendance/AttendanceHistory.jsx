import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaClipboardList, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaChartPie, 
  FaFilter, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight, 
  FaDownload, 
  FaRegCalendarAlt, 
  FaGraduationCap, 
  FaTrophy, 
  FaChartLine, 
  FaEye, 
  FaEllipsisV 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

// Mini SVG Sparkline Component
function Sparkline({ data }) {
  if (!data || data.length === 0) return null;
  const width = 60;
  const height = 18;
  const padding = 2;
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = padding + (1 - val) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Multi-segment SVG Doughnut Chart
function DoughnutChart({ present, absent, late, leave }) {
  const total = present + absent + late + leave || 1;
  const presentPct = Math.round((present / total) * 100);
  const absentPct = Math.round((absent / total) * 100);
  const latePct = Math.round((late / total) * 100);
  const leavePct = Math.round((leave / total) * 100);

  const radius = 35;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;

  const presentDash = (present / total) * circumference;
  const absentDash = (absent / total) * circumference;
  const lateDash = (late / total) * circumference;
  const leaveDash = (leave / total) * circumference;

  return (
    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center select-none">
      <svg className="w-full h-full transform -rotate-90">
        {/* Present segment (green) */}
        {presentDash > 0 && (
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${presentDash} ${circumference}`}
            strokeDashoffset="0"
          />
        )}
        {/* Absent segment (red) */}
        {absentDash > 0 && (
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${absentDash} ${circumference}`}
            strokeDashoffset={-presentDash}
          />
        )}
        {/* Late segment (yellow) */}
        {lateDash > 0 && (
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${lateDash} ${circumference}`}
            strokeDashoffset={-(presentDash + absentDash)}
          />
        )}
        {/* Leave segment (indigo) */}
        {leaveDash > 0 && (
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#6366f1"
            strokeWidth={strokeWidth}
            strokeDasharray={`${leaveDash} ${circumference}`}
            strokeDashoffset={-(presentDash + absentDash + lateDash)}
          />
        )}
      </svg>
      <div className="absolute text-center leading-none">
        <span className="text-base font-black text-slate-900 dark:text-white">{presentPct}%</span>
        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Average</span>
      </div>
    </div>
  );
}

function AttendanceHistory() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Selection states
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [viewMode, setViewMode] = useState("Monthly"); // Daily, Monthly, Custom

  // Data states
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    avgAttendance: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    totalClasses: 0,
    bestStudent: { name: "—", attendancePct: 0 },
    worstStudent: { name: "—", attendancePct: 0 }
  });
  const [calendarData, setCalendarData] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  
  // Roster listing search & sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("desc"); // desc (High to Low), asc (Low to High)

  // Fetch initial classes list
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesRes = await axios.get(`${API}/api/teacher/my-classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0]._id);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [API, token]);

  // Fetch metrics data on filter change
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/attendance/history-stats?classId=${selectedClassId}&studentId=${selectedStudentId}&month=${selectedMonth}&view=${viewMode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSummary(res.data.summary || {});
        setCalendarData(res.data.calendar || []);
        setStudentsList(res.data.students || []);
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, [selectedClassId, selectedStudentId, selectedMonth, viewMode, API, token]);

  // Handle Export Report CSV
  const handleExportCSV = () => {
    if (studentsList.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll No,Student,Present,Absent,Late,Leave,Attendance Pct\n";
    
    studentsList.forEach(s => {
      csvContent += `${s.rollNo},"${s.name}",${s.present},${s.absent},${s.late},${s.leave},${s.attendancePct}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_History_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build calendar month grid
  const renderCalendar = () => {
    if (!selectedMonth) return null;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const firstDayRaw = new Date(year, month - 1, 1).getDay();
    const firstDayIndex = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // 0 = Mon, 6 = Sun
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells = [];
    // Leading dummies
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isDummy: true });
    }
    // Calendar days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayRecord = calendarData.find(c => c.date === dayDateStr);
      cells.push({
        isDummy: false,
        day: d,
        date: dayDateStr,
        status: dayRecord ? dayRecord.status : "No Class"
      });
    }

    return (
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {/* Days Header */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1 select-none">
            {day}
          </div>
        ))}

        {/* Days grid cells */}
        {cells.map((cell, idx) => {
          if (cell.isDummy) {
            return <div key={`dummy-${idx}`} className="h-10 opacity-0 select-none" />;
          }

          let dotColor = "bg-transparent";
          if (cell.status === "Present") dotColor = "bg-emerald-500";
          else if (cell.status === "Absent") dotColor = "bg-rose-500";
          else if (cell.status === "Late") dotColor = "bg-amber-500";
          else if (cell.status === "Leave" || cell.status === "On Leave") dotColor = "bg-indigo-500";

          return (
            <div 
              key={`day-${cell.day}`} 
              className={`h-10 border border-slate-100 dark:border-white/[0.03] rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all`}
            >
              <span className="font-extrabold text-[10px] text-slate-700 dark:text-slate-200">{cell.day}</span>
              {cell.status !== "No Class" && (
                <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${dotColor}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Student list search & sorting calculation
  const filteredStudents = studentsList
    .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "desc") {
        return b.attendancePct - a.attendancePct;
      }
      return a.attendancePct - b.attendancePct;
    });

  // Calculate status label
  const getStatusLabel = (pct) => {
    if (pct >= 90) return { label: "Excellent", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    if (pct >= 80) return { label: "Very Good", bg: "bg-teal-500/10 text-teal-500 border-teal-500/20" };
    if (pct >= 75) return { label: "Good", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    return { label: "Average", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  };

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Attendance History</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            View and analyze daily, monthly and student-wise attendance records.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-purple-500">Attendance History</span>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={studentsList.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/10 transition-all w-fit cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload />
          Export Report
        </button>
      </div>

      {/* Select Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
        
        {/* Class dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>

        {/* Student dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All">All Students</option>
            {studentsList.map(s => (
              <option key={s.studentId} value={s.studentId}>{s.name} ({s.rollNo})</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">View Mode</label>
          <div className="flex bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1 w-fit">
            {["Daily", "Monthly", "Custom"].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                  viewMode === mode
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-450 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Month</label>
          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <FaRegCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Summary metrics row */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          
          {/* Total Present */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Present</p>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{summary.present || 0}</span>
            <p className="text-[8px] text-slate-450 mt-2 font-semibold">{Math.round((summary.present / ((summary.present + summary.absent + summary.late + summary.leave) || 1)) * 100)}% of total classes</p>
          </div>

          {/* Total Absent */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Absent</p>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block text-rose-500">{summary.absent || 0}</span>
            <p className="text-[8px] text-slate-450 mt-2 font-semibold">{Math.round((summary.absent / ((summary.present + summary.absent + summary.late + summary.leave) || 1)) * 100)}% of classes</p>
          </div>

          {/* Total Late */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Late</p>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block text-amber-500">{summary.late || 0}</span>
            <p className="text-[8px] text-slate-450 mt-2 font-semibold">{Math.round((summary.late / ((summary.present + summary.absent + summary.late + summary.leave) || 1)) * 100)}% of classes</p>
          </div>

          {/* Total Classes */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Classes</p>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block text-purple-500">{summary.totalClasses || 0}</span>
            <p className="text-[8px] text-slate-450 mt-2 font-semibold">Active This Month</p>
          </div>

        </div>
      )}

      {/* Calendar and Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left 2 cols: Attendance Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/[0.03]">
            <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">
              Attendance Calendar - {selectedMonth}
            </h2>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-[10px] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                <FaChevronLeft className="text-[8px]" />
              </button>
              <span className="text-[10px] font-bold">Today</span>
              <button className="p-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-[10px] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
                <FaChevronRight className="text-[8px]" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            renderCalendar()
          )}

          {/* Calendar Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.03] text-[9px] font-bold text-slate-450 uppercase tracking-wide select-none">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Late</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-transparent border border-slate-300 dark:border-white/[0.08]" />
              <span>No Class</span>
            </div>
          </div>

        </div>

        {/* Right 1 col: Overview statistics */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100 dark:border-white/[0.03] mb-4">
            <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">
              Attendance Overview - {selectedMonth}
            </h2>
          </div>

          {/* Doughnut Chart representation */}
          <div className="flex items-center justify-center py-2">
            <DoughnutChart 
              present={summary.present || 0}
              absent={summary.absent || 0}
              late={summary.late || 0}
              leave={summary.leave || 0}
            />
          </div>

          {/* Best / Lowest Student performance card */}
          <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.03]">
            {/* Best Attendance */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2">
                <FaTrophy className="text-emerald-500 text-sm" />
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">Best Attendance</p>
                  <p className="text-[10px] font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">{summary.bestStudent?.name || "—"}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-500">{summary.bestStudent?.attendancePct || 0}%</span>
            </div>

            {/* Lowest Attendance */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <div className="flex items-center gap-2">
                <FaChartLine className="text-rose-500 text-sm" />
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-wider leading-none">Lowest Attendance</p>
                  <p className="text-[10px] font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">{summary.worstStudent?.name || "—"}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-rose-500">{summary.worstStudent?.attendancePct || 0}%</span>
            </div>
          </div>

        </div>

      </div>

      {/* Student-wise Attendance Listing */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Table Header controls bar */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Student-wise Attendance</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-xs pointer-events-none" />
            </div>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="desc">Attendance % (High to Low)</option>
              <option value="asc">Attendance % (Low to High)</option>
            </select>

            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
              <FaFilter className="text-[10px]" /> Filters
            </button>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-400 text-lg shadow-inner">
              <FaUserGraduate />
            </div>
            <p className="text-slate-800 dark:text-white font-bold text-xs mt-3">No Students Match Your Criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                  <th className="px-6 py-4 text-center">Late</th>
                  <th className="px-6 py-4 text-center">Leave</th>
                  <th className="px-6 py-4 text-center">Attendance %</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Trend</th>
                  <th className="px-6 py-4 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {filteredStudents.map((s, idx) => {
                  const initials = s.name
                    ? s.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                    : "S";
                  const statusObj = getStatusLabel(s.attendancePct);

                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      
                      {/* Name Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 font-black flex items-center justify-center border border-purple-500/15 shrink-0 select-none">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-200">{s.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Roll No. {s.rollNo}</p>
                          </div>
                        </div>
                      </td>

                      {/* Present count */}
                      <td className="px-6 py-4 text-center font-bold text-emerald-500">{s.present}</td>

                      {/* Absent count */}
                      <td className="px-6 py-4 text-center font-bold text-rose-500">{s.absent}</td>

                      {/* Late count */}
                      <td className="px-6 py-4 text-center font-bold text-amber-500">{s.late}</td>

                      {/* Leave count */}
                      <td className="px-6 py-4 text-center font-bold text-indigo-500">{s.leave}</td>

                      {/* Attendance % */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-slate-900 dark:text-white">{s.attendancePct}%</span>
                      </td>

                      {/* Status Pills */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${statusObj.bg}`}>
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Sparkline Trend */}
                      <td className="px-6 py-4 text-center">
                        <Sparkline data={s.trend} />
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <button className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
                            <FaEye className="text-xs" />
                          </button>
                          <button className="p-2 text-slate-450 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                            <FaEllipsisV className="text-[10px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Page summaries */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/20 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
          <span>Showing 1 to {filteredStudents.length} of {studentsList.length} students</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
              Prev
            </button>
            <span className="px-2.5 py-1 rounded bg-purple-600 text-white font-extrabold shadow-sm">1</span>
            <button className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default AttendanceHistory;
