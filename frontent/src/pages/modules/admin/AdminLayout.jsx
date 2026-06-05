import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePopover, setActivePopover] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const name = localStorage.getItem("name") || "Admin";

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
        ? "bg-[#7C3AED]/20 text-[#38BDF8] border border-[#7C3AED]/30"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-x-hidden" style={{ fontFamily: SORA }}>
      {/* ── Ambient Background Glow Blobs ── */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-[120px] pointer-events-none z-0" />

      {/* ── Click-outside popover closer ── */}
      {activePopover && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setActivePopover(null)}
        />
      )}

      {/* ── DESKTOP: Left Compact Floating Sidebar ── */}
      <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-20 bg-[#0F172A]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex-col items-center justify-between py-8 z-40 select-none">
        
        {/* Logo Icon */}
        <div className="relative group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 transform hover:rotate-6 transition-all duration-300">
            <FaGraduationCap className="text-xl text-white" />
          </div>
          <span className="absolute left-16 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
            TeachHub
          </span>
        </div>

        {/* Icons Navigation Group */}
        <nav className="flex-1 flex flex-col justify-center gap-6">
          
          {/* Dashboard */}
          <div className="relative group">
            <Link
              to="/admin/dashboard"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActive("/admin/dashboard")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaTachometerAlt className="text-lg" />
            </Link>
            <span className="absolute left-14 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
              Dashboard
            </span>
          </div>

          {/* Users popover trigger */}
          <div className="relative">
            <button
              onClick={() => togglePopover("users")}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activePopover === "users" || isActive("/admin/teachers") || isActive("/admin/students")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaUsers className="text-lg" />
            </button>
            {activePopover === "users" && (
              <div className="absolute left-14 top-0 w-44 bg-[#0F172A]/98 border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-1.5">Users Management</p>
                <Link to="/admin/teachers" className={popoverLinkClass("/admin/teachers")}>Teachers</Link>
                <Link to="/admin/students" className={popoverLinkClass("/admin/students")}>Students</Link>
              </div>
            )}
          </div>

          {/* Academics popover trigger */}
          <div className="relative">
            <button
              onClick={() => togglePopover("academics")}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activePopover === "academics" || isActive("/admin/classes") || isActive("/admin/subjects")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaBook className="text-lg" />
            </button>
            {activePopover === "academics" && (
              <div className="absolute left-14 top-0 w-44 bg-[#0F172A]/98 border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-1.5">Academics</p>
                <Link to="/admin/classes" className={popoverLinkClass("/admin/classes")}>Classes</Link>
                <Link to="/admin/subjects" className={popoverLinkClass("/admin/subjects")}>Subjects</Link>
              </div>
            )}
          </div>

          {/* Assignments popover trigger */}
          <div className="relative">
            <button
              onClick={() => togglePopover("assignments")}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activePopover === "assignments" || isActive("/admin/assign-teacher-class") || isActive("/admin/assign-student-class") || isActive("/admin/assign-subject-teacher")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaClipboardCheck className="text-lg" />
            </button>
            {activePopover === "assignments" && (
              <div className="absolute left-14 top-0 w-48 bg-[#0F172A]/98 border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-1.5">Assignments</p>
                <Link to="/admin/assign-teacher-class" className={popoverLinkClass("/admin/assign-teacher-class")}>Assign Teacher</Link>
                <Link to="/admin/assign-student-class" className={popoverLinkClass("/admin/assign-student-class")}>Assign Student</Link>
                <Link to="/admin/assign-subject-teacher" className={popoverLinkClass("/admin/assign-subject-teacher")}>Assign Subject</Link>
              </div>
            )}
          </div>

          {/* Reports popover trigger */}
          <div className="relative">
            <button
              onClick={() => togglePopover("reports")}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activePopover === "reports" || isActive("/admin/attendance-report") || isActive("/admin/exam-results")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaChartBar className="text-lg" />
            </button>
            {activePopover === "reports" && (
              <div className="absolute left-14 top-0 w-48 bg-[#0F172A]/98 border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-2 mb-1.5">Reports</p>
                <Link to="/admin/attendance-report" className={popoverLinkClass("/admin/attendance-report")}>Attendance Report</Link>
                <Link to="/admin/exam-results" className={popoverLinkClass("/admin/exam-results")}>Exam Results</Link>
              </div>
            )}
          </div>

          {/* Exam Schedule */}
          <div className="relative group">
            <Link
              to="/admin/exam-schedule"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActive("/admin/exam-schedule")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaCalendarAlt className="text-lg" />
            </Link>
            <span className="absolute left-14 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
              Exam Schedule
            </span>
          </div>

          {/* Profile */}
          <div className="relative group">
            <Link
              to="/admin/profile"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isActive("/admin/profile")
                  ? "bg-gradient-to-tr from-[#7C3AED]/20 to-[#38BDF8]/20 text-[#38BDF8] border border-[#7C3AED]/30 shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FaUserCircle className="text-lg" />
            </Link>
            <span className="absolute left-14 top-3 bg-[#0F172A] border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
              My Profile
            </span>
          </div>

        </nav>

        {/* Logout Icon */}
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

      {/* ── MOBILE: Floating Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#0F172A]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-40 flex items-center justify-around px-2">
        <Link
          to="/admin/dashboard"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/admin/dashboard") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaTachometerAlt className="text-lg" />
        </Link>

        {/* Hamburger/Menu grid popup */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
            mobileMenuOpen ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaThLarge className="text-lg" />
        </button>

        <Link
          to="/admin/exam-schedule"
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            isActive("/admin/exam-schedule") ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <FaCalendarAlt className="text-lg" />
        </Link>

        {/* Circular profile avatar */}
        <Link
          to="/admin/profile"
          className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#7C3AED]/20 border border-white/20"
        >
          {name.charAt(0).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F172A]" />
        </Link>
      </nav>

      {/* ── MOBILE: Bottom Sheet Sliding Modal Menu ── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed bottom-24 left-4 right-4 max-h-[75vh] bg-[#0F172A]/98 border border-white/10 rounded-3xl p-6 shadow-2xl z-50 overflow-y-auto animate-slideUp text-slate-300">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FaGraduationCap className="text-xl text-[#38BDF8]" />
                <span className="text-base font-extrabold text-white">TeachHub Workspace</span>
              </div>
              <button
                className="text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-xl transition"
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
                  <Link to="/admin/teachers" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Teachers</Link>
                  <Link to="/admin/students" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Students</Link>
                </div>
              </div>

              {/* Category: Academics */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Academics</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin/classes" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Classes</Link>
                  <Link to="/admin/subjects" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Subjects</Link>
                </div>
              </div>

              {/* Category: Assignments */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Assignments</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/admin/assign-teacher-class" className="bg-white/5 border border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-white hover:bg-white/10">Assign Teacher</Link>
                  <Link to="/admin/assign-student-class" className="bg-white/5 border border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-white hover:bg-white/10">Assign Student</Link>
                  <Link to="/admin/assign-subject-teacher" className="bg-white/5 border border-white/[0.04] p-2.5 rounded-xl text-[10px] font-bold text-center block text-white hover:bg-white/10">Assign Subject</Link>
                </div>
              </div>

              {/* Category: Reports */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Reports</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin/attendance-report" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Attendance Report</Link>
                  <Link to="/admin/exam-results" className="bg-white/5 border border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-white hover:bg-white/10">Exam Results</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <Link to="/admin/profile" className="text-xs font-bold text-[#38BDF8] hover:underline">View Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── CANVAS: Main Layout Container ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-28 pb-24 md:pb-6 relative z-10">
        
        {/* Floating Topbar */}
        <header className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-4 mx-4 md:mx-6 mt-4 border border-slate-200/50 rounded-2xl shadow-sm z-30 select-none">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: SORA }}>
                Admin Workspace
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Control Center</p>
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
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">System Admin</p>
              </div>

              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#7C3AED]/15 group-hover:shadow-[#7C3AED]/25 group-hover:scale-105 transition-all duration-200 border border-white/20">
                  {name.charAt(0).toUpperCase()}
                </div>
                {/* Active Indicator dot */}
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
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition"
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