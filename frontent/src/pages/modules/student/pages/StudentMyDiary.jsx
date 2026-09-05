import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFileAlt,
  FaFileUpload,
  FaFilter,
  FaFlask,
  FaGlobe,
  FaGraduationCap,
  FaInfoCircle,
  FaLightbulb,
  FaPaperclip,
  FaPencilAlt,
  FaQuestionCircle,
  FaSchool,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUserTie,
  FaChevronRight,
  FaCheck,
  FaExternalLinkAlt,
  FaPenNib
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

// Helper: Get subject visuals and icon
const getSubjectIcon = (subjectName) => {
  const clean = (subjectName || "").toLowerCase();
  if (clean.includes("hindi") || clean.includes("sanskrit")) {
    return { icon: <FaBook className="text-pink-500" />, bg: "bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400" };
  }
  if (clean.includes("english") || clean.includes("lit")) {
    return { icon: <FaPencilAlt className="text-blue-500" />, bg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" };
  }
  if (clean.includes("math") || clean.includes("stat")) {
    return { icon: <FaLightbulb className="text-purple-500" />, bg: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400" };
  }
  if (clean.includes("evs") || clean.includes("science") || clean.includes("chem") || clean.includes("physics") || clean.includes("bio")) {
    return { icon: <FaFlask className="text-emerald-500" />, bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" };
  }
  if (clean.includes("social") || clean.includes("history") || clean.includes("geography")) {
    return { icon: <FaGlobe className="text-amber-500" />, bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" };
  }
  return { icon: <FaGraduationCap className="text-indigo-500" />, bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" };
};

// Helper: Get type badge icon and styling
const getTypeBadge = (typeStr) => {
  const clean = (typeStr || "").toLowerCase();
  if (clean.includes("question") || clean.includes("exercise")) {
    return { label: typeStr || "Questions", icon: "❓", style: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20" };
  }
  if (clean.includes("writing") || clean.includes("write")) {
    return { label: typeStr || "Writing", icon: "📝", style: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20" };
  }
  if (clean.includes("reading") || clean.includes("read")) {
    return { label: typeStr || "Reading", icon: "📖", style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20" };
  }
  if (clean.includes("learn") || clean.includes("memorize")) {
    return { label: typeStr || "Learn", icon: "🧠", style: "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20" };
  }
  if (clean.includes("project") || clean.includes("draw")) {
    return { label: typeStr || "Project", icon: "🎨", style: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" };
  }
  if (clean.includes("practice")) {
    return { label: typeStr || "Practice", icon: "📚", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20" };
  }
  if (clean.includes("worksheet")) {
    return { label: typeStr || "Worksheet", icon: "📄", style: "bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/20" };
  }
  return { label: typeStr || "Homework", icon: "📌", style: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20" };
};

// Helper: Format date string
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "Today";
  const today = new Date().toISOString().split("T")[0];
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().split("T")[0];

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

export default function StudentMyDiary() {
  const { theme } = useTheme();
  const API = import.meta.env.VITE_API_URL || "";

  // State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [diaryData, setDiaryData] = useState({
    schoolName: "",
    className: "",
    section: "",
    date: "",
    summary: { totalHomework: 0, completed: 0, pending: 0, subjectsCount: 0 },
    homeworks: []
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Signature Inputs per homework ID
  const [parentNameInputs, setParentNameInputs] = useState({});

  // Modal State
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch Diary Data
  const fetchDiary = (dateStr, subjectFilter = "All") => {
    setLoading(true);
    const token = localStorage.getItem("token");

    let url = `${API}/api/student/mydiary?date=${dateStr}`;
    if (subjectFilter !== "All") {
      url += `&subject=${encodeURIComponent(subjectFilter)}`;
    }

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setDiaryData(res.data || {});
      })
      .catch((err) => {
        console.error("Error loading student diary:", err);
        showToast("Failed to load diary entries.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiary(selectedDate, selectedSubject);
  }, [selectedDate, selectedSubject]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Quick Date Selectors
  const handleQuickDateChange = (type) => {
    const today = new Date();
    if (type === "today") {
      setSelectedDate(today.toISOString().split("T")[0]);
    } else if (type === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(yesterday.toISOString().split("T")[0]);
    }
  };

  // Filtered Homeworks
  const filteredHomeworks = useMemo(() => {
    return (diaryData.homeworks || []).filter((hw) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        (hw.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.subjectName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.teacherName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchSubject = selectedSubject === "All" || hw.subjectName === selectedSubject;
      
      let matchStatus = true;
      if (statusFilter === "Completed") {
        matchStatus = hw.status === "Completed" || hw.status === "Submitted" || hw.status === "Reviewed";
      } else if (statusFilter === "Pending") {
        matchStatus = hw.status !== "Completed" && hw.status !== "Submitted" && hw.status !== "Reviewed";
      }

      return matchSearch && matchSubject && matchStatus;
    });
  }, [diaryData.homeworks, searchQuery, selectedSubject, statusFilter]);

  // Unique subject list for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const set = new Set((diaryData.homeworks || []).map((h) => h.subjectName));
    return Array.from(set);
  }, [diaryData.homeworks]);

  // Submit Parent Signature & Mark as Completed
  const handleMarkCompletedWithSignature = (hwId) => {
    const parentName = (parentNameInputs[hwId] || "").trim();
    if (!parentName) {
      alert("Please enter the Parent/Guardian name to sign the diary.");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("token");
    axios
      .post(
        `${API}/api/student/mydiary/${hwId}/complete`,
        { parentSignatureName: parentName, parentName: parentName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        showToast("✒️ Signed by Parent & Homework Marked Completed!");
        // Update local state
        setDiaryData((prev) => {
          const updated = prev.homeworks.map((item) =>
            item._id === hwId
              ? {
                  ...item,
                  status: "Completed",
                  parentSignatureName: parentName,
                  parentSignedAt: new Date().toISOString()
                }
              : item
          );
          const completedCount = updated.filter((i) => i.status === "Completed" || i.status === "Submitted" || i.status === "Reviewed").length;
          const pendingCount = updated.length - completedCount;
          return {
            ...prev,
            summary: { ...prev.summary, completed: completedCount, pending: pendingCount },
            homeworks: updated
          };
        });
        if (selectedHomework && selectedHomework._id === hwId) {
          setSelectedHomework((prev) => ({
            ...prev,
            status: "Completed",
            parentSignatureName: parentName,
            parentSignedAt: new Date().toISOString()
          }));
        }
      })
      .catch((err) => {
        console.error("Error signing diary:", err);
        showToast("⚠️ Could not submit signature. Try again.");
      })
      .finally(() => setActionLoading(false));
  };

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-5xl mx-auto space-y-6 text-left select-none pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-white/20">
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-sky-500/10 dark:from-violet-500/15 dark:to-sky-500/15 p-6 rounded-3xl border border-violet-500/20 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#7C3AED] text-white shadow-sm">
              DAILY HOMEWORK
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Academic Year 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            MyDiary
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 font-semibold">
            Your Daily Homework at One Place
          </p>
        </div>

        {/* School & Class Badge Cards */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <div className="bg-white/80 dark:bg-[#0B132A]/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <FaSchool className="text-indigo-500 text-xs" />
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">School</p>
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight mt-0.5">
                {diaryData.schoolName || "G.D Academy"}
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#0B132A]/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center gap-2 shadow-sm">
            <FaGraduationCap className="text-amber-500 text-xs" />
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Class</p>
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight mt-0.5">
                {diaryData.className} - Sec {diaryData.section}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigation & Control Bar */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Date Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickDateChange("today")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedDate === new Date().toISOString().split("T")[0]
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDateChange("yesterday")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedDate ===
                new Date(Date.now() - 86400000).toISOString().split("T")[0]
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Yesterday
            </button>

            {/* Custom Date Input */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Diary Date
            </span>
            <span className="text-sm font-black text-[#7C3AED] dark:text-[#38BDF8]">
              {formatDateLabel(selectedDate)}
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          {/* Search Box */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search homework by subject, title or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Subject & Status Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {uniqueSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            {/* Status Filter: Simplified to Pending & Completed */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/10 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-sm shrink-0">
            📚
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Homework</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {diaryData.summary?.totalHomework || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/10 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm shrink-0">
            🟢
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Completed</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
              {diaryData.summary?.completed || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/10 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-sm shrink-0">
            🟠
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Pending</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 leading-tight">
              {diaryData.summary?.pending || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/10 rounded-3xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-black text-sm shrink-0">
            📑
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Subjects</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 leading-tight">
              {diaryData.summary?.subjectsCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <FaSpinner className="text-3xl text-[#7C3AED] animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading daily diary records...</p>
        </div>
      ) : filteredHomeworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHomeworks.map((hw) => {
            const visual = getSubjectIcon(hw.subjectName);
            const isCompleted = hw.status === "Completed" || hw.status === "Submitted" || hw.status === "Reviewed";

            const statusBadge = isCompleted
              ? { text: "Completed", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: "🟢" }
              : { text: "Pending", style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: "🟠" };

            return (
              <div
                key={hw._id}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header: Subject & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${visual.bg}`}>
                      {visual.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {hw.subjectName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                        <FaUserTie className="text-[10px] text-indigo-400" />
                        Teacher: <span className="font-extrabold text-slate-700 dark:text-slate-300">{hw.teacherName}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${statusBadge.style}`}>
                    <span>{statusBadge.icon}</span>
                    <span>{statusBadge.text}</span>
                  </span>
                </div>

                {/* Title & Instructions */}
                <div className="space-y-2 py-1">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-150 leading-snug">
                    {hw.title}
                  </h4>
                  <div className="text-xs text-slate-550 dark:text-slate-400 font-medium space-y-1 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 whitespace-pre-line max-h-32 overflow-hidden">
                    {hw.description}
                  </div>
                </div>

                {/* Types Chips */}
                {hw.types && hw.types.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hw.types.map((typeStr, idx) => {
                      const badge = getTypeBadge(typeStr);
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${badge.style}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Parent Signature Section */}
                {isCompleted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaPenNib className="text-emerald-500 text-xs" />
                      <div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                          Parent Signature
                        </p>
                        <p className="text-xs font-black text-slate-800 dark:text-white">
                          {hw.parentSignatureName || "Signed by Parent"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      ✅ COMPLETED
                    </span>
                  </div>
                ) : (
                  <div className="bg-purple-500/5 dark:bg-white/[0.02] border border-purple-500/20 p-3.5 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] flex items-center gap-1.5">
                        <FaPenNib /> Parent Signature Required
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-500">Pending</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Parent must sign (enter name) to complete today's homework.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Enter Parent's Full Name (Signature)..."
                        value={parentNameInputs[hw._id] || ""}
                        onChange={(e) => setParentNameInputs({ ...parentNameInputs, [hw._id]: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                      <button
                        onClick={() => handleMarkCompletedWithSignature(hw._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <FaCheck className="text-xs" /> Submit Signature
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Meta & View Details */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                    <FaClock className="text-[10px]" />
                    <span>Due: {hw.dueDate || hw.homeworkDate}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedHomework(hw);
                      setShowDetailModal(true);
                    }}
                    className="text-[11px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Details <FaChevronRight className="text-[9px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl text-center space-y-4 shadow-sm px-4">
          <div className="w-16 h-16 rounded-3xl bg-violet-500/10 text-[#7C3AED] dark:text-[#38BDF8] border border-violet-500/20 flex items-center justify-center text-2xl mx-auto">
            📖
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              No Homework Recorded
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              There is no homework assigned for {formatDateLabel(selectedDate)} matching your search criteria.
            </p>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base border ${getSubjectIcon(selectedHomework.subjectName).bg}`}>
                  {getSubjectIcon(selectedHomework.subjectName).icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedHomework.subjectName} Homework
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold">
                    Teacher: {selectedHomework.teacherName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Topic</span>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">
                  {selectedHomework.title}
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Homework Details</span>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 whitespace-pre-line">
                  {selectedHomework.description}
                </div>
              </div>
            </div>

            {/* Parent Signature inside modal */}
            {selectedHomework.status === "Completed" ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FaPenNib /> Parent Signature Verified
                </p>
                <p className="text-xs font-black text-slate-800 dark:text-white">
                  ✒️ Signed by: {selectedHomework.parentSignatureName || "Parent / Guardian"}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-purple-500/5 dark:bg-white/[0.02] border border-purple-500/20 rounded-2xl space-y-3">
                <p className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] flex items-center gap-1.5">
                  <FaPenNib /> Parent Signature Form
                </p>
                <input
                  type="text"
                  placeholder="Enter Parent's Full Name (Signature)..."
                  value={parentNameInputs[selectedHomework._id] || ""}
                  onChange={(e) => setParentNameInputs({ ...parentNameInputs, [selectedHomework._id]: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  onClick={() => handleMarkCompletedWithSignature(selectedHomework._id)}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaCheck /> Submit Parent Signature & Mark Complete
                </button>
              </div>
            )}

            {/* Modal Close Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
