import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { requestLocationPermission } from "../../../../../utils/permissionAndDownloadUtils";
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
  FaCheck, 
  FaLock, 
  FaBook,
  FaChalkboardTeacher,
  FaInfoCircle,
  FaExclamationCircle,
  FaGraduationCap,
  FaIdCard,
  FaSchool
} from "react-icons/fa";
import { compressAvatar } from "../../../../../utils/mediaCompression";
import ProfilePhotoCropModal from "../../../../../components/ProfilePhotoCropModal";
import { pickProfilePhoto } from "../../../../../utils/mobileCapabilities";
import { Capacitor } from "@capacitor/core";

const SORA = "'Sora', sans-serif";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function TeacherProfile() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Editable form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [cropModalImage, setCropModalImage] = useState(null);

  // Read-only Assigned Data (managed by School Admin)
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    const res = await requestLocationPermission();
    if (!res.success) {
      alert(res.error || "Could not fetch location");
      setGettingLocation(false);
      return;
    }
    const { latitude, longitude } = res.coords;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await geoRes.json();
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
  };

  useEffect(() => {
    axios.get(`${API}/api/auth/profile`, { headers })
      .then(res => {
        const u = res.data;
        setProfile(u);
        
        setName(u.name || "");
        setEmail(u.email || "");
        setDob(u.dob || "1990-05-12");
        setGender(u.gender || "Male");
        setPhoneNumber(u.phoneNumber || "");
        setAddress(u.address || "");
        setDepartment(u.department || "Academic Faculty");
        setQualification(u.qualification || "M.Sc, B.Ed");
        setExperience(u.experience || "6 Years");
        setEmployeeId(u.employeeId || `TCH${String(u._id).slice(-4).toUpperCase()}`);
        setBio(u.bio || "Passionate educator dedicated to academic excellence and student success.");
        setAvatar(u.avatar || "");

        setAssignedSubjects(u.subjects || []);
        setAssignedClasses(u.classes || []);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, [API, headers]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropModalImage(file);
      e.target.value = "";
    }
  };

  const handleSaveCroppedAvatar = (croppedBase64) => {
    setAvatar(croppedBase64);
    try { localStorage.setItem("avatar", croppedBase64); } catch (err) {}
    window.dispatchEvent(new Event("profileUpdate"));
    setCropModalImage(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveMessage("");
    setSaveError("");
    setSaving(true);

    try {
      const res = await axios.put(`${API}/api/teacher/profile/update`, {
        name,
        email,
        dob,
        gender,
        phoneNumber,
        address,
        department,
        qualification,
        experience,
        bio,
        avatar
      }, { headers });

      if (avatar) {
        try { localStorage.setItem("avatar", avatar); } catch (e) {}
      }
      if (name) {
        try { localStorage.setItem("name", name); } catch (e) {}
      }
      window.dispatchEvent(new Event("profileUpdate"));

      setSaveMessage("Profile updated successfully!");
      if (res.data?.teacher) {
        setProfile(prev => ({ ...prev, ...res.data.teacher }));
      }
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err) {
      setSaveError(err.response?.data?.error || err.response?.data?.message || "Could not save profile changes.");
      setTimeout(() => setSaveError(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      const file = await pickProfilePhoto();
      if (file) {
        setCropModalImage(file);
      }
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarRemove = () => {
    setAvatar("");
    try { localStorage.setItem("avatar", ""); } catch (e) {}
    window.dispatchEvent(new Event("profileUpdate"));
  };

  const userInitials = useMemo(() => {
    if (!name) return "T";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-3" style={{ fontFamily: SORA }}>
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-black text-xs">Syncing instructor records...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 max-w-5xl mx-auto pb-12 select-none text-left">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarFileChange} 
      />

      {/* 1. Hero Identity Banner */}
      <div className="relative overflow-hidden rounded-2.5xl sm:rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#3B82F6] p-4 sm:p-7 text-white shadow-xl shadow-[#7C3AED]/20">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Avatar Container */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-xl overflow-hidden">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-3xl overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAvatarUpload}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-purple-700 hover:bg-slate-100 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-purple-600 transition cursor-pointer"
                title="Change Photo"
              >
                <FaCamera className="text-[10px]" />
              </button>
            </div>

            {/* Identity Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {name || "Instructor"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-0.5 rounded-full shadow-sm">
                  Faculty Account
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/85 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <FaEnvelope className="text-[11px] text-white/70" /> {email || "Instructor Console"}
              </p>

              {/* Quick Institution Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-[11px] font-semibold text-white/90">
                {profile?.schoolName && (
                  <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                    <FaSchool className="text-cyan-300 text-xs" />
                    {profile.schoolName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                  <FaIdCard className="text-amber-300 text-xs" />
                  ID: {employeeId}
                </span>
              </div>
            </div>
          </div>

          {/* Banner Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAvatarUpload}
              className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <FaUpload className="text-xs text-purple-600" />
              Upload Photo
            </button>
            {avatar && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md border border-rose-300/40 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95"
                title="Remove Photo"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metadata Badges (2 COLUMNS ON MOBILE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Badge 1: Employee ID */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <FaIdCard className="text-xs sm:text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider truncate">Employee ID</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{employeeId || "—"}</p>
          </div>
        </div>

        {/* Badge 2: Account Status */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FaShieldAlt className="text-xs sm:text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider truncate">Status</p>
            <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">ACTIVE FACULTY</p>
          </div>
        </div>

        {/* Badge 3: Department */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FaBriefcase className="text-xs sm:text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider truncate">Department</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{department || "Faculty"}</p>
          </div>
        </div>

        {/* Badge 4: Teaching Experience */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FaGraduationCap className="text-xs sm:text-base" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider truncate">Experience</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">{experience || "—"}</p>
          </div>
        </div>

      </div>

      {/* 3. Main Form Section */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2.5xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Instructor Information & Credentials</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Manage personal & professional profile details</p>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
              <FaCheck className="text-[9px]" /> Verified Teacher Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Employee ID (Read-only) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaLock className="text-[9px] text-slate-400" /> Employee ID (Assigned by Admin)
              </label>
              <input
                type="text"
                disabled
                value={employeeId}
                className="w-full bg-transparent text-xs font-black text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaUser className="text-[9px] text-purple-500" /> Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaEnvelope className="text-[9px] text-purple-500" /> Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Phone Number */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaPhone className="text-[9px] text-purple-500" /> Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Date of Birth */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaCalendarAlt className="text-[9px] text-purple-500" /> Date of Birth
              </label>
              <input
                type="date"
                value={formatDateForInput(dob)}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Gender */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaUser className="text-[9px] text-purple-500" /> Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Male" className="bg-white dark:bg-[#0B132A]">Male</option>
                <option value="Female" className="bg-white dark:bg-[#0B132A]">Female</option>
                <option value="Other" className="bg-white dark:bg-[#0B132A]">Other</option>
              </select>
            </div>

            {/* Qualification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaGraduationCap className="text-[9px] text-purple-500" /> Qualification
              </label>
              <input
                type="text"
                placeholder="M.Sc, B.Ed"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Teaching Experience */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                <FaBriefcase className="text-[9px] text-purple-500" /> Teaching Experience
              </label>
              <input
                type="text"
                placeholder="6 Years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Address with Geolocation */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2 focus-within:border-purple-500/50 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-[9px] text-purple-500" /> Residential Address
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-xl border border-purple-500/20 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <FaMapMarkerAlt className="text-[8px]" />
                  {gettingLocation ? "Detecting Location..." : "Use Current Location"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Residential location details"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Professional Summary / Bio */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1 focus-within:border-purple-500/50 transition">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <FaInfoCircle className="text-[9px] text-purple-500" /> Professional Summary / Bio
                </label>
                <span className="text-[9px] font-extrabold text-slate-400">{bio.length}/250</span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 250))}
                rows="2"
                className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white outline-none resize-none leading-relaxed placeholder:text-slate-400"
              />
            </div>

          </div>
        </div>

        {/* 4. Lower Cards: Assigned Subjects & Assigned Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Assigned Subjects */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs border border-purple-500/20">
                  <FaBook />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Assigned Subjects</h3>
                  <p className="text-[9px] text-slate-400 font-semibold">Course responsibilities</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-1">
                <FaLock className="text-[8px]" /> Read-Only
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Subjects assigned to your profile by the School Administrator.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {assignedSubjects.length > 0 ? (
                assignedSubjects.map((sub, idx) => (
                  <div
                    key={sub._id || idx}
                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm"
                  >
                    <FaBook className="text-xs" />
                    <span>{sub.name}</span>
                    {sub.code && <span className="text-[9px] font-bold text-slate-400">({sub.code})</span>}
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-400 font-bold italic">
                  No subjects assigned yet. Contact School Admin for course allocation.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Assigned Classes */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs border border-indigo-500/20">
                  <FaChalkboardTeacher />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Assigned Classes</h3>
                  <p className="text-[9px] text-slate-400 font-semibold">Teaching schedule</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-1">
                <FaLock className="text-[8px]" /> Read-Only
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Class sections allocated to your teaching schedule.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((cls, idx) => (
                  <div
                    key={cls._id || idx}
                    className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-2 rounded-xl text-xs font-black shadow-sm"
                  >
                    <FaChalkboardTeacher className="text-xs" />
                    <span>Class {cls.name} - {cls.section || "A"}</span>
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-400 font-bold italic">
                  No classes assigned yet. Contact School Admin for class allocation.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 5. Save Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          
          <div className="flex-1 w-full">
            {saveMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-black shadow-sm">
                <FaCheck className="text-xs shrink-0" /> {saveMessage}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-black shadow-sm">
                <FaExclamationCircle className="text-xs shrink-0" /> {saveError}
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            <FaCheck className="text-xs" />
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>

      </form>

      {/* CROP & ROTATE PROFILE PHOTO MODAL */}
      {cropModalImage && (
        <ProfilePhotoCropModal
          imageSrc={cropModalImage}
          onClose={() => setCropModalImage(null)}
          onSave={handleSaveCroppedAvatar}
        />
      )}
    </div>
  );
}

export default TeacherProfile;
