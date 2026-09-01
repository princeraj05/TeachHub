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

const defaultProfile = {
  _id: "superadmin_profile",
  name: "Super Admin",
  email: "princerajmne@gmail.com",
  role: "superadmin",
  schoolName: "TeachHub HQ",
  phoneNumber: "+91 98765 43210",
  alternateEmail: "admin@teachhub.app",
  dob: "01 Jan 1995",
  gender: "Male",
  address: "Patna, Bihar, India",
  timezone: "(GMT+05:30) Asia/Kolkata",
  language: "English",
  about: "System administrator with full access to all modules and settings.",
  avatar: ""
};

function SuperAdminProfile() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");

  // Profile data state - INSTANT LOAD
  const [profile, setProfile] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_profile");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (e) {}
    }
    return defaultProfile;
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form input fields state initialized from profile
  const [name, setName] = useState(profile.name || "Super Admin");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "+91 98765 43210");
  const [gender, setGender] = useState(profile.gender || "Male");
  const [address, setAddress] = useState(profile.address || "Patna, Bihar, India");
  const [about, setAbout] = useState(profile.about || "System owner.");
  const [avatar, setAvatar] = useState(profile.avatar || "");

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
      console.log("Using local sessions info");
    }
  };

  const fetchProfile = async () => {
    try {
      setErrorMsg("");
      const res = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        const d = res.data;
        setProfile(d);
        localStorage.setItem("cached_superadmin_profile", JSON.stringify(d));

        setName(d.name || "Super Admin");
        setPhoneNumber(d.phoneNumber || "+91 98765 43210");
        setGender(d.gender || "Male");
        setAddress(d.address || "Patna, Bihar, India");
        setAbout(d.about || "System administrator.");
        setAvatar(d.avatar || "");
      }
    } catch (err) {
      console.log("Using cached profile state");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setAvatar(base64Data);

      try {
        const res = await axios.put(`${API}/api/auth/profile`, { avatar: base64Data }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.user) {
          setProfile(res.data.user);
          localStorage.setItem("avatar", res.data.user.avatar || base64Data);
          localStorage.setItem("cached_superadmin_profile", JSON.stringify(res.data.user));
        }
        window.dispatchEvent(new Event("profileUpdate"));
        setSuccessMsg("Photo updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        // Fallback to storing in localStorage if offline
        localStorage.setItem("avatar", base64Data);
        window.dispatchEvent(new Event("profileUpdate"));
        setSuccessMsg("Photo updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
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
        gender,
        address,
        about,
        avatar
      };

      const res = await axios.put(`${API}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(res.data.user);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("avatar", res.data.user.avatar || "");
      localStorage.setItem("cached_superadmin_profile", JSON.stringify(res.data.user));
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
              <FaMapMarkerAlt className="text-slate-400" /> {address || "No Location Provided"}
            </p>
          </div>
        </div>

        {/* Right role metrics log card block */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/5 pt-5 lg:pt-0 lg:pl-8 flex-grow flex flex-col justify-center gap-3 text-xs font-bold text-slate-500 select-none">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Role</span>
            <p className="text-slate-805 dark:text-white font-extrabold text-sm">Super Administrator</p>
          </div>

          <div className="pt-1">
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
                <span className="text-[9px] font-black text-slate-405 uppercase tracking-widest block">Current Location</span>
                {editMode ? (
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-805 dark:text-white font-semibold outline-none focus:border-[#7C3AED]" />
                ) : (
                  <p className="text-slate-850 dark:text-white font-extrabold text-xs">{address}</p>
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
