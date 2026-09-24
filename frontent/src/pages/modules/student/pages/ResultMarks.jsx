import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaGraduationCap,
  FaArrowLeft,
  FaCalendarAlt,
  FaAward,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaBookOpen
} from "react-icons/fa";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

const formatSubjectDisplayName = (name) => {
  if (!name) return "";
  const clean = name.trim();
  if (clean.toLowerCase() === "bioloagy" || clean.toLowerCase() === "biolagy" || clean.toLowerCase() === "biolgy") {
    return "Biology";
  }
  return name;
};

function ResultMarks() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const API = API_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResultDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/student/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = Array.isArray(res.data) ? res.data : [];
        const match = data.find(
          (r) => String(r.resultId) === String(resultId) || String(r._id) === String(resultId)
        );
        if (match) {
          setResult(match);
        } else {
          setError("The requested academic result could not be found or is not published.");
        }
      } catch (err) {
        console.error("Error fetching result marks detail:", err);
        setError(err.response?.data?.message || "Failed to load marks details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResultDetail();
    }
  }, [API, resultId]);

  const isPass = result && (result.overallResult || "PASS").toUpperCase() === "PASS";

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-5xl mx-auto space-y-6 text-left select-none pb-12 px-1 sm:px-0">
      
      {/* Back Button & Sub Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => navigate("/student/results")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl shadow-xs transition cursor-pointer"
        >
          <FaArrowLeft className="text-xs text-[#7C3AED] dark:text-[#38BDF8]" />
          <span>Back to Academic Results</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-xs space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] animate-spin">
            <FaSpinner className="text-xl" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Loading mark sheet details...
          </p>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && (error || !result) && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-10 text-center space-y-4 shadow-xs">
          <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-white">
            Result Not Available
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {error || "We could not locate this examination result. It may have been unpublished or removed by your administrator."}
          </p>
          <button
            onClick={() => navigate("/student/results")}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Return to Academic Results
          </button>
        </div>
      )}

      {/* Report Card Detail View */}
      {!loading && result && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#38BDF8] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl shadow-inner shrink-0">
                  <FaGraduationCap />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                      {result.examTerm} Examination
                    </span>
                    <span className="text-[10px] font-extrabold text-white/80 bg-black/10 px-2 py-0.5 rounded-full border border-white/20">
                      Academic Year: {result.academicYear}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                    Official Mark Sheet
                  </h1>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {result.className} - Section {result.section}
                    {result.publishedAt && (
                      <span className="ml-2 opacity-80 font-normal">
                        • Published on {new Date(result.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status & Grade Badges */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-center px-4 py-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl">
                  <p className="text-[9px] font-extrabold text-white/80 uppercase tracking-widest">Grade</p>
                  <p className="text-xl font-black text-white">
                    {result.overallGrade || "N/A"}
                  </p>
                </div>
                <div className={`text-center px-5 py-2 rounded-2xl border backdrop-blur-md ${
                  isPass
                    ? "bg-emerald-500/20 border-emerald-300/40 text-white"
                    : "bg-rose-500/20 border-rose-300/40 text-white"
                }`}>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/80">Result</p>
                  <p className="text-xl font-black flex items-center gap-1.5 justify-center">
                    {isPass ? <FaCheckCircle className="text-emerald-300 text-base" /> : <FaTimesCircle className="text-rose-300 text-base" />}
                    {isPass ? "PASS" : "FAIL"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary Metrics Grid */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Performance Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Marks Obtained</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mt-1">
                  {result.totalMarksObtained} <span className="text-xs font-bold text-slate-400">/ {result.totalMaxMarks}</span>
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Percentage</p>
                <p className="text-lg sm:text-xl font-black text-[#7C3AED] dark:text-[#38BDF8] mt-1">
                  {typeof result.percentage === "number" ? `${result.percentage.toFixed(2)}%` : `${result.percentage}%`}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Result</p>
                <p className={`text-lg sm:text-xl font-black mt-1 ${isPass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {result.overallResult || "PASS"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Subjects</p>
                <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mt-1">
                  {Array.isArray(result.subjects) ? result.subjects.length : 0} Subjects
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Remarks Box if present */}
          {result.teacherRemarks && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2.5xl p-5 text-xs space-y-1">
              <p className="font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                Teacher / Principal Remarks:
              </p>
              <p className="text-slate-700 dark:text-slate-300 font-medium italic text-sm">
                "{result.teacherRemarks}"
              </p>
            </div>
          )}

          {/* Subject-wise Marks Table Card */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Subject-wise Marks Breakdown
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Detailed subject scores, grades, and attendance status
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                    <th className="py-3.5 px-4 rounded-l-xl">Subject</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Marks Obtained</th>
                    <th className="py-3.5 px-4 text-center">Max Marks</th>
                    <th className="py-3.5 px-4 text-center">Grade</th>
                    <th className="py-3.5 px-4 rounded-r-xl">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold text-slate-700 dark:text-slate-300">
                  {Array.isArray(result.subjects) && result.subjects.length > 0 ? (
                    result.subjects.map((sub, sIdx) => {
                      const isSubAbsent = sub.isAbsent;
                      return (
                        <tr key={sub.subjectId || sIdx} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                          <td className="py-4 px-4 font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm">
                            {formatSubjectDisplayName(sub.subjectName)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {isSubAbsent ? (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px]">
                                ABSENT
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">
                                PRESENT
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                            {isSubAbsent ? "0 (AB)" : sub.marksObtained}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-500 dark:text-slate-400 font-bold">
                            {sub.maxMarks}
                          </td>
                          <td className="py-4 px-4 text-center font-black text-[#7C3AED] dark:text-[#38BDF8] text-xs sm:text-sm">
                            {isSubAbsent ? "AB" : (sub.grade || "N/A")}
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 italic text-[11px]">
                            {sub.remarks || "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No subject details available for this result.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default ResultMarks;
