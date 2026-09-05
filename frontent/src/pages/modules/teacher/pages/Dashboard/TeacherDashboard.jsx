import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";
import {
  FaUserGraduate,
  FaBook,
  FaSchool,
  FaClipboardCheck,
  FaCalendarAlt,
  FaSearch,
  FaBell,
  FaArrowRight,
  FaVideo,
  FaFileAlt,
  FaRegClock,
  FaRegCalendarAlt,
  FaCloudUploadAlt,
  FaChartBar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronRight,
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function TeacherDashboard() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const teacherName = localStorage.getItem("name") || "Teacher";
  const teacherAvatar = localStorage.getItem("avatar") || "";

  const defaultTeacherData = {
    studentsCount: 0,
    classesCount: 0,
    sectionsCount: 0,
    subjectsCount: 0,
    upcomingExamsCount: 0,
    attendanceStats: { present: 0, absent: 0, late: 0, leave: 0, total: 0, percentage: 0 },
    timetable: [],
    upcomingExams: [],
    classPerformance: [],
    recentActivities: [],
    recentStudents: []
  };

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_cache_teacher_dashboard");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) return parsed.data;
      }
    } catch (e) {}
    return defaultTeacherData;
  });

  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    // Time sensitive greeting
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/api/teacher/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data) {
          setDashboardData(res.data);
          localStorage.setItem("teachhub_cache_teacher_dashboard", JSON.stringify({ timestamp: Date.now(), data: res.data }));
        }
      })
      .catch((err) => {
        console.log("Using cached teacher dashboard statistics");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API, token]);

  // Donut chart data for Attendance Summary
  const donutData = [
    { name: "Present", value: dashboardData.attendanceStats?.present || 0, color: "#10B981" },
    { name: "Absent", value: dashboardData.attendanceStats?.absent || 0, color: "#EF4444" },
    { name: "Late", value: dashboardData.attendanceStats?.late || 0, color: "#F59E0B" },
    { name: "Leave", value: dashboardData.attendanceStats?.leave || 0, color: "#6B7280" }
  ];

  // Bar Colors for Class Performance Overview
  const BAR_COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const stats = [
    {
      label: "My Students",
      value: dashboardData.studentsCount || 0,
      desc: `Across ${dashboardData.classesCount || 0} Classes`,
      icon: <FaUserGraduate className="text-xl" />,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      barColor: "bg-purple-500",
    },
    {
      label: "My Classes",
      value: dashboardData.classesCount || 0,
      desc: `${dashboardData.sectionsCount || 0} Sections`,
      icon: <FaSchool className="text-xl" />,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      barColor: "bg-blue-500",
    },
    {
      label: "Today's Attendance",
      value: `${dashboardData.attendanceStats?.percentage || 0}%`,
      desc: `${dashboardData.attendanceStats?.present || 0} / ${dashboardData.attendanceStats?.total || 0} Present`,
      icon: <FaClipboardCheck className="text-xl" />,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      barColor: "bg-emerald-500",
      progress: dashboardData.attendanceStats?.percentage || 0
    },
    {
      label: "My Subjects",
      value: dashboardData.subjectsCount || 0,
      desc: "Active Subjects",
      icon: <FaBook className="text-xl" />,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      barColor: "bg-amber-500",
    },
  ];

  const quickActions = [
    {
      label: "Mark Attendance",
      icon: <FaClipboardCheck className="text-xl" />,
      bgColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      onClick: () => navigate("/teacher/mark-attendance"),
    },
    {
      label: "Take Online Class",
      icon: <FaVideo className="text-xl" />,
      bgColor: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      onClick: () => navigate("/teacher/support/groups"),
    },
    {
      label: "Create Assignment",
      icon: <FaFileAlt className="text-xl" />,
      bgColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      onClick: () => navigate("/teacher/my-classes"),
    },
    {
      label: "Conduct Exam",
      icon: <FaUserGraduate className="text-xl" />,
      bgColor: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      onClick: () => navigate("/teacher/proctoring"),
    },
    {
      label: "Upload Study Material",
      icon: <FaCloudUploadAlt className="text-xl" />,
      bgColor: "bg-teal-500/10 text-teal-500 border border-teal-500/20",
      onClick: () => navigate("/teacher/my-subjects"),
    },
    {
      label: "View Reports",
      icon: <FaChartBar className="text-xl" />,
      bgColor: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      onClick: () => navigate("/teacher/mark-attendance"),
    },
  ];

  const initials = teacherName
    ? teacherName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 pb-20 select-none text-slate-805 dark:text-slate-100">
      
      {/* Top Navbar Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {greeting}, <span className="text-[#7C3AED] dark:text-[#A78BFA]">{teacherName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 font-medium mt-1">
            Here's what's happening in your classes today.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-sm" />
            <input
              type="text"
              placeholder="Search students, classes, exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#7C3AED] dark:focus:border-[#7C3AED] transition-all"
            />
          </div>

          {/* Calendar Picker Button */}
          <button className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 cursor-pointer">
            <FaRegCalendarAlt className="text-sm" />
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 cursor-pointer">
              <FaBell className="text-sm" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>

          {/* Teacher Profile Info Bubble */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-1.5 pr-4 select-none">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt="Teacher Profile"
                className="w-8 h-8 rounded-xl object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center text-xs font-bold text-white uppercase">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{teacherName}</p>
              <p className="text-[8px] font-extrabold uppercase text-[#7C3AED] dark:text-[#38BDF8] tracking-wider leading-none mt-0.5">Course Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Cards grid (2 COLUMNS ON MOBILE) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-5 mb-4 sm:mb-6">
        
        {/* Core Stats */}
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <p className="text-[8px] sm:text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{s.label}</p>
                <p className="text-lg sm:text-3xl font-black text-slate-800 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{s.value}</p>
              </div>
              <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 text-xs sm:text-base ${s.color}`}>
                {s.icon}
              </div>
            </div>

            <div className="mt-1 sm:mt-4">
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-550 dark:text-slate-400 truncate">{s.desc}</p>
              {s.progress !== undefined ? (
                <div className="w-full bg-slate-100 dark:bg-white/5 h-1 sm:h-1.5 rounded-full mt-1 sm:mt-2 overflow-hidden">
                  <div className={`h-full ${s.barColor}`} style={{ width: `${s.progress}%` }} />
                </div>
              ) : (
                <div className="w-full h-1 sm:h-1.5 mt-1 sm:mt-2" />
              )}
            </div>
          </div>
        ))}

        {/* Upcoming Exams (5th Card matching Academic Year select in mockup style) */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-col justify-between h-24 sm:h-auto shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1 sm:pb-2 mb-1 sm:mb-2">
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 select-none">
              <FaCalendarAlt />
              Academic Year 2026
            </span>
            <FaChevronRight className="text-[8px] text-slate-350" />
          </div>

          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[8px] sm:text-[9px] font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Upcoming Exams</p>
              <p className="text-lg sm:text-3xl font-black text-slate-800 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{dashboardData.upcomingExamsCount}</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-0.5 sm:mt-1">This Week</p>
            </div>
            <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0 text-xs sm:text-lg">
              <FaRegCalendarAlt />
            </div>
          </div>
        </div>

      </div>

      {/* Row 1 Widgets: Donut Chart, Timetable timeline, Upcoming Exams countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
        
        {/* Attendance Summary */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Attendance Summary</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">This Week</p>
            </div>
            <button className="text-[10px] font-black text-slate-400 hover:text-slate-550 select-none bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5">
              Weekly
            </button>
          </div>

          {/* Donut layout */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            {/* Pie Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {dashboardData.attendanceStats?.percentage || 92}%
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Overall
                </span>
              </div>
            </div>

            {/* Explanations list */}
            <div className="space-y-2.5 w-full sm:w-auto">
              {donutData.map((d, index) => {
                const count = d.value;
                const total = dashboardData.attendanceStats?.total || 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
              Total Students: {dashboardData.attendanceStats?.total || 0}
            </span>
            <button 
              onClick={() => navigate("/teacher/mark-attendance")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 hover:underline cursor-pointer"
            >
              View Attendance <FaArrowRight className="text-[8px]" />
            </button>
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Today's Timetable</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Classes & Schedules</p>
            </div>
            <button 
              onClick={() => navigate("/teacher/showtimetable")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer"
            >
              View Full Timetable
            </button>
          </div>

          {/* Timetable Items */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[190px] pr-1.5 select-none scrollbar-thin">
            {(dashboardData.timetable || []).filter(Boolean).length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-slate-400 font-bold">No classes scheduled for today.</p>
              </div>
            ) : (
              (dashboardData.timetable || []).filter(Boolean).map((item, idx) => (
                <div key={item?._id || idx} className="flex gap-4 relative">
                  {/* Left timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${item?.status === 'Completed' ? 'bg-emerald-500' : item?.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'} shrink-0`} />
                    {idx < (dashboardData.timetable || []).filter(Boolean).length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-100 dark:bg-white/5 my-1" />
                    )}
                  </div>

                  {/* Class Info Box */}
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                        {item?.subjectName || "Class"}
                      </h4>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-1">
                        Class {item?.className || ""} - {item?.sectionName || ""} · Room {item?.room || ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-mono font-bold text-slate-450 dark:text-slate-400 leading-none">
                        {item?.startTime || ""}
                      </p>
                      <p className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-1 leading-none">
                        {item?.endTime || ""}
                      </p>
                      <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-md mt-2 tracking-wider ${
                        item?.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : item?.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        {item?.status || "Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Exams list */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Upcoming Exams</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Assigned Evaluations</p>
            </div>
            <button 
              onClick={() => navigate("/teacher/exam-schedule")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer"
            >
              View All Exams
            </button>
          </div>

          {/* Exam listings */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[190px] pr-1.5 scrollbar-thin">
            {dashboardData.upcomingExams.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-slate-400 font-bold">No upcoming exams scheduled.</p>
              </div>
            ) : (
              dashboardData.upcomingExams.map((exam, idx) => (
                <div key={exam._id || idx} className="flex gap-4 items-center bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-3">
                  {/* Calendar Widget representation */}
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-500 dark:text-[#A78BFA] flex flex-col items-center justify-center shrink-0 border border-violet-500/10 font-mono">
                    <span className="text-[14px] font-black leading-none">
                      {new Date(exam.date).getDate()}
                    </span>
                    <span className="text-[7px] font-black uppercase mt-0.5 tracking-wider">
                      {new Date(exam.date).toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">
                      {exam.subjectName} - Unit Test
                    </h4>
                    <p className="text-[9px] text-slate-455 dark:text-slate-400 font-semibold mt-1">
                      Class {exam.className} - {exam.sectionName}
                    </p>
                  </div>

                  <span className="text-[8px] font-extrabold px-2 py-1 rounded-full bg-purple-500/15 text-purple-650 dark:text-[#C084FC] border border-purple-500/10 shrink-0 uppercase tracking-wide">
                    {exam.daysLeft} Days Left
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
              Total Upcoming Exams: {dashboardData.upcomingExamsCount}
            </span>
            <button 
              onClick={() => navigate("/teacher/exam-schedule")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 hover:underline cursor-pointer"
            >
              View All <FaArrowRight className="text-[8px]" />
            </button>
          </div>
        </div>

      </div>

      {/* Row 2 Widgets: Class Performance chart, Recent Activities timeline, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Performance Overview */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Class Performance Overview</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Average score per class</p>
            </div>
            <button className="text-[10px] font-black text-slate-450 hover:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5 select-none">
              This Month
            </button>
          </div>

          {/* Bar Chart */}
          <div className="w-full h-[200px] my-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={dashboardData.classPerformance} barSize={24} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.2)" />
                <XAxis
                  dataKey="className"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontFamily: SORA, fill: "#94a3b8", fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontFamily: SORA, fill: "#94a3b8", fontWeight: 500 }}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 dark:bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/10">
                          <p className="text-[10px] text-slate-450 font-medium mb-0.5">{label}</p>
                          <p className="text-[#38BDF8] text-xs font-extrabold">{payload[0].value}% Average Score</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 6 }}
                />
                <Bar dataKey="performance" radius={[6, 6, 0, 0]}>
                  {dashboardData.classPerformance.map((entry, idx) => (
                    <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 text-right">
            <button 
              onClick={() => navigate("/teacher/mark-attendance")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 ml-auto hover:underline cursor-pointer"
            >
              View Detailed Report <FaArrowRight className="text-[8px]" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Recent Activity</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Logs & Actions</p>
            </div>
            <button className="text-[8px] sm:text-[10px] font-black text-[#7C3AED] dark:text-[#38BDF8] tracking-widest uppercase">
              Live Feed
            </button>
          </div>

          {/* Activity items */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[190px] pr-1.5 scrollbar-thin">
            {dashboardData.recentActivities.map((act, idx) => (
              <div key={idx} className="flex gap-3">
                {/* Icon bubble */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  act.type === 'attendance'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : act.type === 'exam'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : act.type === 'leave'
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                }`}>
                  {act.type === 'attendance' ? (
                    <FaCheckCircle className="text-sm" />
                  ) : act.type === 'exam' ? (
                    <FaRegCalendarAlt className="text-sm" />
                  ) : act.type === 'leave' ? (
                    <FaExclamationTriangle className="text-sm" />
                  ) : (
                    <FaFileAlt className="text-sm" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                    {act.title}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                    {new Date(act.time).toLocaleDateString()} at {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 text-right">
            <button 
              onClick={() => navigate("/teacher/mark-attendance")}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 ml-auto hover:underline cursor-pointer"
            >
              View All Activity <FaArrowRight className="text-[8px]" />
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Quick Actions</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Shortcuts</p>
            </div>
          </div>

          {/* Grid buttons */}
          <div className="grid grid-cols-2 gap-3.5 flex-1 items-center py-2">
            {quickActions.map((act, index) => (
              <button
                key={index}
                onClick={act.onClick}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center select-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-sm ${act.bgColor}`}
              >
                <div className="mb-2 shrink-0">{act.icon}</div>
                <span className="text-[10px] font-black tracking-tight leading-tight">
                  {act.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Table section: Recent Students */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">My Recent Students</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Quick lookup of recently enrolled students in your classes</p>
        </div>

        <div className="overflow-x-auto select-text">
          <table className="w-full min-w-[480px] text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
              {dashboardData.recentStudents.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-12 text-slate-400">
                    <p className="text-xs font-bold">No recent students found</p>
                  </td>
                </tr>
              ) : (
                dashboardData.recentStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium text-xs break-all">{student.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide select-none">
            Student listings are refreshed automatically with class schedules
          </p>
        </div>
      </div>

    </div>
  );
}

export default TeacherDashboard;
