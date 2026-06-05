import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  FaTachometerAlt,
  FaUserGraduate,
  FaClipboardCheck,
  FaBook,
  FaCalendarAlt,
  FaAngleDown,
  FaSignOutAlt,
  FaSchool,
  FaBars,
  FaTimes,
  FaGraduationCap
} from "react-icons/fa";

function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [studentsOpen, setStudentsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const name = localStorage.getItem("name") || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isLinkActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50/70 overflow-hidden font-sans">
      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-[#0B132B] text-slate-300 p-4
          flex flex-col justify-between border-r border-white/5
          transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300
          z-50
        `}
      >
        <div className="overflow-y-auto custom-scroll flex-1">
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-2 py-4 border-b border-white/[0.04] mb-6">
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
              onClick={closeMenu}
            >
              <FaTimes />
            </button>
          </div>

          <nav className="space-y-1.5 px-1">
            <Link
              onClick={closeMenu}
              to="/teacher/dashboard"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLinkActive("/teacher/dashboard")
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <FaTachometerAlt className="text-base" /> Dashboard
            </Link>

            <Link
              onClick={closeMenu}
              to="/teacher/my-classes"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLinkActive("/teacher/my-classes")
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <FaSchool className="text-base" /> My Classes
            </Link>

            <div className="space-y-1">
              <button
                onClick={() => setStudentsOpen(!studentsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white transition-all"
              >
                <span className="flex items-center gap-3.5">
                  <FaUserGraduate className="text-base" /> Students
                </span>
                <FaAngleDown className={`transition-transform duration-200 text-xs text-slate-500 ${studentsOpen ? "rotate-180 text-white" : ""}`} />
              </button>

              {studentsOpen && (
                <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 animate-fadeIn">
                  <Link
                    onClick={closeMenu}
                    to="/teacher/my-students"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLinkActive("/teacher/my-students")
                        ? "text-teal-400 font-semibold bg-teal-500/[0.03]"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    My Students
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setAttendanceOpen(!attendanceOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white transition-all"
              >
                <span className="flex items-center gap-3.5">
                  <FaClipboardCheck className="text-base" /> Attendance
                </span>
                <FaAngleDown className={`transition-transform duration-200 text-xs text-slate-500 ${attendanceOpen ? "rotate-180 text-white" : ""}`} />
              </button>

              {attendanceOpen && (
                <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 animate-fadeIn">
                  <Link
                    onClick={closeMenu}
                    to="/teacher/mark-attendance"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLinkActive("/teacher/mark-attendance")
                        ? "text-teal-400 font-semibold bg-teal-500/[0.03]"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    Mark Attendance
                  </Link>

                  <Link
                    onClick={closeMenu}
                    to="/teacher/attendance-report"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLinkActive("/teacher/attendance-report")
                        ? "text-teal-400 font-semibold bg-teal-500/[0.03]"
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    Attendance Report
                  </Link>
                </div>
              )}
            </div>

            <Link
              onClick={closeMenu}
              to="/teacher/my-subjects"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLinkActive("/teacher/my-subjects")
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <FaBook className="text-base" /> My Subjects
            </Link>

            <Link
              onClick={closeMenu}
              to="/teacher/exam-schedule"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLinkActive("/teacher/exam-schedule")
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-inner"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <FaCalendarAlt className="text-base" /> Exam Schedule
            </Link>
          </nav>
        </div>

        {/* Logout section */}
        <div className="p-2 border-t border-white/[0.04] bg-white/[0.01] mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all active:scale-[0.98]"
          >
            <FaSignOutAlt className="text-base" /> Logout
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center gap-3">
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
                  <FaGraduationCap className="text-white text-base" />
                </div>
                <span className="text-base font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                  TeachHub
                </span>
              </div>
            </div>

            <div className="hidden md:block select-none">
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                Teacher Workspace
              </h1>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Academic Portal</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/teacher/profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <p className="text-sm font-bold text-slate-700 hidden sm:block group-hover:text-teal-600 transition duration-200">
              Welcome, <span className="font-extrabold">{name}</span>
            </p>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md shadow-teal-500/10 group-hover:shadow-teal-500/20 group-hover:scale-105 transition-all duration-200">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;