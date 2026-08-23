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
  FaTimes
} from "react-icons/fa";
import UserProfile from "../../components/UserProfile";
import GlobalEvents from "../modules/student/pages/GlobalEvents";
import SchoolDirectory from "../modules/student/pages/SchoolDirectory";
import SchoolDetails from "../modules/student/pages/SchoolDetails";
import StudentExams from "../modules/student/pages/StudentExams";
import AboutAppPage from "../modules/student/pages/AboutAppPage";
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

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/pending/events")) return "events";
    if (path.startsWith("/pending/schools") || path.startsWith("/pending/school")) return "schools";
    if (path.startsWith("/pending/exams")) return "exams";
    if (path.startsWith("/pending/profile")) return "profile";
    if (path.startsWith("/pending/about")) return "about";
    return "status"; // default
  };

  const activeTab = getActiveTab();

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
      case "status":
      default:
        return (
          <div className="w-full flex flex-col items-center justify-center max-w-xl mx-auto">
            {/* Status Card */}
            <div className="w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-200">
              {/* Ambient glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
              
              {/* Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
                <FaClock className="text-3xl animate-pulse" />
              </div>

              {/* RENDER PERSONAL STATUS STATES A, B, C, D */}

              {/* State D: Rejected */}
              {user.requestStatus === "rejected" ? (
                <div className="space-y-6">
                  <div className="px-4 py-3.5 bg-rose-500/15 border border-rose-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-rose-600 dark:text-rose-400">Join Request Rejected</p>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 font-semibold mt-1">
                        Your request to join <strong className="text-slate-800 dark:text-white font-bold">{user.requestedSchool}</strong> was not approved.
                      </p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Application Unsuccessful
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    You can browse other registered schools and submit a request to join another campus.
                  </p>
                  <Link
                    to="/pending/schools"
                    className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20"
                  >
                    Browse Schools
                  </Link>
                </div>
              ) : user.requestStatus === "scheduled" ? (
                /* State B1: Entrance Exam Scheduled */
                <div className="space-y-6">
                  <div className="px-4 py-3.5 bg-teal-500/15 border border-teal-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-teal-600 dark:text-teal-400">Admission Exam Scheduled</p>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 font-semibold mt-1">
                        Mode: <strong>{user.admissionExamMode || "Online"}</strong>
                      </p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Exam Portal Ready
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    Please visit the <strong>Exams</strong> section in the sidebar to review details and begin your entrance test.
                  </p>
                  <Link
                    to="/pending/exams"
                    className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20"
                  >
                    Go to Exams
                  </Link>
                </div>
              ) : user.requestStatus === "exam_completed" ? (
                /* State B2: Exam Completed / Pending Placement */
                <div className="space-y-6">
                  <div className="px-4 py-3.5 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-sans">Entrance Exam Completed</p>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 font-semibold mt-1">
                        Score Achieved: <strong className="text-slate-800 dark:text-white font-bold">{user.admissionExamScore} / {user.admissionExamTotal}</strong>
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-850 dark:text-white">Wait kro aapko kon sa class milta h</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Your entrance exam results have been evaluated. Please wait until the school administrator registers your class and section.
                  </p>
                </div>
              ) : user.requestedSchool ? (
                /* State B: Standard Application Pending */
                <div className="space-y-6">
                  <div className="px-4 py-3.5 bg-amber-500/15 border border-amber-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-amber-500">Pending School Approval</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-455 font-medium mt-1 leading-relaxed">
                        Applied to join <strong className="font-bold text-slate-700 dark:text-white">{user.requestedSchool}</strong> as a <strong className="font-bold text-slate-700 dark:text-white capitalize">{user.requestedRole}</strong>.
                      </p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Application Pending
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    Your request is successfully queued. Once the School Admin approves your role, you will be redirected automatically to your dashboard console.
                  </p>
                </div>
              ) : (
                /* State A: No School Application */
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Login Successful!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    Your account is ready. Browse available schools from the School section and submit a request to join a school.
                  </p>
                  <Link
                    to="/pending/schools"
                    className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20"
                  >
                    Browse Schools
                  </Link>
                </div>
              )}

              {/* Live Real-time Status footer */}
              {user.requestStatus !== "scheduled" && (
                <div className="inline-flex items-center gap-2 px-4 py-2 mt-6 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-2xl border border-teal-100/50 dark:border-teal-400/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mr-1" />
                  Checking status in real-time
                </div>
              )}
            </div>
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
      <main className="flex-1 h-screen overflow-y-auto pl-0 md:pl-20 lg:pl-64 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 flex items-center justify-center p-6 sm:p-12 transition-all duration-200 select-none">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default PendingApproval;
