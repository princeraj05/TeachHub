import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBookOpen,
  FaClipboardCheck,
  FaChartPie,
  FaCalendarAlt,
  FaInfoCircle,
  FaSearch,
  FaChevronRight,
  FaTimes,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaUserGraduate,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaClock,
  FaHistory,
  FaExclamationTriangle
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function StudentAttendance() {
  const API = API_URL;
  const { theme } = useTheme();

  const [dbAttendance, setDbAttendance] = useState([]);
  const [profile, setProfile] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for Subject Details
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [modalFilter, setModalFilter] = useState("All"); // "All", "Present", "Absent"

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      axios.get(`${API}/api/student/attendance`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/api/student/subjects`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
    ])
      .then(([attRes, profileRes, subjRes]) => {
        setDbAttendance(attRes.data || []);
        setProfile(profileRes.data);
        setStudentSubjects(subjRes.data || []);
      })
      .catch((err) => console.log("Error loading attendance records:", err))
      .finally(() => setLoading(false));
  }, [API]);

  // Build a map of assigned subject teachers from backend
  const assignedTeacherMap = useMemo(() => {
    const map = {};
    if (Array.isArray(studentSubjects)) {
      studentSubjects.forEach(s => {
        if (s.name) {
          const tName = s.teacher?.name || s.teacherName;
          if (tName) {
            map[s.name.trim()] = `Faculty: ${tName}`;
          }
        }
      });
    }
    return map;
  }, [studentSubjects]);

  // Resolve real assigned teacher for subject
  const getTeacherForSubject = (subjName, itemTeacher) => {
    if (itemTeacher?.name) return `Faculty: ${itemTeacher.name}`;
    if (assignedTeacherMap[subjName]) return assignedTeacherMap[subjName];
    return "Faculty: Assigned Teacher";
  };

  // Helper: Get weekday short name
  const getWeekdayShort = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[d.getDay()] || "Day";
    } catch {
      return "Day";
    }
  };

  // Helper: Format Date string (e.g. "16 Sep 2026")
  const formatDateString = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Decorate database attendance records with subjects & real teachers
  const decoratedAttendance = useMemo(() => {
    if (!dbAttendance || dbAttendance.length === 0) {
      return [];
    }

    return dbAttendance.map((item) => {
      const subjectName = item.subject?.name || item.subjectName || "General";
      const teacherName = getTeacherForSubject(subjectName, item.teacher);

      return {
        ...item,
        subject: subjectName,
        teacherName,
        dayShort: getWeekdayShort(item.date),
        formattedDate: formatDateString(item.date)
      };
    });
  }, [dbAttendance, assignedTeacherMap]);

  // Calculations for overall KPI
  const stats = useMemo(() => {
    const total = decoratedAttendance.length;
    const present = decoratedAttendance.filter(a => a.status === "Present").length;
    const absent = decoratedAttendance.filter(a => a.status === "Absent").length;

    const presentRate = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
    const absentRate = total > 0 ? ((absent / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      present,
      absent,
      presentRate,
      absentRate
    };
  }, [decoratedAttendance]);

  // Subject-wise Breakdown stats calculation
  const subjectBreakdown = useMemo(() => {
    const map = {};

    // Initialize from real student assigned subjects first if available
    if (Array.isArray(studentSubjects) && studentSubjects.length > 0) {
      studentSubjects.forEach((s) => {
        const sName = s.name || s.subjectName;
        if (sName) {
          const tName = s.teacher?.name ? `Faculty: ${s.teacher.name}` : assignedTeacherMap[sName] || "Faculty: Assigned Teacher";
          map[sName] = {
            subject: sName,
            faculty: tName,
            total: 0,
            present: 0,
            absent: 0,
            lastAttended: "No Sessions",
            records: []
          };
        }
      });
    }

    // Populate from real decoratedAttendance
    decoratedAttendance.forEach((item) => {
      const subj = item.subject || "General";
      if (!map[subj]) {
        map[subj] = {
          subject: subj,
          faculty: getTeacherForSubject(subj, item.teacher),
          total: 0,
          present: 0,
          absent: 0,
          lastAttended: item.formattedDate || "No Sessions",
          records: []
        };
      }

      map[subj].records.push(item);
      map[subj].total += 1;
      if (item.status === "Present") {
        map[subj].present += 1;
      } else {
        map[subj].absent += 1;
      }
      if (item.formattedDate) {
        map[subj].lastAttended = item.formattedDate;
      }
      map[subj].faculty = getTeacherForSubject(subj, item.teacher);
    });

    // Calculate percentages
    return Object.values(map).map((item) => {
      const rate = item.total > 0 ? ((item.present / item.total) * 100).toFixed(1) : "0.0";
      return {
        ...item,
        rate: parseFloat(rate),
        rateFormatted: `${rate}%`
      };
    });
  }, [decoratedAttendance, studentSubjects, assignedTeacherMap]);

  // Open Subject Detailed View Modal
  const handleOpenSubjectModal = (subjData) => {
    setSelectedSubjectModal(subjData);
    setModalFilter("All");
  };

  if (loading) {
    return (
      <div style={{ fontFamily: SORA }} className="py-24 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Syncing attendance records...</p>
      </div>
    );
  }

  const numericPresentRate = parseFloat(stats.presentRate);
  const isOverallGood = numericPresentRate >= 75;
  const isOverallZero = stats.total === 0;

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-5xl mx-auto space-y-6 text-left select-none pb-20 px-3 sm:px-4">

      {/* ================= COMPACT AGGREGATE ATTENDANCE HEADER CARD ================= */}
      <div className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#38BDF8] dark:from-[#0B132A] dark:via-[#111A3A] dark:to-[#172554] border border-purple-500/20 dark:border-white/10 rounded-2.5xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden mt-1">
        {/* Background decorative glow circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          {/* Left: Title, Status Badge & Description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-lg sm:text-xl shrink-0 shadow-inner">
              <FaGraduationCap />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-200">
                  ATTENDANCE DASHBOARD
                </span>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                  isOverallZero
                    ? "bg-slate-500/30 text-slate-200 border-slate-400/30"
                    : isOverallGood
                    ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                    : "bg-amber-500/30 text-amber-200 border-amber-400/40"
                }`}>
                  {isOverallZero ? "No Sessions" : isOverallGood ? "Good Standing" : "Needs Attention"}
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Aggregate Attendance:</h2>
                <span className="text-lg sm:text-xl font-black text-white font-mono">{stats.presentRate}%</span>
              </div>
              <p className="text-[11px] text-slate-200 dark:text-slate-300 font-medium mt-0.5">
                {stats.present} / {stats.total} Sessions Attended · Target: 75.0%
              </p>
            </div>
          </div>

          {/* Right: Academic Year Dropdown Pill */}
          <div className="shrink-0 self-start sm:self-auto bg-black/25 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2">
            <span>Academic Year 2026</span>
            <span className="text-[10px] text-slate-300">▼</span>
          </div>
        </div>
      </div>

      {/* ================= SUBJECT-WISE BREAKDOWN CARDS ================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">Subject-Wise Attendance</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Select any subject card to inspect detailed session logs and history</p>
          </div>
          <span className="shrink-0 self-start sm:self-auto text-xs font-black text-[#7C3AED] dark:text-[#A78BFA] bg-purple-500/10 px-3 py-1 rounded-xl border border-[#7C3AED]/20">
            {subjectBreakdown.length} Enrolled Subjects
          </span>
        </div>

        {/* 2-Column Desktop / 1-Column Mobile Grid for Optimal Readability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {subjectBreakdown.map((subj) => {
            const isZero = subj.total === 0;
            const isHigh = subj.rate >= 75;
            const isMedium = subj.rate >= 50 && subj.rate < 75;

            const ringColor = isZero
              ? "text-slate-300 dark:text-slate-700"
              : isHigh
              ? "text-emerald-500"
              : isMedium
              ? "text-amber-500"
              : "text-rose-500";

            const cRadius = 26;
            const cCircumference = 2 * Math.PI * cRadius;
            const cOffset = cCircumference - (subj.rate / 100) * cCircumference;

            return (
              <div
                key={subj.subject}
                onClick={() => handleOpenSubjectModal(subj)}
                className="group relative bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] hover:border-[#7C3AED]/50 dark:hover:border-[#7C3AED]/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Course Tag & Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="space-y-1.5 pr-2">
                      <span className="inline-block px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20">
                        COURSE
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors leading-tight line-clamp-1">
                        {subj.subject}
                      </h4>
                      <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FaChalkboardTeacher className="text-xs text-[#7C3AED] shrink-0" />
                        <span className="truncate">{subj.faculty}</span>
                      </p>
                    </div>

                    {/* Radial Percentage Gauge Ring */}
                    <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r={cRadius}
                          className="text-slate-100 dark:text-white/10"
                          strokeWidth="5"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r={cRadius}
                          className={ringColor}
                          strokeWidth="5"
                          strokeDasharray={cCircumference}
                          strokeDashoffset={cOffset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {subj.rateFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LPU-Inspired Metadata Grid (Attended vs Last Session) */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.04] text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-4">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black tracking-wider mb-0.5">ATTENDED</span>
                      <span className="font-black text-slate-900 dark:text-white font-mono text-xs">{subj.present} / {subj.total}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black tracking-wider mb-0.5">LAST SESSION</span>
                      <span className="font-black text-slate-900 dark:text-white truncate text-[11px] block">{subj.lastAttended}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="flex items-center justify-between text-[11px] font-black text-[#7C3AED] dark:text-[#A78BFA] pt-2.5 border-t border-slate-100 dark:border-white/5">
                  <span>View Attendance</span>
                  <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info notice alert */}
      <div className="flex items-start gap-3 bg-purple-500/5 border border-purple-500/10 rounded-2.5xl p-4 text-xs text-slate-600 dark:text-slate-400 select-none">
        <FaInfoCircle className="text-[#7C3AED] text-sm mt-0.5 shrink-0" />
        <div className="text-left">
          <p className="font-semibold leading-relaxed">
            Attendance records are logged in real-time by classroom teachers upon session completion.
            <br />
            Maintain an aggregate score above <strong>75.0%</strong> to meet academic eligibility requirements.
          </p>
        </div>
      </div>

      {/* ================= SUBJECT ATTENDANCE DETAIL MODAL ================= */}
      {selectedSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-left my-auto relative">

            {/* Modal Header */}
            <div className="bg-slate-900 dark:bg-[#111A3A] text-white p-5 sm:p-6 border-b border-slate-800 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSubjectModal(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                >
                  <FaArrowLeft className="text-xs" />
                </button>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-400/20">
                    SUBJECT LOG
                  </span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight mt-0.5">
                    {selectedSubjectModal.subject}
                  </h3>
                  <p className="text-xs text-slate-300 font-bold flex items-center gap-1.5 mt-0.5">
                    <FaChalkboardTeacher className="text-xs text-purple-400" />
                    <span>{selectedSubjectModal.faculty}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Summary KPI Strip */}
            <div className="bg-slate-50 dark:bg-white/[0.02] p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 flex items-center justify-center text-xl font-black shrink-0 font-mono px-3 py-2">
                  {selectedSubjectModal.rateFormatted}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {selectedSubjectModal.present} Attended / {selectedSubjectModal.total} Total Sessions
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedSubjectModal.absent} Absences Recorded
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-200/70 dark:bg-[#0B132A] p-1 rounded-xl border border-slate-300/50 dark:border-white/10 select-none">
                {["All", "Present", "Absent"].map((filter) => {
                  const isActive = modalFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setModalFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Logs List */}
            <div className="p-4 sm:p-6 max-h-[380px] overflow-y-auto space-y-3">
              {selectedSubjectModal.records
                .filter(r => modalFilter === "All" || r.status === modalFilter)
                .length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs flex flex-col items-center gap-2">
                    <FaCalendarAlt className="text-2xl text-slate-300 dark:text-slate-700" />
                    <span>
                      {selectedSubjectModal.total === 0
                        ? "No sessions recorded yet."
                        : `No sessions found matching status "${modalFilter}".`}
                    </span>
                  </div>
                ) : (
                  selectedSubjectModal.records
                    .filter(r => modalFilter === "All" || r.status === modalFilter)
                    .map((session, sIdx) => {
                      const isPresent = session.status === "Present";
                      return (
                        <div
                          key={session._id || sIdx}
                          className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-3.5">
                            {/* [P] / [A] Badge */}
                            <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 border ${
                              isPresent
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/30"
                            }`}>
                              {isPresent ? "P" : "A"}
                            </div>

                            {/* Session Details */}
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">
                                {session.dayShort}, {session.formattedDate || session.date}
                              </p>
                              <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                <FaChalkboardTeacher className="text-xs text-[#7C3AED]" />
                                <span>{session.teacherName || selectedSubjectModal.faculty}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                              isPresent
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20"
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200/60 dark:border-white/5 text-right">
              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
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

export default StudentAttendance;
