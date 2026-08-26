import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaCalendarAlt,
  FaRupeeSign,
  FaUserPlus,
  FaCalendarPlus,
  FaClipboardList,
  FaFileSignature,
  FaFileAlt,
  FaUserCheck,
  FaComments,
  FaBullhorn,
  FaFlag,
  FaUsers,
  FaScroll,
  FaChevronDown,
  FaClock,
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminDashboard() {
  const API = import.meta.env.VITE_API_URL;

  // Local state for live time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dashboard state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [API]);

  // Format current date: "Monday, 26 May 2026"
  const formatLocalDate = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Format current time: "11:30 AM"
  const formatLocalTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Safe defaults if data is missing
  const stats = data?.stats || {
    students: { total: 0, growth: "No change" },
    teachers: { total: 0, growth: "No change" },
    classes: { total: 0, growth: "No change" },
    subjects: { total: 0, growth: "No change" },
    events: { total: 0, growth: "No change" },
    payments: { total: 0, growth: "From 0 users" },
  };

  const joinRequestsCount = data?.joinRequestsCount ?? 0;
  const announcements = data?.announcements || [];
  const upcomingEvents = data?.upcomingEvents || [];

  // Attendance data formatting
  const attendance = data?.studentsOverview || {
    present: 0,
    absent: 0,
    onLeave: 0,
    total: 0,
    totalStudents: 0
  };

  const attendanceTotal = attendance.present + attendance.absent + attendance.onLeave;
  const presentPercent = attendanceTotal > 0 ? ((attendance.present / attendanceTotal) * 100).toFixed(1) : "0.0";
  const absentPercent = attendanceTotal > 0 ? ((attendance.absent / attendanceTotal) * 100).toFixed(1) : "0.0";
  const onLeavePercent = attendanceTotal > 0 ? ((attendance.onLeave / attendanceTotal) * 100).toFixed(1) : "0.0";

  const attendanceChartData = [
    { name: "Present", value: attendance.present || 0, color: "#10B981" },
    { name: "Absent", value: attendance.absent || 0, color: "#F43F5E" },
    { name: "On Leave", value: attendance.onLeave || 0, color: "#F59E0B" },
  ];

  // If there's absolutely no attendance data, we give a tiny placeholder segment so the chart doesn't crash or render blank
  const isAttendanceEmpty = attendanceChartData.every(item => item.value === 0);
  const finalAttendanceChartData = isAttendanceEmpty
    ? [{ name: "No Data", value: 1, color: "#1E293B" }]
    : attendanceChartData.filter(item => item.value > 0);

  // Activity Overview chart formatting
  const activityOverview = data?.activityOverview || {
    chartData: [],
    stats: {
      joinRequests: { value: 0, growth: "0%" },
      examsConducted: { value: 0, growth: "0%" },
      assignments: { value: 0, growth: "0%" },
      events: { value: 0, growth: "0%" }
    }
  };

  // Combine activity values for a single trend line
  const dbActivityChartData = (activityOverview.chartData || []).map(d => ({
    name: d.name,
    value: (d["Join Requests"] || 0) + (d["Exams Conducted"] || 0) + (d["Assignments"] || 0) + (d["Events"] || 0)
  }));

  const hasActivityData = dbActivityChartData.some(d => d.value > 0);
  // Seeding default curve if database is empty so it matches visual look, but swaps dynamically when data updates
  const finalActivityChartData = hasActivityData ? dbActivityChartData : [
    { name: "1 May", value: 30 },
    { name: "8 May", value: 45 },
    { name: "15 May", value: 35 },
    { name: "22 May", value: 55 },
    { name: "26 May", value: 40 }
  ];

  // Tiny sparkline datasets for Stats Cards
  const sparklines = {
    students: [{ value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }, { value: 22 }],
    teachers: [{ value: 5 }, { value: 8 }, { value: 6 }, { value: 12 }, { value: 9 }, { value: 15 }, { value: 14 }],
    classes: [{ value: 20 }, { value: 20 }, { value: 22 }, { value: 22 }, { value: 24 }, { value: 24 }, { value: 24 }],
    subjects: [{ value: 25 }, { value: 28 }, { value: 27 }, { value: 30 }, { value: 29 }, { value: 32 }, { value: 32 }],
    events: [{ value: 2 }, { value: 5 }, { value: 4 }, { value: 8 }, { value: 6 }, { value: 10 }, { value: 8 }]
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 bg-[#080D1A] -m-4 md:-m-6 p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-sm font-semibold tracking-wide">Loading TeachHub Control Center...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#080D1A] min-h-screen text-slate-100 p-6 -m-4 md:-m-6" style={{ fontFamily: SORA }}>
      
      {/* ── GREETING & CLOCK HEADER ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {data?.adminName || "Admin"} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Here's what's happening at {data?.schoolName || "your school"} today.
          </p>
        </div>
        
        {/* Dynamic Real-Time Clock */}
        <div className="flex items-center gap-3 bg-[#0F172A] border border-slate-800/80 rounded-2xl px-4 py-3 shadow-md w-fit self-start md:self-auto">
          <FaCalendarAlt className="text-purple-500 text-lg" />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-200">{formatLocalDate(currentTime)}</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{formatLocalTime(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* ── SIX GLOWING STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        
        {/* Card 1: Students */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#8B5CF6]/15 hover:border-[#8B5CF6]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] text-sm font-bold">
              <FaUserGraduate />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Students</p>
          </div>
          <div className="mt-2 z-10">
            <h2 className="text-2xl font-black text-white">{stats.students.total}</h2>
            <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{stats.students.growth}</p>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklines.students} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="rgba(139, 92, 246, 0.08)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#3B82F6]/15 hover:border-[#3B82F6]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] text-sm font-bold">
              <FaChalkboardTeacher />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Teachers</p>
          </div>
          <div className="mt-2 z-10">
            <h2 className="text-2xl font-black text-white">{stats.teachers.total}</h2>
            <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{stats.teachers.growth}</p>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklines.teachers} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="rgba(59, 130, 246, 0.08)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Classes */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#10B981]/15 hover:border-[#10B981]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-sm font-bold">
              <FaSchool />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Classes</p>
          </div>
          <div className="mt-2 z-10">
            <h2 className="text-2xl font-black text-white">{stats.classes.total}</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{stats.classes.growth}</p>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklines.classes} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#10B981" fill="rgba(16, 185, 129, 0.08)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Subjects */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#F59E0B]/15 hover:border-[#F59E0B]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] text-sm font-bold">
              <FaBook />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Subjects</p>
          </div>
          <div className="mt-2 z-10">
            <h2 className="text-2xl font-black text-white">{stats.subjects.total}</h2>
            <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{stats.subjects.growth}</p>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklines.subjects} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="rgba(245, 158, 11, 0.08)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 5: Events */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#14B8A6]/15 hover:border-[#14B8A6]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6] text-sm font-bold">
              <FaCalendarAlt />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Events This Month</p>
          </div>
          <div className="mt-2 z-10">
            <h2 className="text-2xl font-black text-white">{stats.events.total}</h2>
            <p className="text-[10px] font-bold text-teal-400 mt-0.5">{stats.events.growth}</p>
          </div>
          {/* Sparkline */}
          <div className="absolute bottom-0 left-0 right-0 h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklines.events} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#14B8A6" fill="rgba(20, 184, 166, 0.08)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 6: Payments */}
        <div className="bg-[#0F1631]/80 backdrop-blur border border-[#EF4444]/15 hover:border-[#EF4444]/30 transition-all rounded-2xl p-4 flex flex-col justify-between h-36 relative overflow-hidden shadow-lg group">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] text-sm font-bold">
              <FaRupeeSign />
            </div>
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Pending Payments</p>
          </div>
          <div className="mt-2 z-10 pb-2">
            <h2 className="text-2xl font-black text-white">
              ₹{Number(stats.payments.total).toLocaleString("en-IN")}
            </h2>
            <p className="text-[10px] font-bold text-rose-500 mt-1">{stats.payments.growth}</p>
          </div>
        </div>

      </div>

      {/* ── MIDDLE ROW: QUICK ACTIONS & ANNOUNCEMENTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Add Student */}
              <Link to="/admin/students" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaUserPlus />
                </div>
                <span className="text-xs font-semibold text-slate-200">Add Student</span>
              </Link>

              {/* Add Teacher */}
              <Link to="/admin/teachers" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaUserPlus />
                </div>
                <span className="text-xs font-semibold text-slate-200">Add Teacher</span>
              </Link>

              {/* Create Timetable */}
              <Link to="/admin/create-timetable" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaCalendarPlus />
                </div>
                <span className="text-xs font-semibold text-slate-200">Create Timetable</span>
              </Link>

              {/* Schedule Exam */}
              <Link to="/admin/exam-schedule" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaClipboardList />
                </div>
                <span className="text-xs font-semibold text-slate-200">Schedule Exam</span>
              </Link>

              {/* Create Assignment */}
              <Link to="/admin/assign-student-class" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaFileSignature />
                </div>
                <span className="text-xs font-semibold text-slate-200">Assign Student</span>
              </Link>

              {/* Manage Leaves */}
              <Link to="/admin/teacher-leaves" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaFileAlt />
                </div>
                <span className="text-xs font-semibold text-slate-200">Manage Leaves</span>
              </Link>

              {/* Join Requests */}
              <Link to="/admin/requests" className="relative flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaUserCheck />
                </div>
                {joinRequestsCount > 0 && (
                  <span className="absolute top-2.5 right-6 bg-rose-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-[#0D1326] animate-bounce">
                    {joinRequestsCount}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-200">Join Requests</span>
              </Link>

              {/* Support Chat */}
              <Link to="/admin/support" className="flex flex-col items-center justify-center bg-[#131B35] hover:bg-[#1A254C] transition p-4 rounded-xl border border-white/5 group text-center cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6] text-base mb-2.5 group-hover:scale-110 transition duration-300">
                  <FaComments />
                </div>
                <span className="text-xs font-semibold text-slate-200">Support Chat</span>
              </Link>

            </div>
          </div>
        </div>

        {/* Announcements (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaBullhorn className="text-purple-500 text-lg" />
              <h2 className="text-base font-bold text-white">Announcements</h2>
            </div>
            
            <div className="space-y-4">
              {announcements.map((ann, idx) => {
                let catColor = "bg-[#8B5CF6]/10 text-[#8B5CF6]";
                let icon = <FaFlag />;
                
                if (ann.category === "General") {
                  catColor = "bg-[#3B82F6]/10 text-[#3B82F6]";
                  icon = <FaUsers />;
                } else if (ann.category === "Academic") {
                  catColor = "bg-[#10B981]/10 text-[#10B981]";
                  icon = <FaScroll />;
                }
                
                // Formatted announcement date
                const dateObj = ann.date ? new Date(ann.date) : new Date();
                const now = new Date();
                let dateStr = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                
                if (dateObj.toDateString() === now.toDateString()) {
                  dateStr = "Today";
                } else {
                  const yesterday = new Date(now);
                  yesterday.setDate(now.getDate() - 1);
                  if (dateObj.toDateString() === yesterday.toDateString()) {
                    dateStr = "Yesterday";
                  }
                }
                
                return (
                  <div key={ann._id || idx} className="flex items-start gap-3 bg-[#131B35]/45 hover:bg-[#131B35]/80 p-3.5 rounded-xl border border-white/5 transition">
                    <div className={`w-8 h-8 rounded-lg ${catColor} flex items-center justify-center shrink-0 text-sm`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{ann.title}</h4>
                        <span className="text-[9px] font-medium text-slate-400 shrink-0">
                          {dateStr}, {ann.timeString || "09:00 AM"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {ann.content}
                      </p>
                      <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded-full mt-2 uppercase tracking-wide ${catColor}`}>
                        {ann.category}
                      </span>
                    </div>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <p className="text-xs text-slate-500 italic py-6 text-center">No announcements posted yet.</p>
              )}
            </div>
          </div>
          
          <Link to="/admin/events" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition mt-4 inline-block w-fit">
            View all announcements &rarr;
          </Link>
        </div>

      </div>

      {/* ── BOTTOM ROW: STUDENTS OVERVIEW, ACTIVITY OVERVIEW, EVENTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Students Overview (Donut Chart) (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Students Overview</h2>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-[#131B35] px-2.5 py-1 rounded-lg border border-white/5">
                This Month <FaChevronDown className="text-[8px]" />
              </div>
            </div>
            
            <div className="flex flex-col items-center sm:flex-row sm:justify-around gap-6 py-2">
              
              {/* Donut Chart with Inner Text */}
              <div className="relative w-36 h-36 flex items-center justify-center select-none shrink-0">
                <PieChart width={144} height={144}>
                  <Pie
                    data={finalAttendanceChartData}
                    cx={68}
                    cy={68}
                    innerRadius={50}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {finalAttendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                
                {/* Text centered inside donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-white tracking-tight">{attendance.totalStudents}</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">Total Students</span>
                </div>
              </div>
              
              {/* Legend with percentages */}
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-semibold text-slate-350">Present</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {attendance.present} <span className="text-[10px] font-semibold text-slate-450">({presentPercent}%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                    <span className="text-xs font-semibold text-slate-350">Absent</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {attendance.absent} <span className="text-[10px] font-semibold text-slate-450">({absentPercent}%)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-xs font-semibold text-slate-350">On Leave</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {attendance.onLeave} <span className="text-[10px] font-semibold text-slate-450">({onLeavePercent}%)</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          <Link to="/admin/attendance-report" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition mt-4 inline-block w-fit">
            View attendance report &rarr;
          </Link>
        </div>

        {/* Activity Overview (Area Chart) (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Activity Overview</h2>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-[#131B35] px-2.5 py-1 rounded-lg border border-white/5">
                This Month <FaChevronDown className="text-[8px]" />
              </div>
            </div>
            
            {/* Area Chart */}
            <div className="h-36 w-full opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalActivityChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontFamily: SORA, fill: "#64748B", fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontFamily: SORA, fill: "#64748B", fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                    labelStyle={{ fontSize: "10px", color: "#94A3B8" }}
                    itemStyle={{ fontSize: "10px", color: "#A855F7" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="rgba(139, 92, 246, 0.08)" strokeWidth={2} dot={{ r: 3, stroke: "#8B5CF6", strokeWidth: 1.5, fill: "#0D1326" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Combined Metrics grid */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 mt-2">
              <div className="text-center">
                <span className="block text-[8px] font-extrabold text-slate-450 uppercase tracking-wider">Join Reqs</span>
                <span className="block text-sm font-black text-slate-200 mt-1">{activityOverview.stats.joinRequests.value}</span>
                <span className="block text-[8px] font-bold text-emerald-400 mt-0.5">{activityOverview.stats.joinRequests.growth}</span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] font-extrabold text-slate-450 uppercase tracking-wider">Exams</span>
                <span className="block text-sm font-black text-slate-200 mt-1">{activityOverview.stats.examsConducted.value}</span>
                <span className="block text-[8px] font-bold text-emerald-400 mt-0.5">{activityOverview.stats.examsConducted.growth}</span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] font-extrabold text-slate-450 uppercase tracking-wider">Assigns</span>
                <span className="block text-sm font-black text-slate-200 mt-1">{activityOverview.stats.assignments.value}</span>
                <span className="block text-[8px] font-bold text-emerald-400 mt-0.5">{activityOverview.stats.assignments.growth}</span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] font-extrabold text-slate-450 uppercase tracking-wider">Events</span>
                <span className="block text-sm font-black text-slate-200 mt-1">{activityOverview.stats.events.value}</span>
                <span className="block text-[8px] font-bold text-emerald-400 mt-0.5">{activityOverview.stats.events.growth}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Upcoming Events (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Upcoming Events</h2>
              <Link to="/admin/events" className="text-[10px] font-bold text-[#8B5CF6] hover:underline flex items-center gap-0.5">
                View Calendar
              </Link>
            </div>
            
            <div className="space-y-3">
              {upcomingEvents.map((ev, idx) => (
                <div key={ev._id || idx} className="flex items-center gap-3 bg-[#131B35]/45 hover:bg-[#131B35]/80 border border-white/5 rounded-xl p-2.5 transition">
                  {/* Date square */}
                  <div className="w-11 h-11 shrink-0 rounded-lg bg-[#0F172A] border border-slate-800/80 flex flex-col items-center justify-center p-1.5 select-none">
                    <span className="text-[10px] font-bold text-slate-400 leading-none">{ev.dateMonth}</span>
                    <span className="text-sm font-black text-slate-100 leading-none mt-1">{ev.dateDay}</span>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{ev.title}</h4>
                    <p className="text-[9px] text-slate-450 font-bold truncate mt-0.5">{ev.subtitle}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[8px] font-semibold text-slate-400">
                      <FaClock className="text-purple-500" />
                      <span>{ev.time}</span>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="shrink-0 text-right">
                    <span className="inline-block text-[7px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-slate-500 italic py-6 text-center">No upcoming events scheduled.</p>
              )}
            </div>
          </div>
          
          <Link to="/admin/events" className="text-xs font-bold text-[#8B5CF6] hover:text-purple-400 transition mt-4 inline-block w-fit">
            View all events &rarr;
          </Link>
        </div>

      </div>

      {/* ── FOOTER BAR ── */}
      <footer className="mt-8 pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-bold text-slate-500 select-none">
        <p>&copy; {new Date().getFullYear()} TeachHub. All rights reserved.</p>
        <p>Version 1.0.0</p>
      </footer>

    </div>
  );
}

export default AdminDashboard;