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
  FaDesktop,
  FaClock 
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
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        alert("Could not detect location: " + error.message);
        setGettingLocation(false);
      }
    );
  };

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
        setDepartment(u.department || "Mathematics");
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
        department,
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
        
        {/* Upper Dashboard: Photo and Personal Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Profile Photo (1/3 width) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-between min-h-[360px]">
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

          {/* Card 2: Personal Information Form (2/3 width) */}
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

              {/* Address with Use Current Location option */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1 select-none">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Address</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    className="text-[9px] font-black text-purple-650 hover:text-purple-750 dark:text-purple-400 flex items-center gap-1 cursor-pointer bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <FaMapMarkerAlt className="text-[10px]" />
                    {gettingLocation ? "Detecting Location..." : "Use Current Location"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="123, Green Avenue, Indore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Department */}
              <div className="sm:col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
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

        </div>

        {/* Bottom Alert messages and submit save trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          
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