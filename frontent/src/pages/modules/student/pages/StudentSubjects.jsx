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
  FaRegFileAlt,
  FaBook,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaExternalLinkAlt,
  FaDownload
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

const DUMMY_SUBJECTS = [];

// Helper: Download Base64 or URL file
const downloadFile = (fileUrl, fileName = "note") => {
  if (!fileUrl) return;

  if (fileUrl.startsWith("data:")) {
    try {
      const parts = fileUrl.split(";base64,");
      const mimeType = parts[0].replace("data:", "");
      const base64Data = parts[1];
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      let ext = "pdf";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("pdf")) ext = "pdf";

      let finalName = fileName || "study_material";
      if (!finalName.toLowerCase().endsWith(`.${ext}`)) {
        finalName = `${finalName}.${ext}`;
      }

      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      return;
    } catch (err) {
      console.error("Data URL download error:", err);
    }
  }

  fetch(fileUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Network response error");
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    })
    .catch(() => {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
};

function StudentSubjects() {
  const API = import.meta.env.VITE_API_URL;
  const { theme, toggleTheme } = useTheme();

  const [dbSubjects, setDbSubjects] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // "All", "Active", "Completed"

  // Student Notes Modal State
  const [notesModalSubject, setNotesModalSubject] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [loadingStudentNotes, setLoadingStudentNotes] = useState(false);

  const openStudentNotes = (sub) => {
    setNotesModalSubject(sub);
    setLoadingStudentNotes(true);
    const token = localStorage.getItem("token");
    axios.get(`${API}/api/notes/subject/${sub._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStudentNotes(res.data || []))
      .catch(err => console.error("Error loading notes:", err))
      .finally(() => setLoadingStudentNotes(false));
  };

  // Student Chapters Modal State
  const [chaptersModalSubject, setChaptersModalSubject] = useState(null);
  const [studentChapters, setStudentChapters] = useState([]);
  const [loadingStudentChapters, setLoadingStudentChapters] = useState(false);

  const openStudentChapters = (sub) => {
    setChaptersModalSubject(sub);
    if (sub.chaptersList && sub.chaptersList.length > 0) {
      setStudentChapters(sub.chaptersList);
    } else {
      setLoadingStudentChapters(true);
      const token = localStorage.getItem("token");
      axios.get(`${API}/api/student/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const matchingSub = (res.data || []).find(s => s._id === sub._id);
          setStudentChapters(matchingSub?.chaptersList || []);
        })
        .catch(err => console.error("Error loading chapters:", err))
        .finally(() => setLoadingStudentChapters(false));
    }
  };

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
      const salt = s._id ? s._id.charCodeAt(s._id.length - 1) : i;
      const progress = typeof s.progress === "number" ? s.progress : 0;
      
      let grade = "B";
      if (progress >= 85) grade = "A";
      else if (progress >= 75) grade = "A-";
      else if (progress >= 65) grade = "B+";
      else if (progress > 0) grade = "B";
      else grade = "N/A";
      
      const chaptersCount = Array.isArray(s.chaptersList) 
        ? s.chaptersList.length 
        : (typeof s.chapters === "number" ? s.chapters : (Array.isArray(s.chapters) ? s.chapters.length : 0));
      const notesCount = typeof s.notesCount === "number" ? s.notesCount : 0;
      
      const days = ["Today, 10:00 AM", "Today, 11:00 AM", "Tomorrow", "Today, 02:00 PM"];
      const nextClass = days[salt % days.length];

      return {
        ...s,
        teacher: s.teacher || { name: "No Teacher Assigned" },
        progress,
        grade,
        chaptersCount,
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
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-505 dark:text-slate-400 font-black">
                  
                  {/* Stat 1: Chapters */}
                  <div
                    onClick={() => openStudentChapters(sub)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to view chapter list & syllabus"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaBook className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none flex items-center gap-1">
                        Chapters <FaExternalLinkAlt className="text-[7px] text-[#7C3AED]" />
                      </p>
                      <p className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline mt-1 leading-none">
                        {sub.chaptersCount || sub.chaptersList?.length || 0} Total
                      </p>
                    </div>
                  </div>

                  {/* Stat 2: Notes */}
                  <div
                    onClick={() => openStudentNotes(sub)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Click to view uploaded notes"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${visuals.style}`}>
                      <FaBookOpen className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wide leading-none flex items-center gap-1">
                        Notes <FaExternalLinkAlt className="text-[7px] text-[#7C3AED]" />
                      </p>
                      <p className="text-xs font-black text-purple-600 dark:text-purple-400 mt-1 leading-none">
                        {sub.notesCount} {sub.notesCount === 1 ? "Note" : "Notes"}
                      </p>
                    </div>
                  </div>

                  {/* Stat 3: Next Class */}
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

      {/* Student Notes Overlay Modal */}
      {notesModalSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {notesModalSubject.name} - Class Notes
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Uploaded by Teacher
                </p>
              </div>
              <button
                onClick={() => setNotesModalSubject(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingStudentNotes ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  Fetching notes...
                </div>
              ) : studentNotes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <FaBookOpen className="text-3xl text-purple-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-white">No notes uploaded for your class yet.</p>
                  <p className="text-[10px]">Your teacher will upload chapter PDFs & study photos here.</p>
                </div>
              ) : (
                studentNotes.map((note) => (
                  <div
                    key={note._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {note.fileType === "pdf" ? (
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-xs shrink-0">
                            <FaFilePdf />
                          </div>
                        ) : note.fileType === "image" ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs shrink-0">
                            <FaFileImage />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs shrink-0">
                            <FaFileAlt />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{note.title}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                            {note.className} &bull; Section {note.section}
                          </p>
                        </div>
                      </div>

                      {note.fileUrl && (
                        <button
                          type="button"
                          onClick={() => downloadFile(note.fileUrl, note.fileName || note.title)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                        >
                          <FaDownload className="text-[8px]" /> Download
                        </button>
                      )}
                    </div>

                    {note.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium pl-1">
                        {note.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Chapters Overlay Modal */}
      {chaptersModalSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaBookOpen className="text-purple-600 dark:text-purple-400 text-sm" />
                  {chaptersModalSubject.name} — Syllabus & Chapters
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {studentChapters.length} {studentChapters.length === 1 ? "Chapter" : "Chapters"} Configured by Admin / Teacher
                </p>
              </div>
              <button
                onClick={() => setChaptersModalSubject(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingStudentChapters ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  Fetching chapter details...
                </div>
              ) : studentChapters.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <FaBook className="text-3xl text-purple-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 dark:text-white">No chapters configured for this subject yet.</p>
                  <p className="text-[10px]">Your teacher or admin will add chapter titles & descriptions here.</p>
                </div>
              ) : (
                studentChapters.map((ch, idx) => {
                  const chNo = ch.chapterNo || idx + 1;
                  const title = ch.title || ch.name || `Chapter ${chNo}`;
                  const desc = ch.description || "No description provided.";
                  const status = ch.status || "Not Started";

                  let statusBadge = "bg-slate-500/10 text-slate-500 border-slate-500/20";
                  if (status === "Completed") {
                    statusBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                  } else if (status === "In Progress") {
                    statusBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                  }

                  return (
                    <div
                      key={ch._id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 space-y-2.5 hover:border-purple-500/30 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {chNo}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {title}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                              Chapter {chNo}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md border ${statusBadge}`}>
                          {status}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="pt-0.5">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 dark:border-white/5">
                          {desc}
                        </p>
                      </div>

                      {/* Topics */}
                      {ch.topics && ch.topics.length > 0 && (
                        <div className="pt-1 select-none">
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Topics Covered:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ch.topics.map((tp, tIdx) => (
                              <span
                                key={tIdx}
                                className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border ${
                                  tp.completed
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
                                }`}
                              >
                                {tp.completed ? "✓ " : "• "}{tp.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentSubjects;