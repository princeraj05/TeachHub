import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUser, 
  FaCamera, 
  FaUpload, 
  FaTrash, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaShieldAlt, 
  FaDownload, 
  FaCheck, 
  FaUserShield, 
  FaLock, 
  FaBell, 
  FaChevronRight, 
  FaDesktop 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function TeacherProfile() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Form values state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    // Load standard authentication profile which fetches login sessions
    axios.get(`${API}/api/auth/profile`, { headers })
      .then(res => {
        const u = res.data;
        setProfile(u);
        
        // Initialize form states
        setName(u.name || "");
        setEmail(u.email || "");
        setDob(u.dob || "");
        setGender(u.gender || "Male");
        setPhoneNumber(u.phoneNumber || "");
        setAlternatePhone(u.alternatePhone || "");
        setAddress(u.address || "");
        setPincode(u.pincode || "");
        setDepartment(u.department || "Mathematics");
        setDesignation(u.designation || "Course Instructor");
        setBio(u.bio || "Passionate educator with 6+ years of experience in teaching Mathematics. Dedicated to helping students achieve their academic goals.");
        setAvatar(u.avatar || "");
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, [API, token]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveMessage("");
    setSaveError("");

    try {
      const res = await axios.put(`${API}/api/teacher/profile/update`, {
        name,
        email,
        dob,
        gender,
        phoneNumber,
        alternatePhone,
        address,
        pincode,
        department,
        designation,
        bio,
        avatar
      }, { headers });

      setSaveMessage("Profile changes saved successfully!");
      // Update local profile object
      setProfile(prev => ({ ...prev, ...res.data.teacher }));
    } catch (err) {
      setSaveError(err.response?.data?.error || "Could not save profile changes.");
    }
  };

  // Avatar upload simulation
  const handleAvatarUpload = () => {
    const newAvatarUrl = prompt("Enter profile photo URL:", avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200");
    if (newAvatarUrl !== null) {
      setAvatar(newAvatarUrl);
    }
  };

  const handleAvatarRemove = () => {
    setAvatar("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-400" style={{ fontFamily: SORA }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading profile settings...</p>
      </div>
    );
  }

  // Formatting helpers
  const teacherIdText = profile ? `TCH${String(profile._id).slice(-6).toUpperCase()}` : "THB12584";
  const joinedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "12 Jan 2024";

  // Last Login details
  const lastLoginText = profile?.loginActivity?.lastLogin 
    ? `${new Date(profile.loginActivity.lastLogin.time).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}, ${new Date(profile.loginActivity.lastLogin.time).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" })}`
    : "27 May 2026, 10:30 AM";

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Header breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 select-none">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Edit Profile</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Manage your personal information and account settings
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="hover:underline cursor-pointer">Profile</span>
            <span>&gt;</span>
            <span className="text-purple-500">Edit Profile</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="flex flex-col gap-6">
        
        {/* Upper Dashboard: Photo, Personal Info, Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Profile Photo (1/4 width) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-between min-h-[360px]">
            <div className="w-full select-none text-center">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider pb-3 border-b border-slate-100 dark:border-white/[0.03] text-left">
                Profile Photo
              </h3>
            </div>

            <div className="relative group my-4 select-none">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="avatar" 
                  className="w-32 h-32 rounded-full border-2 border-slate-200 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.08] flex items-center justify-center text-slate-400 text-3xl font-black shadow-inner">
                  {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
              )}
              <button 
                type="button"
                onClick={handleAvatarUpload}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-purple-650 hover:bg-purple-750 text-white border border-white dark:border-[#111827] flex items-center justify-center shadow transition-all cursor-pointer"
              >
                <FaCamera className="text-xs" />
              </button>
            </div>

            <div className="w-full flex flex-col gap-3">
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide select-none">
                JPG, PNG or WEBP. Max size 2MB.
              </p>
              
              <button
                type="button"
                onClick={handleAvatarUpload}
                className="w-full py-2.5 rounded-xl bg-purple-650 hover:bg-purple-750 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <FaUpload className="text-[10px]" /> Upload New Photo
              </button>

              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={!avatar}
                className={`w-full py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  avatar
                    ? "border-rose-500/20 text-rose-500 bg-transparent hover:bg-rose-500/5 cursor-pointer"
                    : "border-slate-200/30 text-slate-400 bg-slate-50/20 dark:bg-white/[0.01] cursor-not-allowed"
                }`}
              >
                <FaTrash className="text-[10px]" /> Remove Photo
              </button>
            </div>
          </div>

          {/* Card 2 & 3: Personal Information Form (2/4 width) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Date of Birth <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="15 May 1992"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Gender <span className="text-rose-500">*</span></label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Phone Number <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-black select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Alternate Phone</label>
                <input
                  type="text"
                  placeholder="+91 91234 56789"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="123, Green Avenue, Indore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="452001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Course Instructor">Course Instructor</option>
                  <option value="Head of Department">Head of Department</option>
                  <option value="Senior Lecturer">Senior Lecturer</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                </select>
              </div>

              {/* Bio description */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1 select-none">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Bio</label>
                  <span className="text-[8px] font-bold text-slate-400">{bio.length}/250</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 250))}
                  rows="2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

            </div>
          </div>

          {/* Card 4: Account Summary & Quick Links (1/4 width) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between select-none">
            
            {/* Top account descriptors */}
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03]">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Account Summary</h3>
              </div>

              <div className="flex flex-col gap-3">
                {/* User ID */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
                    <FaUser className="text-xs" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">User ID</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{teacherIdText}</span>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
                    <FaBriefcase className="text-xs" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Role</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{designation}</span>
                  </div>
                </div>

                {/* Joined On */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-550 border border-amber-500/15 flex items-center justify-center shrink-0">
                    <FaCalendarAlt className="text-xs" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Joined On</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{joinedDate}</span>
                  </div>
                </div>

                {/* Last Login */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/15 flex items-center justify-center shrink-0">
                    <FaClock className="text-xs" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Last Login</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{lastLoginText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links (Change Password Removed) */}
            <div className="flex flex-col gap-3 mt-6">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quick Links</p>
              
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] cursor-pointer transition-all">
                <span className="text-[10px] font-bold flex items-center gap-2"><FaBell className="text-slate-400" /> Notification Settings</span>
                <FaChevronRight className="text-[8px] text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] cursor-pointer transition-all">
                <span className="text-[10px] font-bold flex items-center gap-2"><FaUserShield className="text-slate-400" /> Privacy Settings</span>
                <FaChevronRight className="text-[8px] text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] cursor-pointer transition-all">
                <span className="text-[10px] font-bold flex items-center gap-2"><FaDesktop className="text-slate-400" /> Connected Devices</span>
                <FaChevronRight className="text-[8px] text-slate-400" />
              </div>
            </div>

          </div>

        </div>

        {/* Lower Dashboard: Security Settings (Change Password Removed) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm select-none">
          <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Security Settings</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-100 dark:border-white/[0.03]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
                <FaShieldAlt className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">Two-Factor Authentication (2FA)</span>
                  <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Enabled</span>
                </div>
                <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 mt-2">
                  Add an extra layer of security to your account.
                </p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-400 mt-0.5">
                  Authentication App: <span className="text-purple-500">Google Authenticator</span>
                </p>
              </div>
            </div>

            <button 
              type="button"
              className="px-4 py-2 text-center text-xs font-extrabold text-purple-650 hover:text-purple-750 hover:bg-purple-500/5 border border-purple-500/20 rounded-xl cursor-pointer transition-all whitespace-nowrap"
            >
              Manage 2FA
            </button>
          </div>
        </div>

        {/* Lower Dashboard: Account Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          
          {/* Download Data */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Account Actions</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-100 dark:border-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
                  <FaDownload className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">Download My Data</p>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 font-semibold">
                    Request a copy of your personal data archive.
                  </p>
                </div>
              </div>

              <button 
                type="button"
                className="px-4 py-2 border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/35 hover:bg-purple-500/5 text-purple-500 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Request Data
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Delete Account</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-500/[0.02] rounded-2xl border border-rose-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/15 flex items-center justify-center shrink-0">
                  <FaTrash className="text-xs" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">Delete Account</p>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 font-semibold">
                    Permanently delete your TeachHub faculty profile.
                  </p>
                </div>
              </div>

              <button 
                type="button"
                className="px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Alert messages and submit save trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          
          {/* Feedback alerts */}
          <div className="flex-1 w-full">
            {saveMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold select-none leading-relaxed w-fit animate-none">
                <FaCheck className="text-xs shrink-0" /> {saveMessage}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold select-none leading-relaxed w-fit animate-none">
                <FaExclamationCircle className="text-xs shrink-0" /> {saveError}
              </div>
            )}
          </div>

          {/* Submit Save Button */}
          <button 
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-750 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap select-none"
          >
            <FaCheck className="text-[10px]" /> Save Changes
          </button>
        </div>

      </form>

    </div>
  );
}

export default TeacherProfile;