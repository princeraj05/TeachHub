import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardCheck,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaGraduationCap
} from "react-icons/fa";

function StudentLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const name = localStorage.getItem("name") || "Student";

  const navLinks = [
    { to: "/student/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/student/subjects", icon: <FaBook />, label: "My Subjects" },
    { to: "/student/attendance", icon: <FaClipboardCheck />, label: "My Attendance" },
    { to: "/student/exams", icon: <FaFileAlt />, label: "My Exams" },
    { to: "/student/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans overflow-hidden">
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#0B132B] text-slate-300 flex flex-col transform transition-transform duration-300 border-r border-white/5
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Glow Blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-40 h-40 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FaGraduationCap className="text-xl text-[#0b132b]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              TeachHub
            </span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white transition p-1 bg-white/5 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scroll">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4 select-none">
            Navigation
          </p>
          {navLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="relative z-10 p-4 border-t border-white/[0.04] bg-white/[0.01]">
          <button
            onClick={() => { localStorage.clear(); navigate("/"); }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all w-full active:scale-[0.98]"
          >
            <FaSignOutAlt className="text-base" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-200/60 transition"
              onClick={() => setOpen(!open)}
            >
              <FaBars className="text-sm" />
            </button>
            
            {/* Mobile Logo Badge */}
            <div className="md:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/10">
                  <FaGraduationCap className="text-white text-base" />
                </div>
                <span className="text-base font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  TeachHub
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-sm text-slate-400 font-semibold tracking-wide uppercase">Student Workspace</span>
            </div>
          </div>

          <div
            onClick={() => navigate("/student/profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Welcome back,</p>
              <p className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition duration-200">{name}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md shadow-teal-500/10 group-hover:shadow-teal-500/20 group-hover:scale-105 transition-all duration-200">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;