import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaSchool,
  FaUser,
  FaUsers,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaChevronLeft,
  FaAward,
  FaFileAlt
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SchoolDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [school, setSchool] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (name) {
      fetchSchoolDetails();
    }
  }, [name]);

  const fetchSchoolDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch School Details
      const schoolRes = await axios.get(`${API}/api/schools/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchool(schoolRes.data);

      // Fetch events using schoolName query parameter (accessible to standard/unassigned users)
      const [upRes, compRes] = await Promise.all([
        axios.get(`${API}/api/events/upcoming?schoolName=${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/events/completed?schoolName=${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUpcomingEvents(upRes.data || []);
      setCompletedEvents(compRes.data || []);

    } catch (err) {
      console.error("Error loading school details:", err);
      if (err.response?.status === 404) {
        setError("School details not found in the database.");
      } else {
        setError("Failed to fetch school details from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const basePath = location.pathname.startsWith("/pending") ? "/pending" : "/student";
    navigate(`${basePath}/schools`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading details...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="max-w-md mx-auto py-12 px-6 bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-white/10 rounded-3xl text-center shadow-xl">
        <FaSchool className="text-5xl text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Error Loading Details</h3>
        <p className="text-xs text-slate-400 mt-1 font-semibold">{error || "School does not exist."}</p>
        <button
          onClick={handleBack}
          className="mt-6 inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
        >
          <FaChevronLeft /> Go Back
        </button>
      </div>
    );
  }

  // Checks for optional fields (Strict Conditional Display Rule)
  // Hide section completely if the field is null, undefined, empty string, or empty array.
  const isPresent = (val) => val !== null && val !== undefined && val !== "";
  const isArrayPresent = (arr) => Array.isArray(arr) && arr.length > 0;

  const showPrincipal = isPresent(school.principalName);
  const showTeachers = isPresent(school.totalTeachers);
  const showStudents = isPresent(school.totalStudents);
  const showClasses = isPresent(school.totalClasses);
  const showAvailableClasses = isPresent(school.availableClasses);
  const showTypes = isArrayPresent(school.schoolTypes);
  
  // Boolean displays must not hide when false
  const showAdmissionExam = school.admissionExam !== null && school.admissionExam !== undefined;
  const showDirectAdmission = school.directAdmission !== null && school.directAdmission !== undefined;
  const showAdmissionProcessSection = showAdmissionExam || showDirectAdmission;

  const showDescription = isPresent(school.description);
  const showUpcomingEvents = isArrayPresent(upcomingEvents);
  const showCompletedEvents = isArrayPresent(completedEvents);
  const showEventsSection = showUpcomingEvents || showCompletedEvents;

  // Let's check if there are any school stats to display
  const showStatsSection = showTeachers || showStudents || showClasses || showAvailableClasses;

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header card with back button and banner */}
      <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-xl overflow-hidden text-left transition-colors duration-200">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[60px] pointer-events-none" />
        
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] transition cursor-pointer mb-5 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-3 py-1.5 rounded-xl"
        >
          <FaChevronLeft className="text-[10px]" /> Back to Directory
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-2xl shadow-md shrink-0">
            <FaSchool />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{school.name}</h1>
            <p className="text-[10px] text-[#7C3AED] dark:text-[#38BDF8] font-extrabold uppercase tracking-widest mt-0.5">School Details Profile</p>
          </div>
        </div>
      </div>

      {/* Grid containing principal & about app description */}
      {(showPrincipal || showDescription || showTypes) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Description section */}
            {showDescription && (
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">About Our School</h3>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">
                  {school.description}
                </p>
              </div>
            )}

            {/* School Types section */}
            {showTypes && (
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">School Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {school.schoolTypes.map((type, idx) => (
                    <span key={idx} className="bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#7C3AED]/15 dark:border-[#38BDF8]/10">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar block (Principal Details) */}
          {showPrincipal && (
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md h-full flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#38BDF8]/10 blur-[40px] pointer-events-none" />
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Principal Leadership</span>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 my-4 text-lg">
                  <FaUser />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{school.principalName}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">Head of Institution</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics section */}
      {showStatsSection && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Institutional Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {showTeachers && (
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaChalkboardTeacher className="text-sm text-teal-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Teachers</span>
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-white">{school.totalTeachers}</p>
              </div>
            )}
            {showStudents && (
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaUsers className="text-sm text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Students</span>
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-white">{school.totalStudents}</p>
              </div>
            )}
            {showClasses && (
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaSchool className="text-sm text-purple-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Total Classes</span>
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-white">{school.totalClasses}</p>
              </div>
            )}
            {showAvailableClasses && (
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaDoorOpen className="text-sm text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Available Classes</span>
                </div>
                <p className="text-xs font-black text-slate-700 dark:text-white tracking-wide truncate" title={school.availableClasses}>
                  {school.availableClasses}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admission Process section */}
      {showAdmissionProcessSection && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Admission Process</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showAdmissionExam && (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FaFileAlt className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Interest / Entrance Exam</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                  school.admissionExam
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}>
                  {school.admissionExam ? "Yes" : "No"}
                </span>
              </div>
            )}
            {showDirectAdmission && (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FaAward className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Direct Admission</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                  school.directAdmission
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}>
                  {school.directAdmission ? "Yes" : "No"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events section */}
      {showEventsSection && (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">School Events</h3>
          
          <div className="space-y-6">
            {/* Upcoming events */}
            {showUpcomingEvents && (
              <div>
                <h4 className="text-[10px] font-extrabold uppercase text-[#7C3AED] dark:text-[#38BDF8] tracking-widest mb-3">Upcoming Events</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.map((ev) => (
                    <div key={ev._id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition">
                      <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h5>
                      {ev.subtitle && <p className="text-[9px] font-bold text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wide mt-0.5">{ev.subtitle}</p>}
                      <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-2">
                        <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(ev.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><FaClock /> {ev.eventTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed events */}
            {showCompletedEvents && (
              <div>
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-550 tracking-widest mb-3">Completed Events</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedEvents.map((ev) => (
                    <div key={ev._id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition">
                      <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h5>
                      {ev.subtitle && <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{ev.subtitle}</p>}
                      <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-2">
                        <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(ev.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><FaClock /> {ev.eventTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolDetails;
