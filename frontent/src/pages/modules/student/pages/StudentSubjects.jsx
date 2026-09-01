import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBookOpen,
  FaClipboardCheck,
  FaChartPie,
  FaStar,
  FaSearch,
  FaChevronRight,
  FaGraduationCap,
  FaUser,
  FaCalculator,
  FaFlask,
  FaGlobe,
  FaTimes,
  FaCalendarAlt,
  FaRegFileAlt
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

const DUMMY_SUBJECTS = [];

function StudentSubjects() {
  const API = import.meta.env.VITE_API_URL;
  const { theme, toggleTheme } = useTheme();

  const [dbSubjects, setDbSubjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // "All", "Active", "Completed"

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    Promise.all([
      axios.get(`${API}/api/student/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([subjRes, profileRes]) => {
        setDbSubjects(subjRes.data || []);
        setProfile(profileRes.data);
      })
      .catch((err) => console.log("Error loading subjects data:", err))
      .finally(() => setLoading(false));
  }, [API]);

  // Helper: Get subject initials (avatar)
  const userInitials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Helper: Decorate database subjects with performance data
  const decoratedSubjects = useMemo(() => {
    if (dbSubjects.length === 0) {
      return [];
    }

    return dbSubjects.map((s, i) => {
      // Deterministic stats based on subject ID or Index
      const salt = s._id ? s._id.charCodeAt(s._id.length - 1) : i;
      const progress = 60 + (salt % 31); // 60% - 90%
      
      let grade = "B";
      if (progress >= 85) grade = "A";
      else if (progress >= 75) grade = "A-";
      else if (progress >= 65) grade = "B+";
      
      const assignmentsTotal = 12 + (salt % 6);
      const assignmentsCompleted = Math.floor(assignmentsTotal * (progress / 100));
      
      const quizzesTotal = 10;
      const quizzesCompleted = Math.floor(quizzesTotal * (progress / 100));
      
      const notesCount = 15 + (salt % 10);
      
      const days = ["Today, 10:00 AM", "Today, 11:00 AM", "Tomorrow", "Today, 02:00 PM"];
      const nextClass = days[salt % days.length];

      return {
        ...s,
        teacher: s.teacher || { name: "No Teacher Assigned" },
        progress,
        grade,
        assignmentsCompleted,
        assignmentsTotal,
        quizzesCompleted,
        quizzesTotal,
        notesCount,
        nextClass,
        status: progress === 100 ? "Completed" : "Active"
      };
    });
  }, [dbSubjects]);

  // Helper: Resolve subject icons and color schemes
  const getSubjectVisuals = (name) => {
    const clean = (name || "").toLowerCase();
    if (clean.includes("math")) {
      return {
        icon: <FaCalculator className="text-sm" />,
        style: "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400",
        progressColor: "bg-purple-600 dark:bg-purple-500",
        gradeColor: "text-purple-600 dark:text-purple-400"
      };
    }
    if (clean.includes("science") || clean.includes("physics") || clean.includes("chem") || clean.includes("biology")) {
      return {
        icon: <FaFlask className="text-sm" />,
        style: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
        progressColor: "bg-emerald-500",
        gradeColor: "text-emerald-500"
      };
    }
    if (clean.includes("social") || clean.includes("history") || clean.includes("geography") || clean.includes("civics")) {
      return {
        icon: <FaGlobe className="text-sm" />,
        style: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
        progressColor: "bg-amber-500",
        gradeColor: "text-amber-500"
      };
    }
    // Default Fallback
    return {
      icon: <FaBookOpen className="text-sm" />,
      style: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400",
      progressColor: "bg-blue-600 dark:bg-blue-500",
      gradeColor: "text-blue-600 dark:text-blue-400"
    };
  };

  // Filtered List based on Search & Status Pill
  const filteredSubjects = useMemo(() => {
    return decoratedSubjects.filter((s) => {
      const searchMatch = searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.teacher?.name && s.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const filterMatch = activeFilter === "All" || s.status === activeFilter;

      return searchMatch && filterMatch;
    });
  }, [decoratedSubjects, searchQuery, activeFilter]);

  // Aggregate Metrics calculation
  const metrics = useMemo(() => {
    const total = decoratedSubjects.length;
    const active = decoratedSubjects.filter(s => s.status === "Active").length;
    
    let avgProgress = 0;
    if (total > 0) {
      const sum = decoratedSubjects.reduce((acc, curr) => acc + curr.progress, 0);
      avgProgress = Math.round(sum / total);
    }

    let performance = "Good";
    if (avgProgress >= 80) performance = "Excellent";
    else if (avgProgress >= 70) performance = "Good";
    else if (avgProgress >= 50) performance = "Average";
    else performance = "Need Work";

    return { total, active, avgProgress, performance };
  }, [decoratedSubjects]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing subject records...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6 text-left select-none pb-8">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Workspace
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-1">
            LEARNER CONSOLE
          </p>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-550 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Subjects section title row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">My Subjects</h2>
          <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-1">All subjects you are enrolled in this academic year.</p>
        </div>
        
        {/* Year Dropdown */}
        <div className="shrink-0 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-slate-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
          <span>Academic Year 2026</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
      </div>

      {/* Metrics Stats Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Subjects */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/25 flex items-center justify-center mb-4">
            <FaBookOpen className="text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{metrics.total}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Total Subjects</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 dark:bg-purple-500" />
        </div>

        {/* Card 2: Active Subjects */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center mb-4">
            <FaClipboardCheck className="text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{metrics.active}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Active Subjects</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 3: Average Progress */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center mb-4">
            <FaChartPie className="text-sm" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{metrics.avgProgress}%</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Average Progress</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500" />
        </div>

        {/* Card 4: Overall Performance */}
        <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center mb-4">
            <FaStar className="text-sm" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{metrics.performance}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Overall Performance</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        {/* Search input bar */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-405 dark:text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search subjects or teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl pl-10 pr-10 py-3 text-xs font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        {/* Status toggle pill switcher */}
        <div className="flex bg-slate-100 dark:bg-[#0B132A] p-1.5 rounded-2xl border border-slate-250/60 dark:border-white/[0.06] select-none self-start sm:self-auto">
          {["All", "Active", "Completed"].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4.5 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Cards list */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredSubjects.map((sub) => {
            const visuals = getSubjectVisuals(sub.name);
            return (
              <div
                key={sub._id}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/15 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header Section */}
                <div className="flex items-center justify-between gap-4 mb-4 select-none">
                  <div className="flex items-center gap-3">
                    {/* Dynamic Icon Box */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visuals.style}`}>
                      {visuals.icon}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{sub.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold flex items-center gap-1.5">
                          <FaUser className="text-[9px]" /> Teacher: {sub.teacher?.name || "Lovely Coder"}
                        </p>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 select-none">
                          {sub.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grade Badge and Link arrow */}
                  <div className="flex items-center gap-3">
                    <div className="text-right select-none">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">Grade</p>
                      <p className={`text-sm sm:text-base font-black ${visuals.gradeColor}`}>{sub.grade}</p>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0 cursor-pointer" />
                  </div>
                </div>

                {/* Progress Bar slider section */}
                <div className="py-2.5">
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-505 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{sub.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${visuals.progressColor}`}
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                </div>

                {/* Inner stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-505 dark:text-slate-400 font-black">
                  
                  {/* Stat 1: Assignments */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaRegFileAlt className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none">Assignments</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none">
                        {sub.assignmentsCompleted} / {sub.assignmentsTotal}
                      </p>
                    </div>
                  </div>

                  {/* Stat 2: Quizzes */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaClipboardCheck className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none">Quizzes</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none">
                        {sub.quizzesCompleted} / {sub.quizzesTotal}
                      </p>
                    </div>
                  </div>

                  {/* Stat 3: Notes */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaBookOpen className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none">Notes</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none">{sub.notesCount}</p>
                    </div>
                  </div>

                  {/* Stat 4: Next Class */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaCalendarAlt className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none">Next Class</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none truncate max-w-[110px]">{sub.nextClass}</p>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-8 select-none">
          <FaBookOpen className="text-slate-300 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <p className="text-xs text-slate-450 dark:text-slate-400 font-black">No enrolled subjects match your filter or search query.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
            className="mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Explore More Subjects bottom card banner */}
      <div className="bg-[#0B132A] border border-white/[0.08] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
        <div className="flex items-center gap-3 text-slate-655 dark:text-slate-400">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0 text-base">
            <FaGraduationCap className="text-sm shrink-0" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-white">Explore More Subjects</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Want to add more subjects? Contact your academic advisor.</p>
          </div>
        </div>
        
        <button
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs px-4 py-3 rounded-xl transition-all shadow-md shadow-[#7C3AED]/15 cursor-pointer flex items-center gap-1.5"
        >
          Request Subject <FaChevronRight className="text-[9px]" />
        </button>
      </div>

    </div>
  );
}

export default StudentSubjects;