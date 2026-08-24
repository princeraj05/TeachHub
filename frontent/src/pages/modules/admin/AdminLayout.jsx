import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import axios from "axios";
import {
  FaTachometerAlt,
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaChartBar,
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaGraduationCap,
  FaThLarge,
  FaTimes,
  FaUserShield,
  FaComments,
  FaSun,
  FaMoon,
  FaUserPlus,
  FaTv,
  FaInfoCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePopover, setActivePopover] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [requestCount, setRequestCount] = useState(0);
  const [currentSchoolName, setCurrentSchoolName] = useState(localStorage.getItem("schoolName") || "Admin Workspace");

  const name = localStorage.getItem("name") || "Admin";

  const fetchRequestCount = () => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API}/api/admin/users/join-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRequestCount(res.data.length);
        }
      })
      .catch((err) => console.log("Error loading request count:", err));
  };

  useEffect(() => {
    fetchRequestCount();
    // Poll requests count every 10 seconds for real-time notifications
    const interval = setInterval(fetchRequestCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const user = res.data;
        if (user) {
          localStorage.setItem("schoolName", user.schoolName || "");
          setCurrentSchoolName(user.schoolName || "Admin Workspace");
          localStorage.setItem("name", user.name || "");
          localStorage.setItem("role", user.role || "");
          if (user.token) {
            localStorage.setItem("token", user.token);
          }
        }
      })
      .catch((err) => console.log("Admin profile sync error:", err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Close menus when route changes
  useEffect(() => {
    setActivePopover(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const togglePopover = (menu) => {
    if (activePopover === menu) {
      setActivePopover(null);
    } else {
      setActivePopover(menu);
    }
  };

  const isActive = (path) => location.pathname === path;

  // SubItem Helper for Popover
  const popoverLinkClass = (path) =>
    `block px-3 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive(path)
        ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient Background Glow Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

      {/* Click-outside popover closer */}
      {activePopover && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setActivePopover(null)}
        />
      )}

      {/* DESKTOP: Left Compact/Instagram Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] flex flex-col justify-between py-8 px-4 z-40 select-none transition-all duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 transform hover:rotate-6 transition-all duration-300">
              <FaGraduationCap className="text-xl text-white" />
            </div>
            <span className="hidden lg:block text-xl font-black bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] bg-clip-text text-transparent tracking-tight">
              TeachHub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            
            {/* Dashboard */}
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/dashboard")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaTachometerAlt className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Dashboard</span>
            </Link>

            {/* About Your School */}
            <Link
              to="/admin/about-school"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/about-school")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaInfoCircle className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">About Your School</span>
            </Link>

            <Link
              to="/admin/appointments"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/appointments") ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaCalendarAlt className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Appointments</span>
            </Link>

            <Link to="/admin/create-timetable" className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${isActive("/admin/create-timetable") ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}>
              <div className="flex-shrink-0"><FaCalendarAlt className="text-xl" /></div><span className="hidden lg:block text-sm font-semibold">Create Timetable</span>
            </Link>
            <Link to="/admin/teacher-leaves" className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${isActive("/admin/teacher-leaves") ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}>
              <div className="flex-shrink-0"><FaUserShield className="text-xl" /></div><span className="hidden lg:block text-sm font-semibold">Teacher Leaves</span>
            </Link>

            {/* Join Requests */}
            <Link
              to="/admin/requests"
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/requests")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0"><FaUserPlus className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold truncate">Join Requests</span>
              </div>
              {requestCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-bounce shrink-0">
                  {requestCount}
                </span>
              )}
            </Link>

            {/* Live Proctoring */}
            <Link
              to="/admin/proctoring"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/proctoring")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaTv className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Conduct Exam</span>
            </Link>

            {/* Users */}
            <div className="relative">
              <button
                onClick={() => togglePopover("users")}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full ${
                  activePopover === "users" || isActive("/admin/teachers") || isActive("/admin/students")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0"><FaUsers className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold">Users</span>
              </button>
              {activePopover === "users" && (
                <div className="absolute left-[76px] lg:left-[246px] top-0 w-44 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 border-b border-slate-100 dark:border-white/[0.08] pb-1">Users</p>
                  <Link to="/admin/teachers" className={popoverLinkClass("/admin/teachers")}>Teachers</Link>
                  <Link to="/admin/students" className={popoverLinkClass("/admin/students")}>Students</Link>
                </div>
              )}
            </div>

            {/* Academics */}
            <div className="relative">
              <button
                onClick={() => togglePopover("academics")}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full ${
                  activePopover === "academics" || isActive("/admin/classes") || isActive("/admin/subjects")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0"><FaBook className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold">Academics</span>
              </button>
              {activePopover === "academics" && (
                <div className="absolute left-[76px] lg:left-[246px] top-0 w-44 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 border-b border-slate-100 dark:border-white/[0.08] pb-1">Academics</p>
                  <Link to="/admin/classes" className={popoverLinkClass("/admin/classes")}>Classes</Link>
                  <Link to="/admin/subjects" className={popoverLinkClass("/admin/subjects")}>Subjects</Link>
                </div>
              )}
            </div>

            {/* Assignments */}
            <div className="relative">
              <button
                onClick={() => togglePopover("assignments")}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full ${
                  activePopover === "assignments" || isActive("/admin/assign-teacher-class") || isActive("/admin/assign-student-class") || isActive("/admin/assign-subject-teacher")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0"><FaClipboardCheck className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold">Assignments</span>
              </button>
              {activePopover === "assignments" && (
                <div className="absolute left-[76px] lg:left-[246px] top-0 w-48 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 border-b border-slate-100 dark:border-white/[0.08] pb-1">Assignments</p>
                  <Link to="/admin/assign-teacher-class" className={popoverLinkClass("/admin/assign-teacher-class")}>Assign Teacher</Link>
                  <Link to="/admin/assign-student-class" className={popoverLinkClass("/admin/assign-student-class")}>Assign Student</Link>
                  <Link to="/admin/assign-subject-teacher" className={popoverLinkClass("/admin/assign-subject-teacher")}>Assign Subject</Link>
                </div>
              )}
            </div>

            {/* Reports */}
            <div className="relative">
              <button
                onClick={() => togglePopover("reports")}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full ${
                  activePopover === "reports" || isActive("/admin/attendance-report") || isActive("/admin/exam-results")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0"><FaChartBar className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold">Reports</span>
              </button>
              {activePopover === "reports" && (
                <div className="absolute left-[76px] lg:left-[246px] top-0 w-48 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 border-b border-slate-100 dark:border-white/[0.08] pb-1">Reports</p>
                  <Link to="/admin/attendance-report" className={popoverLinkClass("/admin/attendance-report")}>Attendance Report</Link>
                  <Link to="/admin/exam-results" className={popoverLinkClass("/admin/exam-results")}>Exam Results</Link>
                </div>
              )}
            </div>

            {/* Exam Schedule */}
            <Link
              to="/admin/exam-schedule"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/exam-schedule")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaCalendarAlt className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Exams</span>
            </Link>

            {/* Support */}
            <Link
              to="/admin/support"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/support")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaComments className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Support</span>
            </Link>

            {/* Events */}
            <Link
              to="/admin/events"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/events")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaCalendarAlt className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Events</span>
            </Link>

            {/* Profile */}
            <Link
              to="/admin/profile"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/profile")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaUserCircle className="text-xl" /></div>
              <span className="hidden lg:block text-sm font-semibold">Profile</span>
            </Link>

          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.08] pt-4">
          {/* Appearance Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 px-3.5 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer text-left w-full"
          >
            <div className="flex-shrink-0">
              {theme === "dark" ? <FaSun className="text-xl text-amber-500 animate-pulse" /> : <FaMoon className="text-xl" />}
            </div>
            <span className="hidden lg:block text-sm font-semibold">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3.5 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer text-left w-full"
          >
            <div className="flex-shrink-0">
              <FaSignOutAlt className="text-xl" />
            </div>
            <span className="hidden lg:block text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE: Fixed Bottom Navigation Bar (Flat style with text labels) */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0B132A] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around z-[60] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none">
        {/* Dashboard */}
        <Link
          to="/admin/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Dashboard</span>
        </Link>

        {/* Requests */}
        <Link
          to="/admin/requests"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-all duration-200 ${
            isActive("/admin/requests") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaUserPlus className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Requests</span>
          {requestCount > 0 && (
            <span className="absolute top-1.5 right-4 bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              {requestCount}
            </span>
          )}
        </Link>

        {/* Conduct Exam */}
        <Link
          to="/admin/proctoring"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/proctoring") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTv className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Conduct</span>
        </Link>

        {/* Support */}
        <Link
          to="/admin/support"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/support") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaComments className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Support</span>
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

      {/* MOBILE: Bottom Sheet Sliding Modal Menu */}
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
                <span className="text-base font-extrabold text-slate-800 dark:text-white">TeachHub Workspace</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: Users */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Users</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin/teachers" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Teachers</Link>
                  <Link to="/admin/students" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Students</Link>
                  <Link to="/admin/requests" onClick={() => setMobileMenuOpen(false)} className="relative bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">
                    Requests
                    {requestCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                        {requestCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/admin/proctoring" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Conduct Exam</Link>
                </div>
              </div>

              {/* Category: Academics */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Academics</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin/classes" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Classes</Link>
                  <Link to="/admin/subjects" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Subjects</Link>
                </div>
              </div>

              {/* Category: Assignments */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Assignments</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/admin/assign-teacher-class" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Assign Teacher</Link>
                  <Link to="/admin/assign-student-class" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Assign Student</Link>
                  <Link to="/admin/assign-subject-teacher" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Assign Subject</Link>
                </div>
              </div>

              {/* Category: Reports */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Reports</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin/attendance-report" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Attendance Report</Link>
                  <Link to="/admin/exam-results" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Exam Results</Link>
                </div>
              </div>

              {/* Category: Events */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Events</p>
                <div className="grid grid-cols-1 gap-2">
                  <Link to="/admin/events" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Manage School Events</Link>
                  <Link to="/admin/create-timetable" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Create Timetable</Link>
                  <Link to="/admin/teacher-leaves" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Teacher Leaves</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <Link to="/admin/profile" className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline">View Profile</Link>
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

      {/* CANVAS: Main Layout Container */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 pl-0 md:pl-20 lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6 relative z-10">
        
        {/* Floating Topbar */}
        <header className="flex items-center justify-between bg-white/60 dark:bg-[#0B132A]/60 backdrop-blur-md px-6 py-4 mx-4 md:mx-6 mt-4 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: SORA }}>
                School: {currentSchoolName}
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          {/* User profile avatar section */}
          <div className="relative flex items-center gap-3">
            {/* Quick theme switch in header */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 cursor-pointer transition"
            >
              {theme === "dark" ? <FaSun className="text-amber-500" /> : <FaMoon />}
            </button>

            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-bold text-[#0F172A] dark:text-slate-250 group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition duration-200">
                  {name}
                </p>
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">System Admin</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                {/* Active Indicator dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-450 rounded-full border-2 border-white dark:border-[#0B132A] shadow-sm" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-300">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white truncate">{name}</p>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
                      <FaUserShield className="text-[9px] text-[#38BDF8]" />
                      Administrator
                    </span>
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                  >
                    <FaUserCircle /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition cursor-pointer"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Canvas Contents */}
        <main className="p-4 md:p-6 flex-1 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
