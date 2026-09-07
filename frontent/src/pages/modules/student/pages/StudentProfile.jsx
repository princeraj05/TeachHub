import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import UserProfile from "../../../../components/UserProfile";
import {
  FaArrowLeft,
  FaQrcode,
  FaEdit,
  FaTimes,
  FaSun,
  FaMoon,
  FaGlobe,
  FaCog,
  FaCheck
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

  return (
    <div style={{ fontFamily: SORA }} className="space-y-4 max-w-3xl mx-auto pb-16 select-none text-left">
      
      {/* 1. Header Bar with Back Button & QR Badge */}
      <div className="bg-white dark:bg-[#0B132A] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] font-extrabold text-xs cursor-pointer transition"
        >
          <FaArrowLeft className="text-sm" />
          <span>Back</span>
        </button>

        <h1 className="text-base font-black text-slate-800 dark:text-white tracking-wide">Profile</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="px-3 py-1.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border border-[#7C3AED]/20"
            title="Edit Profile"
          >
            <FaEdit className="text-xs" /> Edit Profile
          </button>
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] text-white px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <FaQrcode className="text-xs" /> (QR)
          </div>
        </div>
      </div>

      {/* 2. Hero TeachHub Brand Gradient Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF6B52] via-[#FF8E53] to-[#FFA048] dark:from-[#7C3AED] dark:via-[#6366F1] dark:to-[#38BDF8] p-6 text-white shadow-xl flex flex-col items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Student Avatar Circle */}
        <div className="relative shrink-0 mb-3">
          <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md p-1 border-4 border-white/40 shadow-2xl overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-3xl">
                {userInitials}
              </div>
            )}
          </div>
        </div>

        {/* Name & ID */}
        <h2 className="text-2xl font-black tracking-tight text-white">{profile?.name || "Student Name"}</h2>
        <p className="text-xs font-black text-white/95 mt-1 tracking-wider">
          {profile?.rollNo || profile?._id?.slice(-8).toUpperCase() || "12324633"}
        </p>

        {/* Program / Class */}
        <p className="text-xs font-bold text-white/90 mt-1 max-w-lg leading-relaxed">
          {profile?.className ? `Class ${profile.className}` : "P132: B.Tech. (Computer Science and Engineering)(2023)"} {profile?.section ? `- Sec ${profile.section}` : ""}
        </p>
      </div>

      {/* 3. BASIC INFORMATION SECTION */}
      <div>
        {/* Dark Banner Title */}
        <div className="bg-[#1E293B] dark:bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider mb-2 shadow-sm border border-slate-800 dark:border-white/10">
          Basic
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-sm space-y-3.5 text-xs">
          
          {/* Father's Name */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Father's Name</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.fatherName || "Rahul Kumar"}</p>
          </div>

          {/* Mother's Name */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Mother's Name</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.motherName || "Sunita Devi"}</p>
          </div>

          {/* Permanent Address */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Permanent Address</p>
            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
              {profile?.permanentAddress || profile?.address || "Village:- Chakhusaini , Post:- Mansi, Ward-8,,Begusarai - 851214- Distt:Begusarai -(Bihar) - India"}
            </p>
          </div>

          {/* Correspondence Address */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Correspondence Address</p>
            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
              {profile?.correspondenceAddress || profile?.address || "Village:- Chakhusaini , Post:- Mansi, Ward-8,,Begusarai - 851214- Distt:Begusarai -(Bihar) - India"}
            </p>
          </div>

          {/* Contact No. */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Contact No.</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.phoneNumber || profile?.fatherMobileNumber || "7479845306"}</p>
          </div>

          {/* Email */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Email</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5 truncate">{profile?.email || "princerajmne@gmail.com"}</p>
          </div>

          {/* Date Of Birth */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Date Of Birth</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.dob || "24 Oct 2005"}</p>
          </div>

          {/* Student Gender */}
          <div>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Student Gender</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.gender || "Male"}</p>
          </div>

        </div>
      </div>

      {/* 4. ACADEMIC DETAILS SECTION */}
      <div>
        {/* Dark Banner Title */}
        <div className="bg-[#1E293B] dark:bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider mb-2 shadow-sm border border-slate-800 dark:border-white/10">
          Academic Details
        </div>

        <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-sm space-y-3.5 text-xs">
          
          {/* Program */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Program / Class</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">
              {profile?.className ? `Class ${profile.className}` : "P132:B.Tech. (Computer Science and Engineering)(2023)"} {profile?.section ? `- Section ${profile.section}` : ""}
            </p>
          </div>

          {/* School Name */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-3">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">School Name</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.schoolName || "TeachHub School"}</p>
          </div>

          {/* Student Roll No */}
          <div>
            <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Student Roll No / ID</p>
            <p className="font-black text-slate-800 dark:text-white mt-0.5">{profile?.rollNo || profile?._id?.slice(-8).toUpperCase() || "12324633"}</p>
          </div>

        </div>
      </div>

      {/* 5. APP PREFERENCES BAR */}
      <div className="bg-white dark:bg-[#0B132A] rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200/60 dark:border-white/10 cursor-pointer"
          >
            {theme === "dark" ? <FaSun className="text-amber-500" /> : <FaMoon className="text-indigo-500" />}
            <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200/60 dark:border-white/10 cursor-pointer"
          >
            <FaGlobe className="text-emerald-500" />
            <span>{language}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 border border-slate-200/60 dark:border-white/10 cursor-pointer"
        >
          <FaCog className="text-amber-500" />
          <span>Settings</span>
        </button>
      </div>

      {/* ============================================= */}
      {/* OVERLAY MODAL 1: Edit Profile */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-2 sm:p-4 w-full max-w-2xl shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              type="button"
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

      {/* OVERLAY MODAL 2: Language Selector */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              type="button"
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
                    type="button"
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

      {/* OVERLAY MODAL 3: Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              type="button"
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
                  type="button"
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
                  type="button"
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
              type="button"
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