import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FaGraduationCap,
  FaClock,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaSchool,
  FaUserCircle,
  FaCamera,
  FaDesktop,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaBookOpen
} from "react-icons/fa";
import UserProfile from "../../components/UserProfile";

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
        className="text-[10px] font-black uppercase tracking-wider bg-teal-500 hover:bg-teal-650 dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-5 py-2.5 rounded-xl shadow-md transition animate-bounce cursor-pointer font-extrabold"
      >
        Start Your Exam
      </button>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-xl border border-amber-205 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-mono whitespace-nowrap">
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

const questionTranslations = {
  "What is the result of 150 + 270?": {
    q: "150 + 270 का परिणाम क्या है?",
    opts: ["320", "420", "520", "380"]
  },
  "Solve: 500 - 185": {
    q: "हल करें: 500 - 185",
    opts: ["315", "325", "295", "415"]
  },
  "What is 12 multiplied by 8?": {
    q: "12 को 8 से गुणा करने पर क्या प्राप्त होता है?",
    opts: ["86", "96", "106", "76"]
  },
  "Divide: 144 / 12": {
    q: "भाग दें: 144 / 12",
    opts: ["10", "11", "12", "14"]
  },
  "Identify the increasing order (ascending order) of numbers: 45, 12, 89, 34": {
    q: "संख्याओं का बढ़ता क्रम (आरोही क्रम) पहचानें: 45, 12, 89, 34",
    opts: ["12 < 34 < 45 < 89", "89 < 45 < 34 < 12", "12 < 45 < 34 < 89", "34 < 12 < 45 < 89"]
  },
  "Identify the decreasing order (descending order) of numbers: 100, 250, 50, 150": {
    q: "संख्याओं का घटता क्रम (अवरोही क्रम) पहचानें: 100, 250, 50, 150",
    opts: ["50 > 100 > 150 > 250", "250 > 150 > 100 > 50", "250 > 100 > 150 > 50", "150 > 250 > 100 > 50"]
  },
  "If a pen costs ₹15, what is the cost of 6 pens?": {
    q: "यदि एक पेन की कीमत ₹15 है, तो 6 पेनों की कीमत क्या होगी?",
    opts: ["₹75", "₹80", "₹90", "₹100"]
  },
  "What is the next number in the pattern: 2, 4, 8, 16, _?": {
    q: "पैटर्न में अगली संख्या क्या है: 2, 4, 8, 16, _?",
    opts: ["20", "24", "32", "30"]
  },
  "Add: 12.5 + 7.25": {
    q: "जोड़ें: 12.5 + 7.25",
    opts: ["19.75", "19.50", "20.25", "19.25"]
  },
  "What is the perimeter of a square with side length 5 cm?": {
    q: "5 सेमी भुजा वाले वर्ग का परिमाप क्या है?",
    opts: ["15 सेमी", "20 सेमी", "25 सेमी", "10 सेमी"]
  },
  "Lion (शेर) kis tarah ka janvar hai?": {
    q: "शेर किस तरह का जानवर है?",
    opts: ["शाकाहारी (Herbivore)", "मांसाहारी (Carnivore)", "सर्वाहारी (Omnivore)", "अपघटक (Decomposer)"]
  },
  "Insan (Human) kis category me aata hai?": {
    q: "इंसान किस श्रेणी में आता है?",
    opts: ["शाकाहारी (Herbivore)", "मांसाहारी (Carnivore)", "सर्वाहारी (Omnivore)", "इनमें से कोई नहीं"]
  },
  "Cow (गाय) kis tarah ka janvar hai?": {
    q: "गाय किस तरह का जानवर है?",
    opts: ["शाकाहारी (Herbivore)", "मांसाहारी (Carnivore)", "सर्वाहारी (Omnivore)", "परजीवी (Parasite)"]
  },
  "Plants apna khana banane ke liye kaun si gas absorb karte hain?": {
    q: "पौधे अपना भोजन बनाने के लिए कौन सी गैस ग्रहण करते हैं?",
    opts: ["ऑक्सीजन", "कार्बन डाइऑक्साइड", "नाइट्रोजन", "हाइड्रोजन"]
  },
  "Human body me kitni bones (हड्डियां) hoti hain?": {
    q: "मानव शरीर में कितनी हड्डियाँ होती हैं?",
    opts: ["206", "306", "106", "250"]
  },
  "Hamare Solar System ka sabse bada planet kaun sa hai?": {
    q: "हमारे सौरमंडल का सबसे बड़ा ग्रह कौन सा है?",
    opts: ["पृथ्वी (Earth)", "मंगल (Mars)", "बृहस्पति (Jupiter)", "शनि (Saturn)"]
  },
  "Pani (Water) ka chemical formula kya hai?": {
    q: "पानी का रासायनिक सूत्र क्या है?",
    opts: ["CO2", "H2O", "O2", "NaCl"]
  },
  "Hamare Earth par primary source of energy kya hai?": {
    q: "हमारी पृथ्वी पर ऊर्जा का प्राथमिक स्रोत क्या है?",
    opts: ["चन्द्रमा (Moon)", "सूर्य (Sun)", "कोयला (Coal)", "हवा (Wind)"]
  },
  "Kaun sa organ hamari body me blood pump karta hai?": {
    q: "कौन सा अंग हमारे शरीर में रक्त पंप करता है?",
    opts: ["फेफड़े (Lungs)", "मस्तिष्क (Brain)", "हृदय (Heart)", "गुर्दा (Kidney)"]
  },
  "Plants ka green color kis pigment ki wajah se hota hai?": {
    q: "पौधों का हरा रंग किस वर्णक के कारण होता है?",
    opts: ["क्लोरोफिल (Chlorophyll)", "हीमोग्लोबिन", "मेलेनिन", "कैरोटीन"]
  },
  "Bihar ki rajdhani kya hai?": {
    q: "बिहार की राजधानी क्या है?",
    opts: ["पटना (Patna)", "गया", "मुजफ्फरपुर", "दरभंगा"]
  },
  "India ki rajdhani (Capital) kya hai?": {
    q: "भारत की राजधानी क्या है?",
    opts: ["मुंबई", "नई दिल्ली", "कोलकाता", "चेन्नई"]
  },
  "India kab aazad (Independent) hua tha?": {
    q: "भारत कब आज़ाद हुआ था?",
    opts: ["15 अगस्त 1947", "26 जनवरी 1950", "15 अगस्त 1950", "2 अक्टूबर 1947"]
  },
  "Republic Day (गणतंत्र दिवस) kab manaya jata hai?": {
    q: "गणतंत्र दिवस कब मनाया जाता है?",
    opts: ["15 अगस्त", "26 जनवरी", "2 अक्टूबर", "14 नवंबर"]
  },
  "Taj Mahal kis shahar me sthit hai?": {
    q: "ताजमहल किस शहर में स्थित है?",
    opts: ["दिल्ली", "आगरा", "जयपुर", "लखनऊ"]
  },
  "India ke first Prime Minister kaun the?": {
    q: "भारत के पहले प्रधानमंत्री कौन थे?",
    opts: ["महात्मा गांधी", "जवाहरलाल नेहरू", "डॉ. राजेंद्र प्रसाद", "सुभाष चंद्र बोस"]
  },
  "India ka national bird (राष्ट्रीय पक्षी) kaun sa hai?": {
    q: "भारत का राष्ट्रीय पक्षी कौन सा है?",
    opts: ["मोर (Peacock)", "तोता", "कौआ", "कबूतर"]
  },
  "Red Fort (लाल किला) kisne banwaya tha?": {
    q: "लाल किला किसने बनवाया था?",
    opts: ["अकबर", "शाहजहाँ", "बाबर", "हुमायूँ"]
  },
  "Kaun se leader ko 'Bapu' ke naam se jana jata hai?": {
    q: "किस नेता को 'बापू' के नाम से जाना जाता है?",
    opts: ["जवाहरलाल नेहरू", "महात्मा गांधी", "Bhagat Singh", "Sardar Patel"]
  },
  "National Anthem 'Jana Gana Mana' kisne likha tha?": {
    q: "राष्ट्रगान 'जन गण मन' किसने लिखा था?",
    opts: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Mahatma Gandhi", "Sarojini Naidu"]
  }
};

