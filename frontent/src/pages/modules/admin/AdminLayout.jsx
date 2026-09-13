import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { usePlatform } from "../../../context/PlatformContext";
import axios from "axios";
import { performLogout } from "../../../utils/logout";
import NotificationBell from "../../../components/NotificationBell";
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
  FaInfoCircle,
  FaMoneyBillWave,
  FaUserCog,
  FaChalkboardTeacher,
  FaBars,
  FaSearch,
  FaSchool
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePopover, setActivePopover] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { platformName, logoUrl, confirmLogout } = usePlatform();
  const [requestCount, setRequestCount] = useState(0);
  const [currentSchoolName, setCurrentSchoolName] = useState(localStorage.getItem("schoolName") || "Admin Workspace");

  const [name, setName] = useState(localStorage.getItem("name") || "Admin");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");

  useEffect(() => {
    const handleProfileUpdate = () => {
      setName(localStorage.getItem("name") || "Admin");
      setAvatar(localStorage.getItem("avatar") || "");
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, []);

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
    // Poll requests count every 60 seconds for smooth background updates
    const interval = setInterval(fetchRequestCount, 60000);
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
          if (user.name) {
            localStorage.setItem("name", user.name);
            setName(user.name);
          }
          localStorage.setItem("role", user.role || "");
          const userAvatar = user.avatar || user.photo || user.profilePhoto || "";
          if (userAvatar) {
            localStorage.setItem("avatar", userAvatar);
            setAvatar(userAvatar);
          }
          if (user.token) {
            localStorage.setItem("token", user.token);
          }
        }
      })
      .catch((err) => {
        console.log("Admin profile sync error:", err);
        if (err.response && err.response.status === 401) {
          performLogout(navigate);
        }
      });
  }, []);

  const handleLogout = () => {
    confirmLogout(navigate);
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
      <aside className="hidden md:flex md:flex-col fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] py-5 px-4 z-40 select-none overflow-y-auto overscroll-contain transition-all duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="w-10 h-10 object-contain rounded-xl shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 transform hover:rotate-6 transition-all duration-300 shrink-0">
                <FaGraduationCap className="text-xl text-white" />
              </div>
            )}
            <span className="hidden lg:block text-lg font-black bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] bg-clip-text text-transparent tracking-tight truncate max-w-[140px]">
              {platformName}
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
            <Link to="/admin/payments" className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${isActive("/admin/payments") ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}>
              <FaMoneyBillWave className="text-xl" /><span className="hidden lg:block text-sm font-semibold">Payments</span>
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

            {/* About App */}
            <Link
              to="/admin/about"
              className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                isActive("/admin/about")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex-shrink-0"><FaInfoCircle className="text-xl text-[#38BDF8]" /></div>
              <span className="hidden lg:block text-sm font-semibold">About App</span>
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
            <Link to="/admin/teacher-management" className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${isActive("/admin/teacher-management") ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}>
              <div className="flex-shrink-0"><FaUserCog className="text-xl" /></div><span className="hidden lg:block text-sm font-semibold">Teacher Management</span>
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
            {/* Users */}
            <div className="w-full flex flex-col gap-1">
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
                <div className="pl-4 lg:pl-10 space-y-1 animate-fadeIn w-full">
                  <Link to="/admin/teachers" className={popoverLinkClass("/admin/teachers")}>Teachers</Link>
                  <Link to="/admin/students" className={popoverLinkClass("/admin/students")}>Students</Link>
                </div>
              )}
            </div>

            {/* Academics */}
            <div className="w-full flex flex-col gap-1">
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
                <div className="pl-4 lg:pl-10 space-y-1 animate-fadeIn w-full">
                  <Link to="/admin/classes" className={popoverLinkClass("/admin/classes")}>Classes</Link>
                  <Link to="/admin/subjects" className={popoverLinkClass("/admin/subjects")}>Subjects</Link>
                </div>
              )}
            </div>

            {/* Assignments */}
            <div className="w-full flex flex-col gap-1">
              <button
                onClick={() => togglePopover("assignments")}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer text-left w-full ${
                  activePopover === "assignments" || isActive("/admin/assign-teacher-class") || isActive("/admin/assign-student-class")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0"><FaClipboardCheck className="text-xl" /></div>
                <span className="hidden lg:block text-sm font-semibold">Assignments</span>
              </button>
              {activePopover === "assignments" && (
                <div className="pl-4 lg:pl-10 space-y-1 animate-fadeIn w-full">
                  <Link to="/admin/assign-teacher-class" className={popoverLinkClass("/admin/assign-teacher-class")}>Assign Teacher</Link>
                  <Link to="/admin/assign-student-class" className={popoverLinkClass("/admin/assign-student-class")}>Assign Student</Link>
                </div>
              )}
            </div>

            {/* Reports */}
            <div className="w-full flex flex-col gap-1">
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
                <div className="pl-4 lg:pl-10 space-y-1 animate-fadeIn w-full">
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
        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.08] pt-4">
          {/* Logout */}

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
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0B132A]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around z-[60] px-1 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none h-14">
        {/* Dashboard */}
        <Link
          to="/admin/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTachometerAlt className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Dashboard</span>
        </Link>

        {/* Events */}
        <Link
          to="/admin/events"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/events") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaCalendarAlt className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Events</span>
        </Link>

        {/* Requests */}
        <Link
          to="/admin/requests"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-all duration-200 ${
            isActive("/admin/requests") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaUserPlus className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Requests</span>
          {requestCount > 0 && (
            <span className="absolute top-1 right-2 bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              {requestCount}
            </span>
          )}
        </Link>

        {/* Support */}
        <Link
          to="/admin/support"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/admin/support") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaComments className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Support</span>
        </Link>

        {/* More */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 cursor-pointer ${
            mobileMenuOpen ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaThLarge className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE / DRAWER: Left Sliding Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex text-left select-none">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[300px] sm:w-[340px] max-w-[85vw] h-full bg-white dark:bg-[#0B132A] shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800 dark:text-slate-100 animate-slideRight">
            
            {/* Top Profile Header Card (TeachHub Purple & Blue Gradient) */}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/admin/profile");
              }}
              className="relative bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#38BDF8] p-5 text-white flex flex-col items-center text-center cursor-pointer group shrink-0 shadow-md"
            >
              {/* Close Drawer Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }}
                className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 w-7 h-7 rounded-full flex items-center justify-center text-xs transition cursor-pointer"
              >
                <FaTimes />
              </button>

              {/* Admin Photo Circle */}
              <div className="w-20 h-20 rounded-full border-4 border-white/40 shadow-xl overflow-hidden mb-3 bg-white/20 shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Admin Name */}
              <h3 className="text-base font-black tracking-tight text-white group-hover:underline">
                {name}
              </h3>
              
              {/* Role Badge */}
              <p className="text-[11px] font-bold text-white/90 mt-0.5 uppercase tracking-wider">
                SCHOOL ADMINISTRATOR
              </p>

              {/* School Name */}
              <p className="text-[10px] font-semibold text-white/80 mt-0.5 truncate max-w-[240px]">
                {currentSchoolName}
              </p>
            </div>

            {/* Live Search Filter Box */}
            <div className="p-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
            </div>

            {/* Nav Items List (Profile is #1) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {[
                { to: "/admin/profile", icon: <FaUserCircle className="text-[#7C3AED] dark:text-[#38BDF8]" />, label: "Profile" },
                { to: "/admin/dashboard", icon: <FaTachometerAlt className="text-purple-500" />, label: "Dashboard" },
                { to: "/admin/teachers", icon: <FaChalkboardTeacher className="text-indigo-500" />, label: "Teachers Directory" },
                { to: "/admin/students", icon: <FaUsers className="text-teal-500" />, label: "Students Directory" },
                { to: "/admin/teacher-management", icon: <FaUserCog className="text-[#38BDF8]" />, label: "Teacher Management" },
                { to: "/admin/requests", icon: <FaUserPlus className="text-rose-500" />, label: `Join Requests ${requestCount > 0 ? `(${requestCount})` : ''}` },
                { to: "/admin/proctoring", icon: <FaTv className="text-[#7C3AED]" />, label: "Conduct Exam" },
                { to: "/admin/classes", icon: <FaSchool className="text-blue-500" />, label: "Classes" },
                { to: "/admin/subjects", icon: <FaBook className="text-amber-500" />, label: "Subjects" },
                { to: "/admin/create-timetable", icon: <FaCalendarAlt className="text-cyan-500" />, label: "Create Timetable" },
                { to: "/admin/exam-schedule", icon: <FaCalendarAlt className="text-rose-500" />, label: "Exams Schedule" },
                { to: "/admin/events", icon: <FaCalendarAlt className="text-[#38BDF8]" />, label: "School Events" },
                { to: "/admin/appointments", icon: <FaCalendarAlt className="text-emerald-500" />, label: "Appointments" },
                { to: "/admin/assign-teacher-class", icon: <FaChalkboardTeacher className="text-indigo-500" />, label: "Assign Teacher Class" },
                { to: "/admin/assign-student-class", icon: <FaUsers className="text-purple-500" />, label: "Assign Student Class" },
                { to: "/admin/teacher-leaves", icon: <FaUserShield className="text-orange-500" />, label: "Teacher Leaves" },
                { to: "/admin/about-school", icon: <FaInfoCircle className="text-slate-400" />, label: "About School Info" },
                { to: "/admin/about", icon: <FaInfoCircle className="text-[#38BDF8]" />, label: "About App" },
                { to: "/admin/payments", icon: <FaMoneyBillWave className="text-emerald-500" />, label: "Payments Center" },
                { to: "/admin/attendance-report", icon: <FaClipboardCheck className="text-teal-500" />, label: "Attendance Report" }
              ]
                .filter(link => link.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition text-xs font-bold ${
                        active
                          ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] font-black border border-[#7C3AED]/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="text-base shrink-0">{link.icon}</span>
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Drawer Footer Logout Button */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition active:scale-95"
              >
                <span>LOGOUT</span>
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CANVAS: Main Layout Container */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 pl-0 md:pl-20 lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6 relative z-10">
        
        {/* Floating Topbar */}
        <header className="flex items-center justify-between bg-white/80 dark:bg-[#0B132A]/80 backdrop-blur-xl px-4 py-2.5 sm:px-6 sm:py-3 mx-3 md:mx-6 mt-2 md:mt-3 border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3 min-w-0">
            {/* 3-Bar Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer transition text-base flex items-center justify-center border border-slate-200/60 dark:border-white/10"
              title="Open Navigation Menu"
            >
              <FaBars />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-md md:max-w-xl" style={{ fontFamily: SORA }}>
                School: {currentSchoolName}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-[#7C3AED] dark:text-[#38BDF8] font-extrabold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          {/* User profile avatar section */}
          <div className="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <NotificationBell fullViewPath="/admin/notifications" />

            {/* Quick theme switch in header */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer transition-all duration-200 text-xs sm:text-sm shadow-xs active:scale-95 flex items-center justify-center"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <FaSun className="text-amber-400 animate-pulse text-sm" />
              ) : (
                <FaMoon className="text-purple-600 dark:text-purple-400 text-sm" />
              )}
            </button>

            <div
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-bold text-[#0F172A] dark:text-slate-250 group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition duration-200">
                  {name}
                </p>
                <p className="text-[8px] sm:text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">System Admin</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm border border-white/20 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Active Indicator dot */}
                <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-450 rounded-full border-2 border-white dark:border-[#0B132A] shadow-sm" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-300">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-xs overflow-hidden border border-white/20 shrink-0">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{name}</p>
                      <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
                        <FaUserShield className="text-[9px] text-[#38BDF8]" />
                        Administrator
                      </span>
                    </div>
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
