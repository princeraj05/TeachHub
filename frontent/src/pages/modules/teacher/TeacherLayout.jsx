import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaBook,
  FaCalendarAlt,
  FaSignOutAlt,
  FaSchool,
  FaGraduationCap,
  FaThLarge,
  FaTimes,
  FaUserCircle,
  FaUserShield,
  FaComments,
  FaSun,
  FaMoon,
  FaTv
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const name = localStorage.getItem("name") || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/teacher/dashboard", icon: <FaTachometerAlt className="text-xl" />, label: "Dashboard" },
    { to: "/teacher/my-classes", icon: <FaSchool className="text-xl" />, label: "My Classes" },
    { to: "/teacher/my-students", icon: <FaUserGraduate className="text-xl" />, label: "My Students" },
    { to: "/teacher/mark-attendance", icon: <FaClipboardCheck className="text-xl" />, label: "Mark Attendance" },
    { to: "/teacher/my-subjects", icon: <FaBook className="text-xl" />, label: "My Subjects" },
    { to: "/teacher/exam-schedule", icon: <FaCalendarAlt className="text-xl" />, label: "Exams" },
    { to: "/teacher/proctoring", icon: <FaTv className="text-xl" />, label: "Conduct Exam" },
    { to: "/teacher/support", icon: <FaComments className="text-xl" />, label: "Support" },
    { to: "/teacher/events", icon: <FaCalendarAlt className="text-xl" />, label: "Events" },
    { to: "/teacher/profile", icon: <FaUserCircle className="text-xl" />, label: "Profile" }
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient Background Glow Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

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
          to="/teacher/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/teacher/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Dashboard</span>
        </Link>

        {/* My Classes */}
        <Link
          to="/teacher/my-classes"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/teacher/my-classes") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaSchool className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Classes</span>
        </Link>

        {/* Mark Attendance */}
        <Link
          to="/teacher/mark-attendance"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/teacher/mark-attendance") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaClipboardCheck className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Attendance</span>
        </Link>

        {/* Support */}
        <Link
          to="/teacher/support"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/teacher/support") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
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
                <span className="text-base font-extrabold text-slate-800 dark:text-white">TeachHub Teacher Panel</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: Students */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Students</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/teacher/my-students" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">My Students</Link>
                  <Link to="/teacher/proctoring" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Conduct Exam</Link>
                </div>
              </div>

              {/* Category: Attendance */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Attendance</p>
                <Link to="/teacher/mark-attendance" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Mark Attendance</Link>
              </div>

              {/* Category: Core Links */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Academics</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/teacher/my-subjects" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">My Subjects</Link>
                  <Link to="/teacher/exam-schedule" className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Exam Schedule</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <Link to="/teacher/profile" className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline">View Profile</Link>
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
        
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white/60 dark:bg-[#0B132A]/60 backdrop-blur-md px-6 py-4 mx-4 md:mx-6 mt-4 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight" style={{ fontFamily: SORA }}>
                Teacher Workspace
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Instructor Console</p>
            </div>
          </div>

          {/* Profile Dropdown */}
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
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">Course Instructor</p>
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
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-300">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white truncate">{name}</p>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#38BDF8] uppercase tracking-widest mt-1 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
                      <FaUserShield className="text-[9px] text-[#38BDF8]" />
                      Instructor
                    </span>
                  </div>
                  <Link
                    to="/teacher/profile"
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

export default TeacherLayout;
