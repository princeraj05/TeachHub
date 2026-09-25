import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaLock,
  FaBook,
  FaUsers,
  FaSpinner,
  FaSchool,
  FaExclamationCircle
} from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

export default function TeacherAcademicResults() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  // Dynamic Academic Year Choices (Current Year +/- 1)
  const getCurrentAcademicYears = () => {
    const currY = new Date().getFullYear();
    return [
      `${currY - 1}-${currY}`,
      `${currY}-${currY + 1}`,
      `${currY + 1}-${currY + 2}`
    ];
  };

  const academicYearOptions = getCurrentAcademicYears();

  // Filters State
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [groupedClassMap, setGroupedClassMap] = useState(new Map());
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[1] || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [examTerm, setExamTerm] = useState("Half-Yearly");

  // Assigned Subjects State
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Roster & Summary Data State
  const [rosterData, setRosterData] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [classSummary, setClassSummary] = useState(null);

  // Form State
  const [editableMarks, setEditableMarks] = useState({});
  const [examExists, setExamExists] = useState(true);

  // Status & Notifications
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // 1. Fetch Teacher's Assigned Classes and Subjects
  const fetchTeacherAssignments = async () => {
    setLoading(true);
    setErrorNotice("");
    try {
      // Fetch assigned classes
      const classRes = await axios.get(`${API}/api/teacher/my-classes`, getHeaders());
      const classList = Array.isArray(classRes.data) ? classRes.data : [];
      setAssignedClasses(classList);

      // Group assigned classes by Class Name
      const map = new Map();
      classList.forEach(c => {
        const cName = String(c.name || "").trim();
        if (!cName) return;
        if (!map.has(cName)) {
          map.set(cName, []);
        }
        map.get(cName).push(c);
      });
      setGroupedClassMap(map);

      // Fetch assigned subjects
      const subRes = await axios.get(`${API}/api/teacher/my-subjects`, getHeaders());
      const subjectList = Array.isArray(subRes.data) ? subRes.data : [];
      setAssignedSubjects(subjectList);

      // Default selection of first assigned class
      const sortedNames = Array.from(map.keys()).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });

      if (sortedNames.length > 0) {
        const firstCName = sortedNames[0];
        setSelectedClassName(firstCName);
        const secDocs = map.get(firstCName) || [];
        setAvailableSections(secDocs.map(s => s.section || "A"));
        setSelectedClassId(secDocs[0]?._id || "");
        setSelectedSection(secDocs[0]?.section || "A");
      }
    } catch (err) {
      console.error("Error loading teacher assignments:", err);
      setErrorNotice("Failed to load your assigned classes and subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherAssignments();
  }, []);

  // 2. Filter Available Subjects when selected class changes
  useEffect(() => {
    if (!selectedClassId) {
      setFilteredSubjects([]);
      setSelectedSubjectId("");
      return;
    }

    // Filter subjects assigned to teacher that are linked to selectedClassId
    const matchingSubjects = assignedSubjects.filter(sub => {
      const classArray = Array.isArray(sub.class) ? sub.class : [];
      const classesArray = Array.isArray(sub.classes) ? sub.classes : [];
      const combined = [...classArray, ...classesArray];
      return combined.some(c => (c._id || c).toString() === selectedClassId.toString());
    });

    setFilteredSubjects(matchingSubjects);
    if (matchingSubjects.length > 0) {
      setSelectedSubjectId(matchingSubjects[0]._id);
    } else {
      setSelectedSubjectId("");
    }
  }, [selectedClassId, assignedSubjects]);

  // 3. Handle Class Selection Change
  const handleClassChange = (e) => {
    const cName = e.target.value;
    setSelectedClassName(cName);
    const secDocs = groupedClassMap.get(cName) || [];
    const secList = secDocs.map(s => s.section || "A");
    setAvailableSections(secList);

    if (secDocs.length > 0) {
      setSelectedClassId(secDocs[0]._id);
      setSelectedSection(secDocs[0].section || "A");
    } else {
      setSelectedClassId("");
      setSelectedSection("ALL");
    }
  };

  // 4. Handle Section Selection Change
  const handleSectionChange = (e) => {
    const secVal = e.target.value;
    setSelectedSection(secVal);
    const secDocs = groupedClassMap.get(selectedClassName) || [];
    const matchingDoc = secDocs.find(s => (s.section || "A").toUpperCase() === secVal.toUpperCase());
    if (matchingDoc) {
      setSelectedClassId(matchingDoc._id);
    } else if (secDocs.length > 0) {
      setSelectedClassId(secDocs[0]._id);
    }
  };

  // 5. Load Roster for Selected Filters
  const loadRosterData = useCallback(async () => {
    if (!selectedClassId || !selectedSubjectId || !examTerm || !academicYear) {
      setRosterData([]);
      setIsPublished(false);
      setExamExists(true);
      return;
    }

    setLoading(true);
    setErrorNotice("");
    setNotice("");

    try {
      // Check class summary publication status
      const summaryUrl = `${API}/api/results/class-summary?classId=${selectedClassId}&section=${encodeURIComponent(selectedSection)}&examTerm=${encodeURIComponent(examTerm)}&academicYear=${encodeURIComponent(academicYear)}`;
      try {
        const summaryRes = await axios.get(summaryUrl, getHeaders());
        setClassSummary(summaryRes.data);
        setIsPublished(!!summaryRes.data.isClassPublished);
      } catch {
        setClassSummary(null);
        setIsPublished(false);
      }

      // Fetch Subject Roster
      const rosterUrl = `${API}/api/results/roster?classId=${selectedClassId}&section=${encodeURIComponent(selectedSection)}&subjectId=${selectedSubjectId}&examTerm=${encodeURIComponent(examTerm)}&academicYear=${encodeURIComponent(academicYear)}`;
      const rosterRes = await axios.get(rosterUrl, getHeaders());

      if (rosterRes.data && rosterRes.data.examExists === false) {
        setExamExists(false);
        setRosterData([]);
        setErrorNotice(rosterRes.data.message || "No Class Exam has been scheduled by the Admin for this class, subject, examination term and academic year.");
        return;
      }

      setExamExists(true);
      const studentRoster = rosterRes.data.roster || [];
      const authoritativeMaxMarks = rosterRes.data.maxMarks || 100;
      setRosterData(studentRoster);

      // Pre-fill editable marks map with Authoritative Max Marks
      const initialMap = {};
      studentRoster.forEach(s => {
        initialMap[s.studentId] = {
          marksObtained: s.marksObtained ?? 0,
          maxMarks: authoritativeMaxMarks,
          isAbsent: !!s.isAbsent,
          remarks: s.remarks || ""
        };
      });
      setEditableMarks(initialMap);

    } catch (err) {
      console.error("Error loading roster:", err);
      setExamExists(false);
      setRosterData([]);
      setErrorNotice(err.response?.data?.message || "No Class Exam has been scheduled by the Admin for this selection. Marks entry is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [API, token, selectedClassId, selectedSection, selectedSubjectId, examTerm, academicYear]);

  useEffect(() => {
    loadRosterData();
  }, [loadRosterData]);

  // Handle Mark Change in Roster Table
  const handleMarkChange = (studentId, field, value) => {
    setEditableMarks(prev => {
      const current = prev[studentId] || { marksObtained: 0, maxMarks: 100, isAbsent: false, remarks: "" };
      let updated = { ...current };

      if (field === "isAbsent") {
        const flag = !!value;
        updated.isAbsent = flag;
        if (flag) updated.marksObtained = 0;
      } else if (field === "marksObtained") {
        updated.marksObtained = value;
      } else if (field === "remarks") {
        updated.remarks = value;
      }

      return { ...prev, [studentId]: updated };
    });
  };

  // Bulk Save Subject Marks
  const saveMarks = async () => {
    if (!selectedClassId || !selectedSubjectId || !examExists) return;
    setSaving(true);
    setErrorNotice("");
    setNotice("");

    try {
      const payloadMarks = rosterData.map(student => {
        const entry = editableMarks[student.studentId] || {};
        const isAbs = !!entry.isAbsent;
        const maxM = Number(entry.maxMarks) || 100;
        const obtM = isAbs ? 0 : Number(entry.marksObtained);

        return {
          studentId: student.studentId,
          classId: selectedClassId,
          section: selectedSection,
          subjectId: selectedSubjectId,
          examTerm,
          academicYear,
          marksObtained: obtM,
          maxMarks: maxM,
          isAbsent: isAbs,
          remarks: entry.remarks || ""
        };
      });

      // Front-end sanity validation
      for (const m of payloadMarks) {
        if (isNaN(m.marksObtained) || m.marksObtained < 0) {
          throw new Error("Marks obtained cannot be negative or empty.");
        }
        if (isNaN(m.maxMarks) || m.maxMarks <= 0) {
          throw new Error("Max marks must be greater than 0.");
        }
        if (m.marksObtained > m.maxMarks) {
          throw new Error(`Marks obtained (${m.marksObtained}) cannot exceed max marks (${m.maxMarks}).`);
        }
      }

      const res = await axios.post(`${API}/api/results/marks`, { marks: payloadMarks }, getHeaders());
      setNotice(res.data.message || "Marks saved successfully!");
      setTimeout(() => setNotice(""), 4000);
      await loadRosterData();
    } catch (err) {
      console.error("Save marks error:", err);
      if (err.response && err.response.status === 400 && err.response.data?.message?.includes("published")) {
        setErrorNotice("Result is published — Read Only. Contact Admin to unpublish if corrections are required.");
        setIsPublished(true);
      } else {
        setErrorNotice(err.response?.data?.message || err.message || "Failed to save marks.");
      }
      setTimeout(() => setErrorNotice(""), 6000);
    } finally {
      setSaving(false);
    }
  };

  // Filter roster items by student search
  const filteredRoster = rosterData.filter(student =>
    (student.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.rollNo || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.admissionNo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSubjectObj = assignedSubjects.find(s => s._id === selectedSubjectId);

  return (
    <div className="font-sans text-slate-800 dark:text-slate-100 pb-32" style={{ fontFamily: SORA }}>
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Teacher Portal • Marks Entry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FaGraduationCap className="text-[#7C3AED] dark:text-[#38BDF8]" />
            Academic Marks Entry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Enter and update subject marks for your assigned classes and examination terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl px-4 py-2.5 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
            <FaCalendarAlt className="text-[#7C3AED] dark:text-[#38BDF8]" />
            <span>Academic Year: <strong className="text-slate-900 dark:text-white">{academicYear}</strong></span>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {notice && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-2xl px-5 py-3.5 text-xs font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-base flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 rounded-2xl px-5 py-3.5 text-xs font-bold shadow-sm animate-fadeIn">
          <FaTimesCircle className="text-rose-500 text-base flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {isPublished && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm animate-fadeIn">
          <FaLock className="text-amber-500 text-lg flex-shrink-0" />
          <div>
            <span className="font-extrabold block text-sm">Result Published — Read Only</span>
            <span className="font-medium text-slate-600 dark:text-amber-300/80">
              Results for {examTerm} {academicYear} have been published by the School Admin. Mark modification is locked.
            </span>
          </div>
        </div>
      )}

      {/* FILTER SELECTION CARD */}
      <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 flex items-center justify-center">
            <FaFilter className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Class & Subject Selection</h2>
            <p className="text-xs text-slate-400 font-medium">Select your assigned Class, Section, Subject, Academic Year, and Term</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Class Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Level</label>
            <select
              value={selectedClassName}
              onChange={handleClassChange}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              {Array.from(groupedClassMap.keys()).map(cName => (
                <option key={cName} value={cName} className="dark:bg-[#0B132A]">
                  Class {cName}
                </option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Section</label>
            <select
              value={selectedSection}
              onChange={handleSectionChange}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="ALL" className="dark:bg-[#0B132A]">All Sections</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec} className="dark:bg-[#0B132A]">
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              {filteredSubjects.map(sub => (
                <option key={sub._id} value={sub._id} className="dark:bg-[#0B132A]">
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Academic Year</label>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              {academicYearOptions.map(yr => (
                <option key={yr} value={yr} className="dark:bg-[#0B132A]">{yr}</option>
              ))}
            </select>
          </div>

          {/* Examination Term Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Examination Term</label>
            <select
              value={examTerm}
              onChange={e => setExamTerm(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="Half-Yearly" className="dark:bg-[#0B132A]">Half-Yearly Examination</option>
              <option value="Annual" className="dark:bg-[#0B132A]">Annual Examination</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <FaUsers />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Class Students</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{rosterData.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg">
            <FaBook />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Subject Name</p>
            <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">
              {currentSubjectObj?.name || "Subject"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Entered Marks</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {rosterData.filter(s => s.isSaved).length} / {rosterData.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <FaLock />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Result Status</p>
            <p className={`text-xs font-black ${isPublished ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {isPublished ? "PUBLISHED" : "DRAFT"}
            </p>
          </div>
        </div>
      </div>

      {/* MARKS ENTRY WORKSPACE CARD */}
      <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm overflow-hidden">
        {/* Workspace Action Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search student by name/roll..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              disabled={saving || isPublished || !selectedSubjectId || !examExists}
              onClick={saveMarks}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isPublished || !selectedSubjectId || !examExists
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 cursor-not-allowed"
                  : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/20"
              }`}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>Save Subject Marks</span>
            </button>
          </div>
        </div>

        {/* ROSTER TABLE DISPLAY */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <FaSpinner className="text-3xl text-[#7C3AED] animate-spin" />
            <span className="text-xs font-bold text-slate-400 animate-pulse">Loading student roster & marks...</span>
          </div>
        ) : !examExists ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-500 mb-3 text-2xl">
              <FaExclamationCircle />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Class Exam Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md font-medium">
              No exam has been created by the Admin for this class, subject, examination term and academic year. Marks entry is unavailable until the Admin schedules this examination.
            </p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3 text-2xl">
              <FaUsers />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Students Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {!selectedSubjectId
                ? "No subject is assigned to you for this class."
                : `No enrolled students were found for Class ${selectedClassName} Section ${selectedSection}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.08] text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Marks Obtained</th>
                  <th className="py-3.5 px-4">Max Marks (Admin Set)</th>
                  <th className="py-3.5 px-4">Absent</th>
                  <th className="py-3.5 px-4">Server Calculated Grade</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredRoster.map((student, idx) => {
                  const sId = student.studentId || student._id;
                  const markEntry = editableMarks[sId] || {
                    marksObtained: student.marksObtained ?? 0,
                    maxMarks: student.maxMarks ?? 100,
                    isAbsent: !!student.isAbsent,
                    remarks: student.remarks || ""
                  };

                  return (
                    <tr key={sId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{student.studentName}</div>
                        <div className="text-[10px] font-medium text-slate-400">Adm #{student.admissionNo || "N/A"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                        {student.rollNo || (idx + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          min="0"
                          max={markEntry.maxMarks}
                          disabled={markEntry.isAbsent || isPublished}
                          value={markEntry.isAbsent ? 0 : markEntry.marksObtained}
                          onChange={e => handleMarkChange(sId, "marksObtained", e.target.value)}
                          className="w-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-1.5 font-extrabold text-xs text-slate-700 dark:text-slate-200">
                          {markEntry.maxMarks || 100}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isPublished}
                            checked={!!markEntry.isAbsent}
                            onChange={e => handleMarkChange(sId, "isAbsent", e.target.checked)}
                            className="w-4 h-4 text-[#7C3AED] rounded border-slate-300 focus:ring-[#7C3AED]"
                          />
                          <span className={`text-xs font-bold ${markEntry.isAbsent ? "text-rose-500" : "text-slate-400"}`}>
                            {markEntry.isAbsent ? "ABSENT" : "Present"}
                          </span>
                        </label>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                          markEntry.isAbsent
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : student.grade === "A+" || student.grade === "A"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : student.grade === "F"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        }`}>
                          {student.grade || (markEntry.isAbsent ? "AB" : "—")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Remarks..."
                          disabled={isPublished}
                          value={markEntry.remarks || ""}
                          onChange={e => handleMarkChange(sId, "remarks", e.target.value)}
                          className="w-36 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
