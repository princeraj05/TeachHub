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
  FaExternalLinkAlt
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
  const API = import.meta.env.VITE_API_URL;
  const { theme } = useTheme();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [diaryData, setDiaryData] = useState({
    schoolName: "G.D Academy",
    className: "Class 5",
    section: "A",
    summary: { totalHomework: 0, completed: 0, pending: 0, subjectsCount: 0 },
    homeworks: []
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State for Homework Details
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Upload Submission state
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [submittingFile, setSubmittingFile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchDiary = (dateToFetch) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/student/mydiary?date=${dateToFetch}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data) {
          setDiaryData(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching student diary:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate]);

  // Handle Quick Date Selection
  const handleQuickDate = (type) => {
    const d = new Date();
    if (type === "yesterday") {
      d.setDate(d.getDate() - 1);
    } else if (type === "prev") {
      d.setDate(d.getDate() - 2);
    }
    const iso = d.toISOString().split("T")[0];
    setSelectedDate(iso);
  };

  // Filtered homework list
  const filteredHomeworks = useMemo(() => {
    return (diaryData.homeworks || []).filter((hw) => {
      const matchSearch =
        (hw.subjectName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.teacherName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchSubject = selectedSubject === "All" || hw.subjectName.toLowerCase() === selectedSubject.toLowerCase();
      const matchStatus = statusFilter === "All" || hw.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchSubject && matchStatus;
    });
  }, [diaryData.homeworks, searchQuery, selectedSubject, statusFilter]);

  // Unique subject list for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const set = new Set((diaryData.homeworks || []).map((h) => h.subjectName));
    return Array.from(set);
  }, [diaryData.homeworks]);

  // Mark as Completed
  const handleMarkCompleted = (hwId) => {
    setActionLoading(true);
    const token = localStorage.getItem("token");
    axios
      .post(`${API}/api/student/mydiary/${hwId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        showToast("🎉 Homework marked as Completed!");
        // Update local state
        setDiaryData((prev) => {
          const updated = prev.homeworks.map((item) =>
            item._id === hwId ? { ...item, status: "Completed" } : item
          );
          const completedCount = updated.filter((i) => ["Completed", "Submitted", "Reviewed"].includes(i.status)).length;
          const pendingCount = updated.length - completedCount;
          return {
            ...prev,
            summary: { ...prev.summary, completed: completedCount, pending: pendingCount },
            homeworks: updated
          };
        });
        if (selectedHomework && selectedHomework._id === hwId) {
          setSelectedHomework((prev) => ({ ...prev, status: "Completed" }));
        }
      })
      .catch((err) => {
        console.error("Error marking completed:", err);
        showToast("⚠️ Could not update status. Try again.");
      })
      .finally(() => setActionLoading(false));
  };

  // Handle File Upload Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Homework with File Attachment
  const handleSubmitHomework = (e) => {
    e.preventDefault();
    if (!selectedHomework) return;

    setSubmittingFile(true);
    const token = localStorage.getItem("token");

    const payload = {
      attachmentUrl: attachmentPreview || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      filename: attachmentFile ? attachmentFile.name : "homework_submission.png",
      fileType: attachmentFile ? attachmentFile.type : "image/png"
    };

    axios
      .post(`${API}/api/student/mydiary/${selectedHomework._id}/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        showToast("🚀 Homework submitted successfully!");
        setDiaryData((prev) => {
          const updated = prev.homeworks.map((item) =>
            item._id === selectedHomework._id
              ? { ...item, status: "Submitted", attachment: payload }
              : item
          );
          const completedCount = updated.filter((i) => ["Completed", "Submitted", "Reviewed"].includes(i.status)).length;
          const pendingCount = updated.length - completedCount;
          return {
            ...prev,
            summary: { ...prev.summary, completed: completedCount, pending: pendingCount },
            homeworks: updated
          };
        });
        setSelectedHomework((prev) => ({ ...prev, status: "Submitted", attachment: payload }));
        setAttachmentFile(null);
        setAttachmentPreview("");
      })
      .catch((err) => {
        console.error("Error submitting homework:", err);
        showToast("⚠️ Error uploading submission.");
      })
      .finally(() => setSubmittingFile(false));
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
                {diaryData.className || "Class 5"} - Sec {diaryData.section || "A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector & Toolbar */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Quick Date Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                selectedDate === todayStr
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDate("yesterday")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                formatDateLabel(selectedDate) === "Yesterday"
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Yesterday
            </button>

            {/* Custom Date Picker */}
            <div className="relative flex items-center bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/10 shrink-0">
              <FaCalendarAlt className="text-slate-400 text-xs mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Date Label Header */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Diary Date</p>
            <p className="text-sm font-black text-indigo-600 dark:text-[#38BDF8]">
              {formatDateLabel(selectedDate)}
            </p>
          </div>
        </div>

        {/* Search & Subject/Status Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search homework by subject, title or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Submitted">Submitted</option>
              <option value="Reviewed">Reviewed</option>
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
            📖
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Subjects</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 leading-tight">
              {diaryData.summary?.subjectsCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Homework Cards Section */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <FaSpinner className="text-3xl text-[#7C3AED] animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading daily diary records...</p>
        </div>
      ) : filteredHomeworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHomeworks.map((hw) => {
            const visual = getSubjectIcon(hw.subjectName);

            let statusBadge = {
              text: "Pending",
              style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              icon: "🟠"
            };

            if (hw.status === "Completed") {
              statusBadge = {
                text: "Completed",
                style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                icon: "🟢"
              };
            } else if (hw.status === "Submitted") {
              statusBadge = {
                text: "Submitted",
                style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                icon: "🔵"
              };
            } else if (hw.status === "Reviewed") {
              statusBadge = {
                text: "Reviewed",
                style: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                icon: "🟣"
              };
            }

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

                {/* Homework Types Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(hw.types || []).map((t, idx) => {
                    const badge = getTypeBadge(t);
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${badge.style}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Card Footer: Date & Details Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <FaClock className="text-[10px] text-amber-500" />
                    Due: <strong className="text-slate-700 dark:text-slate-300">{formatDateLabel(hw.dueDate)}</strong>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedHomework(hw);
                      setShowDetailModal(true);
                    }}
                    className="flex items-center gap-1.5 text-[#7C3AED] dark:text-[#38BDF8] hover:underline font-extrabold cursor-pointer group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Details</span>
                    <FaChevronRight className="text-[9px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400/20 to-emerald-400/20 rounded-full flex items-center justify-center text-4xl mx-auto border border-amber-400/30 animate-pulse">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              No homework for {formatDateLabel(selectedDate)}!
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
              Enjoy your free time, revise previous lessons, and keep learning.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setSelectedSubject("All");
              setStatusFilter("All");
              setSearchQuery("");
            }}
            className="px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#6D28D9] transition cursor-pointer"
          >
            Reset Filters & View Today
          </button>
        </div>
      )}

      {/* Homework Detail & Submission Modal */}
      {showDetailModal && selectedHomework && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${getSubjectIcon(selectedHomework.subjectName).bg}`}>
                  {getSubjectIcon(selectedHomework.subjectName).icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {selectedHomework.subjectName}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">
                    Teacher: {selectedHomework.teacherName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setAttachmentFile(null);
                  setAttachmentPreview("");
                }}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Date</p>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDateLabel(selectedHomework.homeworkDate)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Due Date</p>
                <p className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatDateLabel(selectedHomework.dueDate)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <p className="font-extrabold text-indigo-600 dark:text-[#38BDF8] mt-0.5">
                  {selectedHomework.status}
                </p>
              </div>
            </div>

            {/* Title & Instructions */}
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedHomework.title}
              </h4>
              <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                {selectedHomework.description}
              </div>
            </div>

            {/* Homework Types */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Homework Types</p>
              <div className="flex flex-wrap items-center gap-2">
                {(selectedHomework.types || []).map((t, i) => {
                  const b = getTypeBadge(t);
                  return (
                    <span key={i} className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${b.style}`}>
                      {b.icon} {b.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Submitted Attachment Preview if exists */}
            {selectedHomework.attachment && selectedHomework.attachment.url && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <FaCheckCircle /> Submitted File
                  </span>
                  <a
                    href={selectedHomework.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View File <FaExternalLinkAlt className="text-[9px]" />
                  </a>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                  📎 {selectedHomework.attachment.filename || "homework_submission.png"}
                </p>
              </div>
            )}

            {/* File Upload Section for Submit Homework */}
            {selectedHomework.status !== "Reviewed" && (
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Submit Work / Attach Proof
                </h5>
                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-[#7C3AED] rounded-2xl p-4 text-center cursor-pointer transition relative bg-slate-50 dark:bg-white/[0.01]">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <FaFileUpload className="text-xl text-[#7C3AED]" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {attachmentFile ? attachmentFile.name : "Click or Drag to Upload Image / PDF / Document"}
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-end gap-3">
              {selectedHomework.status === "Pending" && (
                <button
                  onClick={() => handleMarkCompleted(selectedHomework._id)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FaCheck /> Mark as Completed
                </button>
              )}

              {attachmentFile && (
                <button
                  onClick={handleSubmitHomework}
                  disabled={submittingFile}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submittingFile ? <FaSpinner className="animate-spin" /> : <FaPaperclip />}
                  Submit Homework Attachment
                </button>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setAttachmentFile(null);
                  setAttachmentPreview("");
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
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
