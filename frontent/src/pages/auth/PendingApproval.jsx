import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { performLogout } from "../../utils/logout";
import { usePlatform } from "../../context/PlatformContext";
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
  FaBookOpen,
  FaCalendarAlt,
  FaInfoCircle,
  FaThLarge,
  FaTimes,
  FaBell,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaFileAlt,
  FaHeadphones,
  FaArrowRight,
  FaChalkboardTeacher
} from "react-icons/fa";
import UserProfile from "../../components/UserProfile";
import GlobalEvents from "../modules/student/pages/GlobalEvents";
import SchoolDirectory from "../modules/student/pages/SchoolDirectory";
import SchoolDetails from "../modules/student/pages/SchoolDetails";
import RegisterExam from "../modules/student/pages/RegisterExam";
import AboutAppPage from "../modules/student/pages/AboutAppPage";
import StudentSupport from "../modules/student/pages/StudentSupport";
import { useTheme } from "../../context/ThemeContext";
import { FaVideo } from "react-icons/fa";
import { useCall } from "../../context/CallContext";

const SORA = "'Sora', sans-serif";

function PendingApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const { theme, toggleTheme } = useTheme();
  const { confirmLogout } = usePlatform();
  const { startCall } = useCall() || {};
  const [user, setUser] = useState({ name: "Loading...", email: "", role: "", avatar: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [requestedSchoolData, setRequestedSchoolData] = useState(null);
  const [schoolAdmin, setSchoolAdmin] = useState(null);

  // Live 1-second ticker for real-time countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (diffMs < -2 * 60 * 60 * 1000) {
        return { isReady: false, isEnded: true, label: "Meeting Finished", secondsLeft: 0 };
      }
      return { isReady: true, label: "Start Call Now", secondsLeft: 0 };
    }

    if (diffSec > 86400) {
      const days = Math.floor(diffSec / 86400);
      return { isReady: false, label: `${days} Day${days > 1 ? "s" : ""} Left`, secondsLeft: diffSec };
    }

    if (diffSec > 3600) {
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      return { isReady: false, label: `Starts in ${hours}h ${mins}m`, secondsLeft: diffSec };
    }

    if (diffSec > 60) {
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      return { isReady: false, label: `Starts in ${mins} min ${secs} sec`, secondsLeft: diffSec };
    }

    return { isReady: false, label: `Starts in ${diffSec} sec`, secondsLeft: diffSec };
  };

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/pending/events")) return "events";
    if (path.startsWith("/pending/schools") || path.startsWith("/pending/school")) return "schools";
    if (path.startsWith("/pending/exams")) return "exams";
    if (path.startsWith("/pending/profile")) return "profile";
    if (path.startsWith("/pending/about")) return "about";
    if (path.startsWith("/pending/support")) return "support";
    if (path.startsWith("/pending/notifications")) return "notifications";
    return "status"; // default
  };

  const activeTab = getActiveTab();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
    return new Date(dateStr).toLocaleString("en-US", options);
  };

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return "";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateStr).getDay()];
  };

  const formatExamDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const dayName = getDayOfWeek(dateStr);
    return `${day} ${month} ${year} (${dayName})`;
  };

  const getSchoolLocation = (schoolName) => {
    if (requestedSchoolData && requestedSchoolData.address && requestedSchoolData.address.trim()) {
      return requestedSchoolData.address;
    }
    if (!schoolName) return "Siwan, Bihar";
    const name = schoolName.toLowerCase();
    if (name.includes("prince")) return "Noida, U.P.";
    if (name.includes("bright")) return "Patna, Bihar";
    return "Siwan, Bihar";
  };

  const getSchoolBanner = (schoolName) => {
    if (!schoolName) return "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80";
    const name = schoolName.toLowerCase();
    if (name.includes("prince")) {
      return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80";
    }
    if (name.includes("bright") || name.includes("future")) {
      return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80";
  };

  // Poll for role assignment updates
  useEffect(() => {
    if (!token) {
      performLogout(navigate);
      return;
    }

    let isMounted = true;
    let intervalId = null;

    const checkRoleStatus = () => {
      axios
        .get(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (!isMounted) return;
          if (res.data) {
            setUser(res.data);
            if (res.data.role && res.data.role !== "unassigned") {
              // Update token and role in localStorage
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("role", res.data.role);
              localStorage.setItem("name", res.data.name);
              localStorage.setItem("avatar", res.data.avatar || "");

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
          if (!isMounted) return;
          console.error("Polling profile status error:", err);
          if (err.response && err.response.status === 401) {
            if (intervalId) clearInterval(intervalId);
            performLogout(navigate);
          }
        });
    };

    checkRoleStatus(); // Run once immediately
    intervalId = setInterval(checkRoleStatus, 15000);
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigate, API, token]);

  useEffect(() => {
    if (user.requestedSchool && token) {
      axios
        .get(`${API}/api/schools/${encodeURIComponent(user.requestedSchool)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setRequestedSchoolData(res.data);
          if (res.data?.adminUser) setSchoolAdmin(res.data.adminUser);
        })
        .catch((err) => console.error("Error fetching requested school data:", err));

      axios
        .get(`${API}/api/support/contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            const admin = res.data.find(c => c.role === "admin" || c.role === "superadmin");
            if (admin) setSchoolAdmin(admin);
          }
        })
        .catch((err) => console.error("Error fetching school admin contacts:", err));
    }
  }, [user.requestedSchool, token, API]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUser((prev) => ({
        ...prev,
        name: localStorage.getItem("name") || prev.name,
        avatar: localStorage.getItem("avatar") || prev.avatar
      }));
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    confirmLogout(navigate);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Sidebar link highlight helper
  const isLinkActive = (tabName) => activeTab === tabName;

  const isTeacher = user.requestedRole === "teacher" || user.role === "teacher";

  const getNotificationsList = () => {
    const list = [];
    
    list.push({
      id: "not-welcome",
      title: "Welcome to TeachHub",
      message: isTeacher
        ? "Welcome to TeachHub! Explore registered school centers and submit your application for a teaching position."
        : "Welcome to TeachHub! Explore available school centers in your area and submit a request to join.",
      date: user.createdAt || new Date(),
      category: "system"
    });

    if (user.requestedSchool) {
      list.push({
        id: "not-apply",
        title: isTeacher ? "Faculty Application Submitted" : "School Application Submitted",
        message: isTeacher
          ? `Your application to teach at ${user.requestedSchool} has been submitted successfully and is under faculty review.`
          : `Your application to join ${user.requestedSchool} has been submitted successfully and is under review.`,
        date: user.updatedAt || new Date(),
        category: "application"
      });
    }

    if (user.requestStatus === "scheduled" || user.requestStatus === "exam_completed" || user.requestStatus === "approved") {
      if (isTeacher && (user.interviewDate || user.interviewMode)) {
        list.push({
          id: "not-interview",
          title: user.interviewMode === "Offline" ? "In-Person / Offline Interview Scheduled" : "Online Video Meeting Scheduled",
          message: `School Admin scheduled a ${user.interviewMode || 'Online'} meeting on ${formatDate(user.interviewDate)} ${user.interviewTime ? `at ${user.interviewTime}` : ''}. ${user.interviewVenue ? `Venue: ${user.interviewVenue}` : ''}`,
          date: user.interviewDate || user.updatedAt || new Date(),
          category: "acceptance"
        });
      }

      list.push({
        id: "not-accept",
        title: isTeacher ? "Faculty Application Approved" : "School Application Accepted",
        message: isTeacher
          ? `Congratulations! ${user.requestedSchool} has approved your teacher application. Your teaching workspace is being initialized.`
          : `Congratulations! ${user.requestedSchool} has accepted your application request.`,
        date: user.updatedAt || new Date(),
        category: "acceptance"
      });

      if (!isTeacher && (user.requestStatus === "scheduled" || user.requestStatus === "exam_completed")) {
        list.push({
          id: "not-exam",
          title: "Admission Exam Scheduled",
          message: `Your admission entrance exam has been scheduled for ${formatExamDate(user.admissionExamDate)} at 10:00 AM.`,
          date: user.updatedAt || new Date(),
          category: "exam"
        });
      }
    }

    if (!isTeacher && user.requestStatus === "exam_completed") {
      list.push({
        id: "not-completed",
        title: "Entrance Exam Completed",
        message: `Your entrance exam has been submitted. Your score: ${user.admissionExamScore}/${user.admissionExamTotal}. Please wait for class registration.`,
        date: user.updatedAt || new Date(),
        category: "result"
      });
    }

    if (user.requestStatus === "rejected") {
      list.push({
        id: "not-rejected",
        title: "Application Unsuccessful",
        message: `Your request to join ${user.requestedSchool} was not approved by the administrator.`,
        date: user.updatedAt || new Date(),
        category: "rejection"
      });
    }

    return list.reverse(); // Newest first
  };

  // Renders the specific subroute/tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "events":
        return <GlobalEvents />;
      case "schools":
        // Check if viewing details of a specific school
        const match = location.pathname.match(/\/pending\/schools\/(.+)/);
        if (match) {
          return <SchoolDetails />;
        }
        return <SchoolDirectory />;
      case "exams":
        if (isTeacher) {
          return (
            <div className="max-w-md mx-auto py-12 px-6 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl text-center shadow-xl">
              <FaChalkboardTeacher className="text-5xl text-[#7C3AED] mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Teacher Application Portal</h3>
              <p className="text-xs text-slate-400 mt-2 font-semibold leading-relaxed">
                Entrance exams are required for student applicants only. As a teacher applicant, your profile and teaching qualifications are evaluated directly by the school administration.
              </p>
              <Link
                to="/pending"
                className="mt-6 inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
              >
                View Application Status
              </Link>
            </div>
          );
        }
        return <RegisterExam />;
      case "profile":
        return <UserProfile />;
      case "about":
        return <AboutAppPage />;
      case "support":
        return <StudentSupport />;
      case "notifications":
        const notList = getNotificationsList();
        return (
          <div className="w-full flex flex-col gap-6 max-w-xl mx-auto py-2 select-none" style={{ fontFamily: SORA }}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4 select-none">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">Notifications & Updates</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left font-medium">
                  {isTeacher ? "Stay updated on your teacher application status & notifications" : "Stay updated on your application status, exams, and registrations"}
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-650 dark:text-[#38BDF8] border border-purple-550/15 dark:border-[#38BDF8]/20 rounded-full text-xs font-black shrink-0 leading-none">
                {notList.length} Total
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {notList.map((not) => {
                let iconColor = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                let icon = <FaBell className="text-sm" />;

                if (not.category === "acceptance") {
                  iconColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                  icon = <FaCheckCircle className="text-sm" />;
                } else if (not.category === "exam" || not.category === "result") {
                  iconColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  icon = <FaBookOpen className="text-sm" />;
                } else if (not.category === "rejection") {
                  iconColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                  icon = <FaExclamationTriangle className="text-sm" />;
                } else if (not.category === "application") {
                  iconColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                  icon = <FaSchool className="text-sm" />;
                }

                return (
                  <div key={not.id} className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 flex items-start gap-4 text-left hover:scale-[1.01] transition-all duration-200">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconColor}`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{not.title}</h3>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap shrink-0">{formatDate(not.date)}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold leading-relaxed">{not.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "status":
      default:
        return (
          <div className="w-full flex flex-col gap-6 max-w-xl mx-auto py-2">
            
            {/* RENDER PERSONAL STATUS STATES A, B, C, D */}

            {user.requestStatus === "rejected" ? (
              /* State D: Rejected */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-sm">
                  <FaExclamationTriangle className="text-3xl animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Application Unsuccessful</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mt-2.5">
                    Your request to join <strong className="text-slate-800 dark:text-white font-bold">{user.requestedSchool || "the campus"}</strong> {isTeacher ? "as a Teacher" : ""} was not approved by the administrator.
                  </p>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                  You can browse other registered schools and submit a request to join another campus.
                </p>
                <Link
                  to="/pending/schools"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
                >
                  Browse Schools
                </Link>
              </div>
            ) : isTeacher && (user.requestStatus === "scheduled" || user.requestStatus === "exam_completed" || user.requestStatus === "approved") ? (
              /* State B - Teacher Application Approved / Faculty Onboarding */
              <>
                <div className="flex items-center w-full mb-2 relative py-1">
                  <Link to="/pending" className="absolute left-0 p-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10">
                    <FaChevronLeft className="text-xs" />
                  </Link>
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white mx-auto">Faculty Application Status</h1>
                </div>

                {/* Faculty Application Approved Banner */}
                <div className="w-full bg-[#171C35] rounded-3xl border border-emerald-500/20 shadow-xl p-6 text-center relative overflow-hidden flex flex-col items-center">
                  <div className="relative w-full max-w-[220px] h-[110px] rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg border border-emerald-500/30 overflow-hidden mb-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-[#171C35] shadow-xl">
                      <FaCheckCircle className="text-xl" />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-emerald-400 tracking-wide">Faculty Application Approved!</h2>
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed mt-2.5 max-w-sm">
                    Congratulations! Your application to join <strong className="text-white font-bold">{user.requestedSchool}</strong> as a Teacher has been approved by the school administration.
                  </p>
                </div>

                {/* Meeting / Interview & Approval Details Card */}
                {user.interviewDate || user.interviewMode ? (() => {
                  const meetingStatus = user.interviewDate ? getMeetingTimeStatus(user.interviewDate, user.interviewTime) : null;
                  return (
                    <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-purple-500/20 shadow-sm p-5 text-left flex flex-col gap-4">
                      <div className="flex gap-3.5 items-start">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                          {user.interviewMode === "Offline" ? <FaMapMarkerAlt className="text-lg" /> : <FaVideo className="text-lg" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-purple-600 dark:text-purple-400">
                              {user.interviewMode === "Offline" ? "In-Person / Offline Interview" : "Online Video Meeting / Interview"}
                            </h3>
                            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              {user.interviewMode || "Online"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium leading-normal mt-1">
                            {user.interviewMode === "Offline"
                              ? "School Admin has scheduled an offline meeting/interview at campus."
                              : "School Admin has scheduled an online video call interview."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-4 rounded-2.5xl text-xs font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Meeting Date & Time</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">
                            {user.interviewDate ? formatDate(user.interviewDate) : "Scheduled"} {user.interviewTime ? `at ${user.interviewTime}` : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Meeting Mode</span>
                          <span className="text-purple-500 font-black">{user.interviewMode || "Online"}</span>
                        </div>
                        {user.interviewVenue && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">
                              {user.interviewMode === "Offline" ? "Venue / Campus Room" : "Meeting Link / Address"}
                            </span>
                            <span className="text-slate-900 dark:text-white font-extrabold truncate max-w-[200px]">{user.interviewVenue}</span>
                          </div>
                        )}
                        {user.interviewNotes && (
                          <div className="flex flex-col gap-1 border-t border-slate-200/50 dark:border-white/5 pt-2">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Admin Instructions / Notes:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] leading-relaxed">{user.interviewNotes}</span>
                          </div>
                        )}
                      </div>

                      {user.interviewMode !== "Offline" && (
                        <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                            meetingStatus?.isReady
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          }`}>
                            <FaClock className="text-[10px]" />
                            {meetingStatus?.label || "Online Meeting Scheduled"}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const recipient = schoolAdmin || requestedSchoolData?.adminUser;
                              if (!recipient || !recipient._id) {
                                alert(`Connecting to ${user.requestedSchool || 'School'} Admin... Please try again in a moment.`);
                                return;
                              }
                              if (startCall) {
                                startCall(recipient, "video");
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer ${
                              meetingStatus?.isReady
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-bounce"
                                : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/20"
                            }`}
                          >
                            <FaVideo className="text-xs" />
                            {meetingStatus?.isReady ? "Join Video Call Now" : "Start Video Call"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-emerald-500/20 shadow-sm p-5 text-left flex flex-col gap-4">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <FaCheckCircle className="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black text-emerald-500">Direct Approval & Appointment</h3>
                        <p className="text-[10px] text-slate-455 dark:text-slate-500 font-medium leading-normal mt-1">
                          Direct approval granted by School Administration without extra interview steps.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teacher Faculty Onboarding Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 text-left flex flex-col gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <FaChalkboardTeacher className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-purple-600 dark:text-purple-400">Teacher Dashboard Initializing</h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium leading-normal mt-1">
                        The school administrator is setting up your class and subject assignments. You will be automatically redirected to your Teacher Dashboard as soon as setup completes.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-4 rounded-2.5xl text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Position</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">Faculty / Teacher</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">School</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">{user.requestedSchool}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Selection Method</span>
                      <span className="text-purple-500 font-black">{user.interviewDate ? `${user.interviewMode || 'Online'} Interview` : 'Direct Assign / Approval'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">Status</span>
                      <span className="text-emerald-500 font-black">Approved & Active</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-6 text-left flex flex-col gap-3">
                  <h3 className="text-slate-950 dark:text-white text-xs font-black uppercase tracking-wider mb-2 px-1">Application Timeline</h3>
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[30px] bottom-[-10px] w-[2px] bg-emerald-500" />
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Teacher Application Submitted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  {user.interviewDate && (
                    <div className="flex gap-4 relative mt-2">
                      <div className="absolute left-[15px] top-[30px] bottom-[-10px] w-[2px] bg-emerald-500" />
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                        {user.interviewMode === "Offline" ? <FaMapMarkerAlt className="text-xs" /> : <FaVideo className="text-xs" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{user.interviewMode || 'Online'} Meeting / Interview Conducted</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.interviewDate)} {user.interviewTime ? `at ${user.interviewTime}` : ''}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 relative mt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.interviewDate ? "Faculty Application Approved" : "Direct Faculty Approval & Appointment"}
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : user.requestStatus === "scheduled" ? (
              /* State B1: Entrance Exam Scheduled (Student Application Accepted UI) */
              <>
                {/* Top header */}
                <div className="flex items-center w-full mb-2 relative py-1">
                  <Link to="/pending" className="absolute left-0 p-2 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10">
                    <FaChevronLeft className="text-xs" />
                  </Link>
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white mx-auto">Application Status</h1>
                </div>

                {/* Application Accepted Banner */}
                <div className="w-full bg-[#171C35] rounded-3xl border border-violet-500/20 shadow-xl p-6 text-center relative overflow-hidden flex flex-col items-center">
                  <div className="relative w-full max-w-[220px] h-[110px] rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-800 flex items-center justify-center shadow-lg border border-violet-500/30 overflow-hidden mb-5">
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="2" fill="yellow"/><circle cx="80" cy="20" r="1.5" fill="red"/><rect x="40" y="70" width="3" height="3" fill="blue" transform="rotate(45 41.5 71.5)"/></svg>')` }} />
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center border-4 border-[#171C35] shadow-xl">
                      <FaCheckCircle className="text-xl" />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-emerald-450 tracking-wide">Application Accepted!</h2>
                  <p className="text-xs text-slate-350 font-semibold leading-relaxed mt-2.5 max-w-sm">
                    Congratulations! Your application has been accepted by <strong className="text-white font-bold">{user.requestedSchool}</strong>.
                  </p>
                </div>

                {/* School Status Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <FaSchool className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{user.requestedSchool}</h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <FaMapMarkerAlt className="text-xs shrink-0" />
                        {getSchoolLocation(user.requestedSchool)}
                      </p>
                      <span className="inline-flex items-center gap-1 px-3 py-1 mt-3.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <FaCheckCircle className="text-[9px]" /> Accepted
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
                    <FaCalendarAlt className="text-sm" />
                    <span>Accepted on {formatDate(user.updatedAt)}</span>
                  </div>
                </div>

                {/* Exam Scheduled Detail Card */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-5 text-left flex flex-col gap-5">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <FaBookOpen className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-purple-600 dark:text-purple-400">Exam Scheduled</h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium leading-normal mt-1">Your exam has been scheduled. Please check the details below.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-4 rounded-2.5xl">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <FaCalendarAlt className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Name</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">Admission Test 2025</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Date</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{formatExamDate(user.admissionExamDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Time</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">10:00 AM - 12:00 PM</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <FaClock className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Reporting Time</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">09:30 AM</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <FaDesktop className="text-xs" />
                      </div>
                      <div className="flex-1 flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Mode</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{user.admissionExamMode === "Online" ? "Online Proctored" : "Offline Campus"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full mt-1">
                    <Link to="/pending/exams" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/20">
                      Go to Exam <FaChevronRight className="text-[10px]" />
                    </Link>
                    <button onClick={() => setShowInstructionsModal(true)} className="w-full border border-slate-200/60 dark:border-white/10 text-slate-655 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer">
                      <FaFileAlt className="text-xs text-slate-400" /> View Instructions
                    </button>
                  </div>
                </div>

                {/* Bottom Timeline */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-6 text-left flex flex-col gap-3">
                  <h3 className="text-slate-950 dark:text-white text-xs font-black uppercase tracking-wider mb-2 px-1">Application Timeline</h3>
                  <div className="flex gap-4 relative">
                    <div className="absolute left-[15px] top-[30px] bottom-[-10px] w-[2px] bg-emerald-500" />
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Application Submitted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative mt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                      <FaCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Application Accepted</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : user.requestStatus === "exam_completed" ? (
              /* State B2: Exam Completed / Pending Placement */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                  <FaCheckCircle className="text-3xl animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Entrance Exam Completed</h2>
                  <p className="text-slate-500 dark:text-slate-450 text-xs font-black mt-2">Wait kro aapko kon sa class milta h</p>
                </div>
                
                <div className="w-full p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex flex-col gap-3 text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Exam Score</span>
                    <span className="text-slate-800 dark:text-white font-black">{user.admissionExamScore} / {user.admissionExamTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Correct Answers</span>
                    <span className="text-emerald-500 font-black">{user.admissionExamCorrect}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">Incorrect Answers</span>
                    <span className="text-rose-500 font-black">{user.admissionExamWrong}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
                  Your entrance exam results have been evaluated. Please wait until the school administrator registers your class and section.
                </p>
              </div>
            ) : user.requestedSchool ? (
              /* State B: Standard Application Pending (Under Review UI) */
              <>
                {/* Header status top bar */}
                <div className="flex items-center justify-between w-full mb-2 px-1">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-left">
                      {isTeacher ? "Faculty Application Status" : "Application Status"}
                    </h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left font-medium">
                      {isTeacher ? "Track your teaching position application & faculty review status" : "Track your school application and exam status"}
                    </p>
                  </div>
                  <Link to="/pending/notifications" className="relative p-2.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-400 shrink-0 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    <FaBell className="text-lg" />
                    {getNotificationsList().length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7C3AED] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#090F1C]">
                        {getNotificationsList().length}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Current Application Banner Card */}
                <div className="w-full relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-lg min-h-[12rem] flex flex-col justify-end p-6 select-none bg-slate-950">
                  {/* Background Banner Image */}
                  <img
                    src={requestedSchoolData?.coverImage || (requestedSchoolData?.schoolPhotos && requestedSchoolData.schoolPhotos.length > 0 ? requestedSchoolData.schoolPhotos[0] : getSchoolBanner(user.requestedSchool))}
                    alt="School Banner"
                    className="absolute inset-0 w-full h-full object-cover opacity-45 dark:opacity-30"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  
                  {/* Floating School Icon */}
                  <div className="absolute top-5 right-5 w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-lg">
                    {isTeacher ? <FaChalkboardTeacher className="text-xl" /> : <FaSchool className="text-xl" />}
                  </div>

                  {/* Content details overlay */}
                  <div className="relative z-10 text-left space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded-lg border border-[#38BDF8]/20">
                      {isTeacher ? "Faculty Application" : "Current Application"}
                    </span>
                    
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight pt-1.5 drop-shadow-md">
                      {user.requestedSchool}
                    </h2>
                    
                    <p className="text-xs text-slate-200 dark:text-slate-350 flex items-center gap-1.5 font-bold drop-shadow">
                      <FaMapMarkerAlt className="text-xs text-sky-400 shrink-0" />
                      {getSchoolLocation(user.requestedSchool)}
                    </p>
                    
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/10">
                        {isTeacher ? "⏳ Under Faculty Review" : "⏳ Under Review"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Stepper Timeline */}
                <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-6 flex flex-col gap-6 text-left">
                  {isTeacher ? (
                    /* Teacher Applicant Timeline (Faculty hiring review steps) */
                    <>
                      {/* Step 1: Application Submitted */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] bg-amber-500" />
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                          <FaCheckCircle className="text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Teacher Application Submitted</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {/* Step 2: Under Faculty Review */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                          <FaClock className="text-sm animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Under Faculty Review</p>
                          <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 font-medium">School administration is evaluating your teaching profile & qualifications</p>
                        </div>
                      </div>

                      {/* Step 3: Interview & Credential Verification */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                        {user.requestStatus === "scheduled" ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                            <FaClock className="text-sm animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${user.requestStatus === "scheduled" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-400 dark:text-slate-500"}`}>
                            Interview & Credential Verification
                          </p>
                          <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 font-medium">
                            {user.requestStatus === "scheduled" ? "Interview Scheduled by School Admin" : "Pending Admin Review"}
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Faculty Appointment */}
                      <div className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Faculty Appointment & Class Allocation</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending Approval</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Student Stepper (Existing 5 steps) */
                    <>
                      {/* Step 1: Submitted */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] bg-amber-500" />
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                          <FaCheckCircle className="text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Application Submitted</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      {/* Step 2: Under Review */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-[#0B132A] shadow-sm">
                          <FaClock className="text-sm animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Under Review</p>
                          <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 font-medium">School is reviewing your application</p>
                        </div>
                      </div>

                      {/* Step 3: Accepted */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Accepted</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                        </div>
                      </div>

                      {/* Step 4: Exam Scheduled */}
                      <div className="flex gap-4 relative">
                        <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-slate-200 dark:border-white/10" />
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Admission Exam Scheduled</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                        </div>
                      </div>

                      {/* Step 5: Exam Completed */}
                      <div className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-white/20 bg-white dark:bg-[#0B132A] flex items-center justify-center shrink-0 z-10">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Exam Completed</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Pending</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Scheduled Teacher Interview Card */}
                {isTeacher && user.requestStatus === "scheduled" && (
                  <div className="w-full bg-[#0B132A] text-white rounded-3xl border border-white/10 p-6 shadow-xl text-left space-y-4 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {user.interviewMode === "Offline" || user.admissionExamMode === "Offline" ? "In-Person Meeting" : "Online Video Interview"}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-[#38BDF8]" />
                        {new Date(user.interviewDate || user.admissionExamDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} at {user.interviewTime || "09:00 AM"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white">Faculty Interview Scheduled</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-semibold">
                        {user.interviewMode === "Offline" || user.admissionExamMode === "Offline"
                          ? "Please arrive at the school meeting venue at the scheduled date & time."
                          : "Connect directly with the School Administration via online video call."}
                      </p>
                    </div>

                    {(user.interviewMode === "Offline" || user.admissionExamMode === "Offline") ? (
                      <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2.5 text-xs text-slate-200">
                        <FaMapMarkerAlt className="text-rose-400 text-sm shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue Location</p>
                          <p className="font-extrabold text-white">{user.interviewVenue || "School Principal Office"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300">
                          <FaClock className="text-sm animate-pulse text-[#38BDF8]" />
                          <span>{getMeetingTimeStatus(user.interviewDate || user.admissionExamDate, user.interviewTime).label}</span>
                        </div>

                        {getMeetingTimeStatus(user.interviewDate || user.admissionExamDate, user.interviewTime).isReady && (
                          <button
                            type="button"
                            onClick={() => startCall && startCall({ _id: "admin", name: `${user.requestedSchool || "School"} Admin` }, "video")}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <FaVideo className="text-sm" /> Start Call Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* What Happens Next info box */}
                <div className="w-full bg-indigo-500/10 dark:bg-indigo-500/10 rounded-3xl border border-indigo-500/20 p-5 flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <FaShieldAlt className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400">What happens next?</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">
                      {isTeacher
                        ? "Once your application is reviewed by the school administration, they will contact you for credential verification and faculty onboarding."
                        : "Once your application is accepted by the school, your exam will be scheduled and you'll be notified instantly."}
                    </p>
                  </div>
                </div>

                {/* Quick Actions navigation links */}
                <div className="w-full flex flex-col gap-3">
                  <h3 className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-wider mb-1 px-1 text-left">Quick Actions</h3>
                  
                  {/* Browse Schools */}
                  <Link to="/pending/schools" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <FaSchool className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Browse Schools</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{isTeacher ? "Explore Schools & Positions" : "Explore & Apply"}</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>

                  {/* Update Profile */}
                  <Link to="/pending/profile" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <FaUserCircle className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Update Profile</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{isTeacher ? "Keep teaching info updated" : "Keep your info updated"}</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>

                  {/* Help & Support */}
                  <Link to="/pending/support" className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/10 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <FaHeadphones className="text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">Help & Support</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Get assistance</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </Link>
                </div>
              </>
            ) : (
              /* State A: No School Application (Initial welcome state) */
              <div className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden flex flex-col items-center gap-6">
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[50px] pointer-events-none" />
                <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shadow-sm">
                  {isTeacher ? <FaChalkboardTeacher className="text-3xl" /> : <FaGraduationCap className="text-3xl" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isTeacher ? "Teacher Account Active!" : "Login Successful!"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed mt-2.5">
                    {isTeacher
                      ? "Your account is ready. Browse registered schools from the School directory and apply for a teaching position."
                      : "Your account is ready. Browse available schools from the School directory and submit a request to join."}
                  </p>
                </div>
                <Link
                  to="/pending/schools"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold text-center transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
                >
                  Browse Schools
                </Link>
              </div>
            )}

            {/* Live Real-time Status footer */}
            {user.requestStatus !== "scheduled" && user.requestStatus !== "rejected" && (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-2xl border border-emerald-500/20 shadow-sm mx-auto select-none mt-2 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Checking status in real-time
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: SORA }} className="h-screen overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#090F1C] text-slate-800 dark:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 bg-white dark:bg-[#0B132A] border-r border-slate-200/60 dark:border-white/10 flex flex-col justify-between py-6 px-3 z-40 transition-all duration-200">
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
            {/* 1. Wait Karo (Status) */}
            <Link
              to="/pending"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("status")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaClock className="text-xl shrink-0" />
              <span className="hidden lg:block">Wait Karo</span>
            </Link>

            {/* Notifications */}
            <Link
              to="/pending/notifications"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("notifications")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaBell className="text-xl shrink-0" />
              <span className="hidden lg:block">Notifications</span>
            </Link>

            {/* 2. Event */}
            <Link
              to="/pending/events"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("events")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaCalendarAlt className="text-xl shrink-0" />
              <span className="hidden lg:block">Event</span>
            </Link>

            {/* 3. School (Directory) */}
            <Link
              to="/pending/schools"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("schools")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaSchool className="text-xl shrink-0" />
              <span className="hidden lg:block">School</span>
            </Link>

            {/* 4. Exam (Student Applicants Only) */}
            {!isTeacher && (
              <Link
                to="/pending/exams"
                className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                  isLinkActive("exams")
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <FaBookOpen className="text-xl shrink-0" />
                <span className="hidden lg:block">Exam</span>
              </Link>
            )}

            {/* 5. Profile */}
            <Link
              to="/pending/profile"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("profile")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaUserCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">Profile</span>
            </Link>

            {/* 6. About App */}
            <Link
              to="/pending/about"
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 ${
                isLinkActive("about")
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaInfoCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">About App</span>
            </Link>
          </nav>
        </div>

        {/* Footer controls inside Sidebar */}
        <div className="space-y-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
          >
            {theme === "dark" ? <FaSun className="text-xl text-amber-500" /> : <FaMoon className="text-xl" />}
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
              <p className="text-[9px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] tracking-wider uppercase mt-0.5">
                {isTeacher ? "Teacher (Pending)" : "Student (Pending)"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE: Fixed Bottom Navigation Bar (Flat style with text labels) */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0B132A] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around z-[60] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none">
        {/* Wait Karo / Status */}
        <Link
          to="/pending"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("status") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaClock className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Status</span>
        </Link>

        {/* Event */}
        <Link
          to="/pending/events"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("events") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaCalendarAlt className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">Event</span>
        </Link>

        {/* School */}
        <Link
          to="/pending/schools"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isLinkActive("schools") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaSchool className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">School</span>
        </Link>

        {/* Exam (Student Applicants Only) */}
        {!isTeacher && (
          <Link
            to="/pending/exams"
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
              isLinkActive("exams") ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <FaBookOpen className="text-lg" />
            <span className="text-[9px] font-bold tracking-tight">Exam</span>
          </Link>
        )}

        {/* More */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 cursor-pointer ${
            mobileMenuOpen ? "text-[#7C3AED] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaThLarge className="text-lg" />
          <span className="text-[9px] font-bold tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE: Bottom Sheet Sliding Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed bottom-20 left-4 right-4 max-h-[75vh] bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-50 overflow-y-auto animate-slideUp text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FaGraduationCap className="text-xl text-[#7C3AED] dark:text-[#38BDF8]" />
                <span className="text-base font-extrabold text-slate-800 dark:text-white">TeachHub Pending Portal</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: Account */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Settings</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/pending/profile" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">My Profile</Link>
                  <Link to="/pending/about" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">About App</Link>
                  <Link to="/pending/notifications" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 col-span-2">Notifications</Link>
                  <Link to="/pending/support" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-3 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 col-span-2">Help & Support</Link>
                </div>
              </div>

              {/* Category: Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toggleTheme();
                  }}
                  className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline"
                >
                  Change Theme
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-550 dark:text-rose-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto pl-0 md:pl-20 lg:pl-64 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6 flex items-start justify-center pt-6 md:pt-12 p-6 sm:p-12 transition-all duration-200 select-none">
        {renderTabContent()}
      </main>

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl w-full max-w-md animate-scaleUp text-slate-700 dark:text-slate-350 relative text-left">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFileAlt className="text-purple-500 text-lg" /> Admission Exam Instructions
            </h3>
            
            <ul className="text-xs font-semibold space-y-3 mt-4 list-disc pl-5 leading-relaxed text-slate-550 dark:text-slate-400">
              <li>Ensure you are in a quiet, well-lit room for the exam.</li>
              <li>A stable internet connection of at least 2 Mbps is required.</li>
              <li>You must grant camera and screen sharing permissions for proctoring.</li>
              <li>Do not refresh or close the tab, and avoid switching tabs or windows. Doing so may submit the test automatically.</li>
              <li>Ensure your face remains fully visible to the camera at all times.</li>
            </ul>

            <div className="mt-6">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApproval;
