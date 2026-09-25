import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaShieldAlt, 
  FaCalendarAlt, 
  FaEdit, 
  FaCheckCircle, 
  FaStar, 
  FaTicketAlt, 
  FaClock, 
  FaLock, 
  FaCog, 
  FaHistory,
  FaSpinner,
  FaCamera,
  FaExclamationCircle,
  FaCheck
} from "react-icons/fa";
import API_URL from "../../../config/api";

export default function SupportProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editable Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState(() => localStorage.getItem("avatar") || "");

  // Password Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setUserProfile(res.data);
        setName(res.data.name || "");
        setPhoneNumber(res.data.phoneNumber || res.data.phone || "");
        const fetchedAvatar = res.data.avatar || res.data.photo || res.data.profilePhoto || localStorage.getItem("avatar") || "";
        setAvatar(fetchedAvatar);
        if (fetchedAvatar) {
          try { localStorage.setItem("avatar", fetchedAvatar); } catch(e) {}
        }

        // Keep local user info updated in localStorage
        if (res.data.name) localStorage.setItem("userName", res.data.name);
        if (res.data.role) localStorage.setItem("userRole", res.data.role);
        if (res.data.supportDepartment) localStorage.setItem("supportDepartment", res.data.supportDepartment);
      }
    } catch (err) {
      console.error("Error fetching support profile:", err.message);
      setError(err.response?.data?.message || "Failed to load support profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    const handleProfileUpdate = () => {
      const localAv = localStorage.getItem("avatar") || "";
      if (localAv) setAvatar(localAv);
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, [fetchProfile]);

  // Handle Image Upload -> Base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const payload = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        avatar
      };

      const res = await axios.put(`${API_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Profile updated successfully!");
      if (res.data?.user?.name) localStorage.setItem("userName", res.data.user.name);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await axios.put(`${API_URL}/api/auth/profile`, {
        currentPassword,
        password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3">
        <FaSpinner className="text-2xl animate-spin text-purple-500" />
        <span>Loading support profile...</span>
      </div>
    );
  }

  const roleLabel = userProfile?.role === "superadmin" ? "Super Admin" : "Support Team Member";
  const departmentLabel = userProfile?.supportDepartment || "General Support";
  const statusLabel = (userProfile?.supportStatus || "active").toUpperCase();
  const employeeId = userProfile?.employeeId || `SUP-${userProfile?._id?.slice(-6).toUpperCase()}`;
  const joinedDate = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "N/A";
  const initials = (name || "Support").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information, credentials, and security preferences.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <FaCheck className="text-sm shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOP PROFILE BANNER CARD */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          
          {/* Avatar Container with Upload overlay */}
          <div className="relative group">
            {avatar || localStorage.getItem("avatar") ? (
              <img 
                src={avatar || localStorage.getItem("avatar")} 
                alt={name} 
                className="w-24 h-24 rounded-full object-cover shadow-xl border-2 border-purple-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl">
                {initials}
              </div>
            )}

            <label className="absolute inset-0 rounded-full bg-slate-950/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <FaCamera className="text-xl" />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>

            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0D1527]" />
          </div>

          <div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">{name}</h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{statusLabel}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              Support Agent assigned to <strong>{departmentLabel}</strong> department.
            </p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-4 w-full md:w-auto">
          <div><span className="text-slate-400 block text-[10px]">Email</span><span className="font-bold text-slate-800 dark:text-white truncate block">{userProfile?.email}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Department</span><span className="font-semibold text-purple-400">{departmentLabel}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Employee / Support ID</span><span className="font-mono font-bold text-cyan-400">{employeeId}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Joined Date</span><span className="font-semibold text-slate-300">{joinedDate}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Account Status</span><span className="font-bold text-emerald-400">{statusLabel}</span></div>
        </div>
      </div>

      {/* MAIN LAYOUT: Workspace & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORM WORKSPACE (Col 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-[#121B2E]/50 text-xs font-bold">
            {[
              { key: "personal", label: "Personal Information" },
              { key: "security", label: "Security & Password" },
              { key: "activity", label: "Login Activity" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === tab.key ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === "personal" && (
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Personal Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    disabled
                    value={userProfile?.email || ""} 
                    className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Role (Read-only)</label>
                  <input 
                    type="text" 
                    disabled
                    value={roleLabel} 
                    className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Department (SuperAdmin Controlled)</label>
                  <input 
                    type="text" 
                    disabled
                    value={departmentLabel} 
                    className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Support Status (SuperAdmin Controlled)</label>
                  <input 
                    type="text" 
                    disabled
                    value={statusLabel} 
                    className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Security & Password</h3>

              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 font-bold text-xs">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-bold text-xs">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">New Password *</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Confirm New Password *</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
                >
                  {changingPassword ? <FaSpinner className="animate-spin" /> : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN ACTIVITY */}
          {activeTab === "activity" && (
            <div className="p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Recent Login Activity</h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">Current Session</h4>
                      <p className="text-[10px] text-slate-400">Authenticated via JWT Token</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleString() : "Active Now"}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Account Status Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Account Security Status</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FaCheckCircle />
                <span>Verified Account</span>
              </div>
              <p className="text-[11px] text-slate-400">Your support credentials and permissions are verified by SuperAdmin.</p>
            </div>
          </div>

          {/* Support Statistics */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Support Performance</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-rose-400 text-lg">{userProfile?.activeTickets || 0}</div>
                <div className="text-[10px] text-slate-400">Active Tickets</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-emerald-400 text-lg">{userProfile?.ticketsResolved || 0}</div>
                <div className="text-[10px] text-slate-400">Resolved</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
