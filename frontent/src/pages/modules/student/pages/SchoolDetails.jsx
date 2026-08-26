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
  FaFileAlt,
  FaSearch,
  FaCheckCircle,
  FaQuoteLeft,
  FaTimes,
  FaShareAlt,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SchoolDetails() {
  const params = useParams();
  const location = useLocation();
  
  let name = params.name;
  if (!name) {
    const match = location.pathname.match(/\/pending\/schools\/(.+)/);
    if (match) {
      name = decodeURIComponent(match[1]);
    }
  }

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [school, setSchool] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Navigation tabs state
  const [activeSubTab, setActiveSubTab] = useState("details"); // "details" or "teachers"
  
  // Teachers filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");

  // Selected teacher for detail modal
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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

      // Fetch events & teachers list in parallel
      const [upRes, compRes, teachersRes] = await Promise.all([
        axios.get(`${API}/api/events/upcoming?schoolName=${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/events/completed?schoolName=${encodeURIComponent(name)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/api/schools/${encodeURIComponent(name)}/teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error("Error loading school teachers:", err);
          return { data: [] };
        })
      ]);

      setUpcomingEvents(upRes.data || []);
      setCompletedEvents(compRes.data || []);
      setTeachers(teachersRes.data || []);

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

  // Filter teachers list
  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchQuery.toLowerCase();
    const nameMatch = teacher.name?.toLowerCase().includes(term);
    const qualMatch = teacher.qualification?.toLowerCase().includes(term);
    
    // Subject filter
    let subjectMatch = true;
    if (selectedSubject !== "All") {
      subjectMatch = (teacher.subjects || []).some(s => s.name === selectedSubject);
    }

    // Class filter
    let classMatch = true;
    if (selectedClass !== "All") {
      classMatch = (teacher.classes || []).some(c => c.name === selectedClass);
    }

    return (nameMatch || qualMatch) && subjectMatch && classMatch;
  });

  // Extract unique subjects & classes from all loaded teachers for dropdowns
  const availableSubjects = Array.from(new Set(teachers.flatMap(t => (t.subjects || []).map(s => s.name))));
  const availableClasses = Array.from(new Set(teachers.flatMap(t => (t.classes || []).map(c => c.name)))).sort();

  // Photo gallery renderer
  const renderPhotoGallery = () => {
    const photos = school.schoolPhotos || [];
    if (photos.length === 0) {
      if (school.photo) {
        return (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-[280px]">
            <img src={school.photo} alt="School front" className="w-full h-full object-cover" />
          </div>
        );
      }
      return null;
    }

    if (photos.length === 1) {
      return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-[280px]">
          <img src={photos[0]} alt="School front" className="w-full h-full object-cover" />
        </div>
      );
    }

    const displayPhotos = photos.slice(0, 5);
    const mainPhoto = displayPhotos[0];
    const rightPhotos = displayPhotos.slice(1);

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 h-[320px] select-none">
        {/* Large Left Image */}
        <div className="md:col-span-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-full relative group">
          <img src={mainPhoto} alt="Campus" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
        </div>
        
        {/* Right Grid */}
        {rightPhotos.length > 0 && (
          <div className="md:col-span-2 grid grid-cols-2 gap-3.5 h-full">
            {rightPhotos.map((photoUrl, idx) => {
              const isLast = idx === rightPhotos.length - 1 && photos.length > 5;
              return (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-full relative group">
                  <img src={photoUrl} alt="Campus view" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                  {isLast && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-extrabold text-sm backdrop-blur-[2px]">
                      +{photos.length - 5} More Photos
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* ── BACK BUTTON & BREADCRUMB ── */}
      <div className="flex items-center justify-between w-full select-none px-1">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] transition cursor-pointer bg-white dark:bg-[#0B132A] border border-slate-200/40 dark:border-white/5 px-3 py-1.5 rounded-xl shadow-sm"
        >
          <FaChevronLeft className="text-[10px]" /> Back to Directory
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Schools &gt; {school.name} &gt; {activeSubTab === "details" ? "Details" : "Principal & Teachers"}
        </span>
      </div>

      {/* ── SCHOOL MAIN HEADER CARD ── */}
      <div className="relative bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-xl overflow-hidden text-left transition-colors duration-200">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[60px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* School Logo */}
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {school.photo ? (
                <img src={school.photo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <FaSchool className="text-3xl text-purple-500" />
              )}
            </div>
            {/* School Title & Badges */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{school.name}</h1>
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm"><FaCheckCircle /></span>
              </div>
              
              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 select-none">
                {school.affiliation && (
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-450 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-blue-500/15">
                    {school.affiliation}
                  </span>
                )}
                {school.coEducational && (
                  <span className="bg-purple-500/10 text-purple-600 dark:text-purple-450 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-purple-500/15">
                    {school.coEducational}
                  </span>
                )}
                {school.schoolOperationType && (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-emerald-500/15">
                    {school.schoolOperationType}
                  </span>
                )}
                {school.category && (
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-455 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-500/15">
                    {school.category}
                  </span>
                )}
              </div>

              {/* Contacts row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                {school.address && (
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-slate-400 text-[10px]">📍</span>
                    <span className="truncate max-w-[280px]" title={school.address}>{school.address}</span>
                  </div>
                )}
                {school.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-slate-400 text-[10px]">📞</span>
                    <span>{school.phoneNumber}</span>
                  </div>
                )}
                {school.email && (
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-slate-400 text-[10px]">✉️</span>
                    <span>{school.email}</span>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center gap-1.5">
                    <span className="shrink-0 text-slate-400 text-[10px]">🌐</span>
                    <a href={`https://${school.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#7C3AED] dark:text-[#38BDF8]">
                      {school.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="flex flex-row md:flex-col gap-3.5 self-stretch justify-end md:justify-start shrink-0">
            <button
              onClick={handleBack}
              className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 px-5 rounded-xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer text-center"
            >
              Apply for Admission
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("School details link copied to clipboard!");
              }}
              className="flex-1 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-355 py-2.5 px-5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FaShareAlt className="text-xs text-slate-400" /> Share School
            </button>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex items-center gap-6 mt-5 select-none">
          <button
            onClick={() => setActiveSubTab("details")}
            className={`pb-2.5 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer ${
              activeSubTab === "details"
                ? "text-[#7C3AED] dark:text-[#38BDF8]"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-305"
            }`}
          >
            {school.name || "School"} Details
            {activeSubTab === "details" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7C3AED] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("teachers")}
            className={`pb-2.5 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer ${
              activeSubTab === "teachers"
                ? "text-[#7C3AED] dark:text-[#38BDF8]"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-605 dark:hover:text-slate-305"
            }`}
          >
            Principal & Teachers Info
            {activeSubTab === "teachers" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7C3AED] dark:bg-[#38BDF8] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeSubTab === "details" ? (
        /* ======================== SCHOOL DETAILS TAB ======================== */
        <div className="space-y-6 animate-fadeIn">
          {/* Photo Gallery Grid */}
          {renderPhotoGallery()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* School Description */}
              {school.description && (
                <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">About our school</h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: school.description }} 
                    className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold whitespace-pre-line prose dark:prose-invert max-w-none" 
                  />
                </div>
              )}

              {/* School categories list */}
              {school.schoolCategoriesList && school.schoolCategoriesList.length > 0 && (
                <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Categories & Facilities</h3>
                  <div className="flex flex-wrap gap-2 select-none">
                    {school.schoolCategoriesList.map((cat, idx) => (
                      <span key={idx} className="bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#7C3AED]/15 dark:border-[#38BDF8]/10">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-655 dark:text-slate-355 font-semibold">
                  {[
                    "Modern Classrooms & Smart Learning",
                    "Well Equipped Science & Computer Laboratories",
                    "Library with Extensive Digital & Print Resources",
                    "Sports Complex, Basketball Court & Playgrounds",
                    "Experienced, Caring & Qualified Faculty",
                    "Safe School Transport & Bus Facility Available",
                    "CCTV Surveillance & Safe Secure Campus Environment",
                    "Co-curricular Activities & Creative Clubs"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-500 shrink-0 text-[10px]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              {/* School Highlights Card */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-5 rounded-3xl shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">School Highlights</h3>
                <div className="grid grid-cols-2 gap-3 select-none">
                  <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] p-3.5 rounded-2xl">
                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{school.totalStudents ? `${school.totalStudents.toLocaleString()}+` : "1,250+"}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Students</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] p-3.5 rounded-2xl">
                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{school.totalTeachers ? `${school.totalTeachers}+` : "85+"}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Teachers</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] p-3.5 rounded-2xl">
                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{school.totalClasses ? `${school.totalClasses}+` : "30+"}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Classes</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] p-3.5 rounded-2xl">
                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">98%</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Pass Rate</p>
                  </div>
                </div>
              </div>

              {/* Admission Information Card */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-5 rounded-3xl shadow-md text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Admission Information</h3>
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="text-slate-400 dark:text-slate-500">Admission Open For</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">{school.academicYear || "2026 - 2027"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="text-slate-400 dark:text-slate-500">Classes</span>
                    <span className="text-slate-800 dark:text-white font-extrabold truncate max-w-[140px]">{school.availableClasses || "Nursery to Class XII"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="text-slate-400 dark:text-slate-500">Admission Start Date</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">01 Dec 2026</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="text-slate-400 dark:text-slate-500">Last Date to Apply</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">31 May 2027</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400 dark:text-slate-500">Admission Process</span>
                    <span className="text-purple-650 dark:text-sky-400 font-extrabold">{school.admissionProcess || "Direct Admission"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* At a Glance Section */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">{school.name} at a Glance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center select-none">
              <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl flex flex-col items-center gap-1.5">
                <span className="text-xl">🏆</span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">20+</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Years of Excellence</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl flex flex-col items-center gap-1.5">
                <span className="text-xl">👥</span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">14.7:1</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Student-Teacher Ratio</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl flex flex-col items-center gap-1.5">
                <span className="text-xl">🏅</span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">5+</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Awards Won</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl flex flex-col items-center gap-1.5">
                <span className="text-xl">🏀</span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">10+</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Co-Curricular Clubs</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl flex flex-col items-center gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-xl">🛡️</span>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">100%</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Safe Campus</p>
              </div>
            </div>
          </div>

          {/* School Events List */}
          {(upcomingEvents.length > 0 || completedEvents.length > 0) && (
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">School Events</h3>
              <div className="space-y-6">
                {upcomingEvents.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase text-[#7C3AED] dark:text-[#38BDF8] tracking-widest mb-3">Upcoming Events</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {upcomingEvents.map((ev) => (
                        <div key={ev._id} className="p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition">
                          <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h5>
                          {ev.subtitle && <p className="text-[9px] font-bold text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wide mt-0.5">{ev.subtitle}</p>}
                          <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-2 select-none">
                            <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(ev.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span className="flex items-center gap-1"><FaClock /> {ev.eventTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {completedEvents.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-550 tracking-widest mb-3">Completed Events</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {completedEvents.map((ev) => (
                        <div key={ev._id} className="p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:border-slate-300 dark:hover:border-white/10 transition">
                          <h5 className="text-xs font-black text-slate-800 dark:text-white leading-snug">{ev.title}</h5>
                          {ev.subtitle && <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{ev.subtitle}</p>}
                          <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-2 select-none">
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

          {/* Bottom Call to Action */}
          <div className="bg-gradient-to-r from-violet-600/10 to-indigo-700/10 dark:from-violet-600/10 dark:to-indigo-700/10 border border-violet-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left select-none animate-pulse">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Ready to be a part of {school.name}?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Begin your admission journey today and give your child the best start.</p>
            </div>
            <button
              onClick={handleBack}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 px-6 rounded-2xl text-xs font-extrabold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer w-full sm:w-auto text-center shrink-0"
            >
              Apply for Admission
            </button>
          </div>
        </div>
      ) : (
        /* ======================== PRINCIPAL & TEACHERS TAB ======================== */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Principal Profile Card */}
          {school.principalName && (
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-md text-left relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#38BDF8]/5 blur-[60px] pointer-events-none" />
              
              {/* Principal Photo */}
              <div className="w-44 h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 shadow-md relative group select-none self-center md:self-start">
                {school.principalPhoto ? (
                  <img src={school.principalPhoto} alt={school.principalName} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 text-5xl font-black">
                    {school.principalName.split(" ").map(w => w[0]).join("").toUpperCase()}
                  </div>
                )}
              </div>

              {/* Principal Bio / Contact Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#7C3AED] dark:text-[#38BDF8] tracking-widest">Our Principal</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{school.principalName}</h2>
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm"><FaCheckCircle /></span>
                  </div>
                  <p className="text-xs text-slate-455 dark:text-slate-500 font-bold uppercase mt-0.5">{school.principalDesignation || "Principal, G.D Academy"}</p>
                </div>

                {school.principalIntroduction && (
                  <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold italic">
                    "{school.principalIntroduction}"
                  </p>
                )}

                {/* Contact information list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-550 dark:text-slate-400 font-bold pt-3 border-t border-slate-100 dark:border-white/5">
                  {school.principalEmail && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] shrink-0">✉️</span>
                      <span>{school.principalEmail}</span>
                    </div>
                  )}
                  {school.principalPhone && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] shrink-0">📞</span>
                      <span>{school.principalPhone}</span>
                    </div>
                  )}
                  {school.principalLeadershipSince && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px] shrink-0">🗓️</span>
                      <span>Joined: {new Date(school.principalLeadershipSince).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quote details block */}
              <div className="w-full md:w-[240px] bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2xl self-stretch flex flex-col justify-between shrink-0 relative">
                <FaQuoteLeft className="text-slate-200 dark:text-white/5 text-4xl absolute top-3 left-3 pointer-events-none" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold relative z-10 leading-relaxed italic pt-2">
                  "Education is the most powerful weapon which you can use to change the world."
                </p>
                <div className="border-t border-slate-200/50 dark:border-white/5 pt-2 mt-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                  Visionary leadership
                </div>
              </div>
            </div>
          )}

          {/* Stats Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none animate-fadeIn">
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-4 rounded-3xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20 text-lg">
                🎓
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">20+ Years</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Experience</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-4 rounded-3xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 text-lg">
                👥
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">5000+ Mentored</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Students</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-4 rounded-3xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 text-lg">
                🏆
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">25+ Awards</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Received</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-4 rounded-3xl shadow-sm flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 text-lg">
                🌟
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Visionary Leader</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">In Education</p>
              </div>
            </div>
          </div>

          {/* Teachers Section */}
          <div className="space-y-5 text-left animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Our Faculty & Teachers</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Meet the highly qualified teachers at {school.name}</p>
              </div>
              
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-3 select-none">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                  />
                </div>
                
                {/* Subject Selector */}
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Subjects</option>
                  {availableSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>

                {/* Class Selector */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  {availableClasses.map((cls, idx) => (
                    <option key={idx} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Faculty List Grid */}
            {filteredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher._id} className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition hover:shadow-md">
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      {/* Teacher photo */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-[1.5px] shadow-sm select-none">
                        {teacher.avatar ? (
                          <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-extrabold text-white">
                            {teacher.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          {teacher.name}
                          {teacher.rating && <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">★ {teacher.rating.toFixed(1)}</span>}
                        </h4>
                        
                        <p className="text-xs text-slate-455 dark:text-slate-500 font-bold">
                          {teacher.qualification ? `${teacher.qualification} Teacher` : "Senior Teacher"}
                        </p>

                        {/* Subject Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {(teacher.subjects || []).map((sub, idx) => (
                            <span key={idx} className="bg-purple-500/10 text-purple-650 dark:text-purple-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-purple-500/15">
                              {sub.name}
                            </span>
                          ))}
                          {teacher.classes && teacher.classes.length > 0 && (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                              Classes: {teacher.classes.map(c => `${c.name}${c.section ? ` ${c.section}` : ""}`).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Teacher contact & details */}
                    <div className="flex flex-col sm:items-end gap-3.5 self-stretch sm:self-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                      <div className="text-xs text-slate-555 dark:text-slate-450 font-bold space-y-1 text-left sm:text-right">
                        <p className="flex items-center gap-1.5 sm:justify-end"><span>✉️</span> {teacher.email}</p>
                        {teacher.phoneNumber && <p className="flex items-center gap-1.5 sm:justify-end"><span>📞</span> {teacher.phoneNumber}</p>}
                      </div>
                      
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="border border-slate-200/60 dark:border-white/10 text-slate-655 dark:text-slate-350 py-2 px-4 rounded-xl text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-center select-none"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-3xl">
                <FaChalkboardTeacher className="text-slate-355 dark:text-slate-700 text-4xl mx-auto mb-3" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold italic">No teachers found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TEACHER PROFILE DETAILS MODAL ── */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl w-full max-w-lg relative animate-scaleUp text-left max-h-[85vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-605 transition cursor-pointer animate-fadeIn"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-[1.5px]">
                {selectedTeacher.avatar ? (
                  <img src={selectedTeacher.avatar} alt={selectedTeacher.name} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg font-extrabold text-white">
                    {selectedTeacher.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {selectedTeacher.name}
                  <span className="text-xs text-amber-500 font-extrabold">★ {selectedTeacher.rating?.toFixed(1) || "4.8"}</span>
                </h3>
                <p className="text-xs text-slate-455 dark:text-slate-500 font-bold uppercase mt-0.5">
                  {selectedTeacher.qualification || "Qualification: Not specified"}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">Teacher ID: {selectedTeacher.employeeId || "T-0128"}</p>
              </div>
            </div>

            {/* Details Content */}
            <div className="space-y-5">
              {/* Professional info */}
              <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.04] p-4 rounded-2xl space-y-3.5 text-xs">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Professional Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Experience</p>
                    <p className="text-slate-800 dark:text-white font-extrabold mt-0.5">{selectedTeacher.experience || "8+ Years"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Joining Date</p>
                    <p className="text-slate-800 dark:text-white font-extrabold mt-0.5">
                      {selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "12 Jul 2021"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Teaching Subjects</p>
                    <p className="text-slate-800 dark:text-white font-extrabold mt-0.5">
                      {(selectedTeacher.subjects || []).map(s => s.name).join(", ") || "All Subjects"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Assigned Classes</p>
                    <p className="text-slate-800 dark:text-white font-extrabold mt-0.5">
                      {selectedTeacher.classes && selectedTeacher.classes.length > 0
                        ? selectedTeacher.classes.map(c => `${c.name}${c.section ? ` ${c.section}` : ""}`).join(", ")
                        : "General classes"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal/Contact Details */}
              <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.04] p-4 rounded-2xl space-y-3 text-xs">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Contact Details</h4>
                <div className="space-y-2 font-bold text-slate-655 dark:text-slate-350">
                  <p className="flex items-center gap-2"><span>✉️</span> <span className="font-semibold text-slate-400">Email:</span> {selectedTeacher.email}</p>
                  <p className="flex items-center gap-2"><span>📞</span> <span className="font-semibold text-slate-400">Phone:</span> {selectedTeacher.phoneNumber || "Not provided"}</p>
                  {selectedTeacher.dob && <p className="flex items-center gap-2"><span>🎂</span> <span className="font-semibold text-slate-400">DOB:</span> {selectedTeacher.dob}</p>}
                  {selectedTeacher.gender && <p className="flex items-center gap-2"><span>👤</span> <span className="font-semibold text-slate-400">Gender:</span> {selectedTeacher.gender}</p>}
                </div>
              </div>

              {/* Teacher gallery/activity photos */}
              {selectedTeacher.galleryPhotos && selectedTeacher.galleryPhotos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Activity Photos</h4>
                  <div className="grid grid-cols-5 gap-2 select-none">
                    {selectedTeacher.galleryPhotos.map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative group">
                        <img src={photo.url} alt="Activity" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 cursor-pointer text-center"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolDetails;
