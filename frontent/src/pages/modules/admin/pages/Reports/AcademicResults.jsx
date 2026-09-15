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
  FaUnlock,
  FaEye,
  FaExclamationTriangle,
  FaBook,
  FaUsers,
  FaChartBar,
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaCheck
} from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

export default function AcademicResults() {
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
  const [classes, setClasses] = useState([]);
  const [groupedClassMap, setGroupedClassMap] = useState(new Map());
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [academicYear, setAcademicYear] = useState(academicYearOptions[1] || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [examTerm, setExamTerm] = useState("Half-Yearly");

  // Data & Subjects State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [rosterData, setRosterData] = useState([]);
  const [classSummary, setClassSummary] = useState(null);

  // Mark Entry Form State (for subject roster inline edit)
  const [editableMarks, setEditableMarks] = useState({});

  // Single Student Detail Modal State
  const [studentModal, setStudentModal] = useState(null);
  const [studentModalMarks, setStudentModalMarks] = useState([]);

  // Publish / Unpublish Modals & Banner Messages
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
  const [incompleteWarning, setIncompleteWarning] = useState(null);

  // Status & Notifications
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // 1. Fetch Master Classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/classes`, getHeaders());
      const classList = Array.isArray(res.data) ? res.data : [];
      setClasses(classList);

      // Group classes by class name (e.g. Class 1, Class 2, Class 5)
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

      // Default select first available class
      const classNamesSorted = Array.from(map.keys()).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });

      if (classNamesSorted.length > 0) {
        const firstClassName = classNamesSorted[0];
        setSelectedClassName(firstClassName);
        const secDocs = map.get(firstClassName) || [];
        setAvailableSections(secDocs.map(s => s.section || "A"));
        setSelectedClassId(secDocs[0]?._id || "");
        setSelectedSection(secDocs[0]?.section || "A");
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setErrorNotice("Failed to load school classes.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 2. Handle Class Selection Change
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

  // 3. Handle Section Selection Change
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

  // 4. Fetch Subjects for Selected Class
  const fetchSubjectsForClass = useCallback(async () => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await axios.get(`${API}/api/admin/subjects`, getHeaders());
      const allSubjects = Array.isArray(res.data) ? res.data : [];
      
      // Filter subjects associated with selectedClassId
      const filtered = allSubjects.filter(sub => {
        const classArray = Array.isArray(sub.class) ? sub.class : [];
        const classesArray = Array.isArray(sub.classes) ? sub.classes : [];
        const combined = [...classArray, ...classesArray];
        return combined.some(c => (c._id || c).toString() === selectedClassId.toString());
      });

      setSubjects(filtered);
      setSelectedSubjectId("ALL"); // Default to Class Overall Summary
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  }, [API, token, selectedClassId]);

  useEffect(() => {
    fetchSubjectsForClass();
  }, [fetchSubjectsForClass]);

  // 5. Load Roster / Summary Data based on filters and selectedSubjectId
  const loadWorkspaceData = useCallback(async () => {
    if (!selectedClassId || !examTerm || !academicYear) return;
    setLoading(true);
    setErrorNotice("");
    setIncompleteWarning(null);

    try {
      // Load Class Summary Data
      const summaryUrl = `${API}/api/results/class-summary?classId=${selectedClassId}&section=${encodeURIComponent(selectedSection)}&examTerm=${encodeURIComponent(examTerm)}&academicYear=${encodeURIComponent(academicYear)}`;
      const summaryRes = await axios.get(summaryUrl, getHeaders());
      setClassSummary(summaryRes.data);

      if (selectedSubjectId === "ALL") {
        // Roster is overall class summary roster
        setRosterData(summaryRes.data.roster || []);
        setEditableMarks({});
      } else {
        // Load Subject Specific Roster for Marks Entry
        const rosterUrl = `${API}/api/results/roster?classId=${selectedClassId}&section=${encodeURIComponent(selectedSection)}&subjectId=${selectedSubjectId}&examTerm=${encodeURIComponent(examTerm)}&academicYear=${encodeURIComponent(academicYear)}`;
        const rosterRes = await axios.get(rosterUrl, getHeaders());
        const studentRoster = rosterRes.data.roster || [];
        setRosterData(studentRoster);

        // Pre-fill editable marks map
        const initialMap = {};
        studentRoster.forEach(s => {
          initialMap[s.studentId] = {
            marksObtained: s.marksObtained ?? 0,
            maxMarks: s.maxMarks ?? 100,
            isAbsent: !!s.isAbsent,
            remarks: s.remarks || ""
          };
        });
        setEditableMarks(initialMap);
      }
    } catch (err) {
      console.error("Error loading workspace data:", err);
      setErrorNotice(err.response?.data?.message || "Failed to load result workspace data.");
    } finally {
      setLoading(false);
    }
  }, [API, token, selectedClassId, selectedSection, selectedSubjectId, examTerm, academicYear]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Handle Mark Change in Subject Roster
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
      } else if (field === "maxMarks") {
        updated.maxMarks = value;
      } else if (field === "remarks") {
        updated.remarks = value;
      }

      return { ...prev, [studentId]: updated };
    });
  };

  // Save Subject Marks (Bulk Save for current subject)
  const saveSubjectMarks = async () => {
    if (selectedSubjectId === "ALL" || !selectedSubjectId) return;
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

      // Front-end sanity validation before payload submit
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
      await loadWorkspaceData();
    } catch (err) {
      console.error("Save marks error:", err);
      setErrorNotice(err.response?.data?.message || err.message || "Failed to save subject marks.");
      setTimeout(() => setErrorNotice(""), 6000);
    } finally {
      setSaving(false);
    }
  };

  // Open Student Full Marks Review Modal
  const openStudentModal = async (student) => {
    setStudentModal(student);
    setStudentModalMarks([]);
    try {
      // Fetch all marks for this student across all subjects
      const marksPromises = subjects.map(async (sub) => {
        try {
          const res = await axios.get(
            `${API}/api/results/roster?classId=${selectedClassId}&section=${encodeURIComponent(selectedSection)}&subjectId=${sub._id}&examTerm=${encodeURIComponent(examTerm)}&academicYear=${encodeURIComponent(academicYear)}`,
            getHeaders()
          );
          const studentEntry = (res.data.roster || []).find(s => s.studentId === student.studentId || s.studentId === student._id);
          return {
            subjectId: sub._id,
            subjectName: sub.name,
            marksObtained: studentEntry ? studentEntry.marksObtained : 0,
            maxMarks: studentEntry ? studentEntry.maxMarks : 100,
            isAbsent: studentEntry ? studentEntry.isAbsent : false,
            grade: studentEntry ? studentEntry.grade : "",
            remarks: studentEntry ? studentEntry.remarks : "",
            isSaved: !!studentEntry?.isSaved
          };
        } catch {
          return {
            subjectId: sub._id,
            subjectName: sub.name,
            marksObtained: 0,
            maxMarks: 100,
            isAbsent: false,
            grade: "",
            remarks: "",
            isSaved: false
          };
        }
      });
      const resolved = await Promise.all(marksPromises);
      setStudentModalMarks(resolved);
    } catch (err) {
      console.error("Error opening student detail modal:", err);
    }
  };

  // Publish Class Results
  const handlePublishResults = async () => {
    setActionLoading(true);
    setErrorNotice("");
    setNotice("");
    setIncompleteWarning(null);

    try {
      const payload = {
        classId: selectedClassId,
        section: selectedSection,
        examTerm,
        academicYear
      };

      const res = await axios.post(`${API}/api/results/publish`, payload, getHeaders());
      setNotice(res.data.message || "Class results published successfully!");
      setPublishModalOpen(false);
      setTimeout(() => setNotice(""), 4000);
      await loadWorkspaceData();
    } catch (err) {
      console.error("Publish error:", err);
      setPublishModalOpen(false);
      if (err.response && err.response.data && err.response.data.incompleteStudents) {
        setIncompleteWarning(err.response.data);
      } else {
        setErrorNotice(err.response?.data?.message || "Failed to publish class results.");
        setTimeout(() => setErrorNotice(""), 6000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Unpublish Class Results
  const handleUnpublishResults = async () => {
    setActionLoading(true);
    setErrorNotice("");
    setNotice("");

    try {
      const payload = {
        classId: selectedClassId,
        section: selectedSection,
        examTerm,
        academicYear
      };

      const res = await axios.post(`${API}/api/results/unpublish`, payload, getHeaders());
      setNotice(res.data.message || "Class results unpublished successfully!");
      setUnpublishModalOpen(false);
      setTimeout(() => setNotice(""), 4000);
      await loadWorkspaceData();
    } catch (err) {
      console.error("Unpublish error:", err);
      setUnpublishModalOpen(false);
      setErrorNotice(err.response?.data?.message || "Failed to unpublish class results.");
      setTimeout(() => setErrorNotice(""), 6000);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter roster items by search query
  const filteredRoster = rosterData.filter(student =>
    (student.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.rollNo || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.admissionNo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isClassPublished = classSummary?.isClassPublished || false;
  const currentSubjectObj = subjects.find(s => s._id === selectedSubjectId);

  return (
    <div className="font-sans text-slate-800 dark:text-slate-100 pb-16" style={{ fontFamily: SORA }}>
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full">
              School Academic Examination
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FaGraduationCap className="text-[#7C3AED] dark:text-[#38BDF8]" />
            Academic Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage Half-Yearly and Annual examination results, entry rosters, and publication status.
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

      {incompleteWarning && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 rounded-2xl p-5 text-xs font-medium shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm mb-2">
            <FaExclamationTriangle className="text-amber-500 text-lg" />
            <span>Cannot Publish: Incomplete Subject Marks ({incompleteWarning.incompleteCount} Student(s))</span>
          </div>
          <p className="mb-3 text-slate-600 dark:text-amber-300/80">
            All configured subjects must have entered marks for every student in the class before results can be published.
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
            {incompleteWarning.incompleteStudents?.map((inc, idx) => (
              <div key={idx} className="bg-amber-100/60 dark:bg-amber-900/40 p-2 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold">{inc.studentName} (Roll #{inc.rollNo || "N/A"})</span>
                <span className="text-amber-700 dark:text-amber-300 font-semibold">Missing: {inc.missingSubjects?.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER CONTROL PANEL CARD */}
      <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 flex items-center justify-center">
            <FaFilter className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Examination Result Filters</h2>
            <p className="text-xs text-slate-400 font-medium">Select Class, Section, Academic Year, and Examination Term</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* DYNAMIC SUBJECT TABS BAR */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FaBook className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Class Subjects ({subjects.length})
            </span>
          </div>
          {subjects.length === 0 && !loading && (
            <span className="text-xs text-amber-500 font-bold">No subjects configured for Class {selectedClassName}</span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Class Overview Tab */}
          <button
            onClick={() => setSelectedSubjectId("ALL")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 shrink-0 flex items-center gap-2 ${
              selectedSubjectId === "ALL"
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                : "bg-white dark:bg-[#0B132A] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <FaChartBar />
            <span>Class Overall Summary</span>
          </button>

          {/* Dynamic Subject Tabs */}
          {subjects.map(sub => (
            <button
              key={sub._id}
              onClick={() => setSelectedSubjectId(sub._id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 shrink-0 flex items-center gap-2 ${
                selectedSubjectId === sub._id
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                  : "bg-white dark:bg-[#0B132A] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaBook className="text-[10px]" />
              <span>{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CLASS OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <FaUsers />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Students</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{classSummary?.totalStudents || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg">
            <FaBook />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Subjects Configured</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{classSummary?.totalSubjects || subjects.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Published Status</p>
            <p className={`text-xs font-black ${isClassPublished ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {isClassPublished ? "PUBLISHED" : "DRAFT / IN PROGRESS"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
            <FaCloudUploadAlt />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Published Count</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {classSummary?.publishedCount || 0} / {classSummary?.totalStudents || 0}
            </p>
          </div>
        </div>
      </div>

      {/* WORKSPACE & STUDENT ROSTER TABLE CARD */}
      <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm overflow-hidden">
        {/* Workspace Action Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search student by name/roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            {selectedSubjectId !== "ALL" && (
              <span className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 px-3 py-1.5 rounded-xl shrink-0">
                Subject: {currentSubjectObj?.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Subject Roster Bulk Save Button */}
            {selectedSubjectId !== "ALL" && (
              <button
                disabled={saving || isClassPublished}
                onClick={saveSubjectMarks}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  isClassPublished
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/20"
                }`}
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>Save Subject Marks</span>
              </button>
            )}

            {/* Class Publish / Unpublish Actions */}
            {selectedSubjectId === "ALL" && (
              isClassPublished ? (
                <button
                  onClick={() => setUnpublishModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 shadow-sm transition-all"
                >
                  <FaUnlock />
                  <span>Unpublish Results</span>
                </button>
              ) : (
                <button
                  onClick={() => setPublishModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm transition-all"
                >
                  <FaCloudUploadAlt className="text-sm" />
                  <span>Publish Class Results</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* TABLE DISPLAY */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <FaSpinner className="text-3xl text-[#7C3AED] animate-spin" />
            <span className="text-xs font-bold text-slate-400 animate-pulse">Loading class roster & marks data...</span>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3 text-2xl">
              <FaUsers />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Students Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              No students were found for Class {selectedClassName} Section {selectedSection}. Check student assignments under Academics.
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

                  {/* Columns for Subject Specific Entry */}
                  {selectedSubjectId !== "ALL" ? (
                    <>
                      <th className="py-3.5 px-4">Marks Obtained</th>
                      <th className="py-3.5 px-4">Max Marks</th>
                      <th className="py-3.5 px-4">Absent</th>
                      <th className="py-3.5 px-4">Calculated Grade</th>
                      <th className="py-3.5 px-4">Remarks</th>
                    </>
                  ) : (
                    /* Columns for Overall Class Summary */
                    <>
                      <th className="py-3.5 px-4">Subject Progress</th>
                      <th className="py-3.5 px-4">Total Obtained</th>
                      <th className="py-3.5 px-4">Percentage</th>
                      <th className="py-3.5 px-4">Grade</th>
                      <th className="py-3.5 px-4">Overall Result</th>
                      <th className="py-3.5 px-4">Publication Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </>
                  )}
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

                      {/* Subject Specific Inline Edit */}
                      {selectedSubjectId !== "ALL" ? (
                        <>
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              min="0"
                              max={markEntry.maxMarks}
                              disabled={markEntry.isAbsent || isClassPublished}
                              value={markEntry.isAbsent ? 0 : markEntry.marksObtained}
                              onChange={e => handleMarkChange(sId, "marksObtained", e.target.value)}
                              className="w-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              min="1"
                              disabled={isClassPublished}
                              value={markEntry.maxMarks}
                              onChange={e => handleMarkChange(sId, "maxMarks", e.target.value)}
                              className="w-20 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                disabled={isClassPublished}
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
                              disabled={isClassPublished}
                              value={markEntry.remarks || ""}
                              onChange={e => handleMarkChange(sId, "remarks", e.target.value)}
                              className="w-36 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none disabled:opacity-50"
                            />
                          </td>
                        </>
                      ) : (
                        /* Overall Class Summary Rows */
                        <>
                          <td className="py-3.5 px-4 font-bold">
                            <span className={`px-2.5 py-1 rounded-xl text-[11px] ${
                              student.subjectsMissing > 0
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}>
                              {student.subjectsCompleted} / {student.subjectsExpected} Subjects
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {student.totalMarksObtained} / {student.totalMaxMarks}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                            {student.subjectsCompleted > 0 ? `${student.percentage}%` : "—"}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                              {student.overallGrade || "—"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                              student.overallResult === "PASS"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            }`}>
                              {student.overallResult || "FAIL"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] font-bold ${student.isPublished ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                              {student.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openStudentModal(student)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#7C3AED] hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center gap-1.5 ml-auto text-xs"
                            >
                              <FaEye className="text-xs" />
                              <span>Review</span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SINGLE STUDENT MARKS REVIEW MODAL */}
      {studentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-2xl w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Student Marks Review: {studentModal.studentName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll #{studentModal.rollNo} • Adm #{studentModal.admissionNo || "N/A"} • Class {selectedClassName} ({selectedSection})
                </p>
              </div>
              <button
                onClick={() => setStudentModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Obtained</th>
                    <th className="py-2.5 px-3">Max</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {studentModalMarks.map((m, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{m.subjectName}</td>
                      <td className="py-2.5 px-3 font-semibold">{m.isAbsent ? 0 : m.marksObtained}</td>
                      <td className="py-2.5 px-3 font-semibold">{m.maxMarks}</td>
                      <td className="py-2.5 px-3 font-extrabold">{m.isAbsent ? "AB" : (m.grade || "—")}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.isAbsent
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : m.isSaved
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                        }`}>
                          {m.isAbsent ? "ABSENT" : m.isSaved ? "ENTERED" : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setStudentModal(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] text-white font-bold text-xs"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center text-xl mb-4">
              <FaCloudUploadAlt />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Publish Class Results?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to publish <strong>{examTerm}</strong> results for <strong>Class {selectedClassName} ({selectedSection})</strong> for <strong>{academicYear}</strong>?
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
              Once published, students will be able to view their academic result report cards.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handlePublishResults}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                <span>Confirm & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH CONFIRMATION MODAL */}
      {unpublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center text-xl mb-4">
              <FaUnlock />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Unpublish Class Results?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Unpublishing will hide <strong>{examTerm}</strong> results for <strong>Class {selectedClassName} ({selectedSection})</strong> from students until you publish them again.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-2">
              Use this action if you need to correct or edit entered marks.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setUnpublishModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUnpublishResults}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : <FaUnlock />}
                <span>Confirm & Unpublish</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
