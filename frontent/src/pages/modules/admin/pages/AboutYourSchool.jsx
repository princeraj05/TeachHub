import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSchool,
  FaEdit,
  FaLock,
  FaCheckCircle,
  FaInfoCircle,
  FaGraduationCap,
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaBus,
  FaBed,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaArrowUp,
  FaTimes
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AboutYourSchool() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // State managers
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form input states
  const [principalName, setPrincipalName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [established, setEstablished] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [code, setCode] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [medium, setMedium] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState("");
  const [motto, setMotto] = useState("");
  const [photo, setPhoto] = useState("");
  const [availableClasses, setAvailableClasses] = useState("");

  // Categories / Facilities States
  const [academicLevel, setAcademicLevel] = useState("");
  const [coEducational, setCoEducational] = useState("");
  const [schoolOperationType, setSchoolOperationType] = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [transportation, setTransportation] = useState("");
  const [hostelFacility, setHostelFacility] = useState("");

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (data) {
        setSchool(data);
        setPrincipalName(data.principalName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setAddress(data.address || "");
        setEstablished(data.established || "");
        setSchoolType(data.schoolType || "Private");
        setCode(data.code || "");
        setAffiliation(data.affiliation || "");
        setAcademicYear(data.academicYear || "");
        setMedium(data.medium || "");
        setWebsite(data.website || "");
        setStatus(data.status || "Active");
        setRegistrationNumber(data.registrationNumber || "");
        setCategory(data.category || "");
        setMotto(data.motto || "");
        setPhoto(data.photo || "");
        setAvailableClasses(data.availableClasses || "");

        // Categories
        setAcademicLevel(data.academicLevel || "");
        setCoEducational(data.coEducational || "Co-Educational");
        setSchoolOperationType(data.schoolOperationType || "Day School");
        setAdmissionType(data.admissionType || "Direct Admission");
        setTransportation(data.transportation || "Available");
        setHostelFacility(data.hostelFacility || "Not Available");
      }
    } catch (err) {
      console.error("Error fetching school data:", err);
      setError(err.response?.data?.message || "Failed to load school profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        principalName,
        email,
        phoneNumber,
        address,
        established,
        schoolType,
        code,
        affiliation,
        academicYear,
        medium,
        website,
        status,
        registrationNumber,
        category,
        motto,
        photo,
        availableClasses,
        academicLevel,
        coEducational,
        schoolOperationType,
        admissionType,
        transportation,
        hostelFacility
      };

      await axios.put(`${API}/api/schools/my-school`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("School information updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 4000);
      fetchSchoolData();
    } catch (err) {
      console.error("Error saving school details:", err);
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-450 bg-[#080D1A] -m-4 md:-m-6 p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-sm font-semibold tracking-wide">Loading School Profile...</p>
      </div>
    );
  }

  // Calculate classes count for the Available Classes stat card (e.g. "10 Classes")
  const classCountText = school?.totalClasses === 1 ? "1 Class" : `${school?.totalClasses || 0} Classes`;

  return (
    <div className="bg-[#080D1A] min-h-screen text-slate-100 p-6 -m-4 md:-m-6" style={{ fontFamily: SORA }}>
      
      {/* ── HEADER NAVIGATION ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <span>About Your School</span>
            <span>&gt;</span>
            <span className="text-purple-500">Basic Information</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            About Your School
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage your school's basic details and information.
          </p>
        </div>

        {/* Toggle Edit Button */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition self-start sm:self-auto cursor-pointer"
        >
          {isEditing ? (
            <>
              <FaTimes className="text-sm" /> Cancel Editing
            </>
          ) : (
            <>
              <FaEdit className="text-sm" /> Edit School Information
            </>
          )}
        </button>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {error}
        </div>
      )}

      {/* ── MAIN CONTENT GRID ── */}
      <div className="space-y-6">

        {/* CARD 1: BASIC INFORMATION */}
        <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-5">
            <FaSchool className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* School Photo (Left) */}
            <div className="lg:col-span-4">
              <div className="rounded-xl overflow-hidden border border-slate-800/80 aspect-[4/3] bg-slate-900 flex items-center justify-center relative group">
                <img
                  src={photo || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"}
                  alt="School Building"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image URL</label>
                    <input
                      type="text"
                      value={photo}
                      placeholder="Paste Image URL"
                      onChange={(e) => setPhoto(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0F172A] border border-slate-800 rounded-lg text-[10px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Fields (Right) */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                
                {/* School Name */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Name</span>
                  <p className="text-xs font-bold text-white bg-[#0F172A]/40 border border-slate-850 px-3.5 py-2 rounded-xl text-slate-400">
                    {school?.name || "G.D Accedmy"}
                  </p>
                </div>

                {/* Affiliation */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Affiliation / Board</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{affiliation || "CBSE"}</p>
                  )}
                </div>

                {/* Principal Name */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Principal Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{principalName || "Banny Thapar"}</p>
                  )}
                </div>

                {/* Academic Year */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic Year</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{academicYear || "2026 - 2027"}</p>
                  )}
                </div>

                {/* School Email */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{email || "gdaccedmy@gmail.com"}</p>
                  )}
                </div>

                {/* Medium */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Medium</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{medium || "English"}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{phoneNumber || "+91 98765 43210"}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Website</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{website || "www.gdaccedmy.edu.in"}</p>
                  )}
                </div>

                {/* School Address */}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Address</span>
                  {isEditing ? (
                    <textarea
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1 leading-relaxed">
                      {address || "Near Sadar Hospital, Siwan, Bihar - 841226, India"}
                    </p>
                  )}
                </div>

                {/* School Established */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Established</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={established}
                      onChange={(e) => setEstablished(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{established || "2010"}</p>
                  )}
                </div>

                {/* School Status */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Status</span>
                  {isEditing ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  ) : (
                    <div className="px-1 py-1">
                      <span className="inline-block text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {status || "Active"}
                      </span>
                    </div>
                  )}
                </div>

                {/* School Type */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Type</span>
                  {isEditing ? (
                    <select
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                    >
                      <option>Private</option>
                      <option>Government</option>
                    </select>
                  ) : (
                    <div className="px-1 py-1">
                      <span className="inline-block text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {schoolType || "Private"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Registration Number */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registration Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{registrationNumber || "GD/REG/2010/4125"}</p>
                  )}
                </div>

                {/* School Code */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Code</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-white px-1 py-1">{code || "GDAC2026"}</p>
                  )}
                </div>

                {/* School Category */}
                <div>
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Category</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <div className="px-1 py-1">
                      <span className="inline-block text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        {category || "Secondary"}
                      </span>
                    </div>
                  )}
                </div>

                {/* School Motto */}
                <div className="sm:col-span-2">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Motto</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  ) : (
                    <p className="text-xs font-bold text-slate-200 px-1 py-1 italic">
                      &ldquo;{motto || "Learn • Grow • Succeed"}&rdquo;
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* CARD 2: OVERVIEW STATISTICS */}
        <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-5">
            <FaSchool className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Overview Statistics</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Total Students */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] text-xs">
                  <FaUsers />
                </div>
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Students</span>
              </div>
              <div className="mt-1">
                <h4 className="text-lg font-black text-white">{school?.totalStudents ?? 0}</h4>
                <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <FaArrowUp className="text-[7px]" /> 12 this month
                </p>
              </div>
            </div>

            {/* Total Teachers */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] text-xs">
                  <FaChalkboardTeacher />
                </div>
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Teachers</span>
              </div>
              <div className="mt-1">
                <h4 className="text-lg font-black text-white">{school?.totalTeachers ?? 0}</h4>
                <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <FaArrowUp className="text-[7px]" /> 2 this month
                </p>
              </div>
            </div>

            {/* Total Classes */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-xs">
                  <FaSchool />
                </div>
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Classes</span>
              </div>
              <div className="mt-1">
                <h4 className="text-lg font-black text-white">{school?.totalClasses ?? 0}</h4>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5">No change</p>
              </div>
            </div>

            {/* Total Subjects */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] text-xs">
                  <FaBook />
                </div>
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Subjects</span>
              </div>
              <div className="mt-1">
                <h4 className="text-lg font-black text-white">{school?.totalSubjects ?? 0}</h4>
                <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <FaArrowUp className="text-[7px]" /> 3 this month
                </p>
              </div>
            </div>

            {/* Available Classes */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6] text-xs">
                  <FaCalendarAlt />
                </div>
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Available Classes</span>
              </div>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={availableClasses}
                    onChange={(e) => setAvailableClasses(e.target.value)}
                    className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">{availableClasses || "Class 1 to 10"}</h4>
                )}
                <p className="text-[8px] font-bold text-teal-400 mt-0.5">{classCountText}</p>
              </div>
            </div>

          </div>
        </div>

        {/* CARD 3: SCHOOL CATEGORIES */}
        <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-5">
            <FaSchool className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">School Categories</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Academic Level */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] text-base mb-3">
                <FaGraduationCap />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Academic Level</span>
              {isEditing ? (
                <input
                  type="text"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                />
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{academicLevel || "Secondary"}</span>
              )}
            </div>

            {/* School Category */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899] text-base mb-3">
                <FaUsers />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">School Category</span>
              {isEditing ? (
                <select
                  value={coEducational}
                  onChange={(e) => setCoEducational(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                >
                  <option>Co-Educational</option>
                  <option>Boys Only</option>
                  <option>Girls Only</option>
                </select>
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{coEducational || "Co-Educational"}</span>
              )}
            </div>

            {/* School Type */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] text-base mb-3">
                <FaBuilding />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">School Type</span>
              {isEditing ? (
                <select
                  value={schoolOperationType}
                  onChange={(e) => setSchoolOperationType(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                >
                  <option>Day School</option>
                  <option>Boarding School</option>
                  <option>Day & Boarding</option>
                </select>
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{schoolOperationType || "Day School"}</span>
              )}
            </div>

            {/* Admission Type */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] text-base mb-3">
                <FaClipboardList />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Admission Type</span>
              {isEditing ? (
                <select
                  value={admissionType}
                  onChange={(e) => setAdmissionType(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                >
                  <option>Direct Admission</option>
                  <option>Entrance Exam</option>
                  <option>Merit Based</option>
                </select>
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{admissionType || "Direct Admission"}</span>
              )}
            </div>

            {/* Transportation */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-base mb-3">
                <FaBus />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Transportation</span>
              {isEditing ? (
                <select
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                >
                  <option>Available</option>
                  <option>Not Available</option>
                </select>
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{transportation || "Available"}</span>
              )}
            </div>

            {/* Hostel Facility */}
            <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] text-base mb-3">
                <FaBed />
              </div>
              <span className="block text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Hostel Facility</span>
              {isEditing ? (
                <select
                  value={hostelFacility}
                  onChange={(e) => setHostelFacility(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold mt-1"
                >
                  <option>Available</option>
                  <option>Not Available</option>
                </select>
              ) : (
                <span className="block text-xs font-bold text-white mt-1">{hostelFacility || "Not Available"}</span>
              )}
            </div>

          </div>
        </div>

        {/* ── FOOTER ACTION BANNER (VISIBLE IN EDIT MODE OR VIEW MODE) ── */}
        <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl select-none">
          <div className="flex items-center gap-3 text-blue-400">
            <FaInfoCircle className="text-lg shrink-0" />
            <p className="text-xs font-bold text-slate-300">
              Keep your school information updated. This information is visible to parents and students.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto justify-center"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaLock className="text-xs" /> Save Changes
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

export default AboutYourSchool;
