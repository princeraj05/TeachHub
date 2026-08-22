import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  FaInfoCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const name = localStorage.getItem("name") || "Student";

  useEffect(() => {
    // Sync theme on load
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
    { to: "/student/schools", icon: <FaSchool className="text-xl" />, label: "School" },
    { to: "/student/about", icon: <FaInfoCircle className="text-xl" />, label: "About App" },
    { to: "/student/profile", icon: <FaUserCircle className="text-xl" />, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative overflow-x-hidden flex" style={{ fontFamily: SORA }}>
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

      {/* MOBILE: Floating Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/95 dark:bg-[#0B132A]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-45 flex items-center justify-around px-2 transition-all duration-200">
        <Link
          to="/student/dashboard"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
        </Link>

        <Link
          to="/student/subjects"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/subjects") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaBook className="text-lg" />
        </Link>

        <Link
          to="/student/attendance"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/attendance") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaClipboardCheck className="text-lg" />
        </Link>

        <Link
          to="/student/exams"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/exams") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaFileAlt className="text-lg" />
        </Link>

        {/* Theme button for mobile */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 transition-all cursor-pointer animate-none"
        >
          {theme === "dark" ? <FaSun className="text-lg text-amber-500" /> : <FaMoon className="text-lg" />}
        </button>

        {/* Circular Avatar */}
        <Link
          to="/student/profile"
          className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20"
        >
          {name.charAt(0).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-450 rounded-full border-2 border-white dark:border-[#0B132A]" />
        </Link>
      </nav>

      {/* CANVAS: Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-20 lg:pl-64 pb-24 md:pb-6 relative z-10">
        
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
                <div className="fixed inset-0 z-45" onClick={() => setProfileDropdownOpen(false)} />
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