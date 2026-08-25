import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FaGraduationCap,
  FaClock,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaSchool,
  FaUserCircle,
  FaCamera,
  FaDesktop,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaBookOpen,
  FaCalendarAlt,
  FaInfoCircle,
  FaThLarge,
  FaTimes,
  FaBell,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaFileAlt,
  FaHeadphones,
  FaArrowRight
} from "react-icons/fa";
import UserProfile from "../../components/UserProfile";
import GlobalEvents from "../modules/student/pages/GlobalEvents";
import SchoolDirectory from "../modules/student/pages/SchoolDirectory";
import SchoolDetails from "../modules/student/pages/SchoolDetails";
import StudentExams from "../modules/student/pages/StudentExams";
import AboutAppPage from "../modules/student/pages/AboutAppPage";
import StudentSupport from "../modules/student/pages/StudentSupport";
import { useTheme } from "../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

function PendingApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState({ name: "Loading...", email: "", role: "", avatar: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/pending/events")) return "events";
    if (path.startsWith("/pending/schools") || path.startsWith("/pending/school")) return "schools";
    if (path.startsWith("/pending/exams")) return "exams";
    if (path.startsWith("/pending/profile")) return "profile";
    if (path.startsWith("/pending/about")) return "about";
    if (path.startsWith("/pending/support")) return "support";
    return "status"; // default
  };

  const activeTab = getActiveTab();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
    return new Date(dateStr).toLocaleString("en-US", options);
  };

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return "";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateStr).getDay()];
  };

  const formatExamDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const dayName = getDayOfWeek(dateStr);
    return `${day} ${month} ${year} (${dayName})`;
  };

  const getSchoolLocation = (schoolName) => {
    if (!schoolName) return "Siwan, Bihar";
    const name = schoolName.toLowerCase();
    if (name.includes("prince")) return "Noida, U.P.";
    if (name.includes("bright")) return "Patna, Bihar";
    return "Siwan, Bihar";
  };

  // Poll for role assignment updates
  useEffect(() => {
    if (!token) return;

    const checkRoleStatus = () => {
      axios
        .get(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            if (res.data.role && res.data.role !== "unassigned") {
              // Update token and role in localStorage
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("role", res.data.role);
              localStorage.setItem("name", res.data.name);

              // Redirect automatically without requiring reload/logout
              if (res.data.role === "superadmin") {
                navigate("/superadmin/dashboard");
              } else if (res.data.role === "admin") {
                navigate("/admin/dashboard");
              } else if (res.data.role === "teacher") {
                navigate("/teacher/dashboard");
              } else if (res.data.role === "student") {
                navigate("/student/dashboard");
              }
            }
          }
        })
        .catch((err) => {
          console.error("Polling profile status error:", err);
        });
    };

    checkRoleStatus(); // Run once immediately
    const interval = setInterval(checkRoleStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate, API, token]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Sidebar link highlight helper
  const isLinkActive = (tabName) => activeTab === tabName;

  // Renders the specific subroute/tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "events":
        return <GlobalEvents />;
      case "schools":
        // Check if viewing details of a specific school
        const match = location.pathname.match(/\/pending\/schools\/(.+)/);
        if (match) {
          return <SchoolDetails />;
        }
        return <SchoolDirectory />;
      case "exams":
        return <StudentExams />;
      case "profile":
        return <UserProfile />;
      case "about":
        return <AboutAppPage />;
      case "support":
        return <StudentSupport />;
      case "status":
      default:
        return (
          <div className="w-full flex flex-col gap-6 max-w-xl mx-auto py-2">
            
            {/* RENDER PERSONAL STATUS STATES A, B, C, D */}

            {user.requestStatus === "rejected" ? (
              /* State D: Rejected */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-rose-555 bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-550 dark:text-rose-455 shadow-sm">
                  <FaExclamationTriangle className="text-3xl animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Application Unsuccessful</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mt-2.5">
                    Your request to join <strong className="text-slate-800 dark:text-white font-bold">{user.requestedSchool || "the campus"}</strong> was not approved by the administrator.
                  </p>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                  You can browse other registered schools and submit a request to join another campus.
                </p>
                <Link
                  to="/pending/schools"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
                >
                  Browse Schools
                </Link>
              </div>
            ) : user.requestStatus === "scheduled" ? (
              /* State B1: Entrance Exam Scheduled (Application Accepted UI) */
              <>
                {/* Top header */}
                <div className="flex items-center w-full mb-2 relative py-1">
                  <Link to="/pending" className="absolute left-0 p-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10">
                    <FaChevronLeft className="text-xs" />
                  </Link>
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white mx-auto">Application Status</h1>
                </div>

                {/* Application Accepted Banner */}
                <div className="w-full bg-[#171C35] rounded-3xl border border-violet-500/20 shadow-xl p-6 text-center relative overflow-hidden flex flex-col items-center">
                  {/* Glowing check card container */}
                  <div className="relative w-full max-w-[220px] h-[110px] rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-800 flex items-center justify-center shadow-lg border border-violet-500/30 overflow-hidden mb-5">
                    {/* Confetti decoration */}
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="2" fill="yellow"/><circle cx="80" cy="20" r="1.5" fill="red"/><rect x="40" y="70" width="3" height="3" fill="blue" transform="rotate(45 41.5 71.5)"/></svg>')` }} />
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center border-4 border-[#171C35] shadow-xl">
                      <FaCheckCircle className="text-xl" />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-emerald-450 tracking-wide">Application Accepted!</h2>
                  <p className="text-xs text-slate-350 font-semibold leading-relaxed mt-2.5 max-w-sm">
                    Congratulations! Your application has been accepted by <strong className="text-white font-bold">{user.requestedSchool}</strong>.
                  </p>
                </div>

                {/* School Status Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <FaSchool className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{user.requestedSchool}</h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <FaMapMarkerAlt className="text-xs shrink-0" />
                        {getSchoolLocation(user.requestedSchool)}
                      </p>
                      <span className="inline-flex items-center gap-1 px-3 py-1 mt-3.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <FaCheckCircle className="text-[9px]" /> Accepted
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
                    <FaCalendarAlt className="text-sm" />
                    <span>Accepted on {formatDate(user.updatedAt)}</span>
                  </div>
                </div>

                {/* Exam Scheduled Detail Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 text-left flex flex-col gap-5">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <FaBookOpen className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-purple-600 dark:text-purple-400">Exam Scheduled</h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium leading-normal mt-1">Your exam has been scheduled. Please check the details below.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-4 rounded-2.5xl">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <FaCalendarAlt className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Name</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">Admission Test 2025</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Date</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{formatExamDate(user.admissionExamDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Time</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">10:00 AM - 12:00 PM</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Reporting Time</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">09:30 AM</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <FaDesktop className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Mode</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{user.admissionExamMode === "Online" ? "Online Proctored" : "Offline Campus"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full mt-1">
                    <Link to="/pending/exams" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/20">
                      Go to Exam <FaChevronRight className="text-[10px]" />
                    </Link>
                    <button onClick={() => setShowInstructionsModal(true)} className="w-full border border-slate-200/60 dark:border-white/10 text-slate-655 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer">
                      <FaFileAlt className="text-xs text-slate-400" /> View Instructions
                    </button>
                  </div>
                </div>

                {/* Bottom Timeline */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-6 text-left flex flex-col gap-3">
                  <h3 className="text-slate-950 dark:text-white text-xs font-black uppercase tracking-wider mb-2 px-1">Application Timeline</h3>
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[30px] bottom-[-10px] w-[2px] bg-emerald-500" />
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Application Submitted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative mt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Application Accepted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : user.requestStatus === "exam_completed" ? (
              /* State B2: Exam Completed / Pending Placement */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-emerald-555 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                  <FaCheckCircle className="text-3xl animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Entrance Exam Completed</h2>
                  <p className="text-slate-500 dark:text-slate-450 text-xs font-black mt-2">Wait kro aapko kon sa class milta h</p>
                </div>
                
                <div className="w-full p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex flex-col gap-3 text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Score</span>
                    <span className="text-slate-800 dark:text-white font-black">{user.admissionExamScore} / {user.admissionExamTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Correct Answers</span>
                    <span className="text-emerald-500 font-black">{user.admissionExamCorrect}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Incorrect Answers</span>
                    <span className="text-rose-500 font-black">{user.admissionExamWrong}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
                  Your entrance exam results have been evaluated. Please wait until the school administrator registers your class and section.
                </p>
              </div>
            ) : user.requestedSchool ? (
              /* State B: Standard Application Pending (Under Review UI) */
              <>
                {/* Header status top bar */}
                <div className="flex items-center justify-between w-full mb-2 px-1">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Application Status</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left font-medium">Track your school application and exam status</p>
                  </div>
                  <div className="relative p-2.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-400 shrink-0">
                    <FaBell className="text-lg" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7C3AED] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#090F1C]">3</span>
                  </div>
                </div>

                {/* Current Application Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <FaSchool className="text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">Current Application</span>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-0.5">{user.requestedSchool}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <FaMapMarkerAlt className="text-xs shrink-0" />
                      {getSchoolLocation(user.requestedSchool)}
                    </p>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 mt-3.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Under Review
                    </span>
                  </div>
                </div>

                {/* Status Stepper Timeline */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-6 flex flex-col gap-6 text-left">
                  {/* Step 1: Submitted */}
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] bg-amber-500" />
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Application Submitted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaClock className="text-sm animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Under Review</p>
                      <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 font-medium">School is reviewing your application</p>
                    </div>
                  </div>

                  {/* Step 3: Accepted */}
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Accepted</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                    </div>
                  </div>

                  {/* Step 4: Exam Scheduled */}
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Exam Scheduled</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                    </div>
                  </div>

                  {/* Step 5: Exam Completed */}
                  <div className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Exam Completed</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next info box */}
                <div className="w-full bg-indigo-500/10 dark:bg-indigo-500/10 rounded-3xl border border-indigo-500/20 p-5 flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <FaShieldAlt className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400">What happens next?</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                      Once your application is accepted by the school, your exam will be scheduled and you'll be notified instantly.
                    </p>
                  </div>
                </div>

                {/* Quick Actions navigation links */}
                <div className="w-full flex flex-col gap-3">
                  <h3 className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-wider mb-1 px-1 text-left">Quick Actions</h3>
                  
                  {/* Browse Schools */}
                  <Link to="/pending/schools" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <FaSchool className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Browse Schools</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Explore & Apply</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>

                  {/* Update Profile */}
                  <Link to="/pending/profile" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <FaUserCircle className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Update Profile</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Keep your info updated</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>

                  {/* Help & Support */}
                  <Link to="/pending/support" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <FaHeadphones className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Help & Support</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Get assistance</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>
                </div>
              </>
            ) : (
              /* State A: No School Application (Initial welcome state) */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shadow-sm">
                  <FaGraduationCap className="text-3xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Login Successful!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed mt-2.5">
                    Your account is ready. Browse available schools from the School directory and submit a request to join.
                  </p>
                </div>
                <Link
                  to="/pending/schools"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
                >
                  Browse Schools
                </Link>
              </div>
            )}

            {/* Live Real-time Status footer */}
            {user.requestStatus !== "scheduled" && user.requestStatus !== "rejected" && (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-2xl border border-emerald-500/20 shadow-sm mx-auto select-none mt-2 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Checking status in real-time
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: SORA }} className="h-screen overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#090F1C] text-slate-800 dark:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 bg-white dark:bg-[#0B132A] border-r border-slate-200/60 dark:border-white/10 flex flex-col justify-between py-6 px-3 z-40 transition-all duration-200">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start lg:px-4 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black shadow-md shadow-[#7C3AED]/20">
              <FaGraduationCap className="text-xl" />
            </div>
            <span className="hidden lg:block text-lg font-black tracking-tight text-slate-900 dark:text-white">
              TeachHub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* 1. Wait Karo (Status) */}
            <Link
              to="/pending"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("status")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaClock className="text-xl shrink-0" />
              <span className="hidden lg:block">Wait Karo</span>
            </Link>

            {/* 2. Event */}
            <Link
              to="/pending/events"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("events")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaCalendarAlt className="text-xl shrink-0" />
              <span className="hidden lg:block">Event</span>
            </Link>

            {/* 3. School (Directory) */}
            <Link
              to="/pending/schools"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("schools")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaSchool className="text-xl shrink-0" />
              <span className="hidden lg:block">School</span>
            </Link>

            {/* 4. Exam */}
            <Link
              to="/pending/exams"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("exams")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaBookOpen className="text-xl shrink-0" />
              <span className="hidden lg:block">Exam</span>
            </Link>

            {/* 5. Profile */}
            <Link
              to="/pending/profile"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("profile")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaUserCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">Profile</span>
            </Link>

            {/* 6. About App */}
            <Link
              to="/pending/about"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("about")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaInfoCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">About App</span>
            </Link>
          </nav>
        </div>

        {/* Footer controls inside Sidebar */}
        <div className="space-y-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
          >
            {theme === "dark" ? <FaSun className="text-xl text-amber-500" /> : <FaMoon className="text-xl" />}
            <span className="hidden lg:block">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
          >
            <FaSignOutAlt className="text-xl shrink-0" />
            <span className="hidden lg:block">Logout</span>
          </button>

          {/* Profile Badge Footer */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-center lg:justify-start gap-3 px-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-[1.5px] shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-extrabold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name || "User"}</p>
              <p className="text-[9px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] tracking-wider uppercase mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE: Fixed Bottom Navigation Bar (Flat style with text labels) */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0B132A] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around z-[60] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none">
        {/* Wait Karo / Status */}
        <Link
          to="/pending"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("status") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaClock className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Status</span>
        </Link>

        {/* Event */}
        <Link
          to="/pending/events"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("events") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaCalendarAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Event</span>
        </Link>

        {/* School */}
        <Link
          to="/pending/schools"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("schools") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaSchool className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">School</span>
        </Link>

        {/* Exam */}
        <Link
          to="/pending/exams"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("exams") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaBookOpen className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Exam</span>
        </Link>

        {/* More */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 cursor-pointer ${
            mobileMenuOpen ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaThLarge className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE: Bottom Sheet Sliding Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed bottom-20 left-4 right-4 max-h-[75vh] bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-50 overflow-y-auto animate-slideUp text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FaGraduationCap className="text-xl text-[#7C3AED] dark:text-[#38BDF8]" />
                <span className="text-base font-extrabold text-slate-800 dark:text-white">TeachHub Pending Portal</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: Account */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Settings</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/pending/profile" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">My Profile</Link>
                  <Link to="/pending/about" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">About App</Link>
                  <Link to="/pending/support" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 col-span-2">Help & Support</Link>
                </div>
              </div>

              {/* Category: Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toggleTheme();
                  }}
                  className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline"
                >
                  Change Theme
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-550 dark:text-rose-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto pl-0 md:pl-20 lg:pl-64 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 flex items-start justify-center pt-6 md:pt-12 p-6 sm:p-12 transition-all duration-200 select-none">
        {renderTabContent()}
      </main>

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-scaleUp text-slate-700 dark:text-slate-350 relative text-left">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFileAlt className="text-purple-500 text-lg" /> Admission Exam Instructions
            </h3>
            
            <ul className="text-xs font-semibold space-y-3 mt-4 list-disc pl-5 leading-relaxed text-slate-550 dark:text-slate-400">
              <li>Ensure you are in a quiet, well-lit room for the exam.</li>
              <li>A stable internet connection of at least 2 Mbps is required.</li>
              <li>You must grant camera and screen sharing permissions for proctoring.</li>
              <li>Do not refresh or close the tab, and avoid switching tabs or windows. Doing so may submit the test automatically.</li>
              <li>Ensure your face remains fully visible to the camera at all times.</li>
            </ul>

            <div className="mt-6">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApproval;
