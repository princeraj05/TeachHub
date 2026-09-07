import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../../context/ThemeContext";
import { performLogout } from "../../../utils/logout";
import {
  FaTachometerAlt,
  FaBook,
  FaBookOpen,
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
  FaBars,
  FaTimes,
  FaSearch
} from "react-icons/fa";

import { usePlatform } from "../../../context/PlatformContext";

const SORA = "'Sora', sans-serif";

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const { platformName, logoUrl, confirmLogout } = usePlatform();

  const [name, setName] = useState(localStorage.getItem("name") || "Student");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");

  useEffect(() => {
    const handleProfileUpdate = () => {
      setName(localStorage.getItem("name") || "Student");
      setAvatar(localStorage.getItem("avatar") || "");
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
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
          setUserProfile(user);
          if (user.name) {
            try { localStorage.setItem("name", user.name); } catch(e) {}
            setName(user.name);
          }
          const userAvatar = user.avatar || user.photo || user.profilePhoto || "";
          if (userAvatar) {
            try {
              localStorage.setItem("avatar", userAvatar);
            } catch (e) {
              console.warn("Avatar localStorage quota exceeded:", e);
            }
            setAvatar(userAvatar);
          }
        }
      })
      .catch((err) => {
        console.log("Student profile sync error:", err);
        if (err.response && err.response.status === 401) {
          performLogout(navigate);
        }
      });
  }, []);

  const handleLogout = () => {
    confirmLogout(navigate);
  };

  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Complete ordered drawer nav items (Profile is #1)
  const navLinks = [
    { to: "/student/profile", icon: <FaUserCircle className="text-[#FF6B52]" />, label: "Profile" },
    { to: "/student/dashboard", icon: <FaTachometerAlt className="text-purple-500" />, label: "Dashboard" },
    { to: "/student/attendance", icon: <FaClipboardCheck className="text-teal-500" />, label: "Attendance" },
    { to: "/student/mydiary", icon: <FaBookOpen className="text-indigo-500" />, label: "My Diary" },
    { to: "/student/subjects", icon: <FaBook className="text-blue-500" />, label: "My Subjects" },
    { to: "/student/exams", icon: <FaFileAlt className="text-amber-500" />, label: "View Marks / Exams" },
    { to: "/student/showtimetable", icon: <FaCalendarAlt className="text-rose-500" />, label: "Show Timetable" },
    { to: "/student/payments", icon: <FaCreditCard className="text-emerald-500" />, label: "Fee Statement / Pay" },
    { to: "/student/events", icon: <FaCalendarAlt className="text-cyan-500" />, label: "Events" },
    { to: "/student/teacher-on-leave", icon: <FaUserCircle className="text-orange-500" />, label: "Teacher On Leave" },
    { to: "/student/schools", icon: <FaSchool className="text-purple-500" />, label: "School Directory" },
    { to: "/student/support", icon: <FaComments className="text-[#38BDF8]" />, label: "Support Chat" },
    { to: "/student/about", icon: <FaInfoCircle className="text-slate-400" />, label: "About App" }
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient Background Glow Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

      {/* DESKTOP: Left Compact Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] flex flex-col py-5 px-4 z-40 select-none overflow-y-auto overscroll-contain transition-all duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="w-10 h-10 object-contain rounded-xl shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B52] to-[#FFA048] flex items-center justify-center shadow-lg shadow-[#FF6B52]/20 transform hover:rotate-6 transition-all duration-300 shrink-0">
                <FaGraduationCap className="text-xl text-white" />
              </div>
            )}
            <span className="hidden lg:block text-lg font-black bg-gradient-to-r from-[#FF6B52] to-[#FFA048] bg-clip-text text-transparent tracking-tight truncate max-w-[140px]">
              {platformName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-[#FF6B52]/10 text-[#FF6B52] dark:text-[#FFA048] dark:bg-[#FFA048]/10 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0 text-lg">{link.icon}</div>
                <span className="hidden lg:block text-xs font-bold">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.08] pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3.5 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer text-left w-full"
          >
            <div className="flex-shrink-0">
              <FaSignOutAlt className="text-xl" />
            </div>
            <span className="hidden lg:block text-xs font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* LEFT SLIDING NAVIGATION DRAWER (Mobile & Desktop) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] flex select-none">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-250"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[300px] sm:w-[340px] max-w-[85vw] h-full bg-white dark:bg-[#0B132A] shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800 dark:text-slate-100 animate-slideRight">
            
            {/* Top Student Header Card (Warm Sunset Gradient) */}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/student/profile");
              }}
              className="relative bg-gradient-to-br from-[#FF6B52] via-[#FF8E53] to-[#FFA048] p-5 text-white flex flex-col items-center text-center cursor-pointer group shrink-0 shadow-md"
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

              {/* Student Photo Circle */}
              <div className="w-20 h-20 rounded-full border-4 border-white/40 shadow-xl overflow-hidden mb-3 bg-white/20 shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Student Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white">
                    {name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Student Name */}
              <h3 className="text-base font-black tracking-tight text-white group-hover:underline">
                {name}
              </h3>
              
              {/* Roll / Student ID */}
              <p className="text-[11px] font-bold text-white/90 mt-0.5">
                {userProfile?.rollNo || userProfile?._id?.slice(-8).toUpperCase() || "12324633"}
              </p>

              {/* Program & Class */}
              <p className="text-[10px] font-semibold text-white/80 mt-0.5 truncate max-w-[240px]">
                {userProfile?.className ? `Class ${userProfile.className}` : "Class 10-A"} {userProfile?.section ? `(${userProfile.section})` : ""} {userProfile?.schoolName ? `- ${userProfile.schoolName}` : ""}
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
                  className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#FF6B52]/30"
                />
              </div>
            </div>

            {/* Nav Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {navLinks
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
                          ? "bg-[#FF6B52]/10 text-[#FF6B52] dark:text-[#FFA048] font-black border border-[#FF6B52]/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="text-base shrink-0">{link.icon}</span>
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Drawer Footer Logout Button (Gradient Pill Button) */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-gradient-to-r from-[#FF6B52] to-[#FFA048] hover:opacity-95 text-white font-extrabold text-xs py-3 px-5 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition active:scale-95"
              >
                <span>LOGOUT</span>
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CANVAS: Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 pl-0 md:pl-20 lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6 relative z-10">
        
        {/* Floating Top Header Bar */}
        <header className="flex items-center justify-between bg-white/80 dark:bg-[#0B132A]/80 backdrop-blur-xl px-4 py-2.5 sm:px-6 sm:py-3 mx-3 md:mx-6 mt-2 md:mt-3 border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3 min-w-0">
            {/* 3-Bar Hamburger Menu Button */}
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
                Student Console
              </h1>
              <p className="text-[9px] sm:text-[10px] text-[#FF6B52] dark:text-[#FFA048] font-extrabold uppercase tracking-widest mt-0.5">TeachHub Learner</p>
            </div>
          </div>

          {/* User profile avatar section */}
          <div className="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick theme switch in header */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 cursor-pointer transition text-xs sm:text-sm"
            >
              {theme === "dark" ? <FaSun className="text-amber-500" /> : <FaMoon />}
            </button>

            <div
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-bold text-[#0F172A] dark:text-slate-250 group-hover:text-[#FF6B52] dark:group-hover:text-[#FFA048] transition duration-200">
                  {name}
                </p>
                <p className="text-[8px] sm:text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">Student</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#FF6B52] to-[#FFA048] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm border border-white/20 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-450 rounded-full border-2 border-white dark:border-[#0B132A] shadow-sm" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-350">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs font-bold text-white truncate">{name}</p>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#FFA048] uppercase tracking-widest mt-1 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
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
                    type="button"
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
