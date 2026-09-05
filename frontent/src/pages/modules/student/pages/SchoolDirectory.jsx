import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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

const SORA = "'Sora', sans-serif";

function SchoolDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
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

    const hasActiveRequest = ["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool;
    if (hasActiveRequest) {
      alert("You already have an active or pending join request.");
      return;
    }

    setSubmitting(true);
    axios.put(
      `${API}/api/auth/join-request`,
      { schoolName: selectedSchool, role: requestedRole },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => {
        setUser((prev) => ({
          ...prev,
          requestedSchool: selectedSchool,
          requestedRole: requestedRole,
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
    const basePath = location.pathname.startsWith("/pending") ? "/pending" : "/student";
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
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto p-0 md:p-4 bg-transparent transition-all duration-200">
      
      {/* Header section with SVG illustration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 px-1 text-left">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">School Directory</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Available Schools
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">Explore centers and submit a request to join</p>
        </div>
        
        {/* Modern school building SVG illustration */}
        <div className="hidden sm:block shrink-0">
          <svg className="w-32 h-32 text-indigo-500 drop-shadow-lg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <div className="flex gap-3 mb-6 px-1">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search schools, location or principal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-xs shadow-sm"
          />
        </div>
      </div>

      {/* Schools Cards List */}
      {filteredSchools.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredSchools.map((school) => {
            const hasActiveRequest = user && (["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool);
            const isThisApplied = user && user.requestedSchool === school.name;
            const isApprovedHere = user && user.schoolName === school.name;
            const cardBgColor = getSchoolDetails(school.name, "color");

            return (
              <div key={school._id} className="w-full bg-white dark:bg-[#0B132A] rounded-2.5xl sm:rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm p-3.5 sm:p-5 flex flex-col gap-3.5 sm:gap-5 text-left transition hover:shadow-md duration-200">
                
                {/* School Card Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cardBgColor} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                      <FaSchool className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{school.name}</h4>
                      {school.principalName ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                          <FaUser className="text-[10px]" /> Principal: {school.principalName}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                          <FaUser className="text-[10px]" /> Principal: Danny Thapar
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-3.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Center
                      </span>
                    </div>
                  </div>
                  <div className="self-start sm:self-center shrink-0">
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-full text-slate-550 dark:text-slate-400 text-xs font-semibold max-w-[260px] sm:max-w-xs truncate"
                      title={school.address || getSchoolDetails(school.name, "location")}
                    >
                      <FaMapMarkerAlt className="text-xs shrink-0 text-slate-450" />
                      <span className="truncate">{school.address || getSchoolDetails(school.name, "location")}</span>
                    </span>
                  </div>
                </div>

                {/* Stats Row Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.04] p-3 sm:p-4 rounded-2.5xl">
                  {/* Students stat */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <FaUser className="text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-950 dark:text-white leading-none">{getSchoolDetails(school.name, "students", school.totalStudents)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">Students</p>
                    </div>
                  </div>

                  {/* Teachers stat */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <FaGraduationCap className="text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-955 dark:text-white leading-none">{getSchoolDetails(school.name, "teachers", school.totalTeachers)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">Teachers</p>
                    </div>
                  </div>

                  {/* Classes stat */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <FaBook className="text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-955 dark:text-white leading-none">{getSchoolDetails(school.name, "classes", school.totalClasses)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">Classes</p>
                    </div>
                  </div>

                  {/* Events stat */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <FaCalendarAlt className="text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-955 dark:text-white leading-none">{getSchoolDetails(school.name, "events", school.totalEvents)}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wider">Events</p>
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center gap-2.5 sm:gap-3 w-full border-t border-slate-100 dark:border-white/5 pt-3 sm:pt-4">
                  <button
                    onClick={() => handleViewDetails(school.name)}
                    className="flex-1 border border-slate-200/60 dark:border-white/10 text-slate-655 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-center font-sans"
                  >
                    View Details
                  </button>

                  {isApprovedHere ? (
                    <span className="flex-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider">
                      Joined
                    </span>
                  ) : isThisApplied ? (
                    <span className={`flex-1 text-center py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider border ${
                      user.requestStatus === "scheduled"
                        ? "bg-teal-500/15 text-teal-650 border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-450"
                        : user.requestStatus === "exam_completed"
                          ? "bg-emerald-500/15 text-emerald-650 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-450"
                          : "bg-amber-500/15 text-amber-500 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-450"
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
                      className="flex-1 bg-slate-100 dark:bg-slate-800/40 text-slate-400/50 py-3.5 rounded-2xl text-xs font-bold cursor-not-allowed text-center"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSchool(school.name);
                        setAppointmentDate(""); setAppointmentTime(""); setAppointmentNotes(""); setShowJoinModal(true);
                      }}
                      className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-[#7C3AED]/20 cursor-pointer font-sans"
                    >
                      Join School <FaArrowRight className="text-[10px]" />
                    </button>
                  )}
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
      {showJoinModal && (
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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestedRole("student")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "student"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xl">🎓</span>
                    <span className="text-xs font-black">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestedRole("teacher")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "teacher"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xl">💼</span>
                    <span className="text-xs font-black">Teacher</span>
                  </button>
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
      )}
    </div>
  );
}

export default SchoolDirectory;
