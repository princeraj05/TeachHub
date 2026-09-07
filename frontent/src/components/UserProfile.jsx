import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaSchool,
  FaGraduationCap,
  FaHistory,
  FaBriefcase,
  FaChalkboardTeacher,
  FaMoon,
  FaSun,
  FaGlobe,
  FaCog,
  FaInfoCircle,
  FaSignOutAlt,
  FaCheck,
  FaComments,
  FaIdCard,
  FaShieldAlt
} from "react-icons/fa";
import { compressAvatar } from "../utils/mediaCompression";

const SORA = "'Sora', sans-serif";

const AVAILABLE_SUBJECTS = [
  "Mathematics",
  "English",
  "Hindi",
  "Science",
  "Social Studies",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science"
];

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

function UserProfile() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const getCachedUser = () => {
    try {
      const cached = localStorage.getItem("teachhub_cache_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && parsed.name) return parsed;
      }
    } catch (e) {}
    return {
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      role: localStorage.getItem("role") || "unassigned",
      requestedRole: localStorage.getItem("requestedRole") || "student",
      requestedSchool: localStorage.getItem("requestedSchool") || "",
      phoneNumber: localStorage.getItem("phoneNumber") || "",
      avatar: localStorage.getItem("avatar") || ""
    };
  };

  const [user, setUser] = useState(getCachedUser);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [language, setLanguage] = useState("English");

  // Applicant Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    avatar: "",
    requestedRole: "student",
    requestedSchool: "",
    targetClass: "Class 1",
    previousClass: "",
    previousSchool: "",
    previousGrade: "",
    fatherName: "",
    fatherMobileNumber: "",
    qualification: "",
    experience: "1 Year",
    previousInstitute: "",
    subjectsOfExpertise: ["Mathematics", "English"]
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setUser(res.data);
        const userAvatar = res.data.avatar || res.data.photo || res.data.profilePhoto || "";
        const roleType = res.data.requestedRole || (res.data.role === "teacher" ? "teacher" : "student");

        setFormData({
          name: res.data.name || "",
          phoneNumber: res.data.phoneNumber || "",
          avatar: userAvatar,
          requestedRole: roleType,
          requestedSchool: res.data.requestedSchool || res.data.schoolName || "",
          targetClass: res.data.targetClass || "Class 1",
          previousClass: res.data.previousClass || "",
          previousSchool: res.data.previousSchool || "",
          previousGrade: res.data.previousGrade || "",
          fatherName: res.data.fatherName || "",
          fatherMobileNumber: res.data.fatherMobileNumber || "",
          qualification: res.data.qualification || "",
          experience: res.data.experience || "1 Year",
          previousInstitute: res.data.previousInstitute || "",
          subjectsOfExpertise: Array.isArray(res.data.subjectsOfExpertise) && res.data.subjectsOfExpertise.length > 0
            ? res.data.subjectsOfExpertise
            : ["Mathematics", "English"]
        });

        try {
          localStorage.setItem("teachhub_cache_user_profile", JSON.stringify(res.data));
          if (res.data.name) localStorage.setItem("name", res.data.name);
          if (res.data.email) localStorage.setItem("email", res.data.email);
          if (res.data.phoneNumber) localStorage.setItem("phoneNumber", res.data.phoneNumber);
          if (userAvatar) localStorage.setItem("avatar", userAvatar);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  // Distinct Role & Path Checks
  const isPendingPath = location.pathname.startsWith("/pending");
  const isStudentPath = location.pathname.startsWith("/student");

  // Admitted Student vs Pending Applicant distinction
  const isAdmittedStudent = !isPendingPath && (user?.role === "student" || isStudentPath);
  const isAdmittedTeacher = !isPendingPath && user?.role === "teacher" && !isStudentPath;
  const isPendingApplicant = isPendingPath || (!isAdmittedStudent && !isAdmittedTeacher && user?.role !== "admin" && user?.role !== "superadmin");
  const isTeacherApplicant = isAdmittedTeacher || (isPendingApplicant && (formData.requestedRole === "teacher" || user?.requestedRole === "teacher"));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedBase64 = await compressAvatar(file);
        setFormData((prev) => ({ ...prev, avatar: compressedBase64 }));
      } catch (err) {
        console.error("Error compressing avatar:", err);
      }
    }
  };

  const toggleSubjectOfExpertise = (sub) => {
    setFormData((prev) => {
      const current = prev.subjectsOfExpertise || [];
      if (current.includes(sub)) {
        return { ...prev, subjectsOfExpertise: current.filter(s => s !== sub) };
      } else {
        return { ...prev, subjectsOfExpertise: [...current, sub] };
      }
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setShowEditModal(false);

      const updatedAvatar = updatedUser.avatar || formData.avatar || "";
      const updatedName = updatedUser.name || formData.name || "";

      try { localStorage.setItem("name", updatedName); } catch(e) {}
      try { localStorage.setItem("avatar", updatedAvatar); } catch(e) {}
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  if (loading && !user.name) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading profile records...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 max-w-5xl mx-auto pb-12 select-none text-left">
      
      {/* 1. Hero Identity Banner */}
      <div className="relative overflow-hidden rounded-2.5xl sm:rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-5 sm:p-7 text-white shadow-xl shadow-[#7C3AED]/20">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            
            {/* DP Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-xl overflow-hidden">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-3xl overflow-hidden">
                  {user?.avatar || formData.avatar ? (
                    <img src={user.avatar || formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-xs text-emerald-950 font-black shadow-md" title="Online Active">
                <FaCheck className="text-[10px]" />
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || "Applicant User"}</h1>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/25">
                  {isAdmittedStudent
                    ? "STUDENT"
                    : isAdmittedTeacher
                      ? "FACULTY / TEACHER"
                      : isTeacherApplicant
                        ? "TEACHER APPLICANT"
                        : "STUDENT APPLICANT"}
                </span>
              </div>

              <p className="text-xs text-white/80 font-medium mt-1">{user?.email}</p>

              {/* School and Details Pill */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs font-bold">
                <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-xl flex items-center gap-1.5 border border-white/20">
                  <FaSchool className="text-amber-300 text-xs" />
                  <span>{user?.requestedSchool || user?.schoolName || "School Not Selected"}</span>
                </span>
                
                {isTeacherApplicant ? (
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-xl flex items-center gap-1.5 border border-white/20">
                    <FaBriefcase className="text-cyan-300 text-xs" />
                    <span>{formData.experience || "1 Year"} Exp</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-xl flex items-center gap-1.5 border border-white/20">
                    <FaGraduationCap className="text-cyan-300 text-xs" />
                    <span>{isAdmittedStudent ? `Class: ${formData.targetClass || "Class 1"}` : `Target: ${formData.targetClass || "Class 1"}`}</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Quick Action Buttons */}
          <div className="flex sm:flex-col items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 sm:flex-initial w-full bg-white text-[#7C3AED] hover:bg-slate-50 font-black text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <FaEdit className="text-xs" /> Edit Profile
            </button>
            <button
              onClick={() => navigate(isPendingApplicant ? "/pending/support" : "/student/support")}
              className="flex-1 sm:flex-initial w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <FaComments className="text-xs" /> Help Chat
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-2.5xl p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <FaIdCard className="text-lg" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {isAdmittedStudent ? "STUDENT ID" : isAdmittedTeacher ? "TEACHER ID" : "APPLICANT ID"}
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-white tracking-wider mt-0.5">
              #{user?._id ? user._id.slice(-6).toUpperCase() : "7045A0"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-2.5xl p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FaShieldAlt className="text-lg" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {isAdmittedStudent ? "STUDENT STATUS" : isAdmittedTeacher ? "FACULTY STATUS" : "APPLICATION STATUS"}
            </p>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isPendingApplicant
                ? (user?.requestStatus ? user.requestStatus.replace("_", " ").toUpperCase() : "PENDING REVIEW")
                : "ACTIVE"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-2.5xl p-4.5 flex items-center gap-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FaGraduationCap className="text-lg" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ACADEMIC SESSION</p>
            <p className="text-sm font-black text-slate-800 dark:text-white tracking-wider mt-0.5">
              Session 2026
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Details & Preferences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Account Details & Academic Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-white/5 pb-4 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Account Details</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {isPendingApplicant ? "Personal & Application Records" : "Personal & Institutional Records"}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FaEdit className="text-xs text-[#7C3AED]" /> Edit Info
              </button>
            </div>

            {/* Field Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Common Fields */}
              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">FULL NAME</p>
                <p className="text-xs font-black text-slate-800 dark:text-white mt-1 truncate">{user?.name || "Not Provided"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">EMAIL ADDRESS</p>
                <p className="text-xs font-black text-slate-800 dark:text-white mt-1 truncate">{user?.email || "Not Provided"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PHONE NUMBER</p>
                <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{user?.phoneNumber || formData.phoneNumber || "Not Provided"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isPendingApplicant ? "TARGET SCHOOL" : "SCHOOL NAME"}</p>
                <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{user?.requestedSchool || user?.schoolName || "Not Selected"}</p>
              </div>

              {/* Student Specific Applicant Fields */}
              {!isTeacherApplicant ? (
                <>
                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{isPendingApplicant ? "TARGET ADMISSION CLASS" : "CLASS"}</p>
                    <p className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] mt-1">{formData.targetClass || "Class 1"}</p>
                  </div>

                  {isPendingApplicant && (
                    <>
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PREVIOUS CLASS PASSED</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.previousClass || "Not Specified"}</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4 sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PREVIOUS SCHOOL HISTORY</p>
                        <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.previousSchool || "Not Provided"}</p>
                      </div>
                    </>
                  )}

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">FATHER / GUARDIAN NAME</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.fatherName || "Not Provided"}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">FATHER MOBILE NUMBER</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.fatherMobileNumber || "Not Provided"}</p>
                  </div>
                </>
              ) : (
                /* Teacher Specific Fields */
                <>
                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">QUALIFICATION</p>
                    <p className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] mt-1">{formData.qualification || "Not Provided"}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">TEACHING EXPERIENCE</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.experience || "1 Year"}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4 sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">PREVIOUS INSTITUTE / SCHOOL WORKED AT</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{formData.previousInstitute || "Not Provided"}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-4 sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">SUBJECTS OF EXPERTISE</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.subjectsOfExpertise && formData.subjectsOfExpertise.length > 0 ? (
                        formData.subjectsOfExpertise.map(sub => (
                          <span key={sub} className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 rounded-lg text-[10px] font-bold">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs font-semibold text-slate-400">None selected</p>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Preferences Box */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-150 dark:border-white/5 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">App Preferences</h3>
              <p className="text-[10px] text-slate-400 font-bold">Theme, language & settings</p>
            </div>

            {/* Appearance Toggle */}
            <div
              onClick={toggleTheme}
              className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  {theme === "dark" ? <FaMoon /> : <FaSun className="text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Appearance</p>
                  <p className="text-[10px] text-slate-400 font-bold">{theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}</p>
                </div>
              </div>
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-250 ${theme === "dark" ? "bg-[#7C3AED]" : "bg-slate-300"}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-250 ${theme === "dark" ? "translate-x-3.5" : "translate-x-0"}`} />
              </div>
            </div>

            {/* Language Selector */}
            <div
              onClick={() => setShowLanguageModal(true)}
              className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FaGlobe />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Language</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{language}</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div
              onClick={() => setShowSettingsModal(true)}
              className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FaCog />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">Settings</p>
                  <p className="text-[10px] text-slate-400 font-bold">Alerts & notifications</p>
                </div>
              </div>
            </div>

            {/* About App */}
            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FaInfoCircle />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">About App</p>
                  <p className="text-[10px] text-slate-400 font-bold">TeachHub v2.0</p>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <FaSignOutAlt className="text-xs" /> Sign Out of Account
            </button>
          </div>
        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn select-none">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-slate-800 dark:text-white my-auto">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAdmittedStudent ? "Edit Student Profile" : isAdmittedTeacher ? "Edit Faculty Profile" : "Edit Applicant Profile"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">
                  {isPendingApplicant ? "Update your details for school admission/recruitment" : "Update your personal details & contact records"}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Applicant Role Toggle - ONLY for new unassigned applicants */}
              {isPendingApplicant && (!user?.role || user?.role === "unassigned") && (!user?.requestedRole || user?.requestedRole === "unassigned") && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Applying As</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, requestedRole: "student" }))}
                      className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                        formData.requestedRole === "student"
                          ? "bg-[#7C3AED] text-white shadow-md"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <FaGraduationCap className="text-sm" /> Student Applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, requestedRole: "teacher" }))}
                      className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                        formData.requestedRole === "teacher"
                          ? "bg-[#7C3AED] text-white shadow-md"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      <FaChalkboardTeacher className="text-sm" /> Teacher Applicant
                    </button>
                  </div>
                </div>
              )}

              {/* Photo DP Upload */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-cyan-400 p-0.5 shadow-md overflow-hidden">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl">
                        {userInitials}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center cursor-pointer border-2 border-white dark:border-[#0B132A] shadow-md">
                    <FaCamera className="text-[10px]" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5">Click camera to upload profile photo</p>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Student Fields */}
              {!isTeacherApplicant ? (
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                        {isPendingApplicant ? "Target Admission Class" : "Enrolled Class (Assigned)"}
                      </label>
                      {isAdmittedStudent ? (
                        <div>
                          <input
                            type="text"
                            value={formData.targetClass || "Class 1"}
                            readOnly
                            disabled
                            className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-[9px] font-bold text-amber-500 dark:text-amber-400 mt-1">Class assigned by School Admin (Read-only)</p>
                        </div>
                      ) : (
                        <select
                          name="targetClass"
                          value={formData.targetClass}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                        >
                          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </div>

                    {isPendingApplicant && (
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Previous Class Passed</label>
                        <input
                          type="text"
                          name="previousClass"
                          value={formData.previousClass}
                          onChange={handleChange}
                          placeholder="e.g. Class 3"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    )}
                  </div>

                  {isPendingApplicant && (
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Previous School Name / History</label>
                      <input
                        type="text"
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleChange}
                        placeholder="e.g. Bright Public School, Noida"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Father / Guardian Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        placeholder="Father's full name"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Father Mobile Number</label>
                      <input
                        type="tel"
                        name="fatherMobileNumber"
                        value={formData.fatherMobileNumber}
                        onChange={handleChange}
                        placeholder="Father's contact number"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Teacher Fields */
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Educational Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. M.Sc Mathematics, B.Ed"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Teaching Experience</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                      >
                        <option value="Fresher / 0 Year">Fresher / 0 Year</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Previous Institute / School Worked At</label>
                    <input
                      type="text"
                      name="previousInstitute"
                      value={formData.previousInstitute}
                      onChange={handleChange}
                      placeholder="e.g. St. Xavier School"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Subjects of Expertise (Multiple Select)</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const selected = (formData.subjectsOfExpertise || []).includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubjectOfExpertise(sub)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              selected
                                ? "bg-[#7C3AED] text-white shadow-sm"
                                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {selected && "✓ "}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-extrabold text-xs py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-[#7C3AED]/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <FaSave className="text-xs" />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LANGUAGE MODAL */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-slate-800 dark:text-white">
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FaGlobe className="text-sm" />
              </div>
              <h3 className="text-sm font-black">Select Language</h3>
            </div>
            <div className="space-y-2 my-4">
              {["English", "Hindi", "Spanish"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                    language === lang
                      ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8]"
                      : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>{lang}</span>
                  {language === lang && <FaCheck className="text-[10px]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-slate-800 dark:text-white">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FaCog className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-black">Manage Settings</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">App Preferences</p>
              </div>
            </div>
            <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between p-1">
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">Push Notifications</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Receive immediate dashboard alerts</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer ${
                    notificationsEnabled ? "bg-emerald-500" : "bg-slate-350 dark:bg-white/10"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-250 ${
                    notificationsEnabled ? "translate-x-4.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-1">
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">Weekly digest reports</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Summary of attendance & marks via email</p>
                </div>
                <button
                  onClick={() => setDigestEnabled(!digestEnabled)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer ${
                    digestEnabled ? "bg-emerald-500" : "bg-slate-350 dark:bg-white/10"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-250 ${
                    digestEnabled ? "translate-x-4.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer mt-6"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserProfile;
