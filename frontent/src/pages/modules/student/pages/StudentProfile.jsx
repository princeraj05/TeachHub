import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
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
  FaUser
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

  useEffect(() => {
    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [API, token]);

  const userInitials = useMemo(() => {
    if (!profile?.name) return "I";
    return profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [profile]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Workspace
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-1">
            LEARNER CONSOLE
          </p>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Hello, Learner profile card */}
      <div 
        onClick={() => setShowProfileModal(true)}
        className="bg-gradient-to-r from-violet-900 to-indigo-950 border border-violet-850/40 rounded-3xl p-5 text-white flex items-center justify-between shadow-lg shadow-indigo-955/15 cursor-pointer hover:border-violet-600/40 transition-all select-none"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-[#7C3AED] flex items-center justify-center text-white font-black text-xl border-2 border-white/20">
            {userInitials}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              Hello, {profile?.name || "Learner"}! <span className="animate-bounce">👋</span>
            </h2>
            <p className="text-xs text-slate-300 font-semibold mt-0.5">Stay connected, stay informed.</p>
            <span className="inline-block text-[8px] font-black uppercase tracking-widest bg-violet-600/60 border border-violet-500/30 text-white px-2.5 py-0.5 rounded mt-2.5">
              Student
            </span>
          </div>
        </div>
        <FaChevronRight className="text-slate-300 text-xs" />
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
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                <FaUser className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black">My Profile Details</h3>
                <p className="text-[9px] text-slate-455 uppercase font-bold tracking-wide">Standard Student Credentials</p>
              </div>
            </div>
            
            <div className="space-y-3.5 border-t border-slate-100 dark:border-white/5 pt-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Student Name:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{profile?.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Role Rank:</span>
                <span className="text-[#7C3AED] dark:text-[#38BDF8] font-black uppercase tracking-wider">Student</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Address:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{profile?.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Enrollment Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assigned Campus:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{profile?.schoolName || "Global Campus"}</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer mt-6"
            >
              Done
            </button>
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