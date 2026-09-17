import { useState } from "react";
import axios from "axios";
import { FaSchool, FaExchangeAlt, FaInfoCircle, FaTimes, FaCheckCircle } from "react-icons/fa";
import API_URL from "../config/api";

const SORA = "'Sora', sans-serif";

function SchoolChangeModal({ currentSchoolName, requestedSchoolName, userRole, onClose, onSuccess }) {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedSchoolName) return;

    try {
      setSubmitting(true);
      setErrorMsg("");

      const res = await axios.post(
        `${API}/api/school-change-requests`,
        {
          requestedSchoolName,
          reason
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (onSuccess) {
        onSuccess(res.data?.request);
      }
    } catch (err) {
      console.error("Error submitting school change request:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit school change request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: SORA }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/10 w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl transition-all duration-200 text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
            <FaExchangeAlt className="text-xl" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Request School Change</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
            You're currently associated with another school. Submit a request to leave your current school before joining a new school.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <FaInfoCircle className="shrink-0 text-sm" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Current School Readonly */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Current School
            </label>
            <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-100 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-800 dark:text-slate-200 text-xs font-bold">
              <FaSchool className="text-purple-500 shrink-0" />
              <span className="truncate">{currentSchoolName || "Your Current School"}</span>
            </div>
          </div>

          {/* New Requested School Readonly */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              New School Requested
            </label>
            <div className="flex items-center gap-2.5 px-4 py-3 bg-purple-500/10 dark:bg-[#38BDF8]/10 border border-purple-500/20 dark:border-[#38BDF8]/20 rounded-2xl text-[#7C3AED] dark:text-[#38BDF8] text-xs font-black">
              <FaSchool className="shrink-0" />
              <span className="truncate">{requestedSchoolName}</span>
            </div>
          </div>

          {/* Optional Reason Text Area */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Why do you want to leave your current school? <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter your reason for changing school..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-[#151D36] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none"
            />
          </div>

          {/* Informational Message Banner */}
          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-start gap-2.5 leading-relaxed">
            <FaInfoCircle className="text-amber-500 text-sm shrink-0 mt-0.5" />
            <span>
              Because you are currently associated with a school, you cannot directly join another school. Your school change request must be reviewed by the Super Admin.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-95 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit School Change Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 px-5 py-3.5 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SchoolChangeModal;
