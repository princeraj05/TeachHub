import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaSchool,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaClipboardList
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AdminRequests() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const schoolName = localStorage.getItem("schoolName") || "Our School";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [examMode, setExamMode] = useState("Online");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    axios
      .get(`${API}/api/admin/users/join-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setRequests(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching join requests:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAction = async (userId, action, additionalData = {}) => {
    setProcessing(true);
    try {
      await axios.post(
        `${API}/api/admin/users/process-request`,
        { userId, action, ...additionalData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
      setShowScheduleModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalFlow = (user) => {
    if (user.requestedRole === "student") {
      setSelectedUser(user);
      setExamDate("");
      setExamMode("Online");
      setShowScheduleModal(true);
    } else {
      if (window.confirm(`Are you sure you want to approve ${user.name} as a Teacher?`)) {
        handleAction(user._id, "approved");
      }
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!examDate) {
      alert("Please select an exam date");
      return;
    }
    handleAction(selectedUser._id, "approved", { examDate, examMode });
  };

  return (
    <div style={{ fontFamily: SORA }} className="max-w-4xl mx-auto py-6 relative z-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Admissions</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Join Requests
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage student and teacher joining requests for {schoolName}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Fetching pending applications...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => {
            const initials = req.name
              ? req.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
              : "U";

            return (
              <div key={req._id} className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 hover:shadow-md">
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full p-[1px] bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] shrink-0 flex items-center justify-center">
                    {req.avatar ? (
                      <img
                        src={req.avatar}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-extrabold text-white">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-850 dark:text-white truncate">{req.name}</h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                        req.requestedRole === "student"
                          ? "bg-teal-500/10 text-teal-650 dark:text-teal-400 dark:bg-teal-500/5 border border-teal-200/30"
                          : "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 dark:bg-indigo-500/5 border border-indigo-200/30"
                      }`}>
                        {req.requestedRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="text-xs" /> {req.email}
                      </span>
                      {req.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <FaPhone className="text-xs" /> {req.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    disabled={processing}
                    onClick={() => openApprovalFlow(req)}
                    className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition disabled:opacity-50"
                  >
                    <FaCheck className="text-[10px]" /> Approve
                  </button>
                  <button
                    disabled={processing}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to reject ${req.name}'s request?`)) {
                        handleAction(req._id, "rejected");
                      }
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition disabled:opacity-50"
                  >
                    <FaTimes className="text-[10px]" /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 p-8 shadow-sm">
          <FaUserPlus className="text-slate-350 dark:text-slate-700 text-4xl mx-auto mb-4" />
          <h3 className="text-sm font-black text-slate-750 dark:text-slate-300">No Pending Requests</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">All joining requests for {schoolName} are currently processed.</p>
        </div>
      )}

      {/* Admission Test Scheduling Modal */}
      {showScheduleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              if (!processing) setShowScheduleModal(false);
            }}
          />

          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                <FaClipboardList className="text-2xl" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Schedule Admission Exam
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Set admission test schedule details for student <strong className="text-slate-800 dark:text-white">{selectedUser.name}</strong>
              </p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Exam Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Exam Mode */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Exam Mode
                </label>
                <select
                  value={examMode}
                  onChange={(e) => setExamMode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {processing ? "Confirming..." : "Approve & Schedule"}
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRequests;
