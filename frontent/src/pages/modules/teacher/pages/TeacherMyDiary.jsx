import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFileAlt,
  FaFilter,
  FaFlask,
  FaGlobe,
  FaGraduationCap,
  FaInfoCircle,
  FaLightbulb,
  FaPencilAlt,
  FaPlus,
  FaTrash,
  FaSchool,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaCheck,
  FaUserTie,
  FaBookOpen,
  FaChevronRight
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

// Helper: Get type badge styling
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
  if (clean.includes("practice") || clean.includes("worksheet")) {
    return { label: typeStr || "Practice", icon: "📚", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20" };
  }
  return { label: typeStr || "Homework", icon: "📌", style: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20" };
};

const HOMEWORK_TYPE_OPTIONS = [
  { id: "Questions / Exercises", label: "Questions / Exercises", icon: "❓" },
  { id: "Writing", label: "Writing Homework", icon: "📝" },
  { id: "Reading", label: "Reading Chapter", icon: "📖" },
  { id: "Learn / Memorize", label: "Learn / Memorize", icon: "🧠" },
  { id: "Project / Drawing", label: "Project / Drawing", icon: "🎨" },
  { id: "Practice / Worksheet", label: "Practice / Worksheet", icon: "📚" }
];

export default function TeacherMyDiary() {
  const { theme } = useTheme();
  const API = import.meta.env.VITE_API_URL || "";
  const token = localStorage.getItem("token");

  // State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [homeworks, setHomeworks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create Homework Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    className: "",
    section: "A",
    subjectName: "",
    homeworkDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    title: "",
    description: "",
    types: ["Questions / Exercises"]
  });

  // Fetch initial classes and subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [clsRes, subjRes] = await Promise.all([
          axios.get(`${API}/api/teacher/my-classes`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get(`${API}/api/teacher/my-subjects`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        const rawClasses = clsRes.data || [];
        setClassesList(rawClasses);

        if (rawClasses.length > 0) {
          const firstCls = rawClasses[0];
          setFormData((prev) => ({
            ...prev,
            classId: firstCls._id || "",
            className: firstCls.className || firstCls.name || "Class 5",
            section: firstCls.section || "A"
          }));
        }

        const rawSubj = subjRes.data || [];
        // Flatten or map subjects
        const cleanSubjList = Array.isArray(rawSubj)
          ? rawSubj.map((s) => (typeof s === "string" ? s : s.name || s.subjectName || "General"))
          : ["Mathematics", "Science", "English", "Hindi", "Social Studies"];
        setSubjectsList([...new Set(cleanSubjList)]);

        if (cleanSubjList.length > 0) {
          setFormData((prev) => ({ ...prev, subjectName: cleanSubjList[0] }));
        }
      } catch (err) {
        console.error("Error fetching teacher metadata:", err);
      }
    };
    fetchMetadata();
  }, [API, token]);

  // Fetch Homeworks based on selected date / filters
  const fetchHomeworks = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      let url = `${API}/api/teacher/mydiary?date=${selectedDate}`;
      if (selectedClassId && selectedClassId !== "All") {
        url += `&classId=${selectedClassId}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomeworks(res.data || []);
    } catch (err) {
      console.error("Error fetching diary entries:", err);
      setErrorMsg("Failed to load homework entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [selectedDate, selectedClassId]);

  // Filtered homework list
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((hw) => {
      if (selectedSubject !== "All" && hw.subjectName !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (hw.title || "").toLowerCase().includes(q);
        const matchDesc = (hw.description || "").toLowerCase().includes(q);
        const matchSubj = (hw.subjectName || "").toLowerCase().includes(q);
        const matchClass = (hw.className || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubj && !matchClass) return false;
      }
      return true;
    });
  }, [homeworks, selectedSubject, searchQuery]);

  // Handle Create Homework Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a homework topic/title.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await axios.post(`${API}/api/teacher/mydiary`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Homework assigned successfully!");
      setIsModalOpen(false);
      // Reset title & desc
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        types: ["Questions / Exercises"]
      }));
      fetchHomeworks();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error creating homework:", err);
      alert(err.response?.data?.message || "Failed to assign homework.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Homework
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework entry?")) return;

    try {
      await axios.delete(`${API}/api/teacher/mydiary/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomeworks((prev) => prev.filter((hw) => hw._id !== id));
      setSuccessMsg("Homework deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error deleting homework:", err);
      alert("Failed to delete homework.");
    }
  };

  // Toggle Type Selection in Modal Form
  const toggleTypeSelection = (typeId) => {
    setFormData((prev) => {
      const exists = prev.types.includes(typeId);
      if (exists) {
        if (prev.types.length === 1) return prev; // Keep at least one
        return { ...prev, types: prev.types.filter((t) => t !== typeId) };
      } else {
        return { ...prev, types: [...prev.types, typeId] };
      }
    });
  };

  // Class Selection Handler in Modal Form
  const handleClassChangeInModal = (clsId) => {
    const found = classesList.find((c) => c._id === clsId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        classId: found._id,
        className: found.className || found.name || "Class 5",
        section: found.section || "A"
      }));
    } else {
      setFormData((prev) => ({ ...prev, classId: clsId }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" style={{ fontFamily: SORA }}>
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-20 right-5 z-[99] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slideDown">
          <FaCheckCircle className="text-xl" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#38BDF8] p-6 sm:p-8 text-white shadow-xl shadow-[#7C3AED]/15">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase">
              <FaBookOpen className="text-amber-300" />
              Teacher Homework Diary
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Diary & Homework
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl font-medium">
              Create and manage daily subject homework entries for your classes. Students will receive these assignments in real-time.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-center shrink-0 bg-white text-[#7C3AED] hover:bg-slate-50 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <FaPlus className="text-sm" />
            <span>Assign Homework</span>
          </button>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2.5xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
              Homework Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
              Class
            </label>
            <div className="relative">
              <FaSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED] appearance-none"
              >
                <option value="All" className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">All Classes</option>
                {classesList.map((cls) => (
                  <option key={cls._id} value={cls._id} className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">
                    {cls.className || cls.name} {cls.section ? `(${cls.section})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
              Subject
            </label>
            <div className="relative">
              <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED] appearance-none"
              >
                <option value="All" className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">All Subjects</option>
                {subjectsList.map((subj, idx) => (
                  <option key={idx} value={subj} className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search topic or detail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Homework List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span>Assigned Homework</span>
            <span className="text-xs bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full font-black">
              {filteredHomeworks.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200 dark:border-white/10">
            <FaSpinner className="text-3xl text-[#7C3AED] animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-400 animate-pulse">Loading homework entries...</p>
          </div>
        ) : filteredHomeworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200 dark:border-white/10 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-2xl mb-4">
              <FaBookOpen />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
              No Homework Assigned
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              No homework was found for {selectedDate}. Click below to assign homework to your class.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FaPlus /> Assign Homework Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredHomeworks.map((hw) => {
              const subjVisual = getSubjectIcon(hw.subjectName);
              const completionsCount = Array.isArray(hw.studentCompletions) ? hw.studentCompletions.length : 0;

              return (
                <div
                  key={hw._id}
                  className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2.5xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Class Badge */}
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-white/10">
                          {hw.className} {hw.section ? `(${hw.section})` : ""}
                        </span>

                        {/* Subject Badge */}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${subjVisual.bg}`}>
                          {subjVisual.icon}
                          {hw.subjectName}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(hw._id)}
                        className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Homework"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug">
                      {hw.title}
                    </h3>

                    {/* Homework Types */}
                    {hw.types && hw.types.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hw.types.map((t, idx) => {
                          const badge = getTypeBadge(t);
                          return (
                            <span
                              key={idx}
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${badge.style}`}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Description */}
                    {hw.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-100 dark:border-white/[0.05]">
                        {hw.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <FaClock className="text-slate-400" />
                      <span>Due: {hw.dueDate || hw.homeworkDate}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                      <FaCheck className="text-[9px]" />
                      <span>{completionsCount} Completed</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE HOMEWORK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center font-bold">
                  <FaBookOpen />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                    Assign Class Homework
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">Fill in details to post to student diary</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Class & Subject row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Class */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Target Class *
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => handleClassChangeInModal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    {classesList.length === 0 ? (
                      <option value="">Default Class (Class 5-A)</option>
                    ) : (
                      classesList.map((cls) => (
                        <option key={cls._id} value={cls._id} className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">
                          {cls.className || cls.name} {cls.section ? `(${cls.section})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Select Subject */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    {subjectsList.length === 0 ? (
                      <>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Social Studies">Social Studies</option>
                      </>
                    ) : (
                      subjectsList.map((subj, idx) => (
                        <option key={idx} value={subj} className="bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white">
                          {subj}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Homework Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Assigned Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.homeworkDate}
                    onChange={(e) => setFormData({ ...formData, homeworkDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Title / Topic */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Topic / Homework Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 3: Solve Exercises 3.1 to 3.5"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Homework Types Chips */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Homework Task Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOMEWORK_TYPE_OPTIONS.map((item) => {
                    const isSelected = formData.types.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleTypeSelection(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Detailed Instructions (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Write step-by-step instructions or page numbers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] text-white shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Post Homework</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
