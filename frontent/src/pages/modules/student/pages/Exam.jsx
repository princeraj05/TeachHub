import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
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

const SORA = "'Sora', sans-serif";

const DUMMY_EXAMS = [];

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

function Exam() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [exams, setExams] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");

  const userInitials = useMemo(() => {
    if (!profile?.name) return "I";
    return profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [profile]);

  // Exam Proctoring states
  const [activeTest, setActiveTest] = useState(null); // null or "admission" or "class-online"
  const [selectedClassExam, setSelectedClassExam] = useState(null);
  const [testStep, setTestStep] = useState("setup"); // "setup" | "taking" | "graded"

  const socketRef = useRef(null);

  // Media streams
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Test content
  const [testPaper, setTestPaper] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("Mathematics");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (testStep === "taking") {
      const proctorVal = activeTest === "admission"
        ? (profile?.admissionExamProctor)
        : (selectedClassExam?.proctor);

      const proctorId = proctorVal?._id || proctorVal;

      if (proctorId) {
        const token = localStorage.getItem("token");
        const API = import.meta.env.VITE_API_URL;
        socketRef.current = io(API, {
          auth: { token }
        });

        socketRef.current.emit("test-session-start", { proctorId });

        return () => {
          if (socketRef.current) {
            socketRef.current.emit("test-session-stop", { proctorId });
            socketRef.current.disconnect();
          }
        };
      }
    }
  }, [testStep, activeTest, profile, selectedClassExam]);

  useEffect(() => {
    let camInterval;
    let screenInterval;

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
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [API, token]);
  const allExams = useMemo(() => {
    const list = [...exams];
    if (profile && profile.admissionExamDate) {
      list.push({
        _id: "admission-exam-test",
        subject: `Admission Entrance Test (${profile.admissionExamMode})`,
        date: profile.admissionExamDate,
        isAdmission: true,
        duration: 60,
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

      const daysLeft = getDaysLeft(e.date);
      let status = "Upcoming";
      if (e.taken || daysLeft < 0) {
        status = "Completed";
      }

      // Add scores for completed ones
      let score = e.submission?.score;
      let total = e.submission?.total || 100;
      if (status === "Completed" && score === undefined) {
        const scores = [85, 78, 92, 64];
        score = scores[salt % scores.length];
      }

      return {
        ...e,
        duration: e.duration || 60,
        mode: e.mode || "offline",
        room: e.room || `Room ${101 + (salt % 5)}`,
        status,
        score,
        total
      };
    });
  }, [exams, profile]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Filtered exams based on tab choice
  const filteredExamsList = useMemo(() => {
    return allExams.filter((e) => {
      const matchesSearch = e.subject?.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      return e.status === activeFilter;
    });
  }, [allExams, activeFilter, search]);

  // Next upcoming exam resolver
  const nextExamItem = useMemo(() => {
    const upcoming = allExams.filter(e => e.status === "Upcoming");
    if (upcoming.length === 0) return null;
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [allExams]);

  // Aggregate stats metrics
  const examsMetrics = useMemo(() => {
    const total = allExams.length;
    const upcoming = allExams.filter(e => e.status === "Upcoming").length;
    const ongoing = 0; // Standard layout ongoing counts
    const completed = allExams.filter(e => e.status === "Completed").length;

    return { total, upcoming, ongoing, completed };
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

  const formatExamTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  const handleLaunchExam = (exam) => {
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
          
          {/* Sub Header Title row */}
          <div className="flex items-center justify-between gap-4 mt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-1">EXAMS</p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Exam Dashboard</h2>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-1">Stay prepared and track all your upcoming & completed exams.</p>
            </div>
            
            {/* Year Dropdown */}
            <div className="shrink-0 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-slate-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
              <span>Academic Year 2026</span>
              <span className="text-[10px] text-slate-450">▼</span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Exams */}
            <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/25 flex items-center justify-center mb-4">
                <FaBookOpen className="text-sm" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{examsMetrics.total}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Total Exams</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 dark:bg-purple-500" />
            </div>

            {/* Card 2: Upcoming */}
            <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-sm" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{examsMetrics.upcoming}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Upcoming</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-505" />
            </div>

            {/* Card 3: Ongoing */}
            <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center mb-4">
                <FaClock className="text-sm" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{examsMetrics.ongoing}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">Ongoing</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            </div>

            {/* Card 4: Completed */}
            <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center mb-4">
                <FaCheckCircle className="text-sm" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{examsMetrics.completed}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-505 font-extrabold uppercase tracking-wide">Completed</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-500" />
            </div>

          </div>

          {/* Next Exam Card Highlights */}
          {currentNextExam ? (
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Next Exam</h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 uppercase">
                  Upcoming
                </span>
              </div>
              
              <div 
                onClick={() => handleLaunchExam(currentNextExam)}
                className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#7C3AED]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                    <FaBookOpen className="text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                        {currentNextExam.subject}
                      </h4>
                      {currentNextExam.isAdmission ? (
                        <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Admission
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-455 px-1.5 py-0.5 rounded border border-blue-500/20">
                          Internal
                        </span>
                      )}
                    </div>
                    
                    {/* Meta details list */}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-455 dark:text-slate-500 font-black flex-wrap">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-slate-400 text-[11px]" />
                        {formatExamDate(currentNextExam.date)} · {formatExamDay(currentNextExam.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-slate-400 text-[11px]" />
                        {formatExamTime(currentNextExam.date)} · Duration: {currentNextExam.duration} Min
                      </span>
                      <span className="flex items-center gap-1">
                        <FaDesktop className="text-slate-400 text-[11px]" />
                        {currentNextExam.mode === "online" ? "Online Proctored" : `${currentNextExam.room} Offline`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Next Exam</h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 uppercase">
                  Upcoming
                </span>
              </div>
              <div className="text-center py-6 text-slate-450 dark:text-slate-500 font-bold">
                🏖️ No upcoming exams scheduled. Keep studying!
              </div>
            </div>
          )}

          {/* Exam Schedule Overview Panel */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Exam Schedule Overview</h3>
              
              {/* Status toggle pills selector */}
              <div className="flex bg-slate-100 dark:bg-[#0B132A] p-1 rounded-xl border border-slate-250/60 dark:border-white/[0.04] select-none self-start sm:self-auto">
                {["All", "Upcoming", "Completed", "Cancelled"].map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {filter} Exams
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List items */}
            <div className="space-y-4">
              {filteredExamsList.length === 0 ? (
                <div className="text-center py-14 text-slate-450 dark:text-slate-500 font-black flex flex-col items-center gap-2 select-none">
                  <FaBookOpen className="text-2xl text-slate-300 dark:text-slate-700" />
                  <span>No exams found matching this status filter.</span>
                </div>
              ) : (
                filteredExamsList.map((exam) => {
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
                      className={`bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all relative ${
                        exam.status === "Upcoming" ? "hover:border-[#7C3AED]/30 cursor-pointer group" : "opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visuals.style}`}>
                          {visuals.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                              {exam.subject}
                            </h4>
                            {exam.isAdmission ? (
                              <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Admission
                              </span>
                            ) : (
                              <span className="text-[8px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-455 px-1.5 py-0.5 rounded border border-blue-500/20">
                                Internal
                              </span>
                            )}
                          </div>
                          
                          {/* Meta details list */}
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-455 dark:text-slate-500 font-black flex-wrap">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-slate-400 text-[11px]" />
                              {formatExamDate(exam.date)} · {formatExamDay(exam.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-slate-400 text-[11px]" />
                              {formatExamTime(exam.date)} · {exam.duration} Min
                            </span>
                            <span className="flex items-center gap-1">
                              <FaDesktop className="text-slate-400 text-[11px]" />
                              {exam.mode === "online" ? "Online Proctored" : `${exam.room} Offline`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status column on right */}
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {isCompleted ? (
                          <div className="text-right select-none">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase mb-1">
                              Completed
                            </span>
                            {exam.score !== undefined && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                                Score: {exam.score}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black border bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border-[#7C3AED]/20 uppercase">
                            Upcoming
                          </span>
                        )}
                        
                        {exam.status === "Upcoming" && (
                          <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors ml-1" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions Buttons Grid row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 select-none">
            
            {/* Button 1: View Timetable */}
            <div 
              onClick={() => navigate("/student/showtimetable")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/30 rounded-3xl p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">View Timetable</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1.5">See your class schedule</p>
              </div>
            </div>

            {/* Button 2: Exam Instructions */}
            <div 
              onClick={() => setShowInstructionsModal(true)}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-blue-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-4">
                <FaBookOpen className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Exam Instructions</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1.5">Guidelines & rules</p>
              </div>
            </div>

            {/* Button 3: Study Materials */}
            <div 
              onClick={() => navigate("/student/about")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-amber-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4">
                <FaBookOpen className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Study Materials</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1.5">Notes & resources</p>
              </div>
            </div>

            {/* Button 4: Performance */}
            <div 
              onClick={() => navigate("/student/dashboard")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-sm cursor-pointer group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-4">
                <FaChartPie className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Performance</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-1.5">Detailed analytics</p>
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