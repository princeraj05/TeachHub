import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegClock,
  FaUserShield,
  FaCamera,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaLock,
  FaGlobe,
  FaLaptop,
  FaMobileAlt,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

const COMMON_TIMEZONES = [
  "(GMT+05:30) Asia/Kolkata",
  "(GMT+00:00) UTC",
  "(GMT-05:00) America/New_York",
  "(GMT-08:00) America/Los_Angeles",
  "(GMT+00:00) Europe/London",
  "(GMT+08:00) Asia/Singapore",
  "(GMT+09:00) Asia/Tokyo",
  "(GMT+04:00) Asia/Dubai",
  "(GMT+02:00) Europe/Paris"
];

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${month} ${day}, ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

function SuperAdminProfile() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form input fields state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("");
  const [language, setLanguage] = useState("");
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState("");

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Session state
  const [sessions, setSessions] = useState([]);

  // Notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setProfile(res.data);
        setName(res.data.name || "Super Admin");
        setPhoneNumber(res.data.phoneNumber || "+91 98765 43210");
        setAlternateEmail(res.data.alternateEmail || "admin@teachhub.app");
        setDob(res.data.dob || "01 Jan 1995");
        setGender(res.data.gender || "Male");
        setAddress(res.data.address || "B-32, Sector-63, Noida, Uttar Pradesh - 201301, India");
        setTimezone(res.data.timezone || "(GMT+05:30) Asia/Kolkata");
        setLanguage(res.data.language || "English");
        setAbout(res.data.about || "System administrator with full access to all modules and settings.");
        setAvatar(res.data.avatar || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      const msg = err.response?.data?.message || err.message || "Failed to retrieve user profile settings.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use FileReader for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary using standard support uploader
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const uploadRes = await axios.post(`${API}/api/support/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setAvatar(uploadRes.data.url);
      setSuccessMsg("Photo updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to save avatar image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        name,
        phoneNumber,
        alternateEmail,
        dob,
        gender,
        address,
        timezone,
        language,
        about,
        avatar
      };

      const res = await axios.put(`${API}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data.user);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("avatar", res.data.user.avatar || "");
      window.dispatchEvent(new Event("profileUpdate"));
      setEditMode(false);
      setSuccessMsg("Personal profile settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await axios.put(
        `${API}/api/auth/profile`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      alert("Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await axios.post(`${API}/api/auth/sessions/${sessionId}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Logged out from the selected device session.");
      fetchSessions();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error logging out session:", err);
      setErrorMsg("Failed to logout session.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleLogoutAllOther = async () => {
    try {
      await axios.post(`${API}/api/auth/sessions/logout-others`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Logged out from all other sessions.");
      fetchSessions();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error logging out other sessions:", err);
      setErrorMsg("Failed to logout all other sessions.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">Loading profile settings...</p>
      </div>
    );
  }

  const profileInitials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "SA";
  const avatarSource = avatar || "https://res.cloudinary.com/dvm1s1hsp/image/upload/v1724653556/teachhub_logo_placeholder.png";

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-805 dark:text-white text-left max-w-5xl mx-auto pb-12 select-none animate-fadeIn">
      
      {/* 1. Page Breadcrumbs & Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">My Profile</h2>
          <p className="text-[10px] text-slate-455 dark:text-slate-400 font-extrabold uppercase mt-1">
            Profile &gt; My Profile
          </p>
        </div>

        <button
          onClick={() => setEditMode(p => !p)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15 uppercase tracking-wider self-start sm:self-auto"
        >
          <FaEdit /> {editMode ? "Cancel Editing" : "Edit Profile"}
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm">
          <FaCheckCircle className="text-emerald-500 text-base shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 text-rose-700 dark:text-rose-450 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm">
          <FaTimesCircle className="text-rose-500 text-base shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* 2. User Profile Summary Header Card */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left avatar metadata block */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200/50 flex items-center justify-center p-0.5">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-[#7C3AED] text-white text-3xl font-black rounded-full flex items-center justify-center">
                  {profileInitials}
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 text-slate-500 hover:text-[#7C3AED] flex items-center justify-center shadow-md cursor-pointer transition"
              title="Change Profile Photo"
            >
              <FaCamera className="text-xs" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-550/10 text-[#7C3AED] dark:text-[#A78BFA] text-[9px] font-black uppercase tracking-wider self-center">
                Super Administrator
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
              <FaEnvelope className="text-slate-400" /> {profile?.email || "superadmin@teachhub.app"}
            </p>
            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
              <FaPhoneAlt className="text-slate-400" /> {phoneNumber}
            </p>
            <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
              <FaMapMarkerAlt className="text-slate-400" /> {address || "No Address Provided"}
            </p>
          </div>
        </div>

        {/* Right role metrics log card block */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 pt-5 lg:pt-0 lg:pl-8 flex-grow grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 select-none">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Role</span>
            <p className="text-slate-805 dark:text-white font-extrabold">Super Administrator</p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Employee ID</span>
            <p className="text-slate-805 dark:text-white font-extrabold">SA-0001</p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Member Since</span>
            <p className="text-slate-805 dark:text-white font-extrabold flex items-center gap-1"><FaCalendarAlt /> {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Last Login</span>
            <p className="text-slate-805 dark:text-white font-extrabold flex items-center gap-1"><FaRegClock /> {profile?.loginActivity?.lastLogin ? formatDate(profile.loginActivity.lastLogin.time) : "N/A"}</p>
          </div>

          <div className="col-span-2 pt-1.5">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-block">Active Account</span>
          </div>
        </div>

      </div>

      {/* 3. Main configuration Forms Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Personal Information Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Personal Information</h3>
            <button
              type="button"
              onClick={() => setEditMode(p => !p)}
              className="text-[#7C3AED] hover:text-[#6D28D9] border border-[#7C3AED]/20 hover:bg-[#7C3AED]/5 py-1 px-3 rounded-lg text-[10px] font-black transition uppercase cursor-pointer bg-transparent"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-bold text-slate-655 dark:text-slate-350">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Full Name</span>
                {editMode ? (
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-805 dark:text-white font-extrabold text-xs">{name}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Email Address</span>
                <p className="text-slate-405 font-semibold text-xs leading-loose">{profile?.email || "superadmin@teachhub.app"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Phone Number</span>
                {editMode ? (
                  <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-805 dark:text-white font-extrabold text-xs">{phoneNumber}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Alternate Email</span>
                {editMode ? (
                  <input type="email" value={alternateEmail} onChange={(e) => setAlternateEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-805 dark:text-white font-extrabold text-xs">{alternateEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Date of Birth</span>
                {editMode ? (
                  <input type="text" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-850 dark:text-white font-extrabold text-xs">{dob}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Gender</span>
                {editMode ? (
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED] cursor-pointer">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p className="text-slate-805 dark:text-white font-extrabold text-xs">{gender}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Address</span>
                {editMode ? (
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-850 dark:text-white font-extrabold text-xs">{address}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Time Zone</span>
                {editMode ? (
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED] cursor-pointer">
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-slate-850 dark:text-white font-extrabold text-xs flex items-center gap-1"><FaGlobe /> {timezone}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Language</span>
                {editMode ? (
                  <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-850 dark:text-white font-extrabold text-xs">{language}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">About</span>
                {editMode ? (
                  <textarea rows="3" value={about} onChange={(e) => setAbout(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-855 dark:text-slate-200 font-extrabold text-xs leading-relaxed">{about}</p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-black text-[10px] px-4 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-black text-[10px] px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <FaSave /> Save Info
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column (1/3 width) - Profile Photo widget details */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between text-center select-none">
          <div className="w-full border-b border-slate-100 dark:border-white/5 pb-2 flex items-center justify-between text-left">
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Profile Photo</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[#7C3AED] border border-[#7C3AED]/20 py-1 px-3 rounded-lg text-[10px] font-black transition uppercase cursor-pointer bg-transparent"
            >
              Edit
            </button>
          </div>

          <div className="my-8 flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center p-1">
              <img src={avatarSource} alt="Profile Photo" className="w-full h-full object-cover rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">JPG, PNG or GIF. Max size of 2MB.</p>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#7C3AED]/15"
            >
              <FaCamera /> Change Photo
            </button>
            
            <button
              onClick={() => {
                if (window.confirm("Remove avatar photo?")) {
                  setAvatar("");
                }
              }}
              className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 text-slate-550 dark:text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaTrashAlt /> Remove Photo
            </button>
          </div>
        </div>

      </div>

      {/* 4. Split columns (Login Activity only) */}
      <div className="grid grid-cols-1 gap-6">

        {/* Login & Activity */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">Login & Activity</h3>
          
          <div className="space-y-3.5 text-xs font-bold text-slate-655 dark:text-slate-350 select-none">
            
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.02] pb-3">
              <span className="flex items-center gap-2">
                <FaRegClock className="text-blue-500 text-sm" /> Last Login
              </span>
              <div className="text-right">
                <p className="text-slate-805 dark:text-white font-extrabold font-mono">
                  {profile?.loginActivity?.lastLogin ? formatDateTime(profile.loginActivity.lastLogin.time) : "N/A"}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {profile?.loginActivity?.lastLogin?.deviceBrowser || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.02] pb-3">
              <span className="flex items-center gap-2">
                <FaRegClock className="text-slate-400 text-sm" /> Previous Login
              </span>
              <div className="text-right">
                <p className="text-slate-805 dark:text-white font-extrabold font-mono">
                  {profile?.loginActivity?.previousLogin ? formatDateTime(profile.loginActivity.previousLogin.time) : "N/A"}
                </p>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {profile?.loginActivity?.previousLogin?.deviceBrowser || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.02] pb-3">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500 text-sm" /> Login Location
              </span>
              <div className="text-right">
                <p className="text-slate-850 dark:text-white font-extrabold">{profile?.loginActivity?.loginLocation || "Unknown Location"}</p>
                <span className="text-[9px] text-[#38BDF8] font-black block mt-0.5 font-mono">IP: {profile?.loginActivity?.loginIp || "Unknown"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.02] pb-3">
              <span className="flex items-center gap-2">
                <FaUserShield className="text-slate-400 text-sm" /> Total Logins
              </span>
              <span className="text-slate-850 dark:text-white font-black font-mono">{profile?.loginActivity?.totalLogins || 0} logins</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-green-555 text-sm" /> Account Status
              </span>
              <div className="text-right">
                <span className="text-green-555 font-black uppercase text-[10px] tracking-wider block">Active</span>
                <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">Your account is in good standing.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Connected Devices & Sessions Table */}
      <div id="connected-devices-section" className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Connected Devices & Sessions</h3>
          <p className="text-[10px] text-slate-405 font-bold mt-1 leading-relaxed">Manage your active sessions across different devices.</p>
        </div>

        <div className="overflow-x-auto select-none">
          <table className="w-full text-left text-xs font-bold text-slate-500 divide-y divide-slate-100 dark:divide-white/5">
            <thead>
              <tr className="text-[9px] font-black text-slate-405 uppercase tracking-widest">
                <th className="pb-3 pr-4">Device</th>
                <th className="pb-3 px-4">Browser</th>
                <th className="pb-3 px-4">Location / IP</th>
                <th className="pb-3 px-4">Last Active</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-805 dark:text-white font-semibold">
              {sessions.map((session) => (
                <tr key={session.id || session._id} className="hover:bg-slate-50/[0.02] transition-colors">
                  <td className="py-4.5 pr-4 flex items-center gap-2.5 font-extrabold text-xs">
                    {session.device.includes("PC") || session.device.includes("Macintosh") || session.device.includes("Linux") ? <FaLaptop className="text-blue-500 text-sm" /> : <FaMobileAlt className="text-purple-550 text-sm" />}
                    <span>{session.device}</span>
                  </td>
                  <td className="py-4.5 px-4 font-mono text-[10px] text-slate-655 dark:text-slate-350">{session.browser}</td>
                  <td className="py-4.5 px-4">
                    <p className="text-xs font-bold text-slate-850 dark:text-white">{session.location}</p>
                    <span className="text-[9px] font-black font-mono text-slate-400 block mt-0.5">{session.ip}</span>
                  </td>
                  <td className="py-4.5 px-4">
                    <p className="text-xs font-bold text-slate-850 dark:text-white font-mono">{formatDateTime(session.lastActive)}</p>
                    {session.current && <span className="text-[8px] font-black uppercase text-[#7C3AED] dark:text-[#38BDF8] mt-0.5 block tracking-wider">Current Session</span>}
                  </td>
                  <td className="py-4.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      session.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-4.5 pl-4 text-right">
                    {!session.current && session.status === "Active" ? (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-rose-500 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest cursor-pointer bg-transparent border-0"
                      >
                        Logout
                      </button>
                    ) : (
                      <span className="text-slate-350">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-white/5 pt-4 gap-3 select-none">
          <p className="text-[9.5px] text-slate-400 font-bold">If you notice any suspicious activity, log out from all other sessions.</p>
          <button
            onClick={handleLogoutAllOther}
            className="bg-transparent hover:bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] py-2.5 px-4 rounded-xl transition cursor-pointer uppercase tracking-wider"
          >
            Logout All Other Sessions
          </button>
        </div>
      </div>

      {/* CHANGE PASSWORD DIALOG MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] select-none">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-3xl w-96 text-left shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5"><FaLock className="text-amber-500 text-xs" /> Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0 text-sm"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-bold text-slate-300">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#1E293B] text-white font-semibold focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#1E293B] text-white font-semibold focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 py-2 px-4 rounded-xl cursor-pointer font-extrabold uppercase tracking-wider text-[10px]"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2 px-4.5 rounded-xl cursor-pointer font-extrabold uppercase tracking-wider text-[10px]"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminProfile;
