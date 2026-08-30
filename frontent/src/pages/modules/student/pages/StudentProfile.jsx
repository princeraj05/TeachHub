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
  FaEnvelope
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
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
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
    if (!profile?.name) return "I";
    return profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [profile]);

  const handleLogout = () => {
    navigate("/student/logout");
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 max-w-6xl mx-auto pb-6">
      {/* Premium Hero Profile Card */}
      <div 
        onClick={() => setShowProfileModal(true)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-6 text-white shadow-xl shadow-[#7C3AED]/20 cursor-pointer transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl hover:shadow-[#7C3AED]/30 select-none group"
      >
        {/* Ambient Decorative Blurs & Shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-inner overflow-hidden">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-emerald-950 font-black shadow-sm">
                ✓
              </span>
            </div>

            {/* Profile Brief Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Hello, {profile?.name || "Learner"}! <span className="animate-bounce">👋</span>
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                  Student Account
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium max-w-md">
                {profile?.email || "Stay connected, track your progress, and excel."}
              </p>
              
              {/* Quick Metadata Chips */}
              <div className="flex items-center gap-3 pt-2 text-[11px] font-semibold text-white/90">
                {profile?.schoolName && (
                  <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <FaSchool className="text-cyan-300 text-xs" />
                    {profile.schoolName}
                  </span>
                )}
                {profile?.className && (
                  <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <FaGraduationCap className="text-amber-300 text-xs" />
                    Class {profile.className}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Link Arrow */}
          <div className="self-end sm:self-center shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all">
            <span>View Full Profile</span>
            <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Section 1: CONNECT */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-3 px-1">Connect</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 select-none">
          
          {/* Card 1: Support Chat */}
          <div 
            onClick={() => navigate("/student/support")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/30 rounded-2.5xl p-4 flex items-center justify-between cursor-pointer group transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaComments className="text-base" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Support Chat</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold mt-0.5">Get help & support</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Card 2: Announcements */}
          <div 
            onClick={() => navigate("/student/dashboard")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-blue-500/30 rounded-2.5xl p-4 flex items-center justify-between cursor-pointer group transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FaBullhorn className="text-base" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Announcements</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold mt-0.5">Latest updates</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Card 3: Events */}
          <div 
            onClick={() => navigate("/student/events")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-emerald-500/30 rounded-2.5xl p-4 flex items-center justify-between cursor-pointer group transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-555 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FaCalendarAlt className="text-base" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Events</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold mt-0.5">School events</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>

      {/* Section 2: ACADEMICS & SCHOOL */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-3 px-1">Academics & School</p>
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.04] shadow-sm select-none">
          
          {/* Row 1: School Directory */}
          <div 
            onClick={() => navigate("/student/schools")}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaSchool className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">School Directory</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Explore schools & centers</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Row 2: My Profile */}
          <div 
            onClick={() => setShowProfileModal(true)}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FaGraduationCap className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">My Profile</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">View & manage your profile</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Row 3: Achievements */}
          <div 
            onClick={() => setShowAchievementsModal(true)}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-555 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FaTrophy className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Achievements</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Your academic achievements</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Row 4: Progress Report */}
          <div 
            onClick={() => navigate("/student/subjects")}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-555 border border-amber-500/20 flex items-center justify-center shrink-0">
                <FaChartLine className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Progress Report</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">View your academic progress</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>

      {/* Section 3: APP & PREFERENCES */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-3 px-1">App & Preferences</p>
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.04] shadow-sm select-none">
          
          {/* Row 1: About App */}
          <div 
            onClick={() => navigate("/student/about")}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaInfoCircle className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">About App</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Learn more about TeachHub</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Row 1.5: Contact Us */}
          <div 
            onClick={() => navigate("/student/contact")}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaEnvelope className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Contact Us</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Get in touch with support desk</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

          {/* Row 2: Change Theme */}
          <div 
            onClick={toggleTheme}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FaPalette className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Change Theme</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Customize your app experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{theme === "dark" ? "🌙" : "☀️"}</span>
                {/* Custom toggle slider container */}
                <button
                  onClick={toggleTheme}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 shrink-0 cursor-pointer ${
                    theme === "dark" ? "bg-indigo-650" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-250 ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Language */}
          <div 
            onClick={() => setShowLanguageModal(true)}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-555 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FaGlobe className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Language</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Select app language</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{language}</span>
              <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Row 4: Settings */}
          <div 
            onClick={() => setShowSettingsModal(true)}
            className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-555 border border-amber-500/20 flex items-center justify-center shrink-0">
                <FaCog className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Settings</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Manage app preferences</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 group-hover:text-slate-655 dark:group-hover:text-white transition-colors" />
          </div>

        </div>
      </div>

      {/* Section 4: SECURITY & ACCOUNT */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] mb-3 px-1">Security & Account</p>
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm select-none">
          
          {/* Row 1: Logout */}
          <div 
            onClick={handleLogout}
            className="p-4.5 flex items-center justify-between hover:bg-rose-500/5 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-555 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaSignOutAlt className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-600 dark:text-rose-455 leading-tight">Logout</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Sign out from your account</p>
              </div>
            </div>
            <FaChevronRight className="text-rose-500 text-xs shrink-0" />
          </div>

        </div>
      </div>

      {/* Bottom Footer Credits */}
      <div className="py-4 text-center select-none">
        <p className="text-[10px] text-slate-455 dark:text-slate-550 font-bold">
          TeachHub &copy; 2026 &bull; All rights reserved
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

      {/* OVERLAY MODAL 2: Achievements List */}
      {showAchievementsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setShowAchievementsModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-555 border border-emerald-500/20 flex items-center justify-center">
                <FaTrophy className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black">My Achievements</h3>
                <p className="text-[9px] text-slate-455 uppercase font-bold tracking-wide">Awards & Honors</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {/* Achievement 1 */}
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-3 rounded-2xl">
                <span className="text-lg">🥇</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Perfect Attendance (May 2026)</h4>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Achieved a 100% attendance score in classes.</p>
                </div>
              </div>

              {/* Achievement 2 */}
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-3 rounded-2xl">
                <span className="text-lg">🎓</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Vanguard Academics</h4>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Ranked top 5% on subjects performance metrics.</p>
                </div>
              </div>

              {/* Achievement 3 */}
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-3 rounded-2xl">
                <span className="text-lg">🚀</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Pioneer Learner</h4>
                  <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Completed online proctored examinations successfully.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAchievementsModal(false)}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer mt-6"
            >
              Done
            </button>
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
              
              {/* Push notifications */}
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

              {/* Weekly Digest */}
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