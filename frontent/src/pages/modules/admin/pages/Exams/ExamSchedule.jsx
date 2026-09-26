import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaCalendarAlt, FaBook, FaSchool, FaTrash, FaPlus, FaCalendarCheck, FaEdit, FaClock, FaHourglassHalf } from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function ExamSchedule() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const timePickerRef = useRef(null);
  const durationPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setShowTimePicker(false);
      }
      if (durationPickerRef.current && !durationPickerRef.current.contains(e.target)) {
        setShowDurationPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currY = new Date().getFullYear();
  const academicYearOptions = [
    `${currY - 1}-${currY}`,
    `${currY}-${currY + 1}`,
    `${currY + 1}-${currY + 2}`
  ];

  const [form, setForm] = useState({
    title: "",
    classId: "",
    subjectId: "",
    examTerm: "THREE_MONTH",
    academicYear: academicYearOptions[1] || `${currY}-${currY + 1}`,
    maxMarks: 100,
    date: "",
    time: "09:00 AM",
    duration: "1h 30m",
    roomNumber: "",
    mode: "offline",
    negativeMarking: false,
    negativeMarkValue: 0.25,
    questions: [],
    proctorId: ""
  });

  const getUniqueClasses = (list) => {
    if (!Array.isArray(list)) return [];
    const map = new Map();
    list.forEach(c => {
      const name = String(c?.name || "").trim();
      if (name && !map.has(name)) {
        map.set(name, c);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(String(a.name).replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.name).replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });
  };

  const handleClassExamQuestionChange = (qIdx, field, val) => {
    const updatedQs = [...form.questions];
    updatedQs[qIdx] = { ...updatedQs[qIdx], [field]: val };
    setForm({ ...form, questions: updatedQs });
  };

  const handleClassExamOptionChange = (qIdx, optIdx, val) => {
    const updatedQs = [...form.questions];
    const opts = [...updatedQs[qIdx].options];
    opts[optIdx] = val;
    updatedQs[qIdx] = { ...updatedQs[qIdx], options: opts };
    setForm({ ...form, questions: updatedQs });
  };

  const addClassExamQuestion = () => {
    const selectedSubName = subjects.find(s => s._id === form.subjectId)?.name || "General";
    setForm({
      ...form,
      questions: [
        ...form.questions,
        { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, section: selectedSubName }
      ]
    });
  };

  const removeClassExamQuestion = (qIdx) => {
    const updatedQs = form.questions.filter((_, idx) => idx !== qIdx);
    setForm({ ...form, questions: updatedQs });
  };

  const [activeTab, setActiveTab] = useState("class");
  const [selectedAdmissionClassId, setSelectedAdmissionClassId] = useState("");
  const [admissionExam, setAdmissionExam] = useState({
    negativeMarking: false,
    negativeMarkValue: 0.25,
    questions: []
  });
  const [loadingAdmission, setLoadingAdmission] = useState(false);
  const [savingAdmission, setSavingAdmission] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(res.data || []);
    } catch (err) {
      console.log("Error loading teachers:", err);
    }
  };

  const fetchAdmissionExam = async (cId) => {
    setLoadingAdmission(true);
    try {
      const targetId = cId !== undefined ? cId : selectedAdmissionClassId;
      const url = targetId 
        ? `${API}/api/admin/users/admission-exam?classId=${targetId}`
        : `${API}/api/admin/users/admission-exam`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmissionExam(res.data || { negativeMarking: false, negativeMarkValue: 0.25, questions: [] });
    } catch (err) {
      console.log("Error loading admission exam:", err);
    } finally {
      setLoadingAdmission(false);
    }
  };

  const handleAdmissionClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedAdmissionClassId(newClassId);
    fetchAdmissionExam(newClassId);
  };

  const handleAdmissionChange = (field, val) => {
    setAdmissionExam({ ...admissionExam, [field]: val });
  };

  const handleQuestionChange = (qIdx, field, val) => {
    const updatedQs = [...admissionExam.questions];
    updatedQs[qIdx] = { ...updatedQs[qIdx], [field]: val };
    setAdmissionExam({ ...admissionExam, questions: updatedQs });
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updatedQs = [...admissionExam.questions];
    const opts = [...updatedQs[qIdx].options];
    opts[optIdx] = val;
    updatedQs[qIdx] = { ...updatedQs[qIdx], options: opts };
    setAdmissionExam({ ...admissionExam, questions: updatedQs });
  };

  const addQuestion = () => {
    setAdmissionExam({
      ...admissionExam,
      questions: [
        ...admissionExam.questions,
        { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }
      ]
    });
  };

  const removeQuestion = (qIdx) => {
    const updatedQs = admissionExam.questions.filter((_, idx) => idx !== qIdx);
    setAdmissionExam({ ...admissionExam, questions: updatedQs });
  };

  const saveAdmissionExam = async (e) => {
    e.preventDefault();
    if (!selectedAdmissionClassId) {
      alert("Please select a Target Class for the admission exam.");
      return;
    }
    setSavingAdmission(true);
    try {
      await axios.post(`${API}/api/admin/users/admission-exam`, {
        ...admissionExam,
        classId: selectedAdmissionClassId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Admission exam saved successfully for the selected class!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save exam");
    } finally {
      setSavingAdmission(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classList = res.data || [];
      setClasses(classList);
      const uniqueList = getUniqueClasses(classList);
      if (uniqueList.length > 0 && !selectedAdmissionClassId) {
        const firstClassId = uniqueList[0]._id;
        setSelectedAdmissionClassId(firstClassId);
        fetchAdmissionExam(firstClassId);
      } else {
        fetchAdmissionExam();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSubjects = async () => {
    const res = await axios.get(`${API}/api/admin/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubjects(res.data);
  };

  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditExam = (exam) => {
    setEditingId(exam._id);
    setForm({
      title: exam.title || "",
      classId: exam.class?._id || exam.class || "",
      subjectId: exam.subject?._id || exam.subject || "",
      examTerm: exam.examTerm || "THREE_MONTH",
      academicYear: exam.academicYear || academicYearOptions[1] || `${currY}-${currY + 1}`,
      maxMarks: exam.maxMarks || 100,
      date: exam.date ? new Date(exam.date).toISOString().split("T")[0] : "",
      time: exam.time || "09:00 AM",
      duration: exam.duration || "1h 30m",
      roomNumber: exam.roomNumber || "",
      mode: exam.mode || "offline",
      negativeMarking: !!exam.negativeMarking,
      negativeMarkValue: exam.negativeMarkValue || 0.25,
      questions: exam.questions || [],
      proctorId: exam.proctor?._id || exam.proctor || ""
    });
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      title: "",
      classId: "",
      subjectId: "",
      examTerm: "THREE_MONTH",
      academicYear: academicYearOptions[1] || `${currY}-${currY + 1}`,
      maxMarks: 100,
      date: "",
      time: "09:00 AM",
      duration: "1h 30m",
      roomNumber: "",
      mode: "offline",
      negativeMarking: false,
      negativeMarkValue: 0.25,
      questions: [],
      proctorId: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.mode === "online" && form.questions.length === 0) {
      alert("Please add at least one question for the online exam.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${API}/api/exams/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Exam updated successfully!");
      } else {
        await axios.post(`${API}/api/exams`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      cancelEdit();
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving exam");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExam = async (id) => {
    await axios.delete(`${API}/api/exams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExams(exams.filter((e) => e._id !== id));
  };

  const upcomingCount = exams.filter(
    (e) => new Date(e.date) >= new Date()
  ).length;

  const stats = [
    {
      label: "Total Scheduled",
      value: exams.length,
      desc: "all exams",
      grad: "from-indigo-500 to-blue-500",
      shadow: "shadow-indigo-500/10",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      desc: "scheduled forward",
      grad: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-500/10",
      text: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Completed",
      value: exams.length - upcomingCount,
      desc: "already held",
      grad: "from-slate-500 to-slate-600",
      shadow: "shadow-slate-500/10",
      text: "text-slate-600",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Academics</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Exam Schedule
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and organize system wide exam timelines</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("class")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "class"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Class Exam
        </button>
        <button
          onClick={() => setActiveTab("admissions")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "admissions"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Student Register Exam
        </button>
      </div>

      {activeTab === "class" && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-4 sm:mb-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />
                <div className="p-2.5 sm:p-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
                  <p className="text-xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight my-0.5 sm:my-1">{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Create Exam Panel (Left 2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden sticky top-6">
                <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-indigo-500" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
                        {editingId ? <FaEdit className="text-sm" /> : <FaPlus className="text-sm" />}
                      </div>
                      <div>
                        <h2 className="text-slate-800 dark:text-white font-bold text-base">
                          {editingId ? "Edit Exam Details" : "Schedule New Exam"}
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {editingId ? "Update exam parameters below" : "Fill academic details below"}
                        </p>
                      </div>
                    </div>
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Exam Title / Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Exam Title / Description (Optional)</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g. Mid-Term Assessment, Final Examination"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>

                    {/* Examination Term & Academic Year */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Examination Term</label>
                        <select
                          name="examTerm"
                          value={form.examTerm}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                        >
                          <option value="THREE_MONTH">3-Month Examination</option>
                          <option value="SIX_MONTH">6-Month Examination (Mid-Term)</option>
                          <option value="NINE_MONTH">9-Month Examination</option>
                          <option value="FINAL_YEAR">Final Year Examination (Annual)</option>

                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Academic Year</label>
                        <select
                          name="academicYear"
                          value={form.academicYear}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                        >
                          {academicYearOptions.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Class select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Class</label>
                      <div className="relative">
                        <FaSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <select
                          name="classId"
                          value={form.classId}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                        >
                          <option value="" disabled>Select Class</option>
                          {getUniqueClasses(classes).map((cls) => (
                            <option key={cls._id} value={cls._id}>
                              Class {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject select & Max Marks */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subject</label>
                        <div className="relative">
                          <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                          <select
                            name="subjectId"
                            value={form.subjectId}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                          >
                            <option value="" disabled>Select Subject</option>
                            {subjects.map((sub) => (
                              <option key={sub._id} value={sub._id}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Max Marks</label>
                        <input
                          type="number"
                          name="maxMarks"
                          min="1"
                          required
                          placeholder="e.g. 100"
                          value={form.maxMarks}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Date select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Exam Date</label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                          type="date"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Time & Duration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5 relative" ref={timePickerRef}>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Time</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowTimePicker(!showTimePicker)}
                            title="Click to pick time"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                          >
                            <FaClock className="text-sm" />
                          </button>
                          <input
                          type="text"
                          name="time"
                          placeholder="e.g. 09:00 AM - 10:30 AM"
                          value={form.time}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                        </div>

                        {showTimePicker && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 p-3 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Select Start Time</span>
                              <input
                                type="time"
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const [h, m] = e.target.value.split(":");
                                  const hours = parseInt(h, 10);
                                  const suffix = hours >= 12 ? "PM" : "AM";
                                  const displayH = hours % 12 || 12;
                                  const formattedT = `${String(displayH).padStart(2, "0")}:${m} ${suffix}`;
                                  setForm(f => ({ ...f, time: formattedT }));
                                  setShowTimePicker(false);
                                }}
                                className="text-xs bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-slate-800 dark:text-white font-bold cursor-pointer outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                              {[
                                "08:00 AM",
                                "08:30 AM",
                                "09:00 AM",
                                "09:30 AM",
                                "10:00 AM",
                                "10:30 AM",
                                "11:00 AM",
                                "11:30 AM",
                                "12:00 PM",
                                "01:00 PM",
                                "02:00 PM",
                                "03:00 PM"
                              ].map((tVal) => (
                                <button
                                  key={tVal}
                                  type="button"
                                  onClick={() => {
                                    setForm(f => ({ ...f, time: tVal }));
                                    setShowTimePicker(false);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-left cursor-pointer ${
                                    form.time === tVal
                                      ? "bg-teal-500 text-white shadow-sm"
                                      : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-white/10"
                                  }`}
                                >
                                  {tVal}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                      <div className="flex flex-col gap-1.5 relative" ref={durationPickerRef}>
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Duration</label>
                          <button
                            type="button"
                            onClick={() => setShowDurationPicker(!showDurationPicker)}
                            className="text-[9px] font-extrabold text-teal-600 hover:underline cursor-pointer"
                          >
                            {showDurationPicker ? "Close" : "Pick Duration"}
                          </button>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowDurationPicker(!showDurationPicker)}
                            title="Click to pick duration"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                          >
                            <FaHourglassHalf className="text-sm" />
                          </button>
                          <input
                          type="text"
                          name="duration"
                          placeholder="e.g. 1h 30m"
                          value={form.duration}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                        </div>

                        {showDurationPicker && (
                          <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 p-3 space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block border-b border-slate-100 dark:border-white/5 pb-1.5">
                              Select Duration
                            </span>
                            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                              {[
                                { label: "30 Minutes", val: "30 Min" },
                                { label: "45 Minutes", val: "45 Min" },
                                { label: "1 Hour (60m)", val: "1h 00m" },
                                { label: "1.5 Hours (90m)", val: "1h 30m" },
                                { label: "2 Hours (120m)", val: "2h 00m" },
                                { label: "2.5 Hours (150m)", val: "2h 30m" },
                                { label: "3 Hours (180m)", val: "3h 00m" }
                              ].map((dur) => (
                                <button
                                  key={dur.val}
                                  type="button"
                                  onClick={() => {
                                    setForm(f => ({ ...f, duration: dur.val }));
                                    setShowDurationPicker(false);
                                  }}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                    form.duration === dur.val
                                      ? "bg-teal-500 text-white shadow-sm"
                                      : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-white/10"
                                  }`}
                                >
                                  <span>{dur.label}</span>
                                  <span className="text-[10px] opacity-80">{dur.val}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Exam Mode select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Exam Mode</label>
                      <select
                        name="mode"
                        value={form.mode}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                      >
                        <option value="offline">Offline</option>
                        <option value="online">Online (Proctored)</option>
                      </select>
                    </div>

                    {/* Conducting Teacher (Proctor) select - Available for BOTH Offline & Online */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Conducting Teacher (Proctor)</label>
                      <select
                        name="proctorId"
                        value={form.proctorId}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                      >
                        <option value="">Select Conducting Teacher</option>
                        {teachers.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room Number / Venue (Offline / Online) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Room Number / Venue</label>
                      <input
                        type="text"
                        name="roomNumber"
                        placeholder="e.g. Room 102, Main Hall"
                        value={form.roomNumber}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>

                    {form.mode === "online" && (
                      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.negativeMarking}
                            onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            Enable Negative Marking
                          </span>
                        </label>

                        {form.negativeMarking && (
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                              Deduction:
                            </label>
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              max="5"
                              required
                              value={form.negativeMarkValue}
                              onChange={(e) => setForm({ ...form, negativeMarkValue: parseFloat(e.target.value) })}
                              className="w-20 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
                              Questions ({form.questions.length})
                            </h4>
                            <button
                              type="button"
                              onClick={addClassExamQuestion}
                              disabled={!form.subjectId}
                              className="text-[9px] font-black uppercase tracking-wider bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-extrabold"
                            >
                              + Add Question
                            </button>
                          </div>
                          {!form.subjectId && (
                            <p className="text-[9px] text-amber-500 font-bold">Please select a subject first to unlock adding questions.</p>
                          )}

                          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                            {form.questions.map((q, qIdx) => (
                              <div key={qIdx} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 p-3.5 rounded-xl space-y-3 relative">
                                <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-white/5 pb-2">
                                  <span className="text-[9px] font-extrabold text-teal-600 dark:text-[#38BDF8]">Q#{qIdx + 1} ({subjects.find(s => s._id === form.subjectId)?.name || "General"})</span>
                                  <button
                                    type="button"
                                    onClick={() => removeClassExamQuestion(qIdx)}
                                    className="text-[9px] font-extrabold text-rose-500 hover:text-rose-600"
                                  >
                                    Delete
                                  </button>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-extrabold uppercase text-slate-400">Question Text</label>
                                  <input
                                    type="text"
                                    required
                                    value={q.questionText}
                                    onChange={(e) => handleClassExamQuestionChange(qIdx, "questionText", e.target.value)}
                                    placeholder="Enter question"
                                    className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex flex-col gap-1">
                                      <label className="text-[8px] font-extrabold uppercase text-slate-400">Opt {String.fromCharCode(65 + optIdx)}</label>
                                      <input
                                        type="text"
                                        required
                                        value={opt}
                                        onChange={(e) => handleClassExamOptionChange(qIdx, optIdx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                        className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2 border-t border-slate-200/40 dark:border-white/5">
                                  <label className="block text-[8px] font-extrabold uppercase text-slate-400 mb-1">Correct Option</label>
                                  <div className="flex gap-3">
                                    {[0, 1, 2, 3].map((optVal) => (
                                      <label key={optVal} className="flex items-center gap-1 cursor-pointer select-none">
                                        <input
                                          type="radio"
                                          name={`class-correct-ans-${qIdx}`}
                                          checked={q.correctOptionIndex === optVal}
                                          onChange={() => handleClassExamQuestionChange(qIdx, "correctOptionIndex", optVal)}
                                          className="w-3.5 h-3.5 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                        />
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                          {String.fromCharCode(65 + optVal)}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingId ? <FaEdit className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
                          {editingId ? "Update Exam" : "Add Exam"}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Exams Table Panel (Right 3 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">All Scheduled Exams</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {exams.length} exam{exams.length !== 1 ? "s" : ""} total in history
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full select-none">
                    Academic Year 2026
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400 text-xs font-medium">Loading scheduled exams...</p>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm">
                      <FaCalendarCheck />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-white font-bold text-sm">No Exams Scheduled</p>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">Use the scheduling panel to add new exams.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-sm text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                          <th className="px-5 py-4">Class</th>
                          <th className="px-5 py-4">Subject</th>
                          <th className="px-5 py-4">Term</th>
                          <th className="px-5 py-4">Mode</th>
                          <th className="px-5 py-4">Proctor</th>
                          <th className="px-5 py-4">Date</th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60">
                        {exams.map((e) => {
                          const isUpcoming = new Date(e.date) >= new Date();
                          return (
                            <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-indigo-100">
                                  Class {e.class?.name}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-250">{e.subject?.name || "—"}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 border border-teal-100 dark:border-teal-500/20">
                                  {e.examTerm === "THREE_MONTH" ? "3-Month" :
                                   e.examTerm === "SIX_MONTH" ? "6-Month (Mid-Term)" :
                                   e.examTerm === "NINE_MONTH" ? "9-Month" :
                                   e.examTerm === "FINAL_YEAR" ? "Final Year Examination (Annual)" : (e.examTerm || "—")}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                  e.mode === "online" 
                                    ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" 
                                    : "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
                                }`}>
                                  {e.mode || "offline"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-250">{e.proctor?.name || "—"}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-slate-555 text-xs font-medium whitespace-nowrap">
                                  {new Date(e.date).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  isUpcoming 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-slate-100 text-slate-400 border-slate-200/60"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? "bg-emerald-500" : "bg-slate-400"}`} />
                                  {isUpcoming ? "Upcoming" : "Past"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditExam(e)}
                                    className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FaEdit className="text-[9px]" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteExam(e._id)}
                                    className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FaTrash className="text-[9px]" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="px-6 py-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                    Upcoming exams remain active · Completed logs are preserved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "admissions" && (
        <form onSubmit={saveAdmissionExam} className="space-y-6">
          {/* Settings block */}
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 shadow-sm relative overflow-hidden transition-all">
            <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-teal-500 to-[#7C3AED]" />
            <h2 className="text-slate-800 dark:text-white font-black text-sm uppercase tracking-wide mb-4">
              Entrance Exam Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Target Class Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Target Admission Class
                </label>
                <div className="relative">
                  <FaSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    value={selectedAdmissionClassId}
                    onChange={handleAdmissionClassChange}
                    required
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Target Class</option>
                    {getUniqueClasses(classes).map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        Class {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Negative marking options */}
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={admissionExam.negativeMarking}
                    onChange={(e) => handleAdmissionChange("negativeMarking", e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enable Negative Marking
                  </span>
                </label>

                {admissionExam.negativeMarking && (
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Deduction:
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="5"
                      required
                      value={admissionExam.negativeMarkValue}
                      onChange={(e) => handleAdmissionChange("negativeMarkValue", parseFloat(e.target.value))}
                      className="w-20 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-350 uppercase tracking-wide">
                  Exam Questions ({admissionExam.questions.length})
                </h3>
                <p className="text-xs text-slate-400">Configure MCQs with 4 choices and specify correct options.</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer animate-pulse"
              >
                <FaPlus className="text-[9px]" /> Add Question
              </button>
            </div>

            {loadingAdmission ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mb-2" />
                <p className="text-xs text-slate-400 font-bold">Loading exam sheet details...</p>
              </div>
            ) : admissionExam.questions.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <FaBook className="text-slate-300 dark:text-slate-700 text-3xl mx-auto mb-3" />
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">No Questions Added</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Click the "Add Question" button above to build your first exam MCQ.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {admissionExam.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 p-5 shadow-sm space-y-4 transition hover:shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                      <span className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8]">
                        Question #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <FaTrash className="text-[9px]" /> Delete
                      </button>
                    </div>

                    {/* Question Text & Section Select */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                          Question Text
                        </label>
                        <input
                          type="text"
                          required
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                          placeholder="Enter the question (e.g. What is the value of 5 x 6?)"
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-500">
                          Question Section
                        </label>
                        <select
                          value={q.section || "Mathematics"}
                          onChange={(e) => handleQuestionChange(qIdx, "section", e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 cursor-pointer"
                        >
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="Social Science">Social Science</option>
                        </select>
                      </div>
                    </div>

                    {/* 4 Choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                            Option {String.fromCharCode(65 + optIdx)}
                          </label>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Enter Option ${String.fromCharCode(65 + optIdx)}`}
                            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct answer configuration */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        Specify Correct Option Answer
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {[0, 1, 2, 3].map((optVal) => (
                          <label key={optVal} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="radio"
                              name={`correct-ans-${qIdx}`}
                              checked={q.correctOptionIndex === optVal}
                              onChange={() => handleQuestionChange(qIdx, "correctOptionIndex", optVal)}
                              className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              Option {String.fromCharCode(65 + optVal)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Save bar */}
          {admissionExam.questions.length > 0 && (
            <div className="pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingAdmission}
                className="bg-gradient-to-r from-teal-505 to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white py-3.5 px-8 rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingAdmission ? "Saving Exam Layout..." : "Save Admission Exam Paper"}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default ExamSchedule;
