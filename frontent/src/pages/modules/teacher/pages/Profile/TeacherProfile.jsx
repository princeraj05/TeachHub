import { useEffect, useState, useRef } from "react";
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
  FaCheck, 
  FaLock, 
  FaBook,
  FaChalkboardTeacher,
  FaInfoCircle,
  FaExclamationCircle,
  FaGraduationCap,
  FaIdCard
} from "react-icons/fa";
import { compressAvatar } from "../../../../../utils/mediaCompression";

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
  const headers = { Authorization: `Bearer ${token}` };

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

  // Read-only Assigned Data (managed by School Admin)
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);

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
    // Load authentication profile
    axios.get(`${API}/api/auth/profile`, { headers })
      .then(res => {
        const u = res.data;
        setProfile(u);
        
        // Initialize form states
        setName(u.name || "");
        setEmail(u.email || "");
        setDob(u.dob || "1990-05-12");
        setGender(u.gender || "Male");
        setPhoneNumber(u.phoneNumber || "");
        setAddress(u.address || "");
        setDepartment(u.department || "Faculty");
        setQualification(u.qualification || "M.Sc, B.Ed");
        setExperience(u.experience || "6 Years");
        setEmployeeId(u.employeeId || `TCH${String(u._id).slice(-4).toUpperCase()}`);
        setBio(u.bio || "Passionate educator dedicated to academic excellence and student success.");
        setAvatar(u.avatar || "");

        // Set subjects and classes assigned by admin
        setAssignedSubjects(u.subjects || []);
        setAssignedClasses(u.classes || []);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setLoading(false);
      });
  }, [API, token]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressAvatar(file);
        setAvatar(compressedBase64);
        try {
          localStorage.setItem("avatar", compressedBase64);
        } catch (err) {}
        window.dispatchEvent(new Event("profileUpdate"));
      } catch (err) {
        console.error("Error uploading avatar:", err);
        alert("Could not process image file.");
      }
    }
  };

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

      setSaveMessage("Profile changes saved successfully!");
      if (res.data?.teacher) {
        setProfile(prev => ({ ...prev, ...res.data.teacher }));
      }
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err) {
      setSaveError(err.response?.data?.error || err.response?.data?.message || "Could not save profile changes.");
      setTimeout(() => setSaveError(""), 4000);
    }
  };

  const handleAvatarUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarRemove = () => {
    setAvatar("");
    try {
      localStorage.setItem("avatar", "");
    } catch (e) {}
    window.dispatchEvent(new Event("profileUpdate"));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-400" style={{ fontFamily: SORA }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10 font-sans" style={{ fontFamily: SORA }}>
      
      {/* Header title */}
      <div className="mb-6 select-none">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Teacher Profile</h1>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarFileChange} 
      />

      <form onSubmit={handleSaveChanges} className="flex flex-col gap-6">
        
        {/* Upper Grid: Photo and Personal Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Profile Photo & Basic Identity */}
          <div className="lg:col-span-1 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-between min-h-[380px]">
            <div className="w-full select-none">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider pb-3 border-b border-slate-100 dark:border-white/[0.03] text-left">
                Profile Photo & ID
              </h3>
            </div>

            <div className="relative group my-4 select-none flex flex-col items-center">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Teacher avatar" 
                  className="w-32 h-32 rounded-full border-2 border-purple-500/30 object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-3xl font-black shadow-inner">
                  {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
              )}
              <button 
                type="button"
                onClick={handleAvatarUpload}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white border-2 border-white dark:border-[#111827] flex items-center justify-center shadow-lg transition-all cursor-pointer"
              >
                <FaCamera className="text-xs" />
              </button>
            </div>

            <div className="w-full text-center space-y-1 my-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">{name}</h2>
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                <FaIdCard className="text-xs" /> Employee ID: {employeeId}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">{profile?.schoolName || "TeachHub Academy"}</p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.03]">
              <button
                type="button"
                onClick={handleAvatarUpload}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
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

          {/* Card 2: Personal & Academic Details Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Teacher Information & Credentials</h3>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Active Faculty Status
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Employee ID (Read Only) */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Employee ID (Assigned by Admin)</label>
                <input
                  type="text"
                  disabled
                  value={employeeId}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.03] text-xs font-black text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

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

              {/* Phone Number */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formatDateForInput(dob)}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="M.Sc, B.Ed"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Teaching Experience</label>
                <input
                  type="text"
                  placeholder="6 Years"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Address with Geolocation */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1 select-none">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Residential Address</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    className="text-[9px] font-black text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <FaMapMarkerAlt className="text-[10px]" />
                    {gettingLocation ? "Detecting Location..." : "Use Current Location"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="123, Green Avenue, Siwan, Bihar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Bio description */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1 select-none">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Professional Summary / Bio</label>
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

        {/* Lower Section: ASSIGNED SUBJECTS & CLASSES (READ-ONLY FOR TEACHER) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Assigned Subjects (Read Only) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.03] pb-3 mb-4 select-none">
              <div className="flex items-center gap-2">
                <FaBook className="text-purple-500 text-sm" />
                <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Assigned Subjects</h3>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full flex items-center gap-1">
                <FaLock className="text-[8px]" /> Read Only (Managed by Admin)
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-medium mb-3">
              Subjects are assigned to you by the School Administrator. Teachers cannot modify their subject assignments.
            </p>

            <div className="flex flex-wrap gap-2">
              {assignedSubjects.length > 0 ? (
                assignedSubjects.map((sub, idx) => (
                  <div
                    key={sub._id || idx}
                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-xl text-xs font-black shadow-sm"
                  >
                    <FaBook className="text-xs text-purple-500" />
                    <span>{sub.name}</span>
                    {sub.code && <span className="text-[9px] font-bold text-slate-400">({sub.code})</span>}
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-400 font-bold italic">
                  No subjects assigned yet. Please contact School Admin to assign course subjects.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Assigned Classes (Read Only) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.03] pb-3 mb-4 select-none">
              <div className="flex items-center gap-2">
                <FaChalkboardTeacher className="text-indigo-500 text-sm" />
                <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Assigned Classes</h3>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full flex items-center gap-1">
                <FaLock className="text-[8px]" /> Read Only (Managed by Admin)
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-medium mb-3">
              Classes and sections assigned to your teaching schedule.
            </p>

            <div className="flex flex-wrap gap-2">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((cls, idx) => (
                  <div
                    key={cls._id || idx}
                    className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-xl text-xs font-black shadow-sm"
                  >
                    <FaChalkboardTeacher className="text-xs text-indigo-500" />
                    <span>Class {cls.name} - {cls.section || "A"}</span>
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-400 font-bold italic">
                  No classes assigned yet. Please contact School Admin to assign classes.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Alert messages and submit save trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          
          {/* Feedback alerts */}
          <div className="flex-1 w-full">
            {saveMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[11px] font-extrabold select-none leading-relaxed w-fit shadow-sm">
                <FaCheck className="text-xs shrink-0" /> {saveMessage}
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[11px] font-extrabold select-none leading-relaxed w-fit shadow-sm">
                <FaExclamationCircle className="text-xs shrink-0" /> {saveError}
              </div>
            )}
          </div>

          {/* Submit Save Button */}
          <button 
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap select-none active:scale-95"
          >
            <FaCheck className="text-xs" /> Save Profile Changes
          </button>
        </div>

      </form>

    </div>
  );
}

export default TeacherProfile;