import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { performLogout } from "../../../utils/logout";
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardCheck,
  FaFileAlt,
  FaSignOutAlt,
  FaGraduationCap,
  FaUserCircle,
  FaComments,
  FaSun,
  FaMoon,
  FaCalendarAlt,
  FaSchool,
  FaInfoCircle,
  FaCreditCard,
  FaThLarge,
  FaTimes
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const name = localStorage.getItem("name") || "Student";

  const handleLogout = () => {
    performLogout(navigate);
  };

  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/student/dashboard", icon: <FaTachometerAlt className="text-xl" />, label: "Dashboard" },
    { to: "/student/subjects", icon: <FaBook className="text-xl" />, label: "My Subjects" },
    { to: "/student/attendance", icon: <FaClipboardCheck className="text-xl" />, label: "My Attendance" },
    { to: "/student/exams", icon: <FaFileAlt className="text-xl" />, label: "My Exams" },
    { to: "/student/support", icon: <FaComments className="text-xl" />, label: "Support Chat" },
    { to: "/student/events", icon: <FaCalendarAlt className="text-xl" />, label: "Events" },
    { to: "/student/showtimetable", icon: <FaCalendarAlt className="text-xl" />, label: "Show Timetable" },
    { to: "/student/teacher-on-leave", icon: <FaUserCircle className="text-xl" />, label: "Teacher On Leave" },
    { to: "/student/schools", icon: <FaSchool className="text-xl" />, label: "School" },
    { to: "/student/about", icon: <FaInfoCircle className="text-xl" />, label: "About App" },
    { to: "/student/payments", icon: <FaCreditCard className="text-xl" />, label: "Pay School Fee" },
    { to: "/student/profile", icon: <FaUserCircle className="text-xl" />, label: "Profile" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient Background Glow Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

      {/* DESKTOP: Left Compact/Instagram Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] flex flex-col py-5 px-4 z-40 select-none overflow-y-auto overscroll-contain transition-all duration-200">
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
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0">{link.icon}</div>
                <span className="hidden lg:block text-sm font-semibold">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.08] pt-4">
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
          to="/student/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/student/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Dashboard</span>
        </Link>

        {/* My Subjects */}
        <Link
          to="/student/subjects"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/student/subjects") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaBook className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Subjects</span>
        </Link>

        {/* My Attendance */}
        <Link
          to="/student/attendance"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/student/attendance") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaClipboardCheck className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Attendance</span>
        </Link>

        {/* My Exams */}
        <Link
          to="/student/exams"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/student/exams") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaFileAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Exams</span>
        </Link>

        {/* More */}
        <Link
          to="/student/profile"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/student/profile") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaThLarge className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">More</span>
        </Link>
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
                <span className="text-base font-extrabold text-slate-800 dark:text-white">TeachHub Student Panel</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: Social / Support */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Connect</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/student/support" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Support Chat</Link>
                  <Link to="/student/events" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Events</Link>
                </div>
              </div>

              {/* Category: School Info */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">School</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/student/schools" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">School Directory</Link>
                  <Link to="/student/about" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">About App</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <Link to="/student/profile" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline">View Profile</Link>
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

      {/* CANVAS: Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 pl-0 md:pl-20 lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6 relative z-10">
        
        {/* Top Header */}
        <header className="flex items-center justify-between bg-white/60 dark:bg-[#0B132A]/60 backdrop-blur-md px-6 py-4 mx-4 md:mx-6 mt-4 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: SORA }}>
                Student Workspace
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Learner Console</p>
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
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">Student</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-450 rounded-full border-2 border-white dark:border-[#0B132A] shadow-sm" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-350">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white truncate">{name}</p>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#38BDF8] uppercase tracking-widest mt-1 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
                      Student Account
                    </span>
                  </div>
                  <Link
                    to="/student/profile"
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

        {/* Page contents */}
        <main className="p-4 md:p-6 flex-1 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