function PendingApproval() {
  const navigate = useNavigate();
  const [examLanguage, setExamLanguage] = useState("EN"); // "EN" or "HI"
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [activeTab, setActiveTab] = useState("status");
  const [schools, setSchools] = useState([]);
  const [user, setUser] = useState({ name: "Loading...", email: "", role: "", avatar: "" });
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [requestedRole, setRequestedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);

  // Upcoming Events states
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

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
  const [activeSection, setActiveSection] = useState("Mathematics");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (testStep === "taking" && user.admissionExamProctor) {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_URL;
      socketRef.current = io(API, {
        auth: { token }
      });

      const proctorId = user.admissionExamProctor._id || user.admissionExamProctor;
      socketRef.current.emit("test-session-start", { proctorId });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("test-session-stop", { proctorId });
          socketRef.current.disconnect();
        }
      };
    }
  }, [testStep, user.admissionExamProctor]);

  useEffect(() => {
    let camInterval;
    let screenInterval;

    if (testStep === "taking" && socketRef.current && user.admissionExamProctor) {
      const proctorId = user.admissionExamProctor._id || user.admissionExamProctor;

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
  }, [testStep, cameraStream, screenStream, cameraActive, screenActive, user.admissionExamProctor]);

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
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
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
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
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
        
        // Reload user info immediately so it triggers status update
        axios
          .get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
          .then((pRes) => {
            setUser(pRes.data);
          });
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit test");
      })
      .finally(() => {
        setSubmittingTest(false);
      });
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const hasActiveRequest = ["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool;
    if (hasActiveRequest) {
      alert("You already have an active or pending join request.");
      return;
    }
    setSubmitting(true);
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    axios
      .put(
        `${API}/api/auth/join-request`,
        { schoolName: selectedSchool, role: requestedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setUser((prev) => ({
          ...prev,
          requestedSchool: selectedSchool,
          requestedRole: requestedRole,
          requestStatus: "pending"
        }));
        setShowJoinModal(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit request");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const checkRoleStatus = () => {
      axios
        .get(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            if (res.data.role && res.data.role !== "unassigned") {
              // Update token and role in localStorage
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("role", res.data.role);
              localStorage.setItem("name", res.data.name);

              // Redirect automatically without requiring reload/logout
              if (res.data.role === "superadmin") {
                navigate("/superadmin/dashboard");
              } else if (res.data.role === "admin") {
                navigate("/admin/dashboard");
              } else if (res.data.role === "teacher") {
                navigate("/teacher/dashboard");
              } else if (res.data.role === "student") {
                navigate("/student/dashboard");
              }
            }
          }
        })
        .catch((err) => {
          console.error("Polling profile status error:", err);
        });
    };

    checkRoleStatus(); // Run once immediately
    // Poll every 3 seconds
    const interval = setInterval(checkRoleStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/auth/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSchools(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching schools:", err);
      });
  }, []);

  // Fetch upcoming events based on requestedSchool or assigned schoolName
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const school = user.schoolName || user.requestedSchool;
    if (!token || !school) {
      setUpcomingEvents([]);
      return;
    }

    setLoadingEvents(true);
    axios
      .get(`${API}/api/events/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUpcomingEvents(res.data || []);
      })
      .catch((err) => {
        console.error("Error loading upcoming events:", err);
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, [user.schoolName, user.requestedSchool]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div style={{ fontFamily: SORA }} className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1C] text-slate-800 dark:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 bg-white dark:bg-[#0B132A] border-r border-slate-200/60 dark:border-white/10 flex flex-col justify-between py-6 px-3 z-40 transition-all duration-200">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start lg:px-4 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black shadow-md shadow-[#7C3AED]/20">
              <FaGraduationCap className="text-xl" />
            </div>
            <span className="hidden lg:block text-lg font-black tracking-tight text-slate-900 dark:text-white">
              TeachHub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* Status Link */}
            <button
              onClick={() => setActiveTab("status")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "status"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaClock className="text-xl shrink-0" />
              <span className="hidden lg:block">Wait Kro</span>
            </button>

            {/* Profile Link */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaUserCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">Profile</span>
            </button>

            {/* School List Link */}
            <button
              onClick={() => setActiveTab("schools")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "schools"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaSchool className="text-xl shrink-0" />
              <span className="hidden lg:block">School List</span>
            </button>
          </nav>
        </div>

        {/* Footer controls inside Sidebar */}
        <div className="space-y-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
          >
            {theme === "dark" ? <FaSun className="text-xl text-amber-500 animate-pulse" /> : <FaMoon className="text-xl" />}
            <span className="hidden lg:block">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
          >
            <FaSignOutAlt className="text-xl shrink-0" />
            <span className="hidden lg:block">Logout</span>
          </button>

          {/* Profile Badge Footer */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-center lg:justify-start gap-3 px-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-[1.5px] shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-extrabold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name || "User"}</p>
              <p className="text-[9px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] tracking-wider uppercase mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-20 lg:pl-64 min-h-screen flex items-center justify-center p-6 sm:p-12 transition-all duration-200">
        {activeTab === "status" && (
          <div className="w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 max-w-5xl">
            {/* Status Card */}
            <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-200 shrink-0">
              {/* Ambient glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
              
              {/* Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
                <FaClock className="text-3xl animate-pulse" />
              </div>

              {/* Status: Scheduled */}
              {user.requestStatus === "scheduled" && (
                <div className="space-y-6">
                  <div className="px-4 py-3 bg-teal-500/15 border border-teal-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-teal-600 dark:text-teal-400">Admission Exam Scheduled</p>
                      <p className="text-[10px] text-slate-550 dark:text-slate-455 font-semibold mt-1">
                        Please go to the <strong>Admission Exam</strong> tab in the sidebar to view details and start your test.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("exam")}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Go to Admission Exam
                  </button>
                </div>
              )}

              {/* Status: Exam Completed */}
              {user.requestStatus === "exam_completed" && (
                <div className="space-y-6">
                  <div className="px-4 py-3 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-left flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Entrance Exam Completed</p>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 font-semibold mt-1">
                        Score Achieved: <strong className="text-slate-800 dark:text-white font-bold">{user.admissionExamScore} / {user.admissionExamTotal}</strong>
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-850 dark:text-white">Wait kro aapko kon sa class milta h</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Your examination response has been automatically graded. Please wait until the school administrator registers your class and section.
                  </p>
                </div>
              )}

              {/* Status: Standard Pending */}
              {(user.requestStatus === "pending" || !user.requestStatus) && (
                <div className="space-y-4 text-center">
                  {user.requestedSchool && (
                    <div className="mb-6 px-4 py-3 bg-amber-500/15 border border-amber-500/20 rounded-2xl text-left flex items-start gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-amber-500">Pending School Approval</p>
                        <p className="text-[10px] text-slate-555 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                          Requested to join <strong className="font-bold text-slate-700 dark:text-white">{user.requestedSchool}</strong> as a <strong className="font-bold text-slate-700 dark:text-white capitalize">{user.requestedRole}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                    Wait Kro, School Assign Ho Raha Hai
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    Your login was successful! Please wait until the Super Admin assigns your school and system role. You will be able to access your dashboard as soon as the assignment is completed.
                  </p>
                </div>
              )}

              {user.requestStatus !== "scheduled" && user.requestStatus !== "exam_completed" && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-2xl border border-teal-100/50 dark:border-teal-400/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mr-1" />
                  Checking status in real-time
                </div>
              )}
            </div>

            {/* Upcoming Events Card */}
            {(user.schoolName || user.requestedSchool) && (
              <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 relative overflow-hidden transition-all duration-200 text-left shrink-0">
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#38BDF8]/10 blur-[50px] pointer-events-none" />
                
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4 mb-6 select-none">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-lg">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Events</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Stay tuned with school life</p>
                  </div>
                </div>

                {loadingEvents ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold">Syncing events calendar...</p>
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50/50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-2xl p-6">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic">No upcoming events scheduled yet for your school.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {upcomingEvents.map((ev) => (
                      <div key={ev._id} className="bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/5 p-4 rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">{ev.title}</h4>
                        {ev.subtitle && <p className="text-[9px] font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-0.5 uppercase tracking-wide">{ev.subtitle}</p>}
                        
                        <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-3">
                          <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(ev.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          <span className="flex items-center gap-1"><FaClock /> {ev.eventTime}</span>
                        </div>
                        
                        {ev.description && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "exam" && (
          <div className="w-full flex items-center justify-center">
            {/* Proctoring Test setup Canvas */}
            {activeTest === "admission" && testStep === "setup" && (
              <div className="max-w-2xl w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative text-left">
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
                  <div className="space-y-4 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 p-5 rounded-2xl mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Exam System Instructions</h3>
                    <ul className="text-xs text-slate-555 dark:text-slate-455 leading-relaxed list-disc pl-4 space-y-2 font-medium">
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
                          type="button"
                          onClick={activateCamera}
                          className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl transition cursor-pointer font-bold"
                        >
                          Allow Camera
                        </button>
                      )}
                    </div>

                    {/* Screen Share */}
                    <div className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-lg ${
                        screenActive ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-400 animate-pulse"
                      }`}>
                        <FaDesktop />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1">Screen Share Verification</h4>
                      <p className="text-[10px] text-slate-400 font-medium mb-3">Verifies entire desktop view</p>
                      {screenActive ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1">
                          <FaCheckCircle className="text-xs" /> Screen Sharing
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={activateScreenShare}
                          className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl transition cursor-pointer font-bold"
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
                      className="flex-1 bg-gradient-to-r from-teal-500 to-indigo-650 hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
                    >
                      {loadingTest ? "Loading Test..." : "Begin Exam"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTest(null);
                        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
                        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
                        setCameraActive(false);
                        setScreenActive(false);
                      }}
                      className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-550 dark:text-slate-400 px-6 py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Proctoring Test Taking Canvas */}
            {activeTest === "admission" && testStep === "taking" && testPaper && (
              <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative text-left">
                
                {/* Main Question view (Left 3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Section switcher tabs */}
                  <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/60 dark:border-white/10 p-2 shadow-sm flex gap-2 overflow-x-auto">
                    {["Mathematics", "Science", "Social Science"].map((sec) => {
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
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-2 keys ${
                            isSecActive
                              ? "bg-[#7C3AED] text-white dark:bg-[#38BDF8] dark:text-[#090F1C] shadow-sm"
                              : "text-slate-550 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
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
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold uppercase bg-teal-550 border border-teal-100 text-teal-600 px-3 py-1 rounded-full animate-pulse">
                              {activeSection} · Question {testPaper.questions.map((q, idx) => ({ ...q, globalIdx: idx })).filter(q => (q.section || "Mathematics") === activeSection).findIndex(q => q.globalIdx === currentQIndex) + 1} of {testPaper.questions.filter(q => (q.section || "Mathematics") === activeSection).length}
                            </span>

                            {/* Language Switcher */}
                            <div className="inline-flex bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-0.5 rounded-lg text-[9px] font-bold">
                              <button
                                type="button"
                                onClick={() => setExamLanguage("EN")}
                                className={`px-2 py-1 rounded-md transition ${examLanguage === "EN" ? "bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white shadow-sm font-extrabold" : "text-slate-450 dark:text-slate-555"}`}
                              >
                                English
                              </button>
                              <button
                                type="button"
                                onClick={() => setExamLanguage("HI")}
                                className={`px-2 py-1 rounded-md transition ${examLanguage === "HI" ? "bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white shadow-sm font-extrabold" : "text-slate-455 dark:text-slate-555"}`}
                              >
                                हिंदी
                              </button>
                            </div>
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
                                      ? "bg-teal-500 border-teal-600 text-white shadow-md shadow-teal-500/20"
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

                      {/* Question Content Block */}
                      {(() => {
                        const currentQ = testPaper.questions[currentQIndex];
                        const isHi = examLanguage === "HI";
                        const trans = isHi && currentQ ? questionTranslations[currentQ.questionText] : null;
                        const qText = trans?.q || currentQ?.questionText;
                        const qOpts = trans?.opts || currentQ?.options || [];

                        return (
                          <>
                            {/* Question Text */}
                            <div className="mb-8">
                              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white leading-relaxed">
                                {qText}
                              </h2>
                            </div>

                            {/* 4 options select */}
                            <div className="space-y-3 mb-8">
                              {qOpts.map((opt, optIdx) => {
                                const isSelected = selectedAnswers[currentQIndex] === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => selectOption(optIdx)}
                                    className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                                      isSelected
                                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                                        : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/5 text-[#475569] dark:text-slate-400"
                                    }`}
                                  >
                                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black ${
                                      isSelected
                                        ? "border-[#7C3AED] bg-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8] text-white dark:text-[#090F1C]"
                                        : "border-slate-300 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-450"
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="text-xs font-bold">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}

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
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-550 hover:text-slate-700 dark:hover:text-slate-350 transition disabled:opacity-30 cursor-pointer"
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
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-455 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    Live Monitoring
                  </p>
                  <VideoPreview stream={cameraStream} />
                  <div className="text-[9px] text-[#475569] dark:text-slate-400 font-bold text-center leading-relaxed">
                    Feed is synced with proctoring engine. Avoid shifting screens or looking away.
                  </div>
                </div>

              </div>
            )}

            {/* Proctoring Test Graded Canvas */}
            {testStep === "graded" && testResult && (
              <div className="max-w-md w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden relative text-center">
                <div className="h-1.5 bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] w-full" />
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
                      {testResult.score} <span className="text-lg font-bold text-[#94A3B8]">/ {testResult.total}</span>
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-bold text-slate-455">
                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">{testResult.correct} Correct</span>
                      <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/5 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">{testResult.wrong} Incorrect</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTest(null);
                      setTestStep("setup");
                      setTestResult(null);
                      setActiveTab("status");
                    }}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Standard Exam schedule view */}
            {activeTest === null && testStep !== "graded" && (
              <div className="max-w-md w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-200">
                {/* Ambient glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 flex items-center justify-center text-teal-650 dark:text-teal-450 mx-auto mb-6 shadow-sm">
                  <FaDesktop className="text-3xl" />
                </div>

                {user.requestStatus === "scheduled" ? (
                  <div className="space-y-6">
                    <div className="mb-6 px-4 py-3.5 bg-teal-500/15 border border-teal-500/20 rounded-2xl text-left flex items-start gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-teal-600 dark:text-teal-400">Admission Exam Scheduled</p>
                        <p className="text-[10px] text-slate-550 dark:text-slate-455 font-medium mt-1">
                          Mode: <strong>{user.admissionExamMode}</strong>
                        </p>
                        <p className="text-[10px] text-slate-550 dark:text-slate-455 font-medium">
                          Date: <strong>{new Date(user.admissionExamDate).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">Test Countdown</span>
                      <AdmissionCountdown
                        dateStr={user.admissionExamDate}
                        examTaken={user.admissionExamTaken}
                        onLaunchTest={() => {
                          setActiveTest("admission");
                          setTestStep("setup");
                        }}
                      />
                    </div>
                  </div>
                ) : user.requestStatus === "exam_completed" ? (
                  <div className="space-y-4">
                    <div className="px-4 py-3 bg-[#10B981]/15 border border-[#10B981]/20 rounded-2xl text-left flex items-start gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-emerald-600 dark:text-[#10B981]">Exam Already Completed</p>
                        <p className="text-[10px] text-slate-550 dark:text-slate-450 font-medium mt-1">
                          Score Achieved: <strong className="text-slate-800 dark:text-white font-bold">{user.admissionExamScore} / {user.admissionExamTotal}</strong>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#475569] dark:text-slate-400 font-medium mt-2 leading-relaxed">
                      You have already submitted this exam. Your scorecard is locked and under evaluation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">No Admission Exam Scheduled</h3>
                    <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                      There is no admission test scheduled for your account at this time. Once Banny Thapar (Admin) schedules your test, you will see a countdown timer here to start the exam.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="w-full">
            <UserProfile />
          </div>
        )}

        {activeTab === "schools" && (
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 relative overflow-hidden transition-all duration-200">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Directory</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registered Schools
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">List of available schools in TeachHub</p>
            </div>

            {schools.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {schools.map((school, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/10 transition duration-150 shadow-sm gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 border border-teal-200/40">
                        <FaSchool className="text-lg" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{school}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Active Center</p>
                      </div>
                    </div>

                    {/* Join School Action Button */}
                    <div>
                      {(() => {
                        const hasActiveRequest = ["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool;
                        if (hasActiveRequest) {
                          if (user.requestedSchool === school) {
                            return (
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border ${
                                user.requestStatus === "scheduled"
                                  ? "bg-teal-500/15 text-teal-600 border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400"
                                  : user.requestStatus === "exam_completed"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-amber-500/15 text-amber-500 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500"
                              }`}>
                                {user.requestStatus === "scheduled" 
                                  ? "Exam Scheduled" 
                                  : user.requestStatus === "exam_completed" 
                                    ? "Exam Completed" 
                                    : "Pending Approval"}
                              </span>
                            );
                          } else {
                            return (
                              <button
                                disabled
                                className="opacity-40 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-3.5 py-2 rounded-xl cursor-not-allowed"
                              >
                                Join
                              </button>
                            );
                          }
                        } else {
                          return (
                            <button
                              onClick={() => {
                                setSelectedSchool(school);
                                setShowJoinModal(true);
                              }}
                              className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-4 py-2 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                            >
                              Join School
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaSchool className="text-slate-300 dark:text-slate-700 text-4xl mx-auto mb-3" />
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold italic">No schools registered yet.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowJoinModal(false)}
          />

          {/* Modal content */}
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Request to Join School
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">
                You are applying to join <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedSchool}</strong>
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Select Requested Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestedRole("student")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "student"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-lg">🎓</span>
                    <span className="text-xs font-black">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestedRole("teacher")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "teacher"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-lg">💼</span>
                    <span className="text-xs font-black">Teacher</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
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

export default PendingApproval;
