import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaClipboardList, 
  FaUserGraduate, 
  FaCalendarAlt, 
  FaSave, 
  FaCheck, 
  FaTimes, 
  FaBook, 
  FaHistory, 
  FaSearch, 
  FaRegCommentDots, 
  FaRedoAlt, 
  FaGraduationCap, 
  FaClock, 
  FaCalendarCheck 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const SORA = "'Sora', sans-serif";

function MarkAttendance() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Selection states
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));

  // Data states
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeRemarkStudent, setActiveRemarkStudent] = useState(null);
  const [tempRemarkText, setTempRemarkText] = useState("");

  // Fetch classes and subjects on load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const classesRes = await axios.get(`${API}/api/teacher/my-classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0]._id);
        }

        const subjectsRes = await axios.get(`${API}/api/teacher/my-subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, [API, token]);

  // Fetch students when selected class, date, or subject changes
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/api/attendance/by-class?classId=${selectedClassId}&date=${selectedDate}&subjectId=${selectedSubjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStudents(res.data.students || []);
        
        // Populate attendance and remarks state from retrieved records
        const initialAttendance = {};
        const initialRemarks = {};
        res.data.students.forEach(student => {
          if (student.status) {
            initialAttendance[student._id] = student.status;
          } else {
            // Default to Present if not marked
            initialAttendance[student._id] = "Present";
          }
          initialRemarks[student._id] = student.remarks || "";
        });

        setAttendance(initialAttendance);
        setRemarks(initialRemarks);
        setSelectedStudentIds(new Set());
      } catch (err) {
        console.error("Error fetching students attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedClassId, selectedDate, selectedSubjectId, API, token]);

  // Filter subjects based on selected class
  const filteredSubjects = subjects.filter(subject => {
    if (subject.classes && Array.isArray(subject.classes)) {
      return subject.classes.some(c => c._id === selectedClassId);
    }
    return false;
  });

  // Handle individual status change
  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Filter students based on search input
  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const rollMatch = s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || rollMatch;
  });

  // Handle selection checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredStudents.map(s => s._id);
      setSelectedStudentIds(new Set(allIds));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Bulk Actions
  const handleBulkMarkStatus = (status) => {
    setAttendance(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = status;
      });
      return next;
    });
  };

  const handleBulkReset = () => {
    setAttendance(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = "Present"; // Reset back to default Present
      });
      return next;
    });
    setRemarks(prev => {
      const next = { ...prev };
      selectedStudentIds.forEach(id => {
        next[id] = "";
      });
      return next;
    });
  };

  // Save/Submit attendance
  const handleSaveAttendance = async () => {
    setSubmitting(true);
    try {
      const recordsToSave = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || "Present",
        remarks: remarks[s._id] || ""
      }));

      await axios.post(
        `${API}/api/attendance/bulk-save`,
        {
          classId: selectedClassId,
          date: selectedDate,
          subjectId: selectedSubjectId,
          records: recordsToSave
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Attendance saved successfully!");
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Failed to save attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  // Summary Metrics calculations
  const totalRoster = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  students.forEach(s => {
    const status = attendance[s._id];
    if (status === "Present") presentCount++;
    else if (status === "Absent") absentCount++;
    else if (status === "Late") lateCount++;
    else if (status === "Leave" || status === "On Leave") leaveCount++;
  });

  const presentPct = totalRoster > 0 ? Math.round((presentCount / totalRoster) * 100) : 0;
  const absentPct = totalRoster > 0 ? Math.round((absentCount / totalRoster) * 100) : 0;
  const latePct = totalRoster > 0 ? Math.round((lateCount / totalRoster) * 100) : 0;
  const leavePct = totalRoster > 0 ? Math.round((leaveCount / totalRoster) * 100) : 0;

  // Circular gauge config
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (presentPct / 100) * circumference;

  // Remarks modal helpers
  const openRemarksModal = (studentId) => {
    setActiveRemarkStudent(studentId);
    setTempRemarkText(remarks[studentId] || "");
  };

  const saveRemark = () => {
    setRemarks(prev => ({
      ...prev,
      [activeRemarkStudent]: tempRemarkText
    }));
    setActiveRemarkStudent(null);
  };

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Mark Attendance</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Select class, date and mark students attendance
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-purple-500">Mark Attendance</span>
          </div>
        </div>

        <Link
          to="/teacher/attendance-history"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition-all w-fit"
        >
          <FaHistory />
          View Attendance History
        </Link>
      </div>

      {/* Select Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
        {/* Date Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Date</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>

        {/* Subject Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Subject (Optional)</label>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">General Roster Check</option>
              {filteredSubjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
            <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Hand: Student List Table */}
        <div className="flex-1 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* Table Toolbar controls */}
          <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Bulk Actions buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mr-2">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-350 dark:border-white/[0.08] dark:bg-[#1f2937] text-purple-600 focus:ring-purple-500"
                />
                Select All ({selectedStudentIds.size})
              </label>

              <span className="text-slate-300 dark:text-white/10 text-sm">|</span>

              <button
                onClick={() => handleBulkMarkStatus("Present")}
                disabled={selectedStudentIds.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCheck /> Mark Present
              </button>
              
              <button
                onClick={() => handleBulkMarkStatus("Absent")}
                disabled={selectedStudentIds.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes /> Mark Absent
              </button>

              <button
                onClick={handleBulkReset}
                disabled={selectedStudentIds.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/[0.05] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaRedoAlt className="text-[9px]" /> Reset
              </button>
            </div>

            {/* Search inputs bar */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>

          </div>

          {/* Student Roster Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <p className="text-slate-400 text-xs font-semibold">Loading roster list...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-450 text-xl shadow-inner">
                <FaUserGraduate />
              </div>
              <div>
                <p className="text-slate-800 dark:text-white font-bold text-sm">No Students Found</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">Try changing class filter or query criteria.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 w-12 text-center">#</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll No.</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {filteredStudents.map((s, idx) => {
                    const initials = s.name
                      ? s.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                      : "S";
                    const isChecked = selectedStudentIds.has(s._id);
                    const currentStatus = attendance[s._id] || "Present";

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all">
                        {/* Selector Checkbox */}
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectStudent(s._id)}
                            className="rounded border-slate-350 dark:border-white/[0.08] dark:bg-[#1f2937] text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                        
                        {/* Student Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {s.avatar ? (
                              <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 font-black flex items-center justify-center border border-purple-500/15 shrink-0 select-none">
                                {initials}
                              </div>
                            )}
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{s.name}</span>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td className="px-6 py-4 font-black text-slate-500 dark:text-slate-400">
                          {s.rollNo}
                        </td>

                        {/* Status Toggle buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Present Button */}
                            <button
                              onClick={() => handleStatusChange(s._id, "Present")}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === "Present"
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm"
                                  : "border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
                              }`}
                            >
                              <FaCheck className="text-[9px]" /> Present
                            </button>

                            {/* Absent Button */}
                            <button
                              onClick={() => handleStatusChange(s._id, "Absent")}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === "Absent"
                                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm"
                                  : "border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
                              }`}
                            >
                              <FaTimes className="text-[9px]" /> Absent
                            </button>

                            {/* Late Button */}
                            <button
                              onClick={() => handleStatusChange(s._id, "Late")}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === "Late"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm"
                                  : "border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
                              }`}
                            >
                              <FaClock className="text-[9px]" /> Late
                            </button>

                            {/* Leave Button */}
                            <button
                              onClick={() => handleStatusChange(s._id, "Leave")}
                              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === "Leave" || currentStatus === "On Leave"
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-sm"
                                  : "border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
                              }`}
                            >
                              <FaCalendarCheck className="text-[9px]" /> Leave
                            </button>
                          </div>
                        </td>

                        {/* Optional Remarks Button */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openRemarksModal(s._id)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] ${
                              remarks[s._id]
                                ? "bg-purple-500/10 border-purple-500/35 text-purple-500"
                                : "border-slate-200 dark:border-white/[0.05] text-slate-450"
                            }`}
                          >
                            <FaRegCommentDots className="text-sm" />
                          </button>
                          {remarks[s._id] && (
                            <p className="text-[9px] text-slate-400 mt-1 font-semibold truncate max-w-[120px] mx-auto">
                              {remarks[s._id]}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Ledger Warning */}
          <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/20 dark:bg-white/[0.01] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
              Ensure all student checkmarks are verified before submitting attendance ledger.
            </p>
          </div>

        </div>

        {/* Right Hand: Statistics Summary Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Card: Attendance Summary gauge */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">Attendance Summary</h2>
            
            <div className="flex items-center gap-6 py-2">
              {/* Circular SVG Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r={radius} className="stroke-slate-100 dark:stroke-white/[0.05] fill-none" strokeWidth="6" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r={radius} 
                    className="stroke-purple-500 fill-none" 
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{presentPct}%</span>
                  <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Present</span>
                </div>
              </div>

              {/* Status List Breakdown */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-450">Present</span>
                  </div>
                  <span className="text-slate-800 dark:text-white font-extrabold">{presentCount} ({presentPct}%)</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-450">Absent</span>
                  </div>
                  <span className="text-slate-800 dark:text-white font-extrabold">{absentCount} ({absentPct}%)</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-450">Late</span>
                  </div>
                  <span className="text-slate-800 dark:text-white font-extrabold">{lateCount} ({latePct}%)</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-slate-450">Leave</span>
                  </div>
                  <span className="text-slate-800 dark:text-white font-extrabold">{leaveCount} ({leavePct}%)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/[0.03] pt-3 flex items-center justify-between text-[10px] font-black text-slate-450 tracking-wider">
              <span>TOTAL ROSTER STUDENTS</span>
              <span className="text-slate-900 dark:text-white text-xs">{totalRoster}</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">Quick Actions</h2>
            
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/teacher/showtimetable" 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1f2937]/50 border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 text-xs font-bold transition-all text-slate-650 dark:text-slate-300"
              >
                <span>Today's Timetable</span>
                <span>&rarr;</span>
              </Link>
              
              <Link 
                to="/teacher/my-classes" 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1f2937]/50 border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 text-xs font-bold transition-all text-slate-650 dark:text-slate-300"
              >
                <span>View Class Details</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Save Ledger button */}
            <button
              onClick={handleSaveAttendance}
              disabled={submitting || totalRoster === 0}
              className="w-full py-3 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving Attendance...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Attendance
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Optional Remarks Dialog modal overlay */}
      {activeRemarkStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/[0.08] w-full max-w-sm rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Add Attendance Remark</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Write any specific notes or comments for this student's attendance.</p>
            </div>

            <textarea
              rows="4"
              value={tempRemarkText}
              onChange={(e) => setTempRemarkText(e.target.value)}
              placeholder="e.g. Arrived 15 minutes late with permission slip..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setActiveRemarkStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all cursor-pointer border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={saveRemark}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MarkAttendance;