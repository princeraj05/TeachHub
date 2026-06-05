import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  FaTachometerAlt,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaClipboardList,
  FaChartBar,
  FaCalendarAlt,
  FaUserCircle,
  FaAngleDown,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Logo = () => (
  <div className="flex items-center gap-3 select-none">
    <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#0b132b]">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    </div>
    <span
      className="text-xl font-extrabold tracking-tight text-white"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      TeachHub
    </span>
  </div>
);

function NavItem({ to, icon, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className={`text-base ${active ? "text-teal-400" : "text-slate-400"}`}>{icon}</span>
      {label}
    </Link>
  );
}

function Dropdown({ icon, label, children, open, onToggle }) {
  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white transition-all"
      >
        <span className="flex items-center gap-3.5">
          <span className="text-base text-slate-400">{icon}</span>
          {label}
        </span>
        <FaAngleDown
          className={`transition-transform duration-200 text-xs text-slate-500 ${open ? "rotate-180 text-white" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

function SubItem({ to, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "text-teal-400 font-semibold bg-teal-500/[0.03]"
          : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
      }`}
    >
      {label}
    </Link>
  );
}

function AdminLayout() {
  const navigate = useNavigate();

  const [usersOpen, setUsersOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const name = localStorage.getItem("name") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      className="flex min-h-screen bg-slate-50/70 overflow-hidden font-sans"
    >
      {/* ── Mobile Overlay ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-[#0B132B] flex flex-col z-50
          transform transition-transform duration-300 ease-in-out border-r border-white/5
          ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.04]">
          <Logo />
          <button
            className="md:hidden text-slate-400 hover:text-white transition p-1 bg-white/5 rounded-lg"
            onClick={closeMenu}
          >
            <FaTimes />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
              System Admin
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scroll">
          <NavItem
            to="/admin/dashboard"
            icon={<FaTachometerAlt />}
            label="Dashboard"
            onClick={closeMenu}
          />

          <Dropdown
            icon={<FaUsers />}
            label="Users"
            open={usersOpen}
            onToggle={() => setUsersOpen(!usersOpen)}
          >
            <SubItem to="/admin/teachers" label="Teachers" onClick={closeMenu} />
            <SubItem to="/admin/students" label="Students" onClick={closeMenu} />
          </Dropdown>

          <Dropdown
            icon={<FaBook />}
            label="Academics"
            open={academicsOpen}
            onToggle={() => setAcademicsOpen(!academicsOpen)}
          >
            <SubItem to="/admin/classes" label="Classes" onClick={closeMenu} />
            <SubItem to="/admin/subjects" label="Subjects" onClick={closeMenu} />
          </Dropdown>

          <Dropdown
            icon={<FaClipboardList />}
            label="Assignments"
            open={assignOpen}
            onToggle={() => setAssignOpen(!assignOpen)}
          >
            <SubItem to="/admin/assign-teacher-class" label="Assign Teacher" onClick={closeMenu} />
            <SubItem to="/admin/assign-student-class" label="Assign Student" onClick={closeMenu} />
            <SubItem to="/admin/assign-subject-teacher" label="Assign Subject" onClick={closeMenu} />
          </Dropdown>

          <Dropdown
            icon={<FaChartBar />}
            label="Reports"
            open={reportOpen}
            onToggle={() => setReportOpen(!reportOpen)}
          >
            <SubItem to="/admin/attendance-report" label="Attendance Report" onClick={closeMenu} />
            <SubItem to="/admin/exam-results" label="Exam Results" onClick={closeMenu} />
          </Dropdown>

          <NavItem
            to="/admin/exam-schedule"
            icon={<FaCalendarAlt />}
            label="Exam Schedule"
            onClick={closeMenu}
          />

          <NavItem
            to="/admin/profile"
            icon={<FaUserCircle />}
            label="Profile"
            onClick={closeMenu}
          />
        </nav>

        {/* Logout section */}
        <div className="p-4 border-t border-white/[0.04] bg-white/[0.01]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all active:scale-[0.98]"
          >
            <FaSignOutAlt className="text-base" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOP NAVBAR ── */}
        <header className="flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-200/60 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FaBars className="text-sm" />
            </button>

            {/* Mobile Logo Badge */}
            <div className="md:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/10">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0b132b]">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>
                <span className="text-base font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  TeachHub
                </span>
              </div>
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden md:block select-none">
              <h1
                className="text-base font-extrabold text-slate-800 tracking-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin Workspace
              </h1>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Control Panel</p>
            </div>
          </div>

          {/* User profile dropdown/badge */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/admin/profile")}
          >
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition duration-200">
                {name}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Administrator</p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md shadow-teal-500/10 group-hover:shadow-teal-500/20 group-hover:scale-105 transition-all duration-200">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-6 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;