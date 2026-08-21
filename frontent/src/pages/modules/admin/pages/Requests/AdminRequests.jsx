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

  // Tabs state
  const [activeTab, setActiveTab] = useState("new_requests");

  // Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [examMode, setExamMode] = useState("Online");

  // Class Assignment Modal State
  const [classes, setClasses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    fetchRequests();
    fetchClasses();
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

  const fetchClasses = () => {
    axios
      .get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setClasses(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedClassId(res.data[0]._id);
        }
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
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
      if (user.admissionExamDate) {
        setExamDate(new Date(user.admissionExamDate).toISOString().slice(0, 16));
      } else {
        setExamDate("");
      }
      setExamMode(user.admissionExamMode || "Online");
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

  const handleAssignClassSubmit = (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("Please select a class");
      return;
    }
    setProcessing(true);
    axios
      .post(
        `${API}/api/admin/users/assign-class`,
        { userId: selectedUser._id, classId: selectedClassId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        fetchRequests();
        setShowAssignModal(false);
        setSelectedUser(null);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to assign class");
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  // Filter lists
  const pendingRequests = requests.filter(r => r.requestStatus === "pending" || !r.requestStatus);
  const trackerRequests = requests.filter(r => r.requestStatus === "scheduled" || r.requestStatus === "exam_completed");

  return (
    <div style={{ fontFamily: SORA }} className="max-w-4xl mx-auto py-6 relative z-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Admissions</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Join Requests
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage student and teacher joining requests for {schoolName}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 p-1.5 flex gap-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("new_requests")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "new_requests"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
          }`}
        >
          New Requests
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${
            activeTab === "new_requests" ? "bg-white/20 text-white dark:bg-[#090F1C]/20 dark:text-[#090F1C]" : "bg-slate-100 dark:bg-white/10 text-slate-500"
          }`}>
            {pendingRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracker")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "tracker"
              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
          }`}
        >
          Exam Tracker & Performance
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${
            activeTab === "tracker" ? "bg-white/20 text-white dark:bg-[#090F1C]/20 dark:text-[#090F1C]" : "bg-slate-100 dark:bg-white/10 text-slate-500"
          }`}>
            {trackerRequests.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Fetching join requests...</p>
        </div>
      ) : activeTab === "new_requests" ? (
        pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((req) => {
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
            <h3 className="text-sm font-black text-slate-750 dark:text-slate-300">No New Requests</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">There are no new joining applications currently pending.</p>
          </div>
        )
      ) : (
        trackerRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {trackerRequests.map((req) => {
              const initials = req.name
                ? req.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                : "U";

              const hasTakenTest = req.requestStatus === "exam_completed" || req.admissionExamTaken;

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
                          hasTakenTest
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200/20 animate-pulse"
                            : "bg-amber-500/10 text-amber-600 border border-amber-200/20"
                        }`}>
                          {hasTakenTest ? "Exam Completed" : "Exam Scheduled"}
                        </span>
                      </div>

                      {/* Performance Details */}
                      <div className="mt-2.5 space-y-1">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          Mode: <strong className="font-extrabold text-slate-750 dark:text-white">{req.admissionExamMode}</strong>
                          <span className="mx-2">•</span>
                          Schedule: <strong className="font-extrabold text-slate-750 dark:text-white">{new Date(req.admissionExamDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                        </p>
                        {hasTakenTest && (
                          <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-3 py-1.5 rounded-xl mt-1 text-[10px] font-bold text-slate-550 dark:text-slate-400 shadow-sm">
                            <span>Score: <strong className="text-indigo-600 dark:text-[#38BDF8] text-xs font-black">{req.admissionExamScore}</strong> / {req.admissionExamTotal}</span>
                            <span className="text-emerald-600">{req.admissionExamCorrect} Correct</span>
                            <span className="text-rose-600">{req.admissionExamWrong} Incorrect</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {hasTakenTest ? (
                      <button
                        disabled={processing}
                        onClick={() => {
                          setSelectedUser(req);
                          setShowAssignModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition disabled:opacity-50"
                      >
                        <FaSchool className="text-[10px]" /> Assign Class & Section
                      </button>
                    ) : (
                      <button
                        disabled={processing}
                        onClick={() => openApprovalFlow(req)}
                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-[#7C3AED]/10 dark:hover:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#38BDF8] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition disabled:opacity-50 border border-indigo-100 dark:border-white/5"
                      >
                        <FaCalendarAlt className="text-[10px]" /> Reschedule
                      </button>
                    )}
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
            <FaClipboardList className="text-slate-350 dark:text-slate-700 text-4xl mx-auto mb-4" />
            <h3 className="text-sm font-black text-slate-750 dark:text-slate-300">No Scheduled Exams</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">There are no candidates currently in scheduled or evaluation stages.</p>
          </div>
        )
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
                {selectedUser.requestStatus === "scheduled" ? "Reschedule Admission Exam" : "Schedule Admission Exam"}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">
                Set admission test schedule details for student <strong className="text-slate-800 dark:text-white">{selectedUser.name}</strong>
              </p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Exam Date & Time */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Exam Date & Start Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
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
                  className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
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
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-extrabold"
                >
                  {processing ? "Confirming..." : selectedUser.requestStatus === "scheduled" ? "Reschedule Exam" : "Approve & Schedule"}
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

      {/* Class Assignment Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              if (!processing) setShowAssignModal(false);
            }}
          />

          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200 text-left">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Assign Class & Section
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">
                Register student <strong className="text-slate-800 dark:text-white">{selectedUser.name}</strong> to a classroom. Score achieved: <strong className="text-[#7C3AED] dark:text-[#38BDF8]">{selectedUser.admissionExamScore} / {selectedUser.admissionExamTotal}</strong>
              </p>
            </div>

            <form onSubmit={handleAssignClassSubmit} className="space-y-4">
              {/* Class list select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Select Class & Section
                </label>
                {classes.length > 0 ? (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - Section {cls.section}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-500/5 text-rose-500 rounded-xl text-xs font-bold text-center border border-rose-100/55 dark:border-rose-500/15">
                    No classes available. Create classes in Academics first!
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing || classes.length === 0}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-extrabold"
                >
                  {processing ? "Assigning..." : "Assign & Approve Student"}
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setShowAssignModal(false)}
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
