import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { 
  FaBook, 
  FaCalendarAlt, 
  FaDownload, 
  FaEdit, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLayerGroup, 
  FaUserGraduate, 
  FaClipboardList, 
  FaCheckCircle, 
  FaChevronRight, 
  FaClock, 
  FaExclamationTriangle, 
  FaTrophy, 
  FaRegCalendarAlt, 
  FaChartLine 
} from "react-icons/fa";
import SyllabusTab from "../../../../../components/syllabus/SyllabusTab";

const SORA = "'Sora', sans-serif";

// Segment SVG circular progress for Syllabus Overview
function SVGProgressRing({ value }) {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center select-none">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} className="stroke-slate-100 dark:stroke-white/[0.04] fill-none" strokeWidth={strokeWidth} />
        <circle 
          cx="48" 
          cy="48" 
          r={radius} 
          className="stroke-purple-500 fill-none" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className="text-base font-black text-slate-950 dark:text-white">{value}%</span>
        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Overall</span>
      </div>
    </div>
  );
}

function SubjectDetails() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedClassForSyllabus, setSelectedClassForSyllabus] = useState(searchParams.get("class") || "");

  // Fetch subject details on load
  const fetchSubjectDetails = async (classNameParam) => {
    try {
      const activeClass = classNameParam || selectedClassForSyllabus || searchParams.get("class") || "";
      const url = activeClass
        ? `${API}/api/teacher/my-subjects/${subjectId}/details?className=${encodeURIComponent(activeClass)}`
        : `${API}/api/teacher/my-subjects/${subjectId}/details`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading subject details:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectDetails();
  }, [subjectId, API, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-400" style={{ fontFamily: SORA }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading subject details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-slate-400" style={{ fontFamily: SORA }}>
        <FaExclamationTriangle className="text-2xl mx-auto mb-3 text-amber-500" />
        <p className="text-sm font-bold text-slate-800 dark:text-white">Subject details not found</p>
        <Link to="/teacher/my-subjects" className="text-xs text-purple-500 hover:underline mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  const { subjectInfo, teacherInfo, academicMetadata, assignedClasses: rawAssignedClasses, timetable, exams, assignments, progressOverview } = data;

  const sortClasses = (list) => {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      const numA = parseInt(String(a.rawName || a.name || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(String(b.rawName || b.name || "").replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return String(a.section || "").localeCompare(String(b.section || ""));
    });
  };

  const assignedClasses = sortClasses(rawAssignedClasses);

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Subject Details</h1>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <Link to="/teacher/dashboard" className="hover:underline">Dashboard</Link>
            <span>&gt;</span>
            <Link to="/teacher/my-subjects" className="hover:underline">My Subjects</Link>
            <span>&gt;</span>
            <span className="text-purple-500">{subjectInfo.name} ({subjectInfo.code})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-transparent text-purple-650 hover:bg-purple-500/10 border border-purple-500/20 transition-all cursor-pointer">
            <FaDownload /> Download Report
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-650/15 transition-all cursor-pointer">
            <FaEdit /> Edit Subject
          </button>
        </div>
      </div>

      {/* Main Subject Header Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-stretch gap-6 relative overflow-hidden">
        
        {/* Left Column: Subject Name and description */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 select-none">
                  <FaBook className="text-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">{subjectInfo.name}</h2>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider select-none">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">{subjectInfo.code} &bull; Core Subject</p>
                </div>
              </div>

              {/* Class Filter Dropdown in Header */}
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">SELECT CLASS:</span>
                <select
                  value={selectedClassForSyllabus || "All"}
                  onChange={(e) => {
                    setSelectedClassForSyllabus(e.target.value);
                    fetchSubjectDetails(e.target.value);
                  }}
                  className="bg-transparent text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="dark:bg-[#0F172A] text-slate-900 dark:text-white font-bold">All Classes (Overall Aggregate)</option>
                  {assignedClasses.map((c, i) => (
                    <option key={c._id || i} value={c.name} className="dark:bg-[#0F172A] text-slate-900 dark:text-white font-bold">
                      {c.name} ({c.studentCount} Students)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-medium mb-4 max-w-xl">
              {subjectInfo.description}
            </p>
          </div>
          
          {/* Card footer mini counters */}
          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-450 uppercase tracking-wide border-t border-slate-100 dark:border-white/[0.03] pt-4 select-none">
            <div>Classes: <span className="text-slate-800 dark:text-white font-extrabold">{selectedClassForSyllabus && selectedClassForSyllabus !== "All" ? `1 (${selectedClassForSyllabus})` : `${subjectInfo.classesCount} Total`}</span></div>
            <div>Students: <span className="text-slate-800 dark:text-white font-extrabold">{(data?.students || []).length}</span></div>
            <div>Chapters: <span className="text-slate-800 dark:text-white font-extrabold">{subjectInfo.chapters}</span></div>
            <div>Progress: <span className="text-purple-500 font-extrabold">{subjectInfo.progress}%</span></div>
          </div>
        </div>

        {/* Middle Column: Teacher Profile Widget */}
        <div className="md:w-72 border-t md:border-t-0 md:border-l md:border-r border-slate-100 dark:border-white/[0.04] px-0 md:px-6 py-4 md:py-0 flex flex-col justify-center">
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 select-none">Subject Teacher</p>
          <div className="flex items-center gap-3">
            {teacherInfo.avatar ? (
              <img src={teacherInfo.avatar} alt={teacherInfo.name} className="w-12 h-12 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.08] flex items-center justify-center text-slate-400 text-base font-black shadow-inner select-none">
                {teacherInfo.name.split(" ").map(w => w[0]).join("")}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight truncate">{teacherInfo.name}</span>
                <span className="text-[7px] font-black uppercase text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded leading-none">Instructor</span>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate flex items-center gap-1.5 mt-1 font-semibold">
                <FaEnvelope className="text-[9px] shrink-0" />
                {teacherInfo.email}
              </p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate flex items-center gap-1.5 mt-0.5 font-semibold">
                <FaPhone className="text-[9px] shrink-0" />
                {teacherInfo.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Metadata Widget */}
        <div className="md:w-60 flex flex-col justify-center gap-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Academic Year</span>
            <span className="text-slate-800 dark:text-white font-extrabold">{academicMetadata.year}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Term</span>
            <span className="text-slate-800 dark:text-white font-extrabold">{academicMetadata.term}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department</span>
            <span className="text-slate-800 dark:text-white font-extrabold">{academicMetadata.department}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subject Code</span>
            <span className="text-slate-800 dark:text-white font-extrabold">{academicMetadata.subjectCode}</span>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1 mb-6 border-b border-slate-200 dark:border-white/[0.05] select-none scrollbar-none pb-0.5">
        {["Overview", "Classes", "Students", "Timetable", "Exams", "Assignments", "Syllabus", "Performance"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 font-black text-xs cursor-pointer border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab
                ? "border-purple-650 text-purple-650 dark:text-purple-400"
                : "border-transparent text-slate-450 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      {activeTab === "Overview" ? (
        
        // OVERVIEW DASHBOARD GRID
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Classes & Timetable */}
          <div className="flex flex-col gap-6">
            
            {/* Assigned Classes Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Assigned Classes</h3>
                <button className="text-[10px] font-bold text-purple-500 hover:underline cursor-pointer">View All</button>
              </div>

              <div className="flex flex-col gap-3.5 mb-4">
                {assignedClasses.map(c => (
                  <div key={c._id}>
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <div>
                        <p className="text-slate-900 dark:text-white font-extrabold">{c.name}</p>
                        <p className="text-[9px] text-slate-450 mt-0.5 font-semibold">{c.studentCount} Students</p>
                      </div>
                      <span className="text-purple-500 font-extrabold">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer">
                Manage Classes
              </button>
            </div>

            {/* Today's Timetable Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Today's Timetable</h3>
                <Link to="/teacher/showtimetable" className="text-[10px] font-bold text-purple-500 hover:underline">View Full Timetable</Link>
              </div>

              {(timetable || []).filter(Boolean).length === 0 ? (
                <p className="text-slate-450 dark:text-slate-500 text-xs py-4 text-center">No classes scheduled for today.</p>
              ) : (
                <div className="flex flex-col gap-3.5 mb-2 select-none">
                  {(timetable || []).filter(Boolean).map((t, idx) => (
                    <div key={t._id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
                          <FaClock className="text-xs" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{t?.startTime || ""} - {t?.endTime || ""}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">{t?.className || ""} &bull; {t?.topic || ""}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-150 dark:bg-white/[0.03] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/[0.05]">
                        {t?.room || ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[9px] text-slate-450 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider select-none">
                You have {timetable.length} class{timetable.length !== 1 ? "es" : ""} today.
              </p>
            </div>

          </div>

          {/* Column 2: Progress & Assignments */}
          <div className="flex flex-col gap-6">
            
            {/* Progress Overview Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-1">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Progress Overview</h3>
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-600 px-2.5 py-0.5 rounded-md">This Term</span>
              </div>

              <div className="flex items-center gap-6 py-2">
                <SVGProgressRing value={progressOverview.completed} />
                
                <div className="flex-1 flex flex-col gap-2.5 text-[10px] font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Completed</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">{progressOverview.completed}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> In Progress</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">{progressOverview.inProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Not Started</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">{progressOverview.notStarted}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-450" /> Overdue</span>
                    <span className="text-slate-800 dark:text-white font-extrabold">{progressOverview.overdue}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/[0.03] pt-4 select-none">
                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                  <span className="text-slate-450 uppercase tracking-wide">Chapter Completion</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{progressOverview.chapterCompletion}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progressOverview.completed}%` }} />
                </div>

                <button className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer">
                  View Syllabus
                </button>
              </div>
            </div>

            {/* Recent Assignments Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Recent Assignments</h3>
                <button className="text-[10px] font-bold text-purple-500 hover:underline cursor-pointer">View All</button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-slate-450 dark:text-slate-500 text-xs py-4 text-center">No assignments added yet.</p>
              ) : (
                <div className="flex flex-col gap-3 mb-2 select-none">
                  {assignments.map(as => (
                    <div key={as.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                      <div>
                        <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{as.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">{as.className} &bull; Due {as.dueDate}</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                        as.status === "Submitted"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {as.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Column 3: Quick Stats & Exams */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Stats Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Quick Stats</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Classes count */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                  <FaLayerGroup className="text-purple-500 text-sm mb-2" />
                  <span className="text-lg font-black text-slate-900 dark:text-white block leading-tight">{subjectInfo.classesCount}</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wide">Classes</span>
                </div>

                {/* Students count */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                  <FaUserGraduate className="text-emerald-500 text-sm mb-2" />
                  <span className="text-lg font-black text-slate-900 dark:text-white block leading-tight">{subjectInfo.studentsCount}</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wide">Students</span>
                </div>

                {/* Chapters count */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                  <FaBook className="text-blue-500 text-sm mb-2" />
                  <span className="text-lg font-black text-slate-900 dark:text-white block leading-tight">{subjectInfo.chapters}</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wide">Chapters</span>
                </div>

                {/* Assessments count */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                  <FaClipboardList className="text-amber-500 text-sm mb-2" />
                  <span className="text-lg font-black text-slate-900 dark:text-white block leading-tight">15</span>
                  <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wide">Assessments</span>
                </div>
              </div>
            </div>

            {/* Upcoming Exams Widget */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between h-fit">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Upcoming Exams</h3>
                <button className="text-[10px] font-bold text-purple-500 hover:underline cursor-pointer">View All</button>
              </div>

              {exams.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-slate-450 dark:text-slate-500 text-xs">No upcoming exams scheduled.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 mb-4 select-none">
                  {exams.slice(0, 3).map(ex => (
                    <div key={ex._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                      <div>
                        <p className="text-[10px] font-black text-slate-800 dark:text-white leading-tight">{ex.title}</p>
                        <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wide mt-1">{ex.className}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white block">
                          {new Date(ex.date).toLocaleDateString("en-IN", { day: "numeric" })}
                        </span>
                        <span className="text-[7px] text-slate-450 font-bold uppercase tracking-wider">
                          {new Date(ex.date).toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link 
                to="/teacher/exam-schedule"
                className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all"
              >
                View All Exams &rarr;
              </Link>
            </div>

          </div>

          {/* Footer banner widget across grid */}
          <div className="lg:col-span-3 bg-purple-600/5 border border-purple-500/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-650/10 text-purple-650 border border-purple-650/20 flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-sm" />
              </div>
              <p className="text-xs font-semibold text-slate-650 dark:text-slate-300">
                Ensure students complete all assignments and assessments on time to improve overall performance.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-sm">
              View Performance Report <FaChevronRight className="text-[8px]" />
            </button>
          </div>

        </div>
      ) : activeTab === "Syllabus" ? (
        <SyllabusTab 
          subjectId={subjectId} 
          subjectName={subjectInfo.name}
          assignedClasses={assignedClasses}
          initialClass={searchParams.get("class") || selectedClassForSyllabus || ""}
          onSyllabusUpdate={(cName) => {
            setSelectedClassForSyllabus(cName);
            fetchSubjectDetails(cName);
          }}
        />
      ) : activeTab === "Students" ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-6 rounded-2xl shadow-sm space-y-4 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Students Roster {selectedClassForSyllabus && selectedClassForSyllabus !== "All" ? `(${selectedClassForSyllabus})` : "(Across All Classes)"}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
                {(data?.students || []).length} students enrolled in {subjectInfo.name} course
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Class Filter:</span>
              <select
                value={selectedClassForSyllabus || "All"}
                onChange={(e) => {
                  setSelectedClassForSyllabus(e.target.value);
                  fetchSubjectDetails(e.target.value);
                }}
                className="px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-purple-500/30 dark:border-white/15 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="All">All Classes ({(data?.allStudents || []).length} Total)</option>
                {assignedClasses.map((c, i) => (
                  <option key={c._id || i} value={c.name}>{c.name} ({c.studentCount} Students)</option>
                ))}
              </select>
            </div>
          </div>

          {(data?.students || []).length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FaUserGraduate className="text-3xl text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-white">No students enrolled in this class filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto select-text">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-100 dark:border-white/5">
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Class & Section</th>
                    <th className="px-4 py-3 text-center">Gender</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(data?.students || []).map((st, i) => (
                    <tr key={st._id || i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        {st.avatar ? (
                          <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-500 font-black text-[10px] flex items-center justify-center border border-purple-500/20 shrink-0">
                            {st.name?.charAt(0)}
                          </div>
                        )}
                        <span>{st.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{st.email || "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">{st.className || "Class 1 - A"}</td>
                      <td className="px-4 py-3 text-center capitalize">{st.gender || "Student"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-black rounded-full uppercase tracking-wider">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === "Classes" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 select-none">
          {assignedClasses.map((c, i) => (
            <div key={c._id || i} className="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{c.studentCount} Students Enrolled</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-black rounded-xl">
                  {c.progress}% Progress
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.progress}%` }} />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => {
                    setSelectedClassForSyllabus(c.name);
                    fetchSubjectDetails(c.name);
                    setActiveTab("Syllabus");
                  }}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold text-center transition cursor-pointer"
                >
                  View Syllabus &rarr;
                </button>
                <button
                  onClick={() => {
                    setSelectedClassForSyllabus(c.name);
                    fetchSubjectDetails(c.name);
                    setActiveTab("Students");
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Students ({c.studentCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        
        // OTHER TABS FALLBACK CONTENT LISTS
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-6 rounded-2xl shadow-sm py-16 text-center select-none">
          <FaClipboardList className="text-3xl text-purple-500 mx-auto mb-3" />
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-1">{activeTab} Details</h3>
          <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
            Detailed lists, schedules, and analytics logs relating to the {activeTab.toLowerCase()} of {subjectInfo.name}.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl uppercase tracking-wider">
              Under Development &bull; Coming Soon
            </span>
          </div>
        </div>

      )}
      
    </div>
  );
}

export default SubjectDetails;
