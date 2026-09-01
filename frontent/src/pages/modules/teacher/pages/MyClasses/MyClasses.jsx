import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  FaSchool,
  FaUserGraduate,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaRegClock,
  FaRegCalendarAlt,
  FaBook,
  FaChevronRight,
  FaEllipsisV,
  FaCheckCircle,
  FaClipboardCheck,
  FaTimesCircle,
  FaExclamationCircle,
  FaUser,
  FaUsers,
  FaMapMarkerAlt,
  FaVideo,
  FaFileAlt,
  FaChartBar,
  FaChevronLeft,
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function MyClasses() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const teacherName = localStorage.getItem("name") || "Teacher";
  const teacherAvatar = localStorage.getItem("avatar") || "";

  // Component state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected class for details view
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Load overview data
  useEffect(() => {
    fetchClasses();
  }, [API]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/my-classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClasses(res.data);
    } catch (err) {
      console.error("Error loading teacher classes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load single class details
  const fetchClassDetails = async (classId) => {
    try {
      setDetailsLoading(true);
      setSelectedClassId(classId);
      const res = await axios.get(`${API}/api/teacher/my-classes/${classId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassDetails(res.data);
    } catch (err) {
      console.error("Error loading class details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBackToOverview = () => {
    setSelectedClassId(null);
    setClassDetails(null);
    setActiveTab("Overview");
  };

  // Helper to determine color based on performance score
  const getPerformanceColor = (score) => {
    if (score >= 80) return { stroke: "#10B981", label: "Excellent" };
    if (score >= 70) return { stroke: "#34D399", label: "Good" };
    if (score >= 60) return { stroke: "#F59E0B", label: "Average" };
    return { stroke: "#EF4444", label: "Needs Help" };
  };

  // Sparkline mock data mapping
  const sparkDataBlue = [{ value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 48 }, { value: 85 }];
  const sparkDataGreen = [{ value: 40 }, { value: 55 }, { value: 45 }, { value: 70 }, { value: 65 }, { value: 92 }];
  const sparkDataYellow = [{ value: 60 }, { value: 50 }, { value: 40 }, { value: 55 }, { value: 38 }, { value: 48 }];

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold">Loading Classes...</p>
      </div>
    );
  }

  // --- 1. DETAILED CLASS VIEW ---
  if (selectedClassId && classDetails) {
    const details = classDetails;
    
    // Attendance donut data
    const attendanceDonutData = [
      { name: "Present", value: details.attendanceSummary?.present || 736, color: "#10B981" },
      { name: "Absent", value: details.attendanceSummary?.absent || 48, color: "#EF4444" },
      { name: "Late", value: details.attendanceSummary?.late || 12, color: "#F59E0B" },
      { name: "Leave", value: details.attendanceSummary?.leave || 4, color: "#6B7280" }
    ];

    return (
      <div style={{ fontFamily: SORA }} className="space-y-6 pb-20 text-slate-800 dark:text-slate-100 select-none">
        
        {/* Back navigation & Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Class Details</h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
              Complete overview and class management
            </p>
          </div>
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all cursor-pointer self-start xl:self-auto shadow-sm"
          >
            <FaArrowLeft />
            Back to My Classes
          </button>
        </div>

        {/* Class Overview Header Card */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          {/* Accent strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7C3AED]" />

          {/* Left Details block */}
          <div className="flex items-center gap-4 pl-1.5">
            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#A78BFA] dark:bg-[#7C3AED]/20 border border--[#7C3AED]/20 flex flex-col items-center justify-center font-black select-none shrink-0 shadow-inner">
              <span className="text-[20px] leading-none">{details.name?.split(" ")[1] || details.name}</span>
              <span className="text-[10px] leading-none uppercase mt-0.5">{details.section}</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Class {details.name} - <span className="text-[#7C3AED] dark:text-[#A78BFA]">{details.sectionName || `Section ${details.section}`}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-semibold flex items-center gap-1.5">
                <span className="text-[#7C3AED] font-extrabold uppercase">{details.subjectName}</span>
                <span className="text-slate-300 dark:text-white/10">|</span>
                <span className="flex items-center gap-1">
                  Class Teacher: <span className="font-extrabold text-slate-700 dark:text-slate-300">{teacherName}</span>
                </span>
              </p>
            </div>
          </div>

          {/* Right Parameters boxes */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-6 w-full lg:w-auto">
            {/* Students */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/10">
                <FaUsers className="text-sm" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-800 dark:text-white leading-tight">{details.studentsCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-0.5">Students</p>
              </div>
            </div>

            {/* Boys */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/10">
                <FaUser className="text-sm" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-800 dark:text-white leading-tight">{details.boysCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-0.5">Boys</p>
              </div>
            </div>

            {/* Girls */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/10">
                <FaUser className="text-sm" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-800 dark:text-white leading-tight">{details.girlsCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-0.5">Girls</p>
              </div>
            </div>

            {/* Room */}
            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/10">
                <FaMapMarkerAlt className="text-sm" />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-850 dark:text-white leading-tight">{details.room}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-0.5">Class Room</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 items-start justify-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Class Status</span>
              <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mt-1.5">
                {details.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="border-b border-slate-200 dark:border-white/[0.08] flex items-center gap-6 overflow-x-auto select-none py-1">
          {["Overview", "Students", "Subjects", "Timetable", "Attendance", "Performance", "Settings"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                activeTab === tab 
                  ? "text-[#7C3AED] dark:text-[#A78BFA]" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#A78BFA] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Render Tab Contents */}
        {activeTab === "Overview" ? (
          <div className="space-y-6">
            {/* Top row elements: Students list, subjects list, timetable */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Students List */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Students ({details.studentsCount})</h2>
                  </div>
                  <button onClick={() => setActiveTab("Students")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All Students →
                  </button>
                </div>

                {/* List items */}
                <div className="space-y-3.5 flex-1 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.students?.slice(0, 5).map((student, idx) => (
                    <div key={student._id || idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Student Initials */}
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-300">
                          {student.name ? student.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "S"}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">{student.name}</h4>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-none mt-1">Roll No. {student.rollNo}</p>
                        </div>
                      </div>

                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border ${
                        student.status === 'Present'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : student.status === 'Late'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setActiveTab("Students")} className="w-full mt-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 py-2.5 rounded-2xl text-[10px] font-black tracking-wide transition-all cursor-pointer">
                  View All Students
                </button>
              </div>

              {/* Subjects List */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Subjects ({details.subjects?.length})</h2>
                  </div>
                  <button onClick={() => setActiveTab("Subjects")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All Subjects →
                  </button>
                </div>

                {/* List items */}
                <div className="space-y-3.5 flex-1 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.subjects?.slice(0, 5).map((sub, idx) => (
                    <div key={sub._id || idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
                          <FaBook className="text-xs" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">{sub.name}</h4>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-none mt-1">{sub.teacherName} · {sub.periodsPerWeek} Periods / Week</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setActiveTab("Subjects")} className="w-full mt-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 py-2.5 rounded-2xl text-[10px] font-black tracking-wide transition-all cursor-pointer">
                  View All Subjects
                </button>
              </div>

              {/* Today's Timetable */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Today's Timetable</h2>
                  </div>
                  <button onClick={() => setActiveTab("Timetable")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View Full Timetable →
                  </button>
                </div>

                {/* Timetable Items */}
                <div className="space-y-4 flex-1 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.timetable?.map((t, idx) => (
                    <div key={t._id || idx} className="flex gap-4 relative">
                      {/* Left timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${t.status === 'Completed' ? 'bg-emerald-500' : t.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'} shrink-0`} />
                        {idx < details.timetable.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-100 dark:bg-white/5 my-1" />
                        )}
                      </div>

                      {/* Period info */}
                      <div className="flex-1 flex justify-between items-start leading-none select-none">
                        <div>
                          <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight">{t.subjectName}</h4>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1">{t.room}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-mono font-bold text-slate-450 dark:text-slate-400">{t.startTime} - {t.endTime}</p>
                          <span className={`inline-block text-[7px] font-extrabold px-1.5 py-0.5 rounded mt-1.5 tracking-wider ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : t.status === 'In Progress'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom row elements: Attendance Summary, Performance Overview, Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Attendance Summary */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Attendance Summary</h2>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">This Month</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                  {/* Pie chart */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={attendanceDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={62}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {attendanceDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                        {details.attendanceSummary?.percentage || 92}%
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Overall
                      </span>
                    </div>
                  </div>

                  {/* Legends details */}
                  <div className="space-y-2 w-full sm:w-auto">
                    {attendanceDonutData.map((d, index) => {
                      const count = d.value;
                      const total = details.attendanceSummary?.total || 800;
                      const percent = Math.round((count / total) * 100) || 0;
                      return (
                        <div key={index} className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-850 dark:text-white">
                            {count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  <button onClick={() => setActiveTab("Attendance")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 hover:underline cursor-pointer w-fit">
                    View Attendance History →
                  </button>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Performance Overview</h2>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">This Term</p>
                  </div>
                  <button className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5 select-none">
                    This Term
                  </button>
                </div>

                {/* Stat blocks grid */}
                <div className="grid grid-cols-3 gap-3 my-2">
                  {/* Class average */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-2.5 flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Class Average</p>
                      <h4 className="text-lg font-black text-[#3B82F6] mt-1 tracking-tight">{details.performanceOverview?.classAverage || 85}%</h4>
                    </div>
                    <div className="h-6 mt-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={sparkDataBlue}>
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Highest score */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-2.5 flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Highest Score</p>
                      <h4 className="text-lg font-black text-[#10B981] mt-1 tracking-tight">{details.performanceOverview?.highestScore || 92}%</h4>
                    </div>
                    <div className="h-6 mt-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={sparkDataGreen}>
                          <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pass percentage */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-2.5 flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Pass %</p>
                      <h4 className="text-lg font-black text-[#F59E0B] mt-1 tracking-tight">{details.performanceOverview?.passPercentage || 95}%</h4>
                    </div>
                    <div className="h-6 mt-2">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={sparkDataYellow}>
                          <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom line: grade & details button */}
                <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class Grade:</span>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#A78BFA] dark:bg-[#A78BFA]/10 rounded border border-[#7C3AED]/15">
                      {details.performanceOverview?.classGrade || "B+"}
                    </span>
                  </div>
                  <button onClick={() => setActiveTab("Performance")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 hover:underline cursor-pointer">
                    View Detailed Report →
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Recent Activity</h2>
                  </div>
                  <button className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All Activity →
                  </button>
                </div>

                {/* Activity list */}
                <div className="space-y-3.5 flex-1 max-h-[190px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.recentActivities?.map((act, index) => (
                    <div key={act.id || index} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/15 flex items-center justify-center shrink-0">
                        {act.title.includes("attendance") ? <FaClipboardCheck className="text-xs" /> : <FaFileAlt className="text-xs" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{act.title}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                          {new Date(act.time).toLocaleDateString()} at {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaSchool className="text-2xl" />
            </div>
            <h3 className="text-slate-800 dark:text-white font-extrabold text-base">Tab content under construction</h3>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              The {activeTab} section dashboard will render school databases configurations. Please check other tabs.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- 2. OVERVIEW MY CLASSES VIEW ---
  // Compute Stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const avgPerformance = classes.length > 0 
    ? Math.round(classes.reduce((sum, c) => sum + (c.performance || 0), 0) / classes.length) 
    : 78;

  // Filter query logic
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 pb-20 text-slate-800 dark:text-slate-100 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Classes</h1>
          <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 font-medium mt-1">
            Classes assigned to you for teaching and monitoring.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-sm" />
            <input
              type="text"
              placeholder="Search classes, sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#7C3AED] dark:focus:border-[#7C3AED] transition-all"
            />
          </div>

          {/* Filter Button */}
          <button className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm">
            <FaFilter className="text-xs" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Classes */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
            <FaSchool className="text-lg" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Classes</p>
            <p className="text-2xl font-black text-slate-805 dark:text-white mt-1 leading-none">{totalClasses}</p>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FaUsers className="text-lg" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-black text-slate-805 dark:text-white mt-1 leading-none">{totalStudents}</p>
          </div>
        </div>

        {/* Average Performance */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FaChartBar className="text-lg" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Performance</p>
              <p className="text-2xl font-black text-slate-805 dark:text-white mt-1 leading-none">{avgPerformance}%</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-500 select-none mr-1 cursor-pointer">
            <FaCalendarAlt />
            Academic Year 2026
          </div>
        </div>
      </div>

      {/* Grid of Classes */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/5 rounded-3xl py-20 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto mb-3">
            <FaSchool />
          </div>
          <p className="text-slate-800 dark:text-white font-bold text-sm">No Assigned Classes</p>
          <p className="text-slate-400 text-xs font-semibold mt-1">Try resetting search filters or check backend dashboard configs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClasses.map((c) => {
            const perf = getPerformanceColor(c.performance);
            const donutChartData = [
              { name: "Performance", value: c.performance, color: perf.stroke },
              { name: "Remainder", value: 100 - c.performance, color: "rgba(226, 232, 240, 0.1)" }
            ];

            return (
              <div
                key={c._id}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between group"
              >
                {/* Header card row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    {/* Big class code bubble */}
                    <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#A78BFA] dark:bg-[#7C3AED]/20 border border-[#7C3AED]/10 flex items-center justify-center text-lg font-black shrink-0 shadow-inner">
                      {c.name?.split(" ")[1] || c.name}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight flex items-center gap-2">
                        Class {c.name}
                        <span className="inline-block text-[8px] font-black uppercase bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] px-2 py-0.5 rounded border border-[#7C3AED]/15">
                          Section {c.section}
                        </span>
                      </h3>
                      <p className="text-xs text-[#7C3AED] dark:text-[#38BDF8] font-extrabold uppercase mt-1">
                        {c.subjectName}
                      </p>

                      <div className="mt-3.5 space-y-1 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                        <p className="flex items-center gap-1.5">
                          <FaRegClock className="text-slate-400 dark:text-slate-500" /> Timings: {c.timings}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <FaUserGraduate className="text-slate-400 dark:text-slate-500" /> Students: {c.studentsCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Donut on right */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={donutChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={38}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          {donutChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center text-center leading-none">
                      <span className="text-sm font-black text-slate-850 dark:text-white">{c.performance}%</span>
                      <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">{perf.label}</span>
                    </div>
                  </div>
                </div>

                {/* Middle details row */}
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-white/5 pt-4 mt-2 mb-4 text-left select-none">
                  {/* Attendance */}
                  <div>
                    <p className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Attendance (Month)</p>
                    <h4 className="text-sm font-black text-emerald-500 mt-1">{c.attendancePercentage}%</h4>
                  </div>

                  {/* Assignments */}
                  <div>
                    <p className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <FaFileAlt className="text-[7px]" /> Assignments
                    </p>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">{c.assignmentsCount}</h4>
                  </div>

                  {/* Tests Conducted */}
                  <div>
                    <p className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <FaClipboardCheck className="text-[7px]" /> Tests Conducted
                    </p>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">{c.testsConductedCount}</h4>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex gap-2 border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  <button
                    onClick={() => fetchClassDetails(c._id)}
                    className="flex-1 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] py-2.5 rounded-2xl text-[10px] font-black tracking-wide cursor-pointer select-none transition-all flex items-center justify-center gap-1.5 border border-[#7C3AED]/15"
                  >
                    View Class Details
                    <FaChevronRight className="text-[7px]" />
                  </button>
                  <button className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 transition-all cursor-pointer">
                    <FaEllipsisV className="text-xs" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination footer */}
      {filteredClasses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-white/5 pt-5 mt-4 gap-4 text-xs font-bold text-slate-450 dark:text-slate-500 select-none">
          <span>Showing 1 to {filteredClasses.length} of {classes.length} classes</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40" disabled>
              <FaChevronLeft className="text-[9px]" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40" disabled>
              <FaChevronRight className="text-[9px]" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyClasses;