import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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
  FaFolderOpen,
  FaStickyNote,
  FaGraduationCap,
  FaBookOpen,
  FaTimes,
  FaPrint,
  FaCalendarCheck,
  FaExclamationCircle
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
  
  // Directory Filters
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");

  // Student Profile detail state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Phase 3 Modal & Detailed View States
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [examFilter, setExamFilter] = useState("All");
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

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
    setAttendanceFilter("All");
    setExamFilter("All");
    setSelectedExamDetail(null);
    setSelectedAssignmentDetail(null);
    setShowReportCardModal(false);
  };

  // Helper to determine performance grade color
  const getGradeColor = (grade) => {
    if (!grade || grade === "N/A") return "text-slate-400";
    if (grade.startsWith("A")) return "text-emerald-500";
    if (grade.startsWith("B")) return "text-blue-500";
    if (grade.startsWith("C")) return "text-amber-500";
    return "text-rose-500";
  };

  // Directory filter lists
  const classesList = ["All Classes", ...new Set(students.map(s => s.className))];
  const sectionsList = ["All Sections", ...new Set(students.map(s => s.sectionName))];
  const statusList = ["All Status", "Active", "Inactive"];

  // Filter directory students array
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

    // Attendance filtered history
    const filteredAttendanceHistory = (details.attendanceHistory || []).filter(rec => {
      if (attendanceFilter === "All") return true;
      if (attendanceFilter === "Present") return rec.status === "Present";
      if (attendanceFilter === "Absent") return rec.status === "Absent";
      if (attendanceFilter === "Late") return rec.status === "Late";
      if (attendanceFilter === "Leave") return rec.status === "Leave" || rec.status === "On Leave";
      return true;
    });

    // Subject-wise attendance calculation
    const subjectAttendanceMap = {};
    (details.attendanceHistory || []).forEach(a => {
      const sub = a.subjectName || "General Attendance";
      if (!subjectAttendanceMap[sub]) {
        subjectAttendanceMap[sub] = { total: 0, present: 0 };
      }
      subjectAttendanceMap[sub].total++;
      if (a.status === "Present") subjectAttendanceMap[sub].present++;
    });
    const subjectAttendanceList = Object.keys(subjectAttendanceMap).map(sub => ({
      subjectName: sub,
      total: subjectAttendanceMap[sub].total,
      present: subjectAttendanceMap[sub].present,
      percentage: Math.round((subjectAttendanceMap[sub].present / subjectAttendanceMap[sub].total) * 100)
    }));

    // Exam filtered list
    const filteredExams = (details.allExams || []).filter(ex => {
      if (examFilter === "All") return true;
      if (examFilter === "Evaluated") return ex.status === "Evaluated" || ex.status === "Attempted";
      if (examFilter === "Not Taken") return ex.status === "Not Taken" || ex.status === "Scheduled";
      return true;
    });

    const quickActions = [
      {
        label: "Send Message",
        icon: <FaEnvelopeOpen />,
        bgColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        onClick: () => navigate("/teacher/support", {
          state: {
            activeTab: "students",
            studentId: details.studentId,
            email: details.email,
            studentName: details.name
          }
        })
      },
      { label: "View Attendance", icon: <FaClipboardCheck />, bgColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", onClick: () => setActiveTab("Attendance") },
      { label: "View Exam Results", icon: <FaChartBar />, bgColor: "bg-blue-500/10 text-blue-500 border-blue-500/20", onClick: () => setActiveTab("Exams") },
      { label: "View Assignments", icon: <FaFileAlt />, bgColor: "bg-amber-500/10 text-amber-500 border-amber-500/20", onClick: () => setActiveTab("Assignments") },
      { label: "Add Note", icon: <FaRegEdit />, bgColor: "bg-rose-500/10 text-rose-500 border-rose-500/20", onClick: () => setActiveTab("Notes") },
      { label: "Download Report", icon: <FaDownload />, bgColor: "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20", onClick: () => setShowReportCardModal(true) }
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
    <div style={{ fontFamily: SORA }} className="space-y-6 pb-32 text-slate-800 dark:text-slate-100 select-none">
        
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
            <button 
              onClick={() => setShowReportCardModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <FaPrint />
              Report Card
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
                  <FaEnvelope className="text-slate-400" /> Email: {details.email ? (
                    <a href={`mailto:${details.email}`} className="text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-extrabold truncate">
                      {details.email}
                    </a>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300 font-extrabold">N/A</span>
                  )}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <FaPhone className="text-slate-400" /> Phone: {details.phone ? (
                    <a href={`tel:${details.phone}`} className="text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-extrabold">
                      {details.phone}
                    </a>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300 font-extrabold">N/A</span>
                  )}
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
                    Session Log
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
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
                    Current Term
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 items-center py-2 select-none">
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner h-[90px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Grade</span>
                    <span className={`text-3xl font-black mt-2 leading-none ${getGradeColor(details.academicPerformance?.overallGrade)}`}>
                      {details.academicPerformance?.overallGrade || "N/A"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase leading-none">
                      {details.academicPerformance?.overallGrade?.startsWith("A") ? "Excellent" : "Academic Grade"}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner h-[90px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Average Score</span>
                    <span className="text-3xl font-black text-blue-500 mt-2 leading-none">{details.academicPerformance?.averageScore}%</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase leading-none">Overall Score</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-150/40 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-inner h-[76px]">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Highest Score</span>
                    <span className="text-xs font-black text-emerald-500 mt-1 leading-none">{details.academicPerformance?.highestScore}</span>
                    <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 mt-1.5 truncate w-full">{details.academicPerformance?.highestSubject}</span>
                  </div>

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

                <div className="space-y-3.5 flex-1 max-h-[190px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {details.subjects && details.subjects.length > 0 ? (
                    details.subjects.map((sub, idx) => (
                      <div key={idx} className="space-y-1.5 select-none leading-none">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{sub.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-black">
                              {sub.average > 0 ? `${sub.average}%` : "No result"}
                            </span>
                            {sub.grade !== "N/A" && (
                              <span className={`text-[9px] font-extrabold px-1 rounded uppercase tracking-wider ${getGradeColor(sub.grade)} bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5`}>
                                {sub.grade}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              sub.average >= 90 ? 'bg-emerald-500' : sub.average >= 80 ? 'bg-blue-500' : sub.average >= 60 ? 'bg-amber-500' : 'bg-slate-300'
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
                          <tr key={exam._id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedExamDetail(exam)}>
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
                          <tr key={ass.id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors cursor-pointer" onClick={() => setSelectedAssignmentDetail(ass)}>
                            <td className="py-2.5 font-bold text-slate-805 dark:text-white leading-tight">
                              {ass.name}
                              <span className="block text-[8px] text-slate-400 font-bold mt-1">
                                Due: {new Date(ass.dueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-slate-400 font-semibold">{ass.subjectName}</td>
                            <td className="py-2.5 text-right font-black">
                              <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                ass.status === 'Submitted' || ass.status === 'Completed'
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
                      onClick={act.onClick}
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
        ) : activeTab === "Attendance" ? (
          <div className="space-y-6">
            {/* Summary metrics header */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall</span>
                <span className="text-2xl font-black text-[#7C3AED] dark:text-[#A78BFA] mt-1">{details.attendanceOverview?.percentage ?? 0}%</span>
              </div>
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</span>
                <span className="text-2xl font-black text-emerald-500 mt-1">{details.attendanceOverview?.present ?? 0}</span>
              </div>
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</span>
                <span className="text-2xl font-black text-rose-500 mt-1">{details.attendanceOverview?.absent ?? 0}</span>
              </div>
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late</span>
                <span className="text-2xl font-black text-amber-500 mt-1">{details.attendanceOverview?.late ?? 0}</span>
              </div>
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave</span>
                <span className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1">{details.attendanceOverview?.leave ?? 0}</span>
              </div>
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1">{details.attendanceOverview?.total ?? 0}</span>
              </div>
            </div>

            {/* Subject-wise Attendance Breakdown Card (if applicable) */}
            {subjectAttendanceList.length > 0 && (
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaCalendarCheck className="text-[#7C3AED]" /> Subject-Wise Attendance Distribution
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjectAttendanceList.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white truncate">{item.subjectName}</span>
                        <span className="text-xs font-black text-[#7C3AED]">{item.percentage}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Present: {item.present} / {item.total} sessions
                      </p>
                      <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#7C3AED] h-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance session log table */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3 gap-3">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaClipboardCheck className="text-[#7C3AED]" /> Attendance Session History
                </h2>
                
                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/40 dark:border-white/5">
                  {["All", "Present", "Absent", "Late", "Leave"].map(st => (
                    <button
                      key={st}
                      onClick={() => setAttendanceFilter(st)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                        attendanceFilter === st
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAttendanceHistory.length > 0 ? (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-white/5 pb-2">
                        <th className="py-2">Date</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Class / Subject</th>
                        <th className="py-2">Marked By</th>
                        <th className="py-2 text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
                      {filteredAttendanceHistory.map((rec) => (
                        <tr key={rec._id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 font-bold text-slate-800 dark:text-white">
                            {new Date(rec.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center text-[9px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                              rec.status === "Present"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : rec.status === "Absent"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : rec.status === "Late"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold">
                            {rec.className} • <span className="text-slate-400">{rec.subjectName}</span>
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">
                            {rec.teacherName}
                          </td>
                          <td className="py-3 text-right text-slate-400 italic">
                            {rec.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xl mb-3">
                    <FaClipboardCheck />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-extrabold text-sm">No attendance records found</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">No daily attendance logs exist for this filter condition under the current school.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Exams" ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3 gap-3">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaChartBar className="text-[#7C3AED]" /> Scheduled & Attempted Examinations
                </h2>
                
                {/* Exam Filters */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/40 dark:border-white/5">
                  {["All", "Evaluated", "Not Taken"].map(st => (
                    <button
                      key={st}
                      onClick={() => setExamFilter(st)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                        examFilter === st
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.map((ex) => (
                    <div 
                      key={ex._id} 
                      onClick={() => setSelectedExamDetail(ex)}
                      className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4.5 flex flex-col justify-between space-y-3 hover:border-[#7C3AED]/40 cursor-pointer transition-all shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] tracking-wider">
                            {ex.subjectName}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">{ex.title}</h3>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1">
                            Date: {new Date(ex.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wider shrink-0 ${
                          ex.status === "Evaluated" || ex.status === "Attempted"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {ex.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-white/5 pt-3 text-xs font-bold">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Max Marks: <strong className="text-slate-800 dark:text-slate-200">{ex.maxMarks}</strong></span>
                        {ex.status === "Not Taken" ? (
                          <span className="text-amber-500 text-xs font-extrabold">Not Taken</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-black text-sm">{ex.score}%</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${getGradeColor(ex.grade)} bg-slate-50 dark:bg-white/5`}>
                              {ex.grade}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xl mb-3">
                    <FaChartBar />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-extrabold text-sm">No exams found</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">No examination records match this filter condition.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Assignments" ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaFileAlt className="text-[#7C3AED]" /> Class Homework & Assignments (MyDiary)
                </h2>
                <span className="text-[10px] font-bold text-slate-400">Total Assignments: {details.assignments?.length || 0}</span>
              </div>

              {details.assignments && details.assignments.length > 0 ? (
                <div className="space-y-3.5">
                  {details.assignments.map((ass) => (
                    <div 
                      key={ass.id} 
                      onClick={() => setSelectedAssignmentDetail(ass)}
                      className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#7C3AED]/40 cursor-pointer transition-all shadow-xs hover:shadow-md"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] bg-[#7C3AED]/10 px-2 py-0.5 rounded border border-[#7C3AED]/20">
                            {ass.subjectName}
                          </span>
                          {ass.types?.map((t, idx) => (
                            <span key={idx} className="text-[8px] font-bold text-slate-500 bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{ass.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ass.description}</p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-2">
                          <span>Assigned By: <strong className="text-slate-700 dark:text-slate-300">{ass.teacherName}</strong></span>
                          <span>Due Date: <strong className="text-slate-700 dark:text-slate-300">{new Date(ass.dueDate).toLocaleDateString()}</strong></span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border tracking-wider ${
                          ass.status === "Submitted" || ass.status === "Completed" || ass.status === "Reviewed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {ass.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xl mb-3">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-extrabold text-sm">No assignments found</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">No MyDiary homework tasks have been assigned for this student's class.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Performance" ? (
          <div className="space-y-6">
            {/* Academic Performance Top Summary Card */}
            <div className="bg-gradient-to-tr from-[#7C3AED] to-indigo-600 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
                  <FaGraduationCap />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                    Published Academic Performance
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">{details.name}'s Academic Summary</h2>
                  <p className="text-xs text-white/80 font-medium">
                    Overall Grade: <strong>{details.academicPerformance?.overallGrade || "N/A"}</strong> • Average Score: <strong>{details.academicPerformance?.averageScore || 0}%</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-center">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Highest</p>
                  <p className="text-sm font-black text-emerald-300">{details.academicPerformance?.highestScore}</p>
                  <p className="text-[9px] font-semibold text-white/90 truncate max-w-[100px]">{details.academicPerformance?.highestSubject}</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Lowest</p>
                  <p className="text-sm font-black text-amber-300">{details.academicPerformance?.lowestScore}</p>
                  <p className="text-[9px] font-semibold text-white/90 truncate max-w-[100px]">{details.academicPerformance?.lowestSubject}</p>
                </div>
              </div>
            </div>

            {/* Subject Performance Bar Chart */}
            {details.subjects && details.subjects.length > 0 && (
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <FaChartBar className="text-[#7C3AED]" /> Subject Performance Chart
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={details.subjects}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#888888" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                        formatter={(value) => [`${value}%`, "Average Score"]}
                      />
                      <Bar dataKey="average" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Published Report Cards List */}
            <div className="space-y-6">
              {details.publishedResults && details.publishedResults.length > 0 ? (
                details.publishedResults.map((res) => (
                  <div key={res._id} className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] tracking-wider">
                          {res.academicYear} • {res.examTerm} Examination
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                          Official Published Report Card
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border tracking-wider ${
                          res.overallResult === "PASS"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          {res.overallResult}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {res.totalMarksObtained} / {res.totalMaxMarks} ({res.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Subject marks table */}
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] font-black border-b border-slate-100 dark:border-white/5 pb-2">
                            <th className="py-2">Subject Name</th>
                            <th className="py-2 text-center">Marks Obtained</th>
                            <th className="py-2 text-center">Max Marks</th>
                            <th className="py-2 text-center">Percentage</th>
                            <th className="py-2 text-right">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
                          {res.marks.map((m) => (
                            <tr key={m._id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-colors">
                              <td className="py-2.5 font-extrabold text-slate-800 dark:text-white">{m.subjectName}</td>
                              <td className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-300">{m.marksObtained}</td>
                              <td className="py-2.5 text-center text-slate-400 font-semibold">{m.maxMarks}</td>
                              <td className="py-2.5 text-center font-black text-slate-900 dark:text-white">{m.percentage}%</td>
                              <td className="py-2.5 text-right font-black">
                                <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border uppercase ${getGradeColor(m.grade)} bg-slate-50 dark:bg-white/5`}>
                                  {m.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {res.teacherRemarks && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 mt-2">
                        Teacher Remarks: "{res.teacherRemarks}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-sm select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xl mx-auto mb-3">
                    <FaGraduationCap />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-extrabold text-sm">No published academic results found</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Official report card results for Half-Yearly or Annual terms have not been published yet for this student.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Subjects" ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaBookOpen className="text-[#7C3AED]" /> Enrolled Class Subjects
                </h2>
                <span className="text-[10px] font-bold text-slate-400">Total Subjects: {details.subjects?.length || 0}</span>
              </div>

              {details.subjects && details.subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {details.subjects.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4.5 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] bg-[#7C3AED]/10 px-2 py-0.5 rounded border border-[#7C3AED]/20">
                            Subject #{idx + 1}
                          </span>
                          {sub.grade !== "N/A" ? (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${getGradeColor(sub.grade)} bg-slate-50 dark:bg-white/5`}>
                              {sub.grade}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-200/40 dark:bg-white/5 px-2 py-0.5 rounded">
                              No result available
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{sub.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Faculty: <strong className="text-slate-700 dark:text-slate-300">{sub.teacherName || details.classTeacher || "Assigned Teacher"}</strong>
                        </p>
                      </div>

                      <div className="border-t border-slate-200/40 dark:border-white/5 pt-3 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500">Average Score</span>
                        <span className="text-slate-900 dark:text-white font-black">
                          {sub.average > 0 ? `${sub.average}%` : "No result"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xl mb-3">
                    <FaBookOpen />
                  </div>
                  <h3 className="text-slate-800 dark:text-white font-extrabold text-sm">No subjects assigned</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">No active curriculum subjects are assigned to this student's class under the current school.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "Documents" ? (
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-sm select-none">
            <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaFolderOpen />
            </div>
            <h3 className="text-slate-800 dark:text-white font-extrabold text-base">No documents available</h3>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              Document storage backend is currently not configured for individual student uploads. No uploaded certificates or documents exist for this student.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-sm select-none">
            <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaStickyNote />
            </div>
            <h3 className="text-slate-800 dark:text-white font-extrabold text-base">No notes available</h3>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
              Personal student notes model is currently not configured in backend. Class study materials are managed via My Subjects.
            </p>
          </div>
        )}

        {/* --- MODAL 1: EXAM DETAILS MODAL --- */}
        {selectedExamDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] tracking-wider">
                    {selectedExamDetail.subjectName}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedExamDetail.title || selectedExamDetail.examName}</h2>
                </div>
                <button onClick={() => setSelectedExamDetail(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Exam Date</span>
                  <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">
                    {new Date(selectedExamDetail.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Max Marks</span>
                  <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedExamDetail.maxMarks}</span>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedExamDetail.status}</span>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Score / Grade</span>
                  <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">
                    {selectedExamDetail.score !== null ? `${selectedExamDetail.score}% (${selectedExamDetail.grade})` : "Not Taken"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedExamDetail(null)} className="px-5 py-2.5 bg-[#7C3AED] text-white text-xs font-bold rounded-2xl hover:bg-[#6D28D9] transition cursor-pointer">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 2: ASSIGNMENT DETAILS MODAL --- */}
        {selectedAssignmentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#7C3AED] dark:text-[#A78BFA] tracking-wider">
                    {selectedAssignmentDetail.subjectName}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedAssignmentDetail.name}</h2>
                </div>
                <button onClick={() => setSelectedAssignmentDetail(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/5 cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{selectedAssignmentDetail.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Assigned By</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedAssignmentDetail.teacherName}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{new Date(selectedAssignmentDetail.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{selectedAssignmentDetail.status}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Category Types</span>
                    <span className="font-extrabold text-slate-800 dark:text-white mt-1 block">{(selectedAssignmentDetail.types || []).join(", ") || "Homework"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedAssignmentDetail(null)} className="px-5 py-2.5 bg-[#7C3AED] text-white text-xs font-bold rounded-2xl hover:bg-[#6D28D9] transition cursor-pointer">
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 3: REPORT CARD PRINT MODAL --- */}
        {showReportCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#7C3AED] uppercase tracking-wide">Academic Progress Report</h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Official Student Marksheet & Performance Card</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#6D28D9] transition cursor-pointer">
                    <FaPrint /> Print / Save PDF
                  </button>
                  <button onClick={() => setShowReportCardModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100 cursor-pointer">
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* Student Details Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Student Name</span>
                  <span className="font-black text-slate-800 text-sm">{details.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Roll Number</span>
                  <span className="font-extrabold text-slate-800">{details.rollNo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Admission No</span>
                  <span className="font-extrabold text-slate-800">{details.admissionNo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Class & Section</span>
                  <span className="font-extrabold text-slate-800">{details.classAndSection}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Class Teacher</span>
                  <span className="font-extrabold text-slate-800">{details.classTeacher}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Overall Grade</span>
                  <span className="font-black text-emerald-600 text-sm">{details.academicPerformance?.overallGrade || "N/A"}</span>
                </div>
              </div>

              {/* Published Result Marks Table */}
              {details.publishedResults && details.publishedResults.length > 0 ? (
                details.publishedResults.map((res, rIdx) => (
                  <div key={rIdx} className="space-y-3">
                    <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-200">
                      <span className="text-xs font-black uppercase text-[#7C3AED]">
                        {res.academicYear} • {res.examTerm} Term Result
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        Total: {res.totalMarksObtained} / {res.totalMaxMarks} ({res.percentage}%) — {res.overallResult}
                      </span>
                    </div>

                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-[9px] font-black border-b border-slate-200">
                          <th className="p-2">Subject</th>
                          <th className="p-2 text-center">Marks Obtained</th>
                          <th className="p-2 text-center">Max Marks</th>
                          <th className="p-2 text-center">Percentage</th>
                          <th className="p-2 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {res.marks.map((m, mIdx) => (
                          <tr key={mIdx}>
                            <td className="p-2 font-bold text-slate-800">{m.subjectName}</td>
                            <td className="p-2 text-center font-semibold">{m.marksObtained}</td>
                            <td className="p-2 text-center text-slate-500">{m.maxMarks}</td>
                            <td className="p-2 text-center font-bold">{m.percentage}%</td>
                            <td className="p-2 text-right font-black text-[#7C3AED]">{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 font-semibold border border-slate-200">
                  No official published report card available for this student.
                </div>
              )}

              {/* Official Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs font-bold text-slate-500">
                <div>
                  <div className="h-10 border-b border-slate-300 mb-1" />
                  <span>Class Teacher Signature</span>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 mb-1" />
                  <span>Principal Signature</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- 2. STUDENTS DIRECTORY PAGE VIEW ---
  const getStatusStyle = (status) => {
    return status === "Active"
      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      : "bg-slate-500/10 text-slate-500 border border-slate-500/20 dark:bg-white/5 dark:text-slate-400";
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 pb-32 text-slate-800 dark:text-slate-100 select-none">
      
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
      <div className="hidden grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
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
            <p className="text-[10px] font-bold text-slate-455 dark:text-slate-400">Class Directory</p>
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
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">Class Average</p>
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
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-400">Class Average</p>
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
              <tr className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
                <th className="px-6 py-4">Student</th>
                <th className="px-4 py-4">Roll No</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Attendance</th>
                <th className="px-4 py-4">Performance</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-xs">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std) => (
                  <tr 
                    key={std._id} 
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => fetchStudentDetails(std._id)}
                  >
                    {/* Name + avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {std.avatar ? (
                          <img src={std.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 font-extrabold flex items-center justify-center text-xs">
                            {std.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-white text-sm group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                            {std.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{std.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300">
                      {std.rollNo}
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-bold">
                      {std.className} {std.sectionName && `(${std.sectionName})`}
                    </td>

                    {/* Attendance % */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-white">{std.attendancePercentage}%</span>
                        <div className="w-16 bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${std.attendancePercentage >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${std.attendancePercentage}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Performance Score */}
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-slate-800 dark:text-white">
                        {typeof (std.performanceAverage ?? std.performancePercentage) === "number" && (std.performanceAverage ?? std.performancePercentage) > 0
                          ? `${std.performanceAverage ?? std.performancePercentage}%`
                          : "0%"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getStatusStyle(std.status)}`}>
                        {std.status}
                      </span>
                    </td>

                    {/* Action Arrow */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchStudentDetails(std._id);
                        }} 
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition cursor-pointer"
                      >
                        <FaChevronRight className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                    No students match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default MyStudents;
