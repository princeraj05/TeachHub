import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import { requestCameraAndMicPermission, requestScreenSharePermission } from "../../../../utils/permissionAndDownloadUtils";
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
  FaLock,
  FaInfoCircle,
  FaTimes,
  FaChartPie,
  FaFlask,
  FaGlobe
} from "react-icons/fa";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

const normalizeSubjectName = (name) => {
  if (!name) return "";
  let clean = name.toLowerCase().trim();
  if (clean === "bioloagy" || clean === "biolagy" || clean === "biolgy") return "biology";
  if (clean === "math" || clean === "maths" || clean === "mathematics") return "mathematics";
  if (clean === "chem" || clean === "chemistry") return "chemistry";
  if (clean === "phys" || clean === "physics") return "physics";
  if (clean === "sst" || clean === "social science" || clean === "socialscience") return "social science";
  return clean;
};

const isSubjectMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  const n1 = normalizeSubjectName(name1);
  const n2 = normalizeSubjectName(name2);
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const v1 = n1.replace(/[^a-z0-9]/g, "").replace(/[aeiou]/g, "");
  const v2 = n2.replace(/[^a-z0-9]/g, "").replace(/[aeiou]/g, "");
  if (v1 && v2 && (v1 === v2 || v1.includes(v2) || v2.includes(v1))) return true;

  if (n1.length >= 4 && n2.length >= 4 && n1.slice(0, 4) === n2.slice(0, 4)) return true;

  return false;
};

