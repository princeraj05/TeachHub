import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaGraduationCap,
  FaCalendarAlt,
  FaAward,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaBookOpen,
  FaChevronRight
} from "react-icons/fa";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function StudentAcademicResults() {
  const navigate = useNavigate();
  const API = API_URL;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  const fetchStudentResults = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/student/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(data);
    } catch (err) {
      console.error("Error fetching student academic results:", err);
      setError(err.response?.data?.message || "Failed to load academic results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentResults();
  }, []);

  // Filter options
  const availableYears = Array.from(new Set(results.map(r => r.academicYear))).filter(Boolean);

  const filteredResults = results.filter(r => {
    const matchesTerm = selectedTerm === "ALL" || r.examTerm === selectedTerm;
    const matchesYear = selectedYear === "ALL" || r.academicYear === selectedYear;
    return matchesTerm && matchesYear;
  });

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-5xl mx-auto space-y-6 text-left select-none pb-12 px-1 sm:px-0">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#38BDF8] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl shadow-inner shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                Official Report Cards
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Academic Results
              </h1>
              <p className="text-xs text-white/90 font-medium mt-0.5 max-w-lg">
                View published Half-Yearly & Annual examination performance, subject marks, and grades.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-2.5xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Term Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Exam Term:</span>
              <div className="inline-flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                {["ALL", "Half-Yearly", "Annual"].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTerm(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      selectedTerm === t
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t === "ALL" ? "All Terms" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Year Filter */}
            {availableYears.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/30 cursor-pointer"
                >
                  <option value="ALL">All Academic Years</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-xs font-bold text-slate-400">
            Showing {filteredResults.length} of {results.length} published result(s)
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] animate-spin mb-3">
            <FaSpinner className="text-xl" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Fetching your academic results...
          </p>
          <p className="text-xs text-slate-400 mt-1">Please hold tight.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 text-center space-y-3">
          <FaExclamationTriangle className="text-3xl text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={fetchStudentResults}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredResults.length === 0 && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto text-2xl">
            <FaBookOpen />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">
            No Published Results Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {results.length === 0
              ? "Your school administrator has not published any Half-Yearly or Annual examination results for your class yet."
              : "No published results match the selected term and academic year filter."}
          </p>
        </div>
      )}

      {/* Results Cards List */}
      {!loading && !error && filteredResults.length > 0 && (
        <div className="space-y-8">
          {filteredResults.map((result) => {
            const isPass = (result.overallResult || "PASS").toUpperCase() === "PASS";
            
            return (
              <div
                key={result.resultId || `${result.academicYear}-${result.examTerm}`}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Result Card Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-white bg-[#7C3AED] px-3 py-1 rounded-lg">
                        {result.examTerm} Examination
                      </span>
                      <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                        Session: {result.academicYear}
                      </span>
                      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                        {result.className} - Section {result.section}
                      </span>
                    </div>
                    {result.publishedAt && (
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pt-1 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-slate-400" />
                        Published on {new Date(result.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Summary Badges */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Grade Badge */}
                    <div className="text-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                      <p className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Grade</p>
                      <p className="text-lg font-black text-[#7C3AED] dark:text-[#38BDF8]">
                        {result.overallGrade || "N/A"}
                      </p>
                    </div>

                    {/* Overall Status Badge */}
                    <div className={`text-center px-5 py-2 rounded-2xl border ${
                      isPass
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                    }`}>
                      <p className="text-[9px] font-extrabold uppercase tracking-widest">Status</p>
                      <p className="text-lg font-black flex items-center gap-1.5 justify-center">
                        {isPass ? <FaCheckCircle className="text-emerald-500 text-sm" /> : <FaTimesCircle className="text-rose-500 text-sm" />}
                        {isPass ? "PASS" : "FAIL"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Summary Metrics Grid */}
                <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/40 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                  <div className="bg-white dark:bg-[#1E293B]/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Marks Obtained</p>
                    <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-0.5">
                      {result.totalMarksObtained} <span className="text-xs font-bold text-slate-400">/ {result.totalMaxMarks}</span>
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B]/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Percentage</p>
                    <p className="text-base sm:text-lg font-black text-[#7C3AED] dark:text-[#38BDF8] mt-0.5">
                      {typeof result.percentage === "number" ? `${result.percentage.toFixed(2)}%` : `${result.percentage}%`}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B]/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Result</p>
                    <p className={`text-base sm:text-lg font-black mt-0.5 ${isPass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {result.overallResult || "PASS"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#1E293B]/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Subjects</p>
                    <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-0.5">
                      {Array.isArray(result.subjects) ? result.subjects.length : 0} Subjects
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                  {result.teacherRemarks ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic truncate max-w-sm sm:max-w-md">
                      <span className="font-bold not-italic text-slate-700 dark:text-slate-300">Remarks:</span> "{result.teacherRemarks}"
                    </p>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Official Report Card</span>
                  )}

                  <button
                    onClick={() => navigate(`/student/results/${result.resultId}`)}
                    className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>View Marks</span>
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default StudentAcademicResults;
