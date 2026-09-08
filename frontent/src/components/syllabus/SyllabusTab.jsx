import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaBook, 
  FaCheckCircle, 
  FaClock, 
  FaPlus, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp, 
  FaListUl, 
  FaExclamationTriangle,
  FaSync
} from "react-icons/fa";

export default function SyllabusTab({ subjectId, subjectName, assignedClasses = [], initialClass = "", onSyllabusUpdate }) {
  const API = import.meta.env.VITE_API_URL || "https://myschool-admin-panel.onrender.com";
  const token = localStorage.getItem("token");

  // Format classes options: e.g. Class 1, Class 2... Class 10
  const defaultClassOptions = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];
  
  const classList = assignedClasses.length > 0 
    ? assignedClasses.map(c => c.name || `Class ${c.name}`) 
    : defaultClassOptions;

  const getEffectiveClass = (cStr) => {
    if (cStr && cStr !== "All") return cStr;
    if (classList && classList.length > 0) return classList[0];
    return "Class 1";
  };

  const [selectedClass, setSelectedClass] = useState(() => getEffectiveClass(initialClass));
  const [loading, setLoading] = useState(true);
  const [syllabus, setSyllabus] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);

  // Modals state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [showCustomChapterModal, setShowCustomChapterModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customTopicsInput, setCustomTopicsInput] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const effective = getEffectiveClass(initialClass);
    if (effective !== selectedClass) {
      setSelectedClass(effective);
    }
  }, [initialClass]);

  useEffect(() => {
    fetchSyllabus(selectedClass);
  }, [subjectId, selectedClass]);

  const fetchSyllabus = async (targetClass = selectedClass) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/syllabus/subject/${subjectId}?className=${encodeURIComponent(targetClass)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyllabus(res.data);
    } catch (err) {
      console.error("Error loading syllabus:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (chapterId, newStatus) => {
    try {
      await axios.put(
        `${API}/api/syllabus/subject/${subjectId}/chapter/${chapterId}/status`,
        { status: newStatus, className: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSyllabus(selectedClass);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update chapter status");
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !selectedChapterId) return;

    try {
      setSaving(true);
      await axios.post(
        `${API}/api/syllabus/subject/${subjectId}/chapter/${selectedChapterId}/topic`,
        { topicTitle: newTopicTitle, className: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTopicTitle("");
      setShowTopicModal(false);
      fetchSyllabus(selectedClass);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add sub-topic");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTopic = async (chapterId, topicId) => {
    try {
      await axios.patch(
        `${API}/api/syllabus/subject/${subjectId}/chapter/${chapterId}/topic/${topicId}?className=${encodeURIComponent(selectedClass)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSyllabus(selectedClass);
    } catch (err) {
      console.error("Failed to toggle topic:", err);
    }
  };

  const handleAddCustomChapter = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    try {
      setSaving(true);
      const topicsArr = customTopicsInput
        .split("\n")
        .map(t => t.trim())
        .filter(Boolean);

      await axios.post(
        `${API}/api/syllabus/subject/${subjectId}/custom-chapter`,
        {
          title: customTitle,
          description: customDescription,
          topics: topicsArr,
          className: selectedClass
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCustomTitle("");
      setCustomDescription("");
      setCustomTopicsInput("");
      setShowCustomChapterModal(false);
      fetchSyllabus(selectedClass);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add custom chapter");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center select-none flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-xs font-bold">Synchronizing {subjectName} ({selectedClass}) syllabus...</p>
      </div>
    );
  }

  const chapters = syllabus?.chapters || [];
  const stats = syllabus?.stats || {
    totalChapters: chapters.length,
    completedChapters: chapters.filter(c => c.status === "Completed").length,
    inProgressChapters: chapters.filter(c => c.status === "In Progress").length,
    notStartedChapters: chapters.filter(c => c.status === "Not Started").length,
    progressPercentage: 0
  };

  return (
    <div className="space-y-6">

      {/* Syllabus Header & Action Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{subjectName} ({selectedClass}) Curriculum & Syllabus</h3>
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-extrabold rounded-full uppercase tracking-wider">
              Hybrid Mode
            </span>
          </div>
          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium mt-1">
            Admin Master blueprint loaded for <strong className="text-purple-500">{selectedClass}</strong>. Teachers can update progress, add sub-topics, or insert custom modules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchSyllabus(selectedClass)}
            className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition"
            title="Refresh Syllabus"
          >
            <FaSync />
          </button>
          <button
            onClick={() => setShowCustomChapterModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> Add Custom Chapter
          </button>
        </div>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Chapters</span>
          <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">{stats.totalChapters}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/[0.03] border border-emerald-500/15">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
          <span className="text-lg font-black text-emerald-600 block mt-1">{stats.completedChapters}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/15">
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">In Progress</span>
          <span className="text-lg font-black text-amber-600 block mt-1">{stats.inProgressChapters}</span>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/[0.03] border border-purple-500/15">
          <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Overall Progress</span>
          <span className="text-lg font-black text-purple-600 block mt-1">{stats.progressPercentage}%</span>
        </div>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-12 rounded-2xl text-center">
          <FaBook className="text-3xl text-purple-400 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700 dark:text-white">No chapters found for this subject.</p>
          <button
            onClick={() => setShowCustomChapterModal(true)}
            className="mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
          >
            + Create First Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, index) => {
            const isExpanded = expandedChapterId === ch._id;
            const completedTopics = (ch.topics || []).filter(t => t.completed).length;
            const totalTopics = (ch.topics || []).length;

            return (
              <div
                key={ch._id || index}
                className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                {/* Chapter Header Bar */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 select-none ${
                      ch.status === "Completed"
                        ? "bg-emerald-500 text-white"
                        : ch.status === "In Progress"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    }`}>
                      {ch.chapterNo}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{ch.title}</h4>
                        {ch.isMasterChapter ? (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                            Master Chapter
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                            Teacher Custom
                          </span>
                        )}
                      </div>
                      {ch.description && (
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 font-medium leading-relaxed">{ch.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-2">
                        <span>Topics: {completedTopics} / {totalTopics}</span>
                        {ch.completedDate && (
                          <span className="text-emerald-500">Completed on: {new Date(ch.completedDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Controller & Controls */}
                  <div className="flex items-center gap-2 shrink-0 select-none">
                    <select
                      value={ch.status}
                      onChange={(e) => handleStatusChange(ch._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold focus:outline-none border cursor-pointer ${
                        ch.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : ch.status === "In Progress"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => setExpandedChapterId(isExpanded ? null : ch._id)}
                      className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 text-slate-500 rounded-xl text-xs transition"
                      title="Toggle Topics List"
                    >
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Topics Sub-Section */}
                {isExpanded && (
                  <div className="bg-slate-50/70 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/[0.03] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sub-Topics / Lesson Units ({totalTopics})</span>
                      <button
                        onClick={() => {
                          setSelectedChapterId(ch._id);
                          setShowTopicModal(true);
                        }}
                        className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FaPlus className="text-[8px]" /> Add Sub-Topic
                      </button>
                    </div>

                    {totalTopics === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No sub-topics added yet. Click "+ Add Sub-Topic" to list specific lecture units.</p>
                    ) : (
                      <div className="space-y-2">
                        {ch.topics.map((t) => (
                          <label
                            key={t._id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0B132A] border border-slate-200/50 dark:border-white/5 cursor-pointer hover:border-purple-500/30 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => handleToggleTopic(ch._id, t._id)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                              />
                              <span className={`text-xs font-semibold ${t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {t.title}
                              </span>
                            </div>
                            {t.completed && (
                              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Done</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 1. ADD SUB-TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddTopic} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Sub-Topic / Exercise</h4>
              <button type="button" onClick={() => setShowTopicModal(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Sub-Topic Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter Exercises & Short Answers"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTopicModal(false)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow">{saving ? "Saving..." : "Add Sub-Topic"}</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. ADD CUSTOM CHAPTER MODAL */}
      {showCustomChapterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleAddCustomChapter} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Add Teacher Custom Chapter</h4>
              <button type="button" onClick={() => setShowCustomChapterModal(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Chapter Title (Next: Chapter {chapters.length + 1})
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Chapter ${chapters.length + 1}: Sample Paper Revision 2026`}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief note about what this extra chapter covers..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Sub-Topics (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Topic 1: PYQ Paper Solving&#10;Topic 2: Final Doubts Discussion"
                  value={customTopicsInput}
                  onChange={(e) => setCustomTopicsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-purple-500 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCustomChapterModal(false)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow">{saving ? "Saving..." : `+ Add Chapter ${chapters.length + 1}`}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
