import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserGraduate,
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaArrowLeft,
  FaEnvelope,
  FaChevronRight,
  FaEllipsisV,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaUsers,
  FaBirthdayCake,
  FaGenderless,
  FaRegCalendarAlt,
  FaArrowRight,
  FaClipboardCheck,
  FaFileAlt,
  FaChartBar,
  FaBriefcase,
  FaDownload,
  FaEnvelopeOpen,
  FaRegEdit,
  FaCheckCircle,
  FaChevronLeft,
  FaVideo,
  FaSchool,
} from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function MyStudents() {
  const navigate = useNavigate();
  const API = API_URL;
  const token = localStorage.getItem("token");
  const teacherName = localStorage.getItem("name") || "Teacher";
  const teacherAvatar = localStorage.getItem("avatar") || "";

  // Component state
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    presentToday: 0,
    presentTodayPercentage: 0,
    avgAttendance: 0,
    avgPerformance: 0,
    topPerformer: { name: "N/A", average: 0 }
  });
  const [students, setStudents] = useState([]);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  // Student Profile detail state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Load students directory & statistics
  useEffect(() => {
    fetchStudents();
  }, [API]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/my-students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data) {
        setStatsData({
          totalStudents: res.data.totalStudents,
          presentToday: res.data.presentToday,
          presentTodayPercentage: res.data.presentTodayPercentage,
          avgAttendance: res.data.avgAttendance,
          avgPerformance: res.data.avgPerformance,
          topPerformer: res.data.topPerformer
        });
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error("Error loading students directory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load single student profile details
  const fetchStudentDetails = async (studentId) => {
    try {
      setDetailsLoading(true);
      setSelectedStudentId(studentId);
      const res = await axios.get(`${API}/api/teacher/my-students/${studentId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudentDetails(res.data);
    } catch (err) {
      console.error("Error loading student details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBackToDirectory = () => {
    setSelectedStudentId(null);
    setStudentDetails(null);
    setActiveTab("Overview");
  };

  // Helper to determine performance grade color
  const getGradeColor = (grade) => {
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-blue-500";
    if (grade.startsWith("C")) return "text-amber-500";
    return "text-rose-500";
  };

  // Filter lists derived from students list
  const classesList = ["All Classes", ...new Set(students.map(s => s.className))];
  const sectionsList = ["All Sections", ...new Set(students.map(s => s.sectionName))];
  const statusList = ["All Status", "Active", "Inactive"];

  // Filter students array
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === "All Classes" || s.className === selectedClass;
    const matchesSection = selectedSection === "All Sections" || s.sectionName === selectedSection;
    const matchesStatus = selectedStatus === "All Status" || s.status === selectedStatus;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClass && matchesSection && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold">Loading Directory...</p>
      </div>
    );
  }

  // --- 1. STUDENT PROFILE PAGE VIEW ---
  if (selectedStudentId && studentDetails) {
    const details = studentDetails;
    
    // Attendance donut overview
    const attendanceDonut = [
      { name: "Present", value: details.attendanceOverview?.present ?? 0, color: "#10B981" },
      { name: "Absent", value: details.attendanceOverview?.absent ?? 0, color: "#EF4444" },
      { name: "Late", value: details.attendanceOverview?.late ?? 0, color: "#F59E0B" },
      { name: "Leave", value: details.attendanceOverview?.leave ?? 0, color: "#6B7280" }
    ];

    const quickActions = [
      { label: "Send Message", icon: <FaEnvelopeOpen />, bgColor: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      { label: "View Attendance", icon: <FaClipboardCheck />, bgColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      { label: "View Exam Results", icon: <FaChartBar />, bgColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      { label: "View Assignments", icon: <FaFileAlt />, bgColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      { label: "Add Note", icon: <FaRegEdit />, bgColor: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
      { label: "Download Report", icon: <FaDownload />, bgColor: "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20" }
    ];

    const initials = details.name
      ? details.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "S";

    return (
      <div style={{ fontFamily: SORA }} className="space-y-6 pb-20 text-slate-800 dark:text-slate-100 select-none">
        
        {/* Back and title navigation */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Profile</h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
              Dashboard &gt; My Students &gt; Student Profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDirectory}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-xs font-bold text-slate-650 dark:text-slate-300 transition-all cursor-pointer shadow-sm"
            >
              <FaArrowLeft />
              Back to Students
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm">
              <FaRegEdit />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Student Profile Header Information Box */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full xl:w-auto">
            {/* Student Photo */}
            {details.avatar ? (
              <img
                src={details.avatar}
                alt="Student Profile"
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-indigo-500 flex items-center justify-center text-3xl font-black text-white shrink-0 uppercase shadow-md select-none">
                {initials}
              </div>
            )}

            {/* Profile Info Details Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{details.name}</h2>
                <span className="inline-flex items-center text-[8px] font-black uppercase text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {details.status}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                Roll No. {details.rollNo} · Admission No. {details.admissionNo}
              </p>

              {/* Grid of basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2 truncate">
                  <FaBirthdayCake className="text-slate-400" /> Date of Birth: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.dob || "N/A"}{details.age ? ` (${details.age} Years)` : ""}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FaUser className="text-slate-400" /> Gender: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.gender || "N/A"}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FaEnvelope className="text-slate-400" /> Email: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.email || "N/A"}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FaPhone className="text-slate-400" /> Phone: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.phone || "N/A"}</span>
                </p>
                <p className="flex items-center gap-2 truncate md:col-span-2">
                  <FaMapMarkerAlt className="text-slate-400" /> Address: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.address || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar right parameters box */}
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 shrink-0 w-full xl:w-72 leading-none shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/15">
                <FaSchool className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{details.classAndSection}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">Class & Section</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/15">
                <FaUser className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{details.classTeacher}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">Class Teacher</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/15">
                <FaCalendarAlt className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{details.joinedOn}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">Joined On</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector row */}
        <div className="border-b border-slate-200 dark:border-white/[0.08] flex items-center gap-6 overflow-x-auto select-none py-1">
          {["Overview", "Attendance", "Exams", "Assignments", "Performance", "Subjects", "Documents", "Notes"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                activeTab === tab 
                  ? "text-[#7C3AED] dark:text-[#A78BFA]" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#A78BFA] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Render Profile Tabs Contents */}
        {activeTab === "Overview" ? (
          <div className="space-y-6">
            
            {/* Top row: Attendance Donut, performance overview, subjects average */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Attendance Overview Donut */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Attendance Overview</h2>
                  <button className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5 select-none">
                    This Month
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                  {/* Pie donut */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={attendanceDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={62}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {attendanceDonut.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                        {details.attendanceOverview?.percentage ?? 0}%
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Present
                      </span>
                    </div>
                  </div>

                  {/* legends detail list */}
                  <div className="space-y-2 w-full sm:w-auto">
                    {attendanceDonut.map((d, idx) => {
                      const count = d.value;
                      const total = details.attendanceOverview?.total ?? 0;
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between sm:justify-start gap-4">
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
                    View Full Attendance →
                  </button>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Academic Performance</h2>
                  <button className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-white/5 select-none">
                    This Term
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 items-center py-2 select-none">
                  {/* Grade block */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner h-[90px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Grade</span>
                    <span className="text-3xl font-black text-emerald-500 mt-2 leading-none">{details.academicPerformance?.overallGrade}</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase leading-none">Excellent</span>
                  </div>

                  {/* Avg score block */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner h-[90px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Average Score</span>
                    <span className="text-3xl font-black text-blue-500 mt-2 leading-none">{details.academicPerformance?.averageScore}%</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase leading-none">Above Average</span>
                  </div>

                  {/* Highest score */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-inner h-[76px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Highest Score</span>
                    <span className="text-xs font-black text-emerald-500 mt-1 leading-none">{details.academicPerformance?.highestScore}</span>
                    <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 mt-1.5 truncate w-full">{details.academicPerformance?.highestSubject}</span>
                  </div>

                  {/* Lowest score */}
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-inner h-[76px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Lowest Score</span>
                    <span className="text-xs font-black text-[#F59E0B] mt-1 leading-none">{details.academicPerformance?.lowestScore}</span>
                    <span className="text-[8px] font-bold text-slate-455 dark:text-slate-500 mt-1.5 truncate w-full">{details.academicPerformance?.lowestSubject}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  <button onClick={() => setActiveTab("Performance")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 hover:underline cursor-pointer w-fit">
                    View Detailed Report →
                  </button>
                </div>
              </div>

              {/* Subjects List */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Subjects ({details.subjects?.length})</h2>
                  <button onClick={() => setActiveTab("Subjects")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All
                  </button>
                </div>

                {/* Subject progress bar lists */}
                <div className="space-y-3.5 flex-1 max-h-[190px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.subjects && details.subjects.length > 0 ? (
                    details.subjects.map((sub, idx) => (
                      <div key={idx} className="space-y-1.5 select-none leading-none">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{sub.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-black">{sub.average}%</span>
                            <span className={`text-[9px] font-extrabold px-1 rounded uppercase tracking-wider ${getGradeColor(sub.grade)} bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5`}>
                              {sub.grade}
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              sub.average >= 90 ? 'bg-emerald-500' : sub.average >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                            }`} 
                            style={{ width: `${sub.average}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      No published subject results
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Row: Recent Exams, Recent Assignments, Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Exams table */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm lg:col-span-1">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Recent Exams</h2>
                  <button onClick={() => setActiveTab("Exams")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto flex-1 select-text scrollbar-thin">
                  {details.recentExams && details.recentExams.length > 0 ? (
                    <table className="w-full min-w-[280px] text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] font-black border-b border-slate-100 dark:border-white/5 pb-2">
                          <th className="pb-2">Exam Name</th>
                          <th className="pb-2">Subject</th>
                          <th className="pb-2 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
                        {details.recentExams.map((exam) => (
                          <tr key={exam._id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="py-2.5 font-bold text-slate-805 dark:text-white leading-tight">
                              {exam.examName}
                              <span className="block text-[8px] text-slate-400 font-bold mt-1">
                                {new Date(exam.date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-slate-400 font-semibold">{exam.subjectName}</td>
                            <td className="py-2.5 text-right font-black text-slate-800 dark:text-white">
                              <span className="flex items-center justify-end gap-1.5">
                                {exam.score}%
                                <span className={`text-[8px] font-extrabold px-1 rounded ${getGradeColor(exam.grade)} bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5`}>
                                  {exam.grade}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      No recent exam records found
                    </div>
                  )}
                </div>

                <button onClick={() => setActiveTab("Exams")} className="w-full mt-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-605 dark:text-slate-300 py-2 rounded-2xl text-[10px] font-black tracking-wide cursor-pointer transition-all">
                  View All Exams
                </button>
              </div>

              {/* Recent Assignments table */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Recent Assignments</h2>
                  <button onClick={() => setActiveTab("Assignments")} className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto flex-1 select-text scrollbar-thin">
                  {details.recentAssignments && details.recentAssignments.length > 0 ? (
                    <table className="w-full min-w-[280px] text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] font-black border-b border-slate-100 dark:border-white/5 pb-2">
                          <th className="pb-2">Assignment</th>
                          <th className="pb-2">Subject</th>
                          <th className="pb-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
                        {details.recentAssignments.map((ass) => (
                          <tr key={ass.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="py-2.5 font-bold text-slate-805 dark:text-white leading-tight">
                              {ass.name}
                              <span className="block text-[8px] text-slate-400 font-bold mt-1">
                                Due: {new Date(ass.dueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-slate-400 font-semibold">{ass.subjectName}</td>
                            <td className="py-2.5 text-right font-black">
                              <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                ass.status === 'Submitted'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {ass.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                      No assignments found for this class
                    </div>
                  )}
                </div>

                <button onClick={() => setActiveTab("Assignments")} className="w-full mt-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-605 dark:text-slate-300 py-2 rounded-2xl text-[10px] font-black tracking-wide cursor-pointer transition-all">
                  View All Assignments
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-2 gap-3.5 flex-1 items-center py-2 select-none">
                  {quickActions.map((act, index) => (
                    <button
                      key={index}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-center select-none cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-sm leading-none h-[76px] ${act.bgColor}`}
                    >
                      <div className="mb-2.5 text-base shrink-0">{act.icon}</div>
                      <span className="text-[9px] font-black tracking-tight leading-tight uppercase">
                        {act.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaUserGraduate className="text-2xl" />
            </div>
            <h3 className="text-slate-800 dark:text-white font-extrabold text-base">Tab content under construction</h3>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              The {activeTab} section profile dashboard will render student metrics. Please check other tabs.
            </p>
          </div>
        )}

      </div>
    );
  }

  // --- 2. STUDENTS DIRECTORY PAGE VIEW ---
  // Status tag colors
  const getStatusStyle = (status) => {
    return status === "Active"
      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      : "bg-slate-500/10 text-slate-500 border border-slate-500/20 dark:bg-white/5 dark:text-slate-400";
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 pb-20 text-slate-800 dark:text-slate-100 select-none">
      
      {/* Page Welcome Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-905 dark:text-white flex items-center gap-2">
            Hello, <span className="text-[#7C3AED] dark:text-[#A78BFA]">{teacherName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 font-medium mt-1">
            Manage and view your students.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-sm" />
            <input
              type="text"
              placeholder="Search students by name, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#7C3AED] dark:focus:border-[#7C3AED] transition-all"
            />
          </div>

          <button className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm">
            <FaRegCalendarAlt className="text-sm" />
          </button>
        </div>
      </div>

      {/* Top Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
        {/* Total Students */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{statsData.totalStudents}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FaUsers className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">Across 4 Classes</p>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Present Today</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">
                {statsData.presentToday} <span className="text-xs font-extrabold text-emerald-500">({statsData.presentTodayPercentage}%)</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FaUserGraduate className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">Today's Attendance</p>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Attendance</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{statsData.avgAttendance}%</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FaClipboardCheck className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">This Month</p>
          </div>
        </div>

        {/* Average Performance */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Performance</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{statsData.avgPerformance}%</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 flex items-center justify-center shrink-0">
              <FaChartBar className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">This Term</p>
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Performer</p>
              <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white mt-2 tracking-tight truncate leading-tight select-none">{statsData.topPerformer?.name}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FaBriefcase className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-amber-500">{statsData.topPerformer?.average}% Average</p>
          </div>
        </div>
      </div>

      {/* Directory Main List Card Container */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Table Title Header bar */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">My Students</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">Dashboard &gt; My Students</p>
        </div>

        {/* Filter controls row */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#090f20]/50 border-b border-slate-150/40 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-700 dark:text-slate-300 focus:border-[#7C3AED]"
            >
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Section filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-700 dark:text-slate-300 focus:border-[#7C3AED]"
            >
              {sectionsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-700 dark:text-slate-300 focus:border-[#7C3AED]"
            >
              {statusList.map(st => <option key={st} value={st}>{st === 'All Status' ? 'All Status' : st}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white dark:bg-[#0B132A] hover:bg-slate-50 border border-slate-200 dark:border-white/[0.08] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer shadow-sm">
              <FaFilter className="text-[10px]" />
              Filter
            </button>
            <button className="flex items-center gap-2 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 border border-[#7C3AED]/15 px-3.5 py-2 rounded-xl text-xs font-black text-[#7C3AED] dark:text-[#A78BFA] cursor-pointer shadow-sm">
              <FaDownload className="text-[10px]" />
              Export
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto select-text scrollbar-thin">
          <table className="w-full min-w-[760px] text-sm text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll No.</th>
                <th className="px-6 py-4">Class & Section</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-400">
                    <p className="text-xs font-bold">No students found matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const initials = s.name
                    ? s.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "S";
                  const perfStyle = getGradeColor(s.performanceGrade);
                  
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 select-none">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img
                              src={s.avatar}
                              alt={s.name}
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#A78BFA] dark:bg-[#7C3AED]/20 border border-[#7C3AED]/15 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-850 dark:text-white text-xs leading-none">{s.name}</span>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-650 dark:text-slate-300 text-xs">{s.rollNo}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 dark:text-white text-xs">Class {s.className}</span>
                        <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wide mt-1">Section {s.sectionName}</span>
                      </td>
                      <td className="px-6 py-4 select-none">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                              <PieChart>
                                <Pie
                                  data={[
                                    { value: s.attendancePercentage, color: "#10B981" },
                                    { value: 100 - s.attendancePercentage, color: "rgba(226,232,240,0.1)" }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={8}
                                  outerRadius={12}
                                  startAngle={90}
                                  endAngle={-270}
                                  dataKey="value"
                                >
                                  <Cell fill="#10B981" />
                                  <Cell fill="rgba(226,232,240,0.1)" />
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <span className="text-xs font-black text-slate-850 dark:text-white">{s.attendancePercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 select-none">
                        <span className="flex items-center gap-2">
                          <span className={`text-xs font-black w-6 ${perfStyle}`}>{s.performanceGrade}</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.performancePercentage}%</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 select-none">
                        <span className={`inline-flex items-center text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wide ${getStatusStyle(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 select-none">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => fetchStudentDetails(s._id)}
                            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-[#0B132A] hover:bg-[#7C3AED]/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-450 hover:text-[#7C3AED] transition-all cursor-pointer shadow-sm"
                            title="Quick View"
                          >
                            <FaSearch className="text-[10px]" />
                          </button>
                          <button
                            onClick={() => fetchStudentDetails(s._id)}
                            className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#7C3AED]/20 transition-all cursor-pointer shadow-sm"
                            title="View Profile"
                          >
                            <FaUser className="text-[10px]" />
                          </button>
                          <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-[#0B132A] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 transition-all cursor-pointer">
                            <FaEllipsisV className="text-[10px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar footer */}
        {filteredStudents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-white/5 px-6 py-5 gap-4 text-xs font-bold text-slate-450 dark:text-slate-500 select-none">
            <span>Showing 1 to {Math.min(10, filteredStudents.length)} of {filteredStudents.length} students</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40" disabled>
                <FaChevronLeft className="text-[9px]" />
              </button>
              <button className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md cursor-pointer">
                1
              </button>
              <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                2
              </button>
              <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                3
              </button>
              <span className="px-1 text-slate-350 select-none">...</span>
              <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                13
              </button>
              <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                <FaChevronRight className="text-[9px]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyStudents;
