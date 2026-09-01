import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera
} from "react-icons/fa";
import { compressAvatar } from "../utils/mediaCompression";

const SORA = "'Sora', sans-serif";

function UserProfile() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({ name: "", email: "", role: "", phoneNumber: "", fatherMobileNumber: "", motherMobileNumber: "", avatar: "" });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", phoneNumber: "", fatherMobileNumber: "", motherMobileNumber: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2500);

    fetchProfile().finally(() => {
      if (isMounted) {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      const userAvatar = res.data.avatar || res.data.photo || res.data.profilePhoto || "";
      setFormData({
        name: res.data.name || "",
        phoneNumber: res.data.phoneNumber || "",
        fatherMobileNumber: res.data.fatherMobileNumber || "",
        motherMobileNumber: res.data.motherMobileNumber || "",
        avatar: userAvatar
      });
      if (res.data.name) {
        try { localStorage.setItem("name", res.data.name); } catch(e) {}
      }
      if (userAvatar) {
        try { localStorage.setItem("avatar", userAvatar); } catch(e) {}
      }
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      setEditMode(false);

      const updatedAvatar = updatedUser.avatar || updatedUser.photo || updatedUser.profilePhoto || formData.avatar || "";
      const updatedName = updatedUser.name || formData.name || "";

      // Update name and avatar in localStorage for Layout header updates
      try { localStorage.setItem("name", updatedName); } catch(e) {}
      try { localStorage.setItem("avatar", updatedAvatar); } catch(e) {}
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 sm:py-20 text-center flex flex-col items-center justify-center px-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading profile...</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 px-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Personal Profile
        </h1>
      </div>

      <div className="bg-white dark:bg-[#0B132A] rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-lg sm:shadow-xl overflow-hidden flex flex-col relative transition-all duration-200">
        <div className="h-1.5 sm:h-2 w-full bg-gradient-to-r from-[#7C3AED] via-[#38BDF8] to-[#312E81]" />

        <form onSubmit={handleSave} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* Avatar and Identity Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 sm:mb-4 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#0B132A]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white">
                    {initials}
                  </div>
                )}
              </div>

              {editMode && (
                <label className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 flex items-center justify-center text-white cursor-pointer shadow-md transition-all border-2 border-white dark:border-[#0B132A]">
                  <FaCamera className="text-sm sm:text-xs" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h2 className="text-slate-900 dark:text-white font-extrabold text-lg sm:text-xl tracking-tight break-words px-2">
              {user.name}
            </h2>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 text-[11px] sm:text-xs font-extrabold rounded-full uppercase tracking-wider">
              <FaUserShield className="text-[10px]" />
              {user.role}
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4">
            {/* Full Name */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] shrink-0">
                <FaUserCircle className="text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</p>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="mt-1 w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-sm sm:text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                ) : (
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate mt-0.5">
                    {user.name || "—"}
                  </p>
                )}
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 opacity-75">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FaEnvelope className="text-base sm:text-lg" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="text-slate-800 dark:text-slate-300 font-bold text-sm truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 self-start sm:self-auto text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/10">
                  Read Only
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <FaPhone className="text-base sm:text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</p>
                {editMode ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number (e.g. +91 9999999999)"
                    className="mt-1 w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-sm sm:text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                ) : (
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate mt-0.5">
                    {user.phoneNumber || "Not Provided"}
                  </p>
                )}
              </div>
            </div>
            {user.role === "student" && [
              ["fatherMobileNumber", "Father Mobile Number"],
              ["motherMobileNumber", "Mother Mobile Number"]
            ].map(([field, label]) => <div key={field} className="bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4"><div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0"><FaPhone /></div><div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>{editMode ? <input type="tel" name={field} value={formData[field]} onChange={handleChange} placeholder="Enter mobile number" className="mt-1 w-full bg-white dark:bg-[#1E293B] border rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-white" /> : <p className="text-slate-800 dark:text-slate-200 font-bold text-sm mt-0.5">{user[field] || "Not Provided"}</p>}</div></div>)}
          </div>

          {/* Action buttons */}
          <div className="pt-1 sm:pt-2">
            {editMode ? (
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      phoneNumber: user.phoneNumber || "",
                      fatherMobileNumber: user.fatherMobileNumber || "",
                      motherMobileNumber: user.motherMobileNumber || "",
                      avatar: user.avatar || ""
                    });
                    setEditMode(false);
                  }}
                  className="w-full sm:w-auto bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.99] text-slate-500 dark:text-slate-400 px-5 py-3.5 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-[#7C3AED]/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FaSave className="text-xs" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="w-full bg-[#0F172A] dark:bg-[#7C3AED] hover:bg-[#1E293B] dark:hover:bg-[#6D28D9] active:scale-[0.99] text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FaEdit className="text-xs" />
                Edit Profile Settings
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
