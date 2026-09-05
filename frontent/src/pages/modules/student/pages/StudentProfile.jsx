import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import UserProfile from "../../../../components/UserProfile";
import {
  FaComments,
  FaBullhorn,
  FaCalendarAlt,
  FaSchool,
  FaGraduationCap,
  FaTrophy,
  FaChartLine,
  FaInfoCircle,
  FaPalette,
  FaGlobe,
  FaCog,
  FaSignOutAlt,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaEdit,
  FaCreditCard,
  FaFileAlt,
  FaSun,
  FaMoon,
  FaShieldAlt
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentProfile() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);

  // Modal controls
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [language, setLanguage] = useState("English");

  const fetchProfile = () => {
    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener("profileUpdate", fetchProfile);
    return () => window.removeEventListener("profileUpdate", fetchProfile);
  }, [API, token]);

  const userInitials = useMemo(() => {
    if (!profile?.name) return "S";
    return profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [profile]);

  const handleLogout = () => {
    navigate("/student/logout");
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 max-w-5xl mx-auto pb-12 select-none text-left">
      
      {/* 1. Hero Identity Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-6 sm:p-8 text-white shadow-xl shadow-[#7C3AED]/20">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-xl overflow-hidden">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-3xl overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-xs text-emerald-950 font-black shadow-md">
                ✓
              </span>
            </div>

            {/* Identity Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile?.name || "Student"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-0.5 rounded-full shadow-sm">
                  Student Account
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/85 font-medium">
                {profile?.email || "Learner Console"}
              </p>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-[11px] font-semibold text-white/90">
                {profile?.schoolName && (
                  <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                    <FaSchool className="text-cyan-300 text-xs" />
                    {profile.schoolName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                  <FaGraduationCap className="text-amber-300 text-xs" />
                  {profile?.className ? `Class ${profile.className}` : "Class 1"} {profile?.section ? `- Sec ${profile.section}` : "- Sec A"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <FaEdit className="text-xs text-purple-600" />
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/student/support")}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95"
            >
              <FaComments className="text-xs" />
              Help Chat
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metadata Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <FaIdCard className="text-base" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Student ID</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate max-w-[120px]">
              {profile?.rollNo || profile?._id?.slice(-6).toUpperCase() || "STU-2026"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Status</p>
            <span className="inline-block text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mt-0.5">
              Active Student
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-base" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Academic Term</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">Session 2026</p>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Student Account Details Card */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Account Details</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Personal & Institutional Records</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                <FaEdit className="text-xs" /> Edit Info
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Full Name</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{profile?.name || "—"}</p>
              </div>

              {/* Email Address */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Email Address</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1 truncate">{profile?.email || "—"}</p>
              </div>

              {/* Phone Number */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Phone Number</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{profile?.phoneNumber || "Not Provided"}</p>
              </div>

              {/* School Name */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">School Name</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{profile?.schoolName || "TeachHub School"}</p>
              </div>

              {/* Father Mobile */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Father Mobile</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{profile?.fatherMobileNumber || "Not Provided"}</p>
              </div>

              {/* Mother Mobile */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Mother Mobile</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{profile?.motherMobileNumber || "Not Provided"}</p>
              </div>
            </div>
          </div>

          {/* Quick Academic Navigation Cards */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-3 px-1">Academic Tools</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => navigate("/student/subjects")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 hover:border-purple-500/40 p-4 rounded-2xl flex flex-col items-center text-center gap-2.5 cursor-pointer group transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FaGraduationCap className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">My Subjects</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Enrolled courses</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/student/showtimetable")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 p-4 rounded-2xl flex flex-col items-center text-center gap-2.5 cursor-pointer group transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FaCalendarAlt className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Timetable</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Class schedule</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/student/exams")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 p-4 rounded-2xl flex flex-col items-center text-center gap-2.5 cursor-pointer group transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FaFileAlt className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">My Exams</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Exams & marks</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/student/payments")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex flex-col items-center text-center gap-2.5 cursor-pointer group transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FaCreditCard className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">School Fee</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Pay & receipts</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Preferences & Quick Actions */}
        <div className="space-y-6">
          
          {/* App Preferences Box */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">App Preferences</h3>
              <p className="text-[10px] text-slate-400 font-bold">Theme, language & settings</p>
            </div>

            {/* Toggle Theme */}
            <div
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
                  {theme === "dark" ? <FaMoon /> : <FaSun className="text-amber-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Appearance</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">{theme === "dark" ? "Dark Mode Active" : "Light Mode Active"}</p>
                </div>
              </div>
              <button
                type="button"
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 shrink-0 ${
                  theme === "dark" ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-250 ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Language Selector */}
            <div
              onClick={() => setShowLanguageModal(true)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                  <FaGlobe />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Language</h4>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{language}</p>
                </div>
              </div>
              <FaChevronRight className="text-slate-400 text-xs" />
            </div>

            {/* Manage Settings */}
            <div
              onClick={() => setShowSettingsModal(true)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                  <FaCog />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Settings</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">Alerts & notifications</p>
                </div>
              </div>
              <FaChevronRight className="text-slate-400 text-xs" />
            </div>

            {/* About App */}
            <div
              onClick={() => navigate("/student/about")}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">
                  <FaInfoCircle />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">About App</h4>
                  <p className="text-[9px] text-slate-400 font-semibold">TeachHub v2.0</p>
                </div>
              </div>
              <FaChevronRight className="text-slate-400 text-xs" />
            </div>
          </div>

          {/* Logout Box */}
          <button
            onClick={handleLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-4 rounded-3xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-98"
          >
            <FaSignOutAlt className="text-sm" /> Sign Out of Account
          </button>

        </div>

      </div>

      {/* Footer Credits */}
      <div className="pt-6 text-center select-none">
        <p className="text-[10px] text-slate-400 font-bold">
          TeachHub &copy; 2026 &bull; School Management Platform
        </p>
      </div>

      {/* ============================================= */}
      {/* OVERLAY MODAL 1: Profile Details */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-2 sm:p-4 w-full max-w-2xl shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowProfileModal(false);
                fetchProfile();
              }}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-655 dark:hover:text-white cursor-pointer z-50 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mt-2">
              <UserProfile />
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL 3: Language Selector */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-555 border border-emerald-500/20 flex items-center justify-center">
                <FaGlobe className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black">Select Language</h3>
            </div>
            
            <div className="space-y-2 my-4">
              {["English", "Hindi", "Spanish"].map((lang) => {
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguageModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                      isSelected
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8]"
                        : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <FaCheck className="text-[10px]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL 4: Settings Preferences */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-555 border border-amber-500/20 flex items-center justify-center">
                <FaCog className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black">Manage Settings</h3>
                <p className="text-[9px] text-slate-455 uppercase font-bold tracking-wide">App Preferences</p>
              </div>
            </div>
            
            <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              <div className="flex items-center justify-between p-1">
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">Push Notifications</h5>
                  <p className="text-[10px] text-slate-455 mt-0.5">Receive immediate dashboard alerts</p>
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
                  <p className="text-[10px] text-slate-455 mt-0.5">Summary of attendance & marks via email</p>
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

export default StudentProfile;