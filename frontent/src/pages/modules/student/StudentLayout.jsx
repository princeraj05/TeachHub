import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardCheck,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaGraduationCap,
  FaUserCircle,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const name = localStorage.getItem("name") || "Student";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/student/dashboard", icon: <FaTachometerAlt className="text-lg" />, label: "Dashboard" },
    { to: "/student/subjects", icon: <FaBook className="text-lg" />, label: "My Subjects" },
    { to: "/student/attendance", icon: <FaClipboardCheck className="text-lg" />, label: "My Attendance" },
    { to: "/student/exams", icon: <FaFileAlt className="text-lg" />, label: "My Exams" },
    { to: "/student/support", icon: <FaComments className="text-lg" />, label: "Support Chat" },
    { to: "/student/profile", icon: <FaUser className="text-lg" />, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-x-hidden" style={{ fontFamily: SORA }}>
      {/* ── Ambient Background Glow Blobs ── */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-[120px] pointer-events-none z-0" />

      {/* ── DESKTOP: Left Compact Floating Sidebar ── */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-20 bg-[#0F172A]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex-col items-center justify-between py-8 z-40 select-none">
        
        {/* Logo */}
        <div className="relative group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 transform hover:rotate-6 transition-all duration-300">
            <FaGraduationCap className="text-2xl text-white" />
          </div>
          <span className="absolute left-16 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            TeachHub
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col justify-center gap-6">
          {navLinks.map(({ to, icon, label }, i) => (
            <div key={i} className="relative group">
              <Link
                to={to}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive(to)
                    ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {icon}
              </Link>
              <span className="absolute left-14 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
                {label}
              </span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="relative group">
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
          >
            <FaSignOutAlt className="text-lg" />
          </button>
          <span className="absolute left-14 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            Logout
          </span>
        </div>

      </aside>

      {/* ── MOBILE: Bottom Navigation Bar (Instagram Style) ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#0F172A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-40 flex items-center justify-around px-2">
        <Link
          to="/student/dashboard"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/dashboard") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
        </Link>

        <Link
          to="/student/subjects"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/subjects") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaBook className="text-lg" />
        </Link>

        <Link
          to="/student/attendance"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/attendance") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaClipboardCheck className="text-lg" />
        </Link>

        <Link
          to="/student/exams"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/student/exams") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaFileAlt className="text-lg" />
        </Link>

        {/* Circular Avatar */}
        <Link
          to="/student/profile"
          className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#7C3AED]/20 border border-white/20"
        >
          {name.charAt(0).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F172A]" />
        </Link>
      </nav>

      {/* ── CANVAS: Main Container ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-28 pb-24 md:pb-6 relative z-10">
        
        {/* Top Header */}
        <header className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-4 mx-4 md:mx-6 mt-4 border border-slate-200/50 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: SORA }}>
                Student Workspace
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Learner Console</p>
            </div>
          </div>

          {/* User profile avatar section */}
          <div className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#7C3AED] transition duration-200">
                  {name}
                </p>
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">Student</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#7C3AED]/15 group-hover:shadow-[#7C3AED]/25 group-hover:scale-105 transition-all duration-200 border border-white/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 mt-3 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-slate-300">
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
                    <FaUser /> My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition"
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