function Exam() {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = API_URL;

  const [exams, setExams] = useState([]);
  const [publishedResults, setPublishedResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTest, setActiveTest] = useState(null); // 'admission' | 'class-online'
  const [selectedClassExam, setSelectedClassExam] = useState(null);
  const [testStep, setTestStep] = useState(null); // 'setup' | 'taking' | 'submitted'
  const [selectedOfflineExam, setSelectedOfflineExam] = useState(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Proctoring states
  const [cameraActive, setCameraActive] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaError, setMediaError] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    let camInterval, screenInterval;
    const proctorVal = activeTest === "admission"
      ? (profile?.admissionExamProctor)
      : (selectedClassExam?.proctor);

    const proctorId = proctorVal?._id || proctorVal;

    if (testStep === "taking" && socketRef.current && proctorId) {
      const camVideo = document.createElement("video");
      const screenVideo = document.createElement("video");

      if (cameraStream) {
        camVideo.srcObject = cameraStream;
        camVideo.autoplay = true;
        camVideo.muted = true;
        camVideo.play().catch(e => console.log(e));
      }

      if (screenStream) {
        screenVideo.srcObject = screenStream;
        screenVideo.autoplay = true;
        screenVideo.muted = true;
        screenVideo.play().catch(e => console.log(e));
      }

      const camCanvas = document.createElement("canvas");
      const screenCanvas = document.createElement("canvas");

      camInterval = setInterval(() => {
        if (cameraActive && cameraStream && camVideo.readyState === 4) {
          camCanvas.width = 160;
          camCanvas.height = 120;
          const ctx = camCanvas.getContext("2d");
          ctx.drawImage(camVideo, 0, 0, camCanvas.width, camCanvas.height);
          const data = camCanvas.toDataURL("image/jpeg", 0.5);
          socketRef.current.emit("proctor-signal", {
            targetId: proctorId,
            signal: { type: "camera-frame", frame: data }
          });
        }
      }, 2000);

      screenInterval = setInterval(() => {
        if (screenActive && screenStream && screenVideo.readyState === 4) {
          screenCanvas.width = 320;
          screenCanvas.height = 240;
          const ctx = screenCanvas.getContext("2d");
          ctx.drawImage(screenVideo, 0, 0, screenCanvas.width, screenCanvas.height);
          const data = screenCanvas.toDataURL("image/jpeg", 0.5);
          socketRef.current.emit("proctor-signal", {
            targetId: proctorId,
            signal: { type: "screen-frame", frame: data }
          });
        }
      }, 2000);
    }

    return () => {
      clearInterval(camInterval);
      clearInterval(screenInterval);
    };
  }, [testStep, cameraStream, screenStream, cameraActive, screenActive, activeTest, profile, selectedClassExam]);

  useEffect(() => {
    axios
      .get(`${API}/api/student/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExams(res.data || []))
      .catch((err) => console.log(err));

    axios
      .get(`${API}/api/student/results`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPublishedResults(res.data || []))
      .catch((err) => console.log(err));

    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [API, token]);

  const formatDurationStr = (dur) => {
    if (!dur) return "60 Min";
    const str = String(dur).trim();
    if (str.toLowerCase().includes("min") || str.toLowerCase().includes("h") || str.toLowerCase().includes("m")) {
      return str;
    }
    return `${str} Min`;
  };

  const allExams = useMemo(() => {
    const list = [...exams];
    if (profile && profile.admissionExamDate) {
      list.push({
        _id: "admission-exam-test",
        subject: `Admission Entrance Test (${profile.admissionExamMode || "online"})`,
        date: profile.admissionExamDate,
        isAdmission: true,
        duration: "60 Min",
        mode: profile.admissionExamMode || "online",
        proctored: true,
        taken: profile.admissionExamTaken
      });
    }

    if (list.length === 0) {
      return [];
    }

    return list.map((e, idx) => {
      const salt = e._id ? e._id.charCodeAt(e._id.length - 1) : idx;
      
      const getDaysLeft = (dateStr) => {
        return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
      };

      let isPast = false;
      if (e.date) {
        let y, m, d;
        if (typeof e.date === "string" && e.date.includes("-")) {
          const parts = e.date.split("T")[0].split("-");
          if (parts.length === 3) {
            y = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10) - 1;
            d = parseInt(parts[2], 10);
          }
        }
        if (!y) {
          const dt = new Date(e.date);
          y = dt.getFullYear();
          m = dt.getMonth();
          d = dt.getDate();
        }
        const examEnd = new Date(y, m, d, 23, 59, 59, 999).getTime();
        isPast = examEnd < Date.now();
      }

      // Check for subject score in publishedResults as fallback if studentMark is not directly on e
      let matchedSubjectMark = e.studentMark;
      const currentSubjName = (e.subject || e.title || "").toLowerCase().trim();

      if (!matchedSubjectMark && Array.isArray(publishedResults)) {
        for (const resDoc of publishedResults) {
          if (Array.isArray(resDoc.subjects)) {
            const subMatch = resDoc.subjects.find(
              s => isSubjectMatch(s.subjectName, currentSubjName)

            );
            if (subMatch) {
              const maxM = subMatch.maxMarks || 100;
              matchedSubjectMark = {
                marksObtained: subMatch.marksObtained,
                maxMarks: maxM,
                isAbsent: subMatch.isAbsent,
                percentage: maxM > 0 ? Math.round((subMatch.marksObtained / maxM) * 100) : 0
              };
              break;
            }
          }
        }
      }

      let isExamTaken = e.taken || !!matchedSubjectMark || !!e.submission;
      let status = "Upcoming";
      if (isExamTaken || isPast) {
        status = "Completed";
      }

      // Add scores for completed ones if studentMark or submission exists
      let isAbsent = matchedSubjectMark ? matchedSubjectMark.isAbsent : false;
      let score = matchedSubjectMark
        ? matchedSubjectMark.percentage
        : e.submission?.score;
      let total = matchedSubjectMark
        ? matchedSubjectMark.maxMarks
        : (e.submission?.total || 100);
      let marksObtained = matchedSubjectMark ? matchedSubjectMark.marksObtained : null;

      const roomStr = e.roomNumber
        ? (String(e.roomNumber).trim().toLowerCase().startsWith("room") ? e.roomNumber : `Room ${e.roomNumber}`)
        : (e.room || `Room ${101 + (salt % 5)}`);

      return {
        ...e,
        title: e.title || e.subject || "Exam",
        subject: e.subject || e.title || "Exam",
        time: e.time || "",
        duration: formatDurationStr(e.duration),
        mode: e.mode || "offline",
        room: roomStr,
        status,
        score,
        total,
        isAbsent,
        marksObtained
      };
    });
  }, [exams, profile, publishedResults]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [termFilter, setTermFilter] = useState("ALL");
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Filtered exams based on tab choice
  const filteredExamsList = useMemo(() => {
    return allExams.filter((e) => {
      const matchesSearch = e.subject?.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (termFilter !== "ALL" && e.examTerm !== termFilter) return false;
      if (activeFilter === "All") return true;
      return e.status === activeFilter;
    });
  }, [allExams, activeFilter, termFilter, search]);

  // Next upcoming exam resolver
  const nextExamItem = useMemo(() => {
    const upcoming = allExams.filter(e => e.status === "Upcoming");
    if (upcoming.length === 0) return null;
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [allExams]);

  const getSubjectVisuals = (subjectName) => {
    const clean = (subjectName || "").toLowerCase();
    if (clean.includes("admission")) {
      return {
        icon: <FaBookOpen className="text-xs" />,
        style: "bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 dark:text-purple-400"
      };
    }
    if (clean.includes("math")) {
      return {
        icon: <FaFlask className="text-xs" />,
        style: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-455"
      };
    }
    return {
      icon: <FaGlobe className="text-xs" />,
      style: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-455"
    };
  };

  const formatExamDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatExamDay = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "long" });
    } catch {
      return "Day";
    }
  };

  const formatExamTime = (examOrDate) => {
    if (typeof examOrDate === "object" && examOrDate !== null) {
      if (examOrDate.time) return examOrDate.time;
      examOrDate = examOrDate.date;
    }
    try {
      const d = new Date(examOrDate);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  const handleLaunchExam = (exam) => {
    if (exam.mode === "offline") {
      setSelectedOfflineExam(exam);
      setShowOfflineModal(true);
      return;
    }

    if (exam.isAdmission) {
      setActiveTest("admission");
      setTestStep("setup");
    } else {
      setSelectedClassExam(exam);
      setActiveTest("class-online");
      setTestStep("setup");
    }
  };

  const currentNextExam = nextExamItem || null;

  // Proctoring setup media activations
  const activateCamera = async () => {
    setMediaError("");
    const res = await requestCameraAndMicPermission("video");
    if (res.success && res.stream) {
      setCameraStream(res.stream);
      setCameraActive(true);
    } else {
      setMediaError(res.error || "Webcam access rejected. Proctoring requires camera access.");
    }
  };

  const activateScreenShare = async () => {
    setMediaError("");
    const res = await requestScreenSharePermission();
    if (res.success && res.stream) {
      setScreenStream(res.stream);
      setScreenActive(true);
    } else {
      setMediaError(res.error || "Screen share rejected. Proctoring requires entire screen sharing.");
    }
  };

  // Launch test taking
  const launchTestFlow = () => {
    if (activeTest === "admission") {
      setLoadingTest(true);
      axios
        .get(`${API}/api/student/admission-exam`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setTestPaper(res.data);
          setSelectedAnswers(new Array(res.data.questions?.length || 0).fill(-1));
          setCurrentQIndex(0);
          setActiveSection("Mathematics");
          setTestStep("taking");
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Failed to load test layout");
        })
        .finally(() => {
          setLoadingTest(false);
        });
    } else if (activeTest === "class-online" && selectedClassExam) {
      const preparedQuestions = (selectedClassExam.questions || []).map(q => ({
        ...q,
        section: selectedClassExam.subject || "General"
      }));
      setTestPaper({
        ...selectedClassExam,
        questions: preparedQuestions
      });
      setSelectedAnswers(new Array(preparedQuestions.length).fill(-1));
      setCurrentQIndex(0);
      setActiveSection(selectedClassExam.subject || "General");
      setTestStep("taking");
    }
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
    const url = activeTest === "admission" 
      ? `${API}/api/student/admission-exam/submit` 
      : `${API}/api/student/exams/${selectedClassExam._id}/submit`;

    axios
      .post(
        url,
        { answers: selectedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setTestResult(res.data.result);
        setTestStep("graded");
        // Stop media streams
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        
        // Refetch exams
        axios
          .get(`${API}/api/student/exams`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => setExams(res.data || []));
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit test");
      })
      .finally(() => {
        setSubmittingTest(false);
      });
  };

  return (
    <div style={{ fontFamily: SORA }}>      {/* General view (no active test taking) */}
      {!activeTest && (
        <div className="space-y-6">
          
          {/* Exam Schedule Overview Panel */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Exam Schedule Overview</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Filter by status to view schedule details and scores</p>
              </div>
              
              {/* Status toggle pills selector */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-[#0B132A] p-1 rounded-xl border border-slate-250/60 dark:border-white/[0.04] select-none self-start sm:self-auto">
                {["All", "Upcoming", "Completed", "Cancelled"].map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
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

            {/* Term Filter Pills Selector */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/10 select-none mb-4">
              {[
                { id: "ALL", label: "All Terms" },
                { id: "THREE_MONTH", label: "3-Month" },
                { id: "SIX_MONTH", label: "6-Month" },
                { id: "NINE_MONTH", label: "9-Month" },
                { id: "FINAL_YEAR", label: "Final Year" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTermFilter(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    termFilter === t.id
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 2-Column Desktop / 1-Column Mobile Grid Cards */}
            <div>
              {filteredExamsList.length === 0 ? (
                <div className="text-center py-14 text-slate-450 dark:text-slate-500 font-bold text-xs flex flex-col items-center gap-2 select-none">
                  <FaBookOpen className="text-2xl text-slate-300 dark:text-slate-700" />
                  <span>No exams found matching status "{activeFilter}".</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExamsList.map((exam) => {
                    const isCompleted = exam.status === "Completed";
                    const visuals = getSubjectVisuals(exam.subject);
                    
                    return (
                      <div
                        key={exam._id}
                        onClick={() => {
                          if (exam.status === "Upcoming") {
                            handleLaunchExam(exam);
                          }
                        }}
                        className={`group relative bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] hover:border-[#7C3AED]/40 dark:hover:border-[#7C3AED]/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                          exam.status === "Upcoming" ? "cursor-pointer" : "opacity-90"
                        }`}
                      >
                        <div>
                          {/* Top Header: Icon, Subject Title, Badge */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${visuals.style}`}>
                                {visuals.icon}
                              </div>
                              <div>
                                <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20">
                                  {exam.isAdmission ? "ADMISSION" : "INTERNAL"}
                                </span>
                                <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors leading-tight line-clamp-1 mt-0.5">
                                  {exam.subject}
                                </h4>
                              </div>
                            </div>
                          </div>

                          {/* Meta details grid box */}
                          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.04] text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-4">
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black tracking-wider mb-0.5 flex items-center gap-1">
                                <FaCalendarAlt className="text-slate-400 text-[10px]" /> DATE & DAY
                              </span>
                              <span className="font-black text-slate-900 dark:text-white text-xs block truncate">
                                {formatExamDate(exam.date)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block">{formatExamDay(exam.date)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black tracking-wider mb-0.5 flex items-center gap-1">
                                <FaClock className="text-slate-400 text-[10px]" /> TIME & DURATION
                              </span>
                              <span className="font-black text-slate-900 dark:text-white text-xs block truncate">
                                {formatExamTime(exam)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block">{exam.duration}</span>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase font-black tracking-wider mb-0.5 flex items-center gap-1">
                                <FaDesktop className="text-slate-400 text-[10px]" /> VENUE / MODE
                              </span>
                              <span className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-1">
                                {exam.mode === "online" ? (
                                  <span className="text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1">💻 ONLINE PROCTORED</span>
                                ) : (
                                  <span>🏫 {exam.room} • OFFLINE</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Status / Score Row */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5">
                          {isCompleted ? (
                            <div className="flex items-center justify-between w-full select-none">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase">
                                Completed
                              </span>
                              {exam.isAbsent ? (
                                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                                  Not Taken
                                </span>
                              ) : (exam.score !== undefined && exam.score !== null) || (exam.marksObtained !== undefined && exam.marksObtained !== null) ? (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                  Score: {exam.score !== undefined && exam.score !== null ? exam.score : Math.round((exam.marksObtained / (exam.total || 100)) * 100)}%
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                                  Not Taken
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full select-none">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border-[#7C3AED]/20 uppercase">
                                Upcoming
                              </span>
                              <span className="text-[11px] font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Start / Details <FaChevronRight className="text-[10px]" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions Buttons Grid row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-4 sm:mt-6 select-none">
            
            {/* Button 1: View Timetable */}
            <div 
              onClick={() => navigate("/student/showtimetable")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/30 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center mb-2 sm:mb-4">
                <FaCalendarAlt className="text-xs sm:text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">View Timetable</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1">See your class schedule</p>
              </div>
            </div>

            {/* Button 2: Exam Instructions */}
            <div 
              onClick={() => setShowInstructionsModal(true)}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-blue-500/30 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-2 sm:mb-4">
                <FaBookOpen className="text-xs sm:text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Exam Instructions</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1">Guidelines & rules</p>
              </div>
            </div>

            {/* Button 3: Study Materials */}
            <div 
              onClick={() => navigate("/student/subjects")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-amber-500/30 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-2 sm:mb-4">
                <FaBookOpen className="text-xs sm:text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Study Materials</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1">Notes & resources</p>
              </div>
            </div>

            {/* Button 4: Performance */}
            <div 
              onClick={() => navigate("/student/results")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-emerald-500/30 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-2 sm:mb-4">
                <FaChartPie className="text-xs sm:text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Performance</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1">Detailed analytics</p>
              </div>
            </div>

          </div>

          {/* Informational notification card alert at bottom */}
          <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-2.5xl p-4.5 text-xs text-slate-655 dark:text-slate-400 select-none">
            <FaInfoCircle className="text-blue-500 text-sm mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="font-semibold leading-relaxed">
                Exam schedules are subject to change.
                <br />
                Please check regularly for updates from your school.
              </p>
            </div>
          </div>

          {/* Exam Rules & Instructions Overlay Modal */}
          {showInstructionsModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
                >
                  <FaTimes className="text-sm" />
                </button>
                
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                    <FaBookOpen className="text-sm" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Exam Guidelines</h3>
                </div>
                
                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed my-4">
                  <p>Please read these rules carefully before starting any proctored examination:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Make sure your webcam and screen sharing permissions are enabled.</li>
                    <li>Remain in front of your camera for the entire duration of the test.</li>
                    <li>Do not navigate away from the test tab or close browser windows.</li>
                    <li>Negative marking rules apply: verify the warning badge in the question header.</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </div>
          )}

          {/* Offline Classroom Exam Details Overlay Modal */}
          {showOfflineModal && selectedOfflineExam && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl relative select-none">
                <button
                  onClick={() => {
                    setShowOfflineModal(false);
                    setSelectedOfflineExam(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
                >
                  <FaTimes className="text-sm" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FaBookOpen className="text-base" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        Offline Exam (Classroom)
                      </span>
                      {selectedOfflineExam.isAdmission ? (
                        <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          Admission
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                          Internal
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-1">
                      {selectedOfflineExam.subject}
                    </h3>
                    {selectedOfflineExam.title && selectedOfflineExam.title !== selectedOfflineExam.subject && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {selectedOfflineExam.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Exam Details Grid */}
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3.5 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                      <FaCalendarAlt className="text-slate-400 text-[10px]" /> Exam Date
                    </p>
                    <p className="text-xs font-black text-slate-800 dark:text-white">
                      {formatExamDate(selectedOfflineExam.date)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {formatExamDay(selectedOfflineExam.date)}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3.5 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                      <FaClock className="text-slate-400 text-[10px]" /> Timing & Duration
                    </p>
                    <p className="text-xs font-black text-slate-800 dark:text-white">
                      {formatExamTime(selectedOfflineExam)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Duration: {selectedOfflineExam.duration}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3.5 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                      <FaDesktop className="text-slate-400 text-[10px]" /> Venue / Room
                    </p>
                    <p className="text-xs font-black text-slate-800 dark:text-white">
                      {selectedOfflineExam.room}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">In-Person Exam Hall</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3.5 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                      <FaInfoCircle className="text-slate-400 text-[10px]" /> Invigilator / Proctor
                    </p>
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                      {selectedOfflineExam.proctor?.name || "Assigned Teacher"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Max Marks: {selectedOfflineExam.maxMarks || 100}
                    </p>
                  </div>
                </div>

                {/* Offline Exam Instructions Box */}
                <div className="bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 p-4 rounded-2xl mb-6">
                  <h4 className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <FaExclamationTriangle /> Offline Classroom Examination Instructions
                  </h4>
                  <ul className="text-[11px] text-amber-900 dark:text-amber-300 space-y-1.5 font-semibold list-disc pl-4 leading-relaxed">
                    <li>Please reach <strong>{selectedOfflineExam.room}</strong> at least 15 minutes prior to <strong>{formatExamTime(selectedOfflineExam)}</strong>.</li>
                    <li>Carry your physical <strong>Student Admit Card / ID Card</strong>.</li>
                    <li>Bring necessary stationery (Pens, Pencils, Eraser, Ruler).</li>
                    <li>Mobile phones, smartwatches, and electronic gadgets are strictly prohibited inside the exam hall.</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setShowOfflineModal(false);
                    setSelectedOfflineExam(null);
                  }}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Got It, I Will Be Prepared
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Proctoring Test setup Canvas */}
      {(activeTest === "admission" || activeTest === "class-online") && testStep === "setup" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-[#7C3AED] w-full" />
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                <FaLock />
              </div>
              <div>
                <h2 className="text-slate-800 dark:text-white font-black text-lg tracking-tight">
                  {activeTest === "admission" ? "Entrance Examination Proctoring Setup" : `${testPaper?.subject || "Class"} Exam Proctoring Setup`}
                </h2>
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
      {(activeTest === "admission" || activeTest === "class-online") && testStep === "taking" && testPaper && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative">
          
          {/* Main Question view (Left 3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Section switcher tabs */}
            <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 p-2 shadow-sm flex gap-2 overflow-x-auto">
              {(activeTest === "admission" ? ["Mathematics", "Science", "Social Science"] : [testPaper.subject || "General"]).map((sec) => {
                const isSecActive = activeSection === sec;
                const secQs = testPaper.questions.map((q, idx) => ({ ...q, globalIdx: idx })).filter(q => (q.section || "Mathematics") === sec);
                const answeredCount = secQs.filter(q => selectedAnswers[q.globalIdx] !== -1).length;

                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      if (secQs.length > 0) {
                        setCurrentQIndex(secQs[0].globalIdx);
                        setActiveSection(sec);
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isSecActive
                        ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
                        : "text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {sec}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isSecActive 
                        ? "bg-white/20 text-white dark:bg-[#090F1C]/25 dark:text-[#090F1C]" 
                        : "bg-slate-100 dark:bg-white/10 text-slate-500"
                    }`}>
                      {answeredCount}/{secQs.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative">
              <div className="h-1.5 bg-gradient-to-r from-teal-500 to-[#7C3AED] w-full" />
              <div className="p-6">
                
                {/* Question Header & Grid navigation */}
                <div className="border-b border-slate-100 dark:border-white/5 pb-4 mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-teal-550 border border-teal-100 text-teal-600 px-3 py-1 rounded-full">
                        {activeSection} · Question {testPaper.questions.map((q, idx) => ({ ...q, globalIdx: idx })).filter(q => (q.section || "Mathematics") === activeSection).findIndex(q => q.globalIdx === currentQIndex) + 1} of {testPaper.questions.filter(q => (q.section || "Mathematics") === activeSection).length}
                      </span>
                    </div>
                    {testPaper.negativeMarking && (
                      <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/5 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 px-2.5 py-1 rounded-md">
                        Negative: -{testPaper.negativeMarkValue}
                      </span>
                    )}
                  </div>

                  {/* Circle navigation grid for active section questions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {testPaper.questions
                      .map((q, idx) => ({ ...q, globalIdx: idx }))
                      .filter(q => (q.section || "Mathematics") === activeSection)
                      .map((q, localIdx) => {
                        const isQActive = currentQIndex === q.globalIdx;
                        const isAnswered = selectedAnswers[q.globalIdx] !== -1;
                        return (
                          <button
                            key={q.globalIdx}
                            type="button"
                            onClick={() => setCurrentQIndex(q.globalIdx)}
                            className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer border ${
                              isQActive
                                ? "bg-teal-555 border-teal-600 text-white shadow-md shadow-teal-555/20"
                                : isAnswered
                                  ? "bg-indigo-50 border-indigo-200 text-[#7C3AED] dark:bg-[#7C3AED]/10 dark:border-[#7C3AED]/20 dark:text-[#38BDF8]"
                                  : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-[#1E293B] dark:border-white/5"
                            }`}
                          >
                            {localIdx + 1}
                          </button>
                        );
                      })}
                  </div>
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
                    onClick={() => {
                      const prevQ = testPaper.questions[currentQIndex - 1];
                      if (prevQ) {
                        setCurrentQIndex(currentQIndex - 1);
                        setActiveSection(prevQ.section || "Mathematics");
                      }
                    }}
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
                      onClick={() => {
                        const nextQ = testPaper.questions[currentQIndex + 1];
                        if (nextQ) {
                          setCurrentQIndex(currentQIndex + 1);
                          setActiveSection(nextQ.section || "Mathematics");
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:text-[#5B21B6] dark:hover:text-[#0EA5E9] transition cursor-pointer"
                    >
                      Next <FaChevronRight className="text-[10px]" />
                    </button>
                  )}
                </div>

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
      {(activeTest === "admission" || activeTest === "class-online") && testStep === "graded" && testResult && (
        <div className="max-w-md mx-auto bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative text-center">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 w-full" />
          <div className="p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto mb-4">
              <FaCheckCircle />
            </div>

            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Test Evaluated Successfully!</h2>
            <p className="text-xs text-slate-455 mt-0.5">Your examination response has been graded</p>

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

export default Exam;
