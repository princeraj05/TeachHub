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
  FaClipboardList,
  FaVideo,
  FaVideoSlash,
  FaClock,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
  FaEye,
  FaGraduationCap,
  FaBriefcase
} from "react-icons/fa";
import { useCall } from "../../../../../context/CallContext";

const SORA = "'Sora', sans-serif";

function AdminRequests() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const schoolName = localStorage.getItem("schoolName") || "Our School";
  const { startCall } = useCall() || {};

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState("new_requests");

  // Applicant Full Profile Modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingApplicant, setViewingApplicant] = useState(null);

  // Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [examMode, setExamMode] = useState("Online");
  const [proctorId, setProctorId] = useState("");
  const [teachers, setTeachers] = useState([]);

  // Teacher Interview Scheduling State
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("09:00 AM");
  const [interviewMode, setInterviewMode] = useState("Online");
  const [interviewVenue, setInterviewVenue] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [teacherApprovalTab, setTeacherApprovalTab] = useState("interview"); // "direct" or "interview"

  // Class Assignment Modal State
  const [classes, setClasses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [approvalTab, setApprovalTab] = useState("with_exam");

  // Live 1-second ticker for real-time countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    if (token) {
      axios
        .get(`${API}/api/admin/users/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setTeachers(res.data))
        .catch((err) => console.error("Error fetching teachers", err));
    }
  };

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

  const toLocalDateTimeString = (dateObjOrStr) => {
    if (!dateObjOrStr) return "";
    const date = new Date(dateObjOrStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const getMeetingTimeStatus = (targetDate, targetTime) => {
    if (!targetDate) return { isReady: false, label: "Not Scheduled", secondsLeft: Infinity };

    let meetingDateObj = new Date(targetDate);
    if (targetTime && typeof targetTime === "string") {
      const timeMatch = targetTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3];
        if (ampm) {
          if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        meetingDateObj.setHours(hours, minutes, 0, 0);
      }
    }

    const currentNow = new Date();
    const diffMs = meetingDateObj.getTime() - currentNow.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec <= 900) {
      if (diffMs < -24 * 60 * 60 * 1000) {
        return { isReady: true, isEnded: true, label: "Meeting Finished", secondsLeft: 0 };
      }
      return { isReady: true, isLive: true, label: "Meeting Live Now", secondsLeft: 0 };
    }

    if (diffSec > 86400) {
      const days = Math.floor(diffSec / 86400);
      return { isReady: true, label: `${days} Day${days > 1 ? "s" : ""} Left`, secondsLeft: diffSec };
    }

    if (diffSec > 3600) {
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      return { isReady: true, label: `Starts in ${hours}h ${mins}m`, secondsLeft: diffSec };
    }

    if (diffSec > 60) {
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      return { isReady: true, label: `Starts in ${mins} min ${secs} sec`, secondsLeft: diffSec };
    }

    return { isReady: true, isLive: true, label: `Starting in ${diffSec}s`, secondsLeft: diffSec };
  };

  const openProfileModal = (user) => {
    setViewingApplicant(user);
    setShowProfileModal(true);
  };

  const openApprovalFlow = (user) => {
    setSelectedUser(user);
    if (user.requestedRole === "student") {
      setApprovalTab("with_exam");
      if (user.admissionExamDate) {
        setExamDate(toLocalDateTimeString(user.admissionExamDate));
      } else {
        setExamDate("");
      }
      setExamMode(user.admissionExamMode || "Online");
      setProctorId(user.admissionExamProctor?._id || user.admissionExamProctor || "");
      setShowScheduleModal(true);
    } else {
      setTeacherApprovalTab("interview");
      const initialDate = user.interviewDate || user.admissionExamDate;
      if (initialDate) {
        setInterviewDate(toLocalDateTimeString(initialDate));
        const d = new Date(initialDate);
        if (!isNaN(d.getTime())) {
          setInterviewTime(user.interviewTime || d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
        }
      } else {
        setInterviewDate("");
        setInterviewTime("09:00 AM");
      }
      setShowScheduleModal(true);
    }
  };

  const handleTeacherScheduleSubmit = (e) => {
    e.preventDefault();
    if (!interviewDate) {
      alert("Please select a meeting date");
      return;
    }
    const [datePart, timePart] = interviewDate.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart ? timePart.split(":").map(Number) : [9, 0];
    const localDate = new Date(year, month - 1, day, hour, minute);
    const utcDate = localDate.toISOString();

    handleAction(selectedUser._id, "schedule_interview", {
      interviewDate: utcDate,
      interviewTime,
      interviewMode,
      interviewVenue,
      interviewNotes
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!examDate) {
      alert("Please select an exam date");
      return;
    }
    // Parse "YYYY-MM-DDTHH:mm" manually to guarantee local timezone parsing
    const [datePart, timePart] = examDate.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    const utcDate = localDate.toISOString();

    handleAction(selectedUser._id, "approved", { examDate: utcDate, examMode, proctorId });
  };

  const handleDirectAdmitSubmit = (e) => {
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
        setShowScheduleModal(false);
        setSelectedUser(null);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to assign class");
      })
      .finally(() => {
        setProcessing(false);
      });
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
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      disabled={processing}
                      onClick={() => openProfileModal(req)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition border border-slate-200/60 dark:border-white/10"
                      title="View Full Application Details"
                    >
                      <FaEye className="text-xs text-[#7C3AED] dark:text-[#38BDF8]" /> View Profile
                    </button>
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

              const isTeacherReq = req.requestedRole === "teacher" || req.role === "teacher";
              const hasTakenTest = !isTeacherReq && (req.requestStatus === "exam_completed" || req.admissionExamTaken);
              const meetingStatus = isTeacherReq ? getMeetingTimeStatus(req.interviewDate || req.admissionExamDate, req.interviewTime) : null;

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
                          isTeacherReq
                            ? "bg-indigo-500/10 text-indigo-600 border border-indigo-200/20"
                            : hasTakenTest
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200/20 animate-pulse"
                              : "bg-amber-500/10 text-amber-600 border border-amber-200/20"
                        }`}>
                          {isTeacherReq ? "Faculty Interview Scheduled" : hasTakenTest ? "Exam Completed" : "Exam Scheduled"}
                        </span>
                      </div>

                      {/* Performance / Meeting Details */}
                      <div className="mt-2.5 space-y-1">
                        {isTeacherReq ? (
                          <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            <p>
                              Mode: <strong className="font-extrabold text-slate-750 dark:text-white">{req.interviewMode || req.admissionExamMode || "Online"}</strong>
                              <span className="mx-2">•</span>
                              Schedule: <strong className="font-extrabold text-slate-750 dark:text-white">{new Date(req.interviewDate || req.admissionExamDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} at {req.interviewTime || "09:00 AM"}</strong>
                            </p>

                            {(req.interviewMode === "Offline" || req.admissionExamMode === "Offline") ? (
                              <p className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <FaMapMarkerAlt className="text-xs text-rose-500 shrink-0" />
                                Venue: <strong>{req.interviewVenue || "School Principal Office"}</strong>
                              </p>
                            ) : (
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  meetingStatus?.isLive
                                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse"
                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                }`}>
                                  <FaClock className="text-[10px]" />
                                  {meetingStatus?.label || "Meeting Ready"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => startCall && startCall({ _id: req._id, name: req.name, avatar: req.avatar, role: req.requestedRole || "teacher" }, "video")}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md transition cursor-pointer ${
                                    meetingStatus?.isLive
                                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 animate-pulse"
                                      : "bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[#7C3AED]/20"
                                  }`}
                                >
                                  <FaVideo className="text-xs" /> {meetingStatus?.isLive ? "Start Call Now" : "Start Video Call"}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                              Mode: <strong className="font-extrabold text-slate-750 dark:text-white">{req.admissionExamMode}</strong>
                              <span className="mx-2">•</span>
                              Schedule: <strong className="font-extrabold text-slate-750 dark:text-white">{new Date(req.admissionExamDate).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</strong>
                              {req.admissionExamMode === "Online" && (
                                <>
                                  <span className="mx-2">•</span>
                                  Proctor: <strong className="font-extrabold text-slate-750 dark:text-white">{req.admissionExamProctor?.name || "Myself (Admin)"}</strong>
                                </>
                              )}
                            </p>
                            {hasTakenTest && (
                              <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-3 py-1.5 rounded-xl mt-1 text-[10px] font-bold text-slate-550 dark:text-slate-400 shadow-sm">
                                <span>Score: <strong className="text-indigo-600 dark:text-[#38BDF8] text-xs font-black">{req.admissionExamScore}</strong> / {req.admissionExamTotal}</span>
                                <span className="text-emerald-600">{req.admissionExamCorrect} Correct</span>
                                <span className="text-rose-600">{req.admissionExamWrong} Incorrect</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      disabled={processing}
                      onClick={() => openProfileModal(req)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition border border-slate-200/60 dark:border-white/10"
                      title="View Full Application Details"
                    >
                      <FaEye className="text-xs text-[#7C3AED] dark:text-[#38BDF8]" /> View Profile
                    </button>
                    {isTeacherReq ? (
                      <>
                        <button
                          disabled={processing}
                          onClick={() => {
                            if (window.confirm(`Directly approve ${req.name} as Teacher now?`)) {
                              handleAction(req._id, "approved");
                            }
                          }}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm cursor-pointer transition disabled:opacity-50"
                        >
                          <FaCheck className="text-[10px]" /> Direct Approve
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => openApprovalFlow(req)}
                          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-[#7C3AED]/10 dark:hover:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#38BDF8] text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition disabled:opacity-50 border border-indigo-100 dark:border-white/5"
                        >
                          <FaCalendarAlt className="text-[10px]" /> Reschedule
                        </button>
                      </>
                    ) : hasTakenTest ? (
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
            <h3 className="text-sm font-black text-slate-750 dark:text-slate-300">No Scheduled Exams or Meetings</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">There are no candidate exams or interviews currently scheduled.</p>
          </div>
        )
      )}

      {/* Admission Test / Teacher Interview Scheduling Modal */}
      {showScheduleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              if (!processing) setShowScheduleModal(false);
            }}
          />

          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative z-10 shadow-2xl transition-all duration-200 text-left">
            {selectedUser.requestedRole === "teacher" || selectedUser.role === "teacher" ? (
              /* Teacher Approval & Scheduling Modal */
              <div>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                    <FaChalkboardTeacher className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Process Teacher Join Request
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Choose how to approve applicant <strong className="text-slate-800 dark:text-white">{selectedUser.name}</strong>
                  </p>
                </div>

                {/* Teacher Mode Tabs */}
                <div className="mb-6 flex rounded-xl border border-slate-200/60 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setTeacherApprovalTab("direct")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      teacherApprovalTab === "direct"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    Direct Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherApprovalTab("interview")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      teacherApprovalTab === "interview"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    Schedule Interview
                  </button>
                </div>

                {teacherApprovalTab === "direct" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <p className="font-bold">⚡ Direct Approval:</p>
                      <p className="mt-1 leading-relaxed">
                        This will immediately assign <strong>{selectedUser.name}</strong> as an active Teacher in {schoolName}. They will gain immediate access to the Teacher Dashboard.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleAction(selectedUser._id, "approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                      >
                        {processing ? "Approving..." : "Directly Approve as Teacher"}
                      </button>
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setShowScheduleModal(false)}
                        className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3.5 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTeacherScheduleSubmit} className="space-y-4">
                    {/* Meeting Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Meeting / Interview Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={interviewDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInterviewDate(val);
                          if (val) {
                            const [datePart, timePart] = val.split("T");
                            if (datePart && timePart) {
                              const [y, m, d] = datePart.split("-").map(Number);
                              const [hr, min] = timePart.split(":").map(Number);
                              const dateObj = new Date(y, m - 1, d, hr, min);
                              const formatted = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                              setInterviewTime(formatted);
                            }
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
                      />
                    </div>

                    {/* Time Label */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Display Time Label (Auto-synced, e.g. 09:00 AM)
                      </label>
                      <input
                        type="text"
                        placeholder="09:00 AM"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
                      />
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Interview Mode
                      </label>
                      <select
                        value={interviewMode}
                        onChange={(e) => setInterviewMode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
                      >
                        <option value="Online">Online Video Call</option>
                        <option value="Offline">Offline (In-Person Meeting)</option>
                      </select>
                    </div>

                    {/* Venue (if Offline) */}
                    {interviewMode === "Offline" && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                          Meeting Venue / Location Address
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., School Principal Office, Room 102"
                          value={interviewVenue}
                          onChange={(e) => setInterviewVenue(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-black uppercase tracking-wider"
                      >
                        {processing ? "Scheduling..." : "Schedule Meeting & Notify"}
                      </button>
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => setShowScheduleModal(false)}
                        className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3.5 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Student Admission Exam Scheduling Modal */
              <div>
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

                {/* Approval Mode Tabs */}
                <div className="mb-6 flex rounded-xl border border-slate-200/60 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setApprovalTab("with_exam")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      approvalTab === "with_exam"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    With Admission Test
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalTab("without_exam")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      approvalTab === "without_exam"
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                    }`}
                  >
                    Direct Admission (No Test)
                  </button>
                </div>

                {approvalTab === "without_exam" ? (
                  <form onSubmit={handleDirectAdmitSubmit} className="space-y-4">
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

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={processing || classes.length === 0}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-extrabold"
                      >
                        {processing ? "Admitting..." : "Directly Enroll Student"}
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
                ) : (
                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                        Exam Date & Start Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
                      />
                    </div>

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

                    {examMode === "Online" && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                          Assigned Proctor (Invigilator)
                        </label>
                        <select
                          value={proctorId}
                          onChange={(e) => setProctorId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer"
                        >
                          <option value="">Myself (Admin)</option>
                          {teachers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} (Teacher)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

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
                )}
              </div>
            )}
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

          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative z-10 shadow-2xl transition-all duration-200 text-left">
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

      {/* Full Applicant Profile Details Modal */}
      {showProfileModal && viewingApplicant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 select-none">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative z-10 animate-slideUp text-slate-800 dark:text-white my-auto text-left">
            <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#38BDF8] w-full shrink-0" />
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-0.5 shrink-0 shadow-md">
                  {viewingApplicant.avatar ? (
                    <img
                      src={viewingApplicant.avatar}
                      alt="Applicant Avatar"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                      {viewingApplicant.name ? viewingApplicant.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">{viewingApplicant.name}</h3>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                      (viewingApplicant.requestedRole === "student" || viewingApplicant.role === "student")
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {(viewingApplicant.requestedRole || viewingApplicant.role || "student").toUpperCase()} APPLICANT
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-medium mt-0.5">{viewingApplicant.email}</p>
                  
                  <p className="text-[10px] font-bold text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wider mt-1 flex items-center gap-1">
                    <FaSchool /> Target School: {viewingApplicant.requestedSchool || viewingApplicant.schoolName || schoolName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Section 1: Application Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">APPLICANT ID</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
                    #{viewingApplicant._id ? viewingApplicant._id.slice(-6).toUpperCase() : "REQ01"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">STATUS</p>
                  <p className="text-xs font-black text-amber-500 uppercase tracking-wider mt-0.5">
                    {viewingApplicant.requestStatus ? viewingApplicant.requestStatus.replace("_", " ") : "Pending"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3 col-span-2 sm:col-span-1">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">APPLICATION DATE</p>
                  <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
                    {viewingApplicant.createdAt ? new Date(viewingApplicant.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently"}
                  </p>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-2.5 flex items-center gap-1.5">
                  <FaPhone className="text-[#7C3AED] dark:text-[#38BDF8]" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase">MOBILE PHONE</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{viewingApplicant.phoneNumber || "Not Provided"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase">EMAIL ADDRESS</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 truncate">{viewingApplicant.email}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Student or Teacher Specific Profile Details */}
              {(viewingApplicant.requestedRole === "student" || viewingApplicant.role === "student" || (!viewingApplicant.requestedRole && viewingApplicant.role !== "teacher")) ? (
                /* Student Applicant Records */
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-2.5 flex items-center gap-1.5">
                    <FaGraduationCap className="text-[#7C3AED] dark:text-[#38BDF8]" /> Admission & Academic History
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">TARGET ADMISSION CLASS</p>
                      <p className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] mt-0.5">{viewingApplicant.targetClass || "Class 1"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">PREVIOUS CLASS PASSED</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.previousClass || "Not Specified"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 sm:col-span-2">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">PREVIOUS SCHOOL HISTORY</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.previousSchool || "Not Provided"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">FATHER / GUARDIAN NAME</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.fatherName || "Not Provided"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">FATHER MOBILE NUMBER</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.fatherMobileNumber || "Not Provided"}</p>
                    </div>

                    {viewingApplicant.motherMobileNumber && (
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase">MOTHER MOBILE NUMBER</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.motherMobileNumber}</p>
                      </div>
                    )}

                    {(viewingApplicant.dob || viewingApplicant.gender) && (
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase">DOB & GENDER</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
                          {viewingApplicant.dob || "N/A"} ({viewingApplicant.gender || "N/A"})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Teacher Applicant Records */
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-2.5 flex items-center gap-1.5">
                    <FaBriefcase className="text-[#7C3AED] dark:text-[#38BDF8]" /> Professional Teaching Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">QUALIFICATION</p>
                      <p className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] mt-0.5">{viewingApplicant.qualification || "Not Provided"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">TEACHING EXPERIENCE</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.experience || "1 Year"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 sm:col-span-2">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">PREVIOUS INSTITUTE / SCHOOL WORKED AT</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{viewingApplicant.previousInstitute || "Not Provided"}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 sm:col-span-2">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase">SUBJECTS OF EXPERTISE</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.isArray(viewingApplicant.subjectsOfExpertise) && viewingApplicant.subjectsOfExpertise.length > 0 ? (
                          viewingApplicant.subjectsOfExpertise.map((sub, i) => (
                            <span key={i} className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 rounded-lg text-[10px] font-extrabold">
                              {sub}
                            </span>
                          ))
                        ) : (
                          <p className="text-xs font-semibold text-slate-400">None specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setShowProfileModal(false);
                    openApprovalFlow(viewingApplicant);
                  }}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <FaCheck className="text-[10px]" /> Process / Schedule Request
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to reject ${viewingApplicant.name}'s request?`)) {
                      setShowProfileModal(false);
                      handleAction(viewingApplicant._id, "rejected");
                    }
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-rose-500/20"
                >
                  <FaTimes className="text-[10px]" /> Reject
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer border border-slate-200/60 dark:border-white/10"
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

export default AdminRequests;
