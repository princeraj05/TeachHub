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
  FaRedoAlt, 
  FaGraduationCap 
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

  // Timetable-based subject sequencing states
  const [timetableSubjects, setTimetableSubjects] = useState([]);
  const [completedSubjectIds, setCompletedSubjectIds] = useState(new Set());
  const [isCurrentSubjectCompleted, setIsCurrentSubjectCompleted] = useState(false);

  // Data states
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getCleanId = (id) => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object") {
      if (id._id) return getCleanId(id._id);
      if (typeof id.toString === "function") {
        const str = id.toString();
        if (str !== "[object Object]") return str;
      }
    }
    return String(id);
  };

  const getSubName = (subObj) => {
    if (!subObj) return "Subject";
    if (typeof subObj === "object") return subObj.name || subObj.subjectName || "Subject";
    return "Subject";
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = String(timeStr).trim().toUpperCase();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

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

  // Load Timetable Schedule and Subject Sequencing for selected Class & Date
  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;

    const loadTimetableAndCompletions = async () => {
      try {
        const dateObj = new Date(selectedDate);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

        // 1. Fetch timetable entries for class & day
        const ttRes = await axios.get(`${API}/api/timetable?day=${dayName}&classId=${selectedClassId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawEntries = Array.isArray(ttRes.data) ? ttRes.data : [];
        // Sort chronologically by start time
        rawEntries.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

        // Get Set of IDs of subjects assigned to this teacher
        const myTeacherSubjectIds = new Set(subjects.map(s => getCleanId(s._id)));

        const orderedList = [];
        const seenSubIds = new Set();

        rawEntries.forEach(e => {
          const subObj = e.subject;
          const subIdStr = getCleanId(subObj);
          const subName = getSubName(subObj);
          
          // Only include if scheduled today AND assigned to this teacher
          if (subIdStr && (myTeacherSubjectIds.size === 0 || myTeacherSubjectIds.has(subIdStr))) {
            if (!seenSubIds.has(subIdStr)) {
              seenSubIds.add(subIdStr);
              orderedList.push({
                _id: subIdStr,
                name: subName,
                startTime: e.startTime || "",
                endTime: e.endTime || ""
              });
            }
          }
        });

        // Fallback: If no timetable entries exist for today, include teacher's assigned subjects for this class
        if (orderedList.length === 0 && subjects.length > 0) {
          const classSubjects = subjects.filter(subject => {
            if (subject.classes && Array.isArray(subject.classes)) {
              return subject.classes.some(c => getCleanId(c._id || c) === getCleanId(selectedClassId));
            }
            return true;
          });

          classSubjects.forEach(sub => {
            const subId = getCleanId(sub._id);
            if (!seenSubIds.has(subId)) {
              seenSubIds.add(subId);
              orderedList.push({
                _id: subId,
                name: sub.name || "Subject",
                startTime: "",
                endTime: ""
              });
            }
          });
        }

        setTimetableSubjects(orderedList);

        // 2. Check which subjects have already completed attendance on selectedDate
        const completedSet = new Set();
        for (const sub of orderedList) {
          try {
            const checkRes = await axios.get(
              `${API}/api/attendance/by-class?classId=${selectedClassId}&date=${selectedDate}&subjectId=${sub._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (checkRes.data && checkRes.data.alreadyMarked) {
              completedSet.add(getCleanId(sub._id));
            }
          } catch (e) {}
        }
        setCompletedSubjectIds(completedSet);

        // 3. Auto-select the first pending subject in sequence
        const firstPending = orderedList.find(sub => !completedSet.has(getCleanId(sub._id)));
        if (firstPending) {
          setSelectedSubjectId(getCleanId(firstPending._id));
        } else if (orderedList.length > 0) {
          setSelectedSubjectId(getCleanId(orderedList[0]._id));
        } else {
          setSelectedSubjectId("");
        }
      } catch (err) {
        console.error("Error loading timetable sequence:", err);
      }
    };

    loadTimetableAndCompletions();
  }, [selectedClassId, selectedDate, subjects, API, token]);

  // Check if selectedSubjectId is already marked for today
  useEffect(() => {
    if (selectedSubjectId && completedSubjectIds.has(String(selectedSubjectId))) {
      setIsCurrentSubjectCompleted(true);
    } else {
      setIsCurrentSubjectCompleted(false);
    }
  }, [selectedSubjectId, completedSubjectIds]);

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
  };

  // Save/Submit attendance
  const handleSaveAttendance = async () => {
    if (!selectedSubjectId) {
      alert("Please select a subject to mark attendance!");
      return;
    }
    if (isCurrentSubjectCompleted) {
      alert("Attendance for this subject has already been recorded for today!");
      return;
    }

    setSubmitting(true);
    try {
      const recordsToSave = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || "Present",
        remarks: ""
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

      const currentSubIdStr = getCleanId(selectedSubjectId);
      const currentSubObj = timetableSubjects.find(s => getCleanId(s._id) === currentSubIdStr)
        || subjects.find(s => getCleanId(s._id) === currentSubIdStr);
      const currentSubName = currentSubObj ? (currentSubObj.name || getSubName(currentSubObj)) : "Subject";

      // Update completed set with normalized string ID
      const nextCompleted = new Set(completedSubjectIds);
      nextCompleted.add(currentSubIdStr);
      setCompletedSubjectIds(nextCompleted);

      // Find next pending subject in timetable sequence
      const currentIdx = timetableSubjects.findIndex(s => getCleanId(s._id) === currentSubIdStr);
      const nextPending = timetableSubjects.find((s, idx) => idx > currentIdx && !nextCompleted.has(getCleanId(s._id)))
        || timetableSubjects.find(s => !nextCompleted.has(getCleanId(s._id)));

      if (nextPending && getCleanId(nextPending._id) !== currentSubIdStr) {
        setSelectedSubjectId(getCleanId(nextPending._id));
        alert(`Attendance saved for ${currentSubName}! Next pending subject (${nextPending.name}) selected.`);
      } else {
        setIsCurrentSubjectCompleted(true);
        alert(`Attendance saved for ${currentSubName}! All subjects completed for today.`);
      }

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

  students.forEach(s => {
    const status = attendance[s._id];
    if (status === "Absent") absentCount++;
    else presentCount++;
  });

  const presentPct = totalRoster > 0 ? Math.round((presentCount / totalRoster) * 100) : 0;
  const absentPct = totalRoster > 0 ? Math.round((absentCount / totalRoster) * 100) : 0;

  // Circular gauge config
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (presentPct / 100) * circumference;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm">
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
          <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select Subject *</label>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {timetableSubjects.length === 0 ? (
                <option value="">No subjects found</option>
              ) : (
                timetableSubjects.map(sub => {
                  const isDone = completedSubjectIds.has(sub._id);
                  const timeLabel = sub.startTime ? `${sub.startTime} - ${sub.endTime} | ` : "";
                  return (
                    <option key={sub._id} value={sub._id}>
                      {timeLabel}{sub.name}{isDone ? " (Completed Today ✔)" : ""}
                    </option>
                  );
                })
              )}
            </select>
            <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Completed Attendance Today Info Banner */}
      {isCurrentSubjectCompleted && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <span>✔ Attendance for this subject has already been recorded for today ({selectedDate}). Next attendance will be available tomorrow!</span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-[10px] font-black uppercase tracking-wider shrink-0">Completed Today</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Hand: Student List Table */}
        <div className="flex-1 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
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
                              className={`px-4 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
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
                              className={`px-4 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                currentStatus === "Absent"
                                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm"
                                  : "border-slate-200 dark:border-white/[0.05] text-slate-450 hover:bg-slate-100 dark:hover:bg-white/[0.02]"
                              }`}
                            >
                              <FaTimes className="text-[9px]" /> Absent
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
              disabled={submitting || totalRoster === 0 || !selectedSubjectId || isCurrentSubjectCompleted}
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

    </div>
  );
}

export default MarkAttendance;
