import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getMediaUrl } from "../../../../config/api";
import {
  FaSchool,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBook,
  FaCalendarAlt,
  FaArrowRight
} from "react-icons/fa";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function SchoolDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [schools, setSchools] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [requestedRole, setRequestedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, profileRes, appointmentsRes] = await Promise.all([
        axios.get(`${API}/api/schools`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSchools(schoolsRes.data || []);
      setUser(profileRes.data);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error("Error loading school directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSchoolDetails = schools.find((school) => school.name === selectedSchool);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const hasActiveRequest = user && user.requestStatus !== "rejected" && ["pending", "scheduled", "exam_completed"].includes(user.requestStatus);
    if (hasActiveRequest) {
      alert("You already have an active or pending join request.");
      return;
    }

    const loginSource = localStorage.getItem("loginSource");
    const isTeacherContext = location.pathname.startsWith("/teacher") || loginSource === "teacher" || user?.role === "teacher" || user?.requestedRole === "teacher";
    const roleToSubmit = isTeacherContext ? "teacher" : "student";

    setSubmitting(true);
    axios.put(
      `${API}/api/auth/join-request`,
      { schoolName: selectedSchool, role: roleToSubmit },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        setUser((prev) => ({
          ...prev,
          requestedSchool: selectedSchool,
          requestedRole: roleToSubmit,
          requestStatus: "pending"
        }));
        setShowJoinModal(false);
        fetchData();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit request");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleViewDetails = (schoolName) => {
    const basePath = location.pathname.startsWith("/pending") ? "/pending" : (location.pathname.startsWith("/teacher") ? "/teacher" : "/student");
    navigate(`${basePath}/schools/${encodeURIComponent(schoolName)}`);
  };

  const getSchoolDetails = (schoolName, field, dbValue) => {
    if (dbValue !== undefined && dbValue !== null) {
      return `${dbValue.toLocaleString()}`;
    }
    
    const name = (schoolName || "").toLowerCase();
    if (name.includes("prince")) {
      if (field === "location") return "Noida, U.P.";
      if (field === "color") return "from-purple-600 to-indigo-800";
    }
    if (name.includes("bright")) {
      if (field === "location") return "Patna, Bihar";
      if (field === "color") return "from-emerald-500 to-teal-700";
    }
    
    if (field === "location") return "Siwan, Bihar";
    if (field === "color") return "from-sky-400 to-blue-600";
    return "0";
  };

  const filteredSchools = schools.filter((school) => {
    const term = search.toLowerCase();
    const nameMatch = school.name?.toLowerCase().includes(term);
    const principalMatch = school.principalName?.toLowerCase().includes(term);
    const locationMatch = (school.address || getSchoolDetails(school.name, "location")).toLowerCase().includes(term);
    return nameMatch || principalMatch || locationMatch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing school directory...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 bg-transparent transition-all duration-200">
      
      {/* Header section with SVG illustration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 text-left">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">School Directory</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Available Schools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Explore centers and submit a request to join</p>
        </div>
        
        {/* Modern school building SVG illustration */}
        <div className="hidden sm:block shrink-0">
          <svg className="w-28 h-28 sm:w-32 sm:h-32 text-indigo-500 drop-shadow-lg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 15V22H82V15H70Z" fill="#2563EB"/>
            <path d="M70 12V32" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M25 45L60 30L95 45" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M45 35V45" stroke="#1E40AF" strokeWidth="2"/>
            <rect x="30" y="45" width="60" height="45" rx="4" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.5"/>
            <rect x="15" y="55" width="15" height="35" rx="3" fill="#172554" stroke="#1E40AF" strokeWidth="1.5"/>
            <rect x="90" y="55" width="15" height="35" rx="3" fill="#172554" stroke="#1E40AF" strokeWidth="1.5"/>
            <rect x="50" y="25" width="20" height="25" rx="2" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.5"/>
            <circle cx="60" cy="35" r="5" fill="white" stroke="#3B82F6" strokeWidth="1"/>
            <path d="M60 32.5V35H62.5" stroke="#1E3A8A" strokeWidth="1" strokeLinecap="round"/>
            <rect x="38" y="53" width="8" height="12" rx="1.5" fill="#60A5FA" opacity="0.8"/>
            <rect x="74" y="53" width="8" height="12" rx="1.5" fill="#60A5FA" opacity="0.8"/>
            <rect x="20" y="63" width="5" height="8" rx="1" fill="#3B82F6" opacity="0.8"/>
            <rect x="95" y="63" width="5" height="8" rx="1" fill="#3B82F6" opacity="0.8"/>
            <path d="M52 90V75C52 72.7909 53.7909 71 56 71H64C66.2091 71 68 72.7909 68 75V90H52Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
            <circle cx="56" cy="82" r="1" fill="white"/>
            <circle cx="64" cy="82" r="1" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="flex gap-3 mb-5 sm:mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search schools, location or principal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold text-xs shadow-sm"
          />
        </div>
      </div>

      {/* Schools Cards List */}
      {filteredSchools.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          {filteredSchools.map((school) => {
            const hasActiveRequest = user && user.requestStatus !== "rejected" && ["pending", "scheduled", "exam_completed"].includes(user.requestStatus);
            const isThisApplied = user && user.requestStatus !== "rejected" && user.requestedSchool === school.name && ["pending", "scheduled", "exam_completed"].includes(user.requestStatus);
            const isApprovedHere = user && user.role !== "unassigned" && user.requestStatus !== "rejected" && (user.schoolName === school.name || user.school === school.name);
            const cardBgColor = getSchoolDetails(school.name, "color");

            return (
              <div key={school._id} className="w-full bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-left flex flex-col">
                
                {/* School Cover Banner image */}
                <div className="w-full h-36 sm:h-48 md:h-52 relative bg-slate-900 overflow-hidden shrink-0">
                  {school.coverImage ? (
                    <img
                      src={getMediaUrl(school.coverImage)}
                      alt={`${school.name} Cover Banner`}
                      style={{ objectPosition: `center ${school.coverPosition !== undefined ? school.coverPosition : 50}%` }}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : school.schoolPhotos && school.schoolPhotos.length > 0 ? (
                    <img
                      src={getMediaUrl(school.schoolPhotos[0])}
                      alt={`${school.name} Cover Banner`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : school.photo ? (
                    <img
                      src={getMediaUrl(school.photo)}
                      alt={`${school.name} Cover Banner`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-r ${cardBgColor} flex items-center justify-center opacity-90`}>
                      <FaSchool className="text-white/20 text-6xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Right Active Status Tag over cover */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black tracking-wider uppercase rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Active Center
                    </span>
                  </div>
                </div>

                {/* Card Body Container */}
                <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 -mt-8 sm:-mt-10 relative z-10">
                  
                  {/* School Logo & Title Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                    <div className="flex items-end gap-3.5">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cardBgColor} text-white flex items-center justify-center shrink-0 shadow-lg border-4 border-white dark:border-[#0B132A] overflow-hidden`}>
                        {school.photo ? (
                          <img src={getMediaUrl(school.photo)} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <FaSchool className="text-xl sm:text-2xl" />
                        )}
                      </div>
                      <div className="min-w-0 pb-0.5">
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">{school.name}</h4>
                        {school.principalName ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                            <FaUser className="text-[10px] text-purple-500" /> Principal: {school.principalName}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                            <FaUser className="text-[10px] text-purple-500" /> Principal: Danny Thapar
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="self-start sm:self-end shrink-0">
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold max-w-full sm:max-w-xs truncate"
                        title={school.address || getSchoolDetails(school.name, "location")}
                      >
                        <FaMapMarkerAlt className="text-xs shrink-0 text-rose-500" />
                        <span className="truncate">{school.address || getSchoolDetails(school.name, "location")}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] p-3 sm:p-4 rounded-2xl">
                    {/* Students stat */}
                    <div className="flex items-center gap-2.5 p-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <FaUser className="text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{getSchoolDetails(school.name, "students", school.totalStudents)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-400 font-extrabold mt-1 uppercase tracking-wider truncate">Students</p>
                      </div>
                    </div>

                    {/* Teachers stat */}
                    <div className="flex items-center gap-2.5 p-1">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                        <FaGraduationCap className="text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{getSchoolDetails(school.name, "teachers", school.totalTeachers)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-400 font-extrabold mt-1 uppercase tracking-wider truncate">Teachers</p>
                      </div>
                    </div>

                    {/* Classes stat */}
                    <div className="flex items-center gap-2.5 p-1">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <FaBook className="text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{getSchoolDetails(school.name, "classes", school.totalClasses)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-400 font-extrabold mt-1 uppercase tracking-wider truncate">Classes</p>
                      </div>
                    </div>

                    {/* Events stat */}
                    <div className="flex items-center gap-2.5 p-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <FaCalendarAlt className="text-xs" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{getSchoolDetails(school.name, "events", school.totalEvents)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-400 font-extrabold mt-1 uppercase tracking-wider truncate">Events</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center gap-2.5 sm:gap-3 w-full border-t border-slate-100 dark:border-white/5 pt-3 sm:pt-4">
                    <button
                      onClick={() => handleViewDetails(school.name)}
                      className="flex-1 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-200 py-3 rounded-2xl text-xs font-extrabold transition hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-center active:scale-[0.98]"
                    >
                      View Details
                    </button>

                    {localStorage.getItem("loginSource") === "admin" || user?.role === "admin" || user?.requestedRole === "admin" ? (
                      <span className="flex-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-center py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <FaSchool className="text-xs text-purple-500" />
                        Registered School
                      </span>
                    ) : isApprovedHere ? (
                      <span className="flex-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider">
                        Joined
                      </span>
                    ) : isThisApplied ? (
                      <span className={`flex-1 text-center py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border ${
                        user.requestStatus === "scheduled"
                          ? "bg-teal-500/15 text-teal-600 border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400"
                          : user.requestStatus === "exam_completed"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>
                        {user.requestStatus === "scheduled" 
                          ? "Exam Scheduled" 
                          : user.requestStatus === "exam_completed" 
                            ? "Exam Completed" 
                            : "Pending Approval"}
                      </span>
                    ) : hasActiveRequest ? (
                      <button
                        disabled
                        className="flex-1 bg-slate-100 dark:bg-slate-800/40 text-slate-400 py-3 rounded-2xl text-xs font-extrabold cursor-not-allowed text-center"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSchool(school.name);
                          setAppointmentDate(""); setAppointmentTime(""); setAppointmentNotes("");
                          const source = localStorage.getItem("loginSource");
                          if (source === "teacher") {
                            setRequestedRole("teacher");
                          } else if (source === "student") {
                            setRequestedRole("student");
                          }
                          setShowJoinModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer active:scale-[0.98]"
                      >
                        <span>Join School</span>
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-3xl">
          <FaSchool className="text-slate-350 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold italic">No schools registered in system.</p>
        </div>
      )}

      {appointments.length > 0 && (
        <div className="mt-8 border-t border-slate-200/60 dark:border-white/10 pt-6 text-left">
          <h3 className="text-sm font-black text-slate-800 dark:text-white">My Teacher Appointments</h3>
          <div className="mt-3 space-y-2">
            {appointments.map((appointment) => (
              <div className="rounded-xl border bg-slate-50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/10 p-3 text-xs dark:text-white" key={appointment._id}>
                <b>{appointment.schoolName}</b> · {new Date(appointment.date).toLocaleDateString()} at {appointment.time} · {appointment.mode}{" "}
                <span className="ml-2 font-bold text-violet-600">{appointment.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (() => {
        const loginSource = localStorage.getItem("loginSource");
        const isTeacherContext = location.pathname.startsWith("/teacher") || loginSource === "teacher" || user?.role === "teacher" || user?.requestedRole === "teacher";
        const isStudentContext = location.pathname.startsWith("/student") || loginSource === "student" || user?.role === "student" || user?.requestedRole === "student";

        const effectiveRole = isTeacherContext ? "teacher" : "student";
        const showStudent = !isTeacherContext;
        const showTeacher = isTeacherContext || (!isStudentContext && loginSource !== "student");
        const gridColsClass = showStudent && showTeacher ? "grid-cols-2" : "grid-cols-1";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
            <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200 text-left">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                  <FaSchool className="text-2xl" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Apply to Join</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Submit request to join {selectedSchool}</p>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-2">Select Role</label>
                  <div className={`grid ${gridColsClass} gap-3`}>
                    {showStudent && (
                      <button
                        type="button"
                        onClick={() => setRequestedRole("student")}
                        disabled={loginSource === "student"}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                          effectiveRole === "student"
                            ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                            : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-xl">🎓</span>
                        <span className="text-xs font-black">Student</span>
                      </button>
                    )}
                    {showTeacher && (
                      <button
                        type="button"
                        onClick={() => setRequestedRole("teacher")}
                        disabled={loginSource === "teacher"}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                          effectiveRole === "teacher"
                            ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                            : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <span className="text-xl">💼</span>
                        <span className="text-xs font-black">Teacher</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/15 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3.5 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default SchoolDirectory;
