import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaCamera,
  FaDesktop,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaLock
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

// Countdown Timer Component
const AdmissionCountdown = ({ dateStr, onLaunchTest, examTaken }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [dateStr]);

  if (examTaken) {
    return (
      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-100/50">
        Completed
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <button
        onClick={onLaunchTest}
        className="text-[10px] font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-600 dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-4 py-2 rounded-xl shadow-md transition animate-bounce cursor-pointer"
      >
        Start Your Exam
      </button>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-xl border border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-mono whitespace-nowrap">
      ⏳ {days > 0 ? `${days}d ` : ""}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

// Video preview box for proctoring camera
const VideoPreview = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-40 h-28 rounded-2xl object-cover border-2 border-[#7C3AED] shadow-2xl scale-x-[-1]"
    />
  );
};

function StudentExams() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");

  // Exam Proctoring states
  const [activeTest, setActiveTest] = useState(null); // null or "admission"
  const [testStep, setTestStep] = useState("setup"); // "setup" | "taking" | "graded"
  
  // Media streams
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Test content
  const [testPaper, setTestPaper] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/student/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExams(res.data || []))
      .catch((err) => console.log(err));

    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [API, token]);

  const allExams = [...exams];
  if (profile && profile.admissionExamDate) {
    allExams.push({
      _id: "admission-exam-test",
      subject: `Admission Entrance Test (${profile.admissionExamMode})`,
      date: profile.admissionExamDate,
      isAdmission: true
    });
  }

  const filtered = allExams.filter((e) =>
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getBadge = (days) => {
    if (days < 0) return { label: "Passed", cls: "bg-slate-100 text-slate-400 border-slate-200/60" };
    if (days === 0) return { label: "Today!", cls: "bg-rose-550 text-rose-600 border-rose-200" };
    if (days <= 3) return { label: `${days}d left`, cls: "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" };
    if (days <= 7) return { label: `${days}d left`, cls: "bg-amber-50 text-amber-600 border-amber-100" };
    return { label: `${days}d left`, cls: "bg-teal-50 text-teal-600 border-teal-100" };
  };

  const nextExam = allExams.filter((e) => getDaysLeft(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.subject || "—";
  const thisWeekCount = allExams.filter((e) => { const d = getDaysLeft(e.date); return d >= 0 && d <= 7; }).length;

  const stats = [
    {
      label: "Total Exams",
      value: allExams.length,
      desc: "scheduled syllabus",
      grad: "from-indigo-500 to-blue-500",
    },
    {
      label: "This Week",
      value: thisWeekCount,
      desc: "upcoming next 7d",
      grad: "from-teal-500 to-emerald-500",
    },
    {
      label: "Next Session",
      value: nextExam,
      desc: "upcoming course exam",
      grad: "from-amber-500 to-orange-500",
      isTruncate: true,
    },
  ];

  // Proctoring setup media activations
  const activateCamera = async () => {
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      setMediaError("Webcam access rejected. Proctoring requires camera access.");
    }
  };

  const activateScreenShare = async () => {
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setScreenActive(true);
    } catch (err) {
      setMediaError("Screen share rejected. Proctoring requires entire screen sharing.");
    }
  };

  // Launch test taking
  const launchTestFlow = () => {
    setLoadingTest(true);
    axios
      .get(`${API}/api/student/admission-exam`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setTestPaper(res.data);
        setSelectedAnswers(new Array(res.data.questions?.length || 0).fill(-1));
        setTestStep("taking");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to load test layout");
      })
      .finally(() => {
        setLoadingTest(false);
      });
  };

  // Option selection
  const selectOption = (optIdx) => {
    const updated = [...selectedAnswers];
    updated[currentQIndex] = optIdx;
    setSelectedAnswers(updated);
  };

  // Submit test
  const submitExamPaper = () => {
    setSubmittingTest(true);
    axios
      .post(
        `${API}/api/student/admission-exam/submit`,
        { answers: selectedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setTestResult(res.data.result);
        setTestStep("graded");
        // Stop media streams
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        // Reload user profile in sidebar immediately!
        axios
          .get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
          .then((pRes) => {
            setProfile(pRes.data);
            if (pRes.data.token) localStorage.setItem("token", pRes.data.token);
          });
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit test");
      })
      .finally(() => {
        setSubmittingTest(false);
      });
  };

  return (
    <div style={{ fontFamily: SORA }}>
      {/* General view (no active test taking) */}
      {!activeTest && (
        <>
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Exams</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Exam Schedule
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Prepare and check your upcoming course exam timelines</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />
                <div className="p-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
                  <p className={`text-slate-800 dark:text-white tracking-tight my-1 ${s.isTruncate ? "text-lg font-extrabold leading-tight truncate h-8 mt-2" : "text-3xl font-extrabold"}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Exam Timelines</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Syllabus test timetable details</p>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 transition-all w-52"
                />
              </div>
            </div>

            {/* Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Exam Date</th>
                    <th className="px-6 py-4 text-center">Countdown / Launch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 dark:divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FaBookOpen className="text-2xl text-slate-200" />
                          <span className="text-xs font-semibold">No scheduled exams found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e, i) => {
                      const days = getDaysLeft(e.date);
                      const badge = getBadge(days);
                      return (
                        <tr key={i} className={`transition-colors ${e.isAdmission ? "bg-teal-50/30 hover:bg-teal-50/50 dark:bg-teal-500/5 dark:hover:bg-teal-500/10" : "hover:bg-slate-50/50"}`}>
                          <td className="px-6 py-4 text-slate-400 font-bold text-xs">{i + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                e.isAdmission 
                                  ? "bg-teal-500 border-teal-600 text-white shadow-sm shadow-teal-500/20" 
                                  : "bg-teal-50 border border-teal-100 text-teal-500 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20"
                              }`}>
                                <FaBookOpen className="text-xs" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-850 dark:text-slate-200 text-xs">{e.subject}</span>
                                {e.isAdmission && (
                                  <span className="text-[8px] font-black uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded tracking-wider">
                                    Admission Exam
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-xs">
                              <FaCalendarAlt className="text-teal-400 text-xs shrink-0" />
                              {new Date(e.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {e.isAdmission ? (
                              <AdmissionCountdown
                                dateStr={e.date}
                                examTaken={profile?.admissionExamTaken}
                                onLaunchTest={() => {
                                  setActiveTest("admission");
                                  setTestStep("setup");
                                }}
                              />
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${badge.cls}`}>
                                <FaClock className="text-[9px]" />
                                {badge.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100/60 dark:divide-white/5">
              {filtered.length === 0 ? (
                <div className="text-center py-14 text-slate-400 flex flex-col items-center gap-2">
                  <FaBookOpen className="text-2xl text-slate-200" />
                  <span className="text-xs font-semibold">No exams found</span>
                </div>
              ) : (
                filtered.map((e, i) => {
                  const days = getDaysLeft(e.date);
                  const badge = getBadge(days);
                  return (
                    <div key={i} className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      e.isAdmission ? "bg-teal-50/30 dark:bg-teal-500/5 hover:bg-teal-50/50 dark:hover:bg-teal-500/10" : "hover:bg-slate-50/50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          e.isAdmission
                            ? "bg-teal-505 border-teal-600 text-white shadow-sm shadow-teal-500/20"
                            : "bg-teal-50 border border-teal-100 text-teal-500 dark:bg-teal-500/10 dark:text-teal-400"
                        }`}>
                          <FaBookOpen className="text-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-800 dark:text-slate-250 text-xs">{e.subject}</p>
                            {e.isAdmission && (
                              <span className="text-[7px] font-black uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1 py-0.5 rounded tracking-wider">
                                Admission
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <FaCalendarAlt className="text-[9px]" />
                            {new Date(e.date).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {e.isAdmission ? (
                          <AdmissionCountdown
                            dateStr={e.date}
                            examTaken={profile?.admissionExamTaken}
                            onLaunchTest={() => {
                              setActiveTest("admission");
                              setTestStep("setup");
                            }}
                          />
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${badge.cls}`}>
                            <FaClock className="text-[9px]" />
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                Exam schedules are regulated by Academic Administrator Console
              </p>
            </div>
          </div>
        </>
      )}

      {/* Proctoring Test setup Canvas */}
      {activeTest === "admission" && testStep === "setup" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-[#7C3AED] w-full" />
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                <FaLock />
              </div>
              <div>
                <h2 className="text-slate-800 dark:text-white font-black text-lg tracking-tight">Entrance Examination Proctoring Setup</h2>
                <p className="text-xs text-slate-400 mt-0.5">Initialize proctoring streams to unlock test taking</p>
              </div>
            </div>

            {/* Instruction cards */}
            <div className="space-y-4 bg-slate-50 dark:bg-white/5 border border-slate-200/45 dark:border-white/10 p-5 rounded-2xl mb-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Exam System Instructions</h3>
              <ul className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed list-disc pl-4 space-y-2 font-medium">
                <li>This exam is fully monitored. Your <strong>Webcam video feed</strong> will stay floating in the corner.</li>
                <li>You must share your <strong>Entire Screen</strong>. Window-only sharing is strictly flagged.</li>
                <li>Closing screen sharing or disabling the webcam will result in immediate disqualification.</li>
                <li>Negative marking rules apply if enabled. The scorecard is generated immediately upon submission.</li>
              </ul>
            </div>

            {/* Verification triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Webcam */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-lg ${
                  cameraActive ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-400 animate-pulse"
                }`}>
                  <FaCamera />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">Webcam Verification</h4>
                <p className="text-[10px] text-slate-400 font-medium mb-3">Checks active camera feed</p>
                {cameraActive ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" /> Camera Active
                  </span>
                ) : (
                  <button
                    onClick={activateCamera}
                    className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Allow Camera
                  </button>
                )}
              </div>

              {/* Screen share */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-lg ${
                  screenActive ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-400 animate-pulse"
                }`}>
                  <FaDesktop />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">Screen Share Verification</h4>
                <p className="text-[10px] text-slate-400 font-medium mb-3">Checks entire screen sharing stream</p>
                {screenActive ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" /> Screen Sharing
                  </span>
                ) : (
                  <button
                    onClick={activateScreenShare}
                    className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Share Screen
                  </button>
                )}
              </div>
            </div>

            {/* Error alerts */}
            {mediaError && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                <FaExclamationTriangle className="text-base" /> {mediaError}
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
              <button
                disabled={!cameraActive || !screenActive || loadingTest}
                onClick={launchTestFlow}
                className="flex-1 bg-gradient-to-r from-teal-500 to-indigo-650 hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingTest ? "Loading Test Paper..." : "Begin Exam"}
              </button>
              <button
                onClick={() => {
                  setActiveTest(null);
                  if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
                  if (screenStream) screenStream.getTracks().forEach(t => t.stop());
                  setCameraActive(false);
                  setScreenActive(false);
                }}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-6 py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Test Taking Canvas */}
      {activeTest === "admission" && testStep === "taking" && testPaper && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative">
          
          {/* Main Question view (Left 3 cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative">
            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-[#7C3AED] w-full" />
            <div className="p-6">
              
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full">
                    Question {currentQIndex + 1} of {testPaper.questions.length}
                  </span>
                </div>
                {testPaper.negativeMarking && (
                  <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/5 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 px-2.5 py-1 rounded-md">
                    Negative: -{testPaper.negativeMarkValue}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-relaxed">
                  {testPaper.questions[currentQIndex]?.questionText}
                </h2>
              </div>

              {/* 4 options select */}
              <div className="space-y-3 mb-8">
                {testPaper.questions[currentQIndex]?.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8] text-white dark:text-[#090F1C]"
                          : "border-slate-300 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-400"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-xs font-semibold">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6">
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition disabled:opacity-30 cursor-pointer"
                >
                  <FaChevronLeft className="text-[10px]" /> Back
                </button>

                {currentQIndex === testPaper.questions.length - 1 ? (
                  <button
                    disabled={submittingTest}
                    onClick={submitExamPaper}
                    className="bg-gradient-to-r from-teal-500 to-[#312E81] hover:opacity-90 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md cursor-pointer transition flex items-center gap-1.5"
                  >
                    {submittingTest ? "Submitting..." : "Submit Test"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:text-[#5B21B6] dark:hover:text-[#0EA5E9] transition cursor-pointer"
                  >
                    Next <FaChevronRight className="text-[10px]" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Proctoring camera preview side panel (Right 1 col) */}
          <div className="lg:col-span-1 flex flex-col items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-4 rounded-3xl">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Live Monitoring
            </p>
            <VideoPreview stream={cameraStream} />
            <div className="text-[9px] text-slate-400 font-bold text-center leading-relaxed">
              Feed is synced with proctoring engine. Avoid shifting screens or looking away.
            </div>
          </div>

        </div>
      )}

      {/* Graded test score card */}
      {activeTest === "admission" && testStep === "graded" && testResult && (
        <div className="max-w-md mx-auto bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative text-center">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 w-full" />
          <div className="p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-4">
              <FaCheckCircle />
            </div>

            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Test Evaluated Successfully!</h2>
            <p className="text-xs text-slate-455 mt-0.5">Your entrance exam response has been graded</p>

            {/* Score box */}
            <div className="my-6 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Score Achieved</span>
              <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight my-1">
                {testResult.score} <span className="text-lg font-bold text-slate-400">/ {testResult.total}</span>
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-bold text-slate-455">
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">{testResult.correct} Correct</span>
                <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/5 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">{testResult.wrong} Incorrect</span>
              </div>
            </div>

            {/* Final wait message */}
            <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-750 dark:text-teal-400 rounded-2xl text-xs font-black leading-relaxed mb-6">
              Wait kro aapko kon sa class milta h
            </div>

            <button
              onClick={() => {
                setActiveTest(null);
                setTestStep("setup");
                setTestResult(null);
              }}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentExams;