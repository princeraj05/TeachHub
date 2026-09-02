import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaBook, 
  FaCalendarAlt, 
  FaLayerGroup, 
  FaSearch, 
  FaFilter, 
  FaThLarge, 
  FaList, 
  FaEllipsisV, 
  FaChevronRight, 
  FaUserGraduate, 
  FaHourglassHalf, 
  FaCalendarCheck 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const SORA = "'Sora', sans-serif";

function MySubjects() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API}/api/teacher/my-subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [API, token]);

  // Compute overall KPI stats
  const totalSubjects = subjects.length;
  
  // Count unique classes assigned across all subjects
  const classesSet = new Set();
  subjects.forEach(s => {
    s.classes?.forEach(c => classesSet.add(c._id || `${c.name}-${c.section}`));
  });
  const totalClassesAssigned = classesSet.size;

  // Sum students across subjects
  const totalStudents = subjects.reduce((sum, s) => sum + (s.studentsCount || 0), 0);

  // Average progress across subjects
  const avgProgress = totalSubjects > 0 
    ? Math.round(subjects.reduce((sum, s) => sum + (s.progress || 0), 0) / totalSubjects)
    : 0;

  // Filter subjects by search query
  const filteredSubjects = subjects.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">My Subjects</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Manage subjects assigned to you and track progress
          </p>
        </div>
      </div>

      {/* Summary Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Subjects */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
            <FaBook className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Subjects</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{totalSubjects}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Active Subjects</p>
          </div>
        </div>

        {/* Classes Assigned */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
            <FaLayerGroup className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Classes Assigned</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{totalClassesAssigned}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Across All Subjects</p>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
            <FaUserGraduate className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Students</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{totalStudents}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold font-semibold">Across All Subjects</p>
          </div>
        </div>

        {/* Avg. Progress */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 flex items-center justify-center shrink-0">
            <FaHourglassHalf className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Avg. Progress</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{avgProgress}%</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Overall Completion</p>
          </div>
        </div>

        {/* Academic term */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/15 flex items-center justify-center shrink-0">
            <FaCalendarCheck className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">This Term</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">2026</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Academic Year</p>
          </div>
        </div>
      </div>

      {/* Toolbar filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
        
        {/* Toggle view grid/list */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === "grid"
                  ? "bg-purple-650/10 text-purple-500 border border-purple-500/10 shadow-sm"
                  : "text-slate-450 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FaThLarge className="text-xs" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === "list"
                  ? "bg-purple-650/10 text-purple-500 border border-purple-500/10 shadow-sm"
                  : "text-slate-450 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FaList className="text-xs" />
            </button>
          </div>
          
          <span className="text-xs font-bold text-slate-450 uppercase select-none">
            {viewMode === "grid" ? "Grid View" : "List View"}
          </span>
        </div>

        {/* Right tools search and filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search subjects, classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>

          <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option>All Terms</option>
            <option>Term 1</option>
            <option>Term 2</option>
          </select>

          <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
            <FaFilter className="text-[10px]" /> Filter
          </button>
        </div>

      </div>

      {/* Subjects Grid/List Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-xs font-semibold">Loading courses...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm py-24 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-400 text-lg shadow-inner mx-auto mb-3">
            <FaBook />
          </div>
          <p className="text-slate-800 dark:text-white font-bold text-sm">No Subjects Found</p>
          <p className="text-slate-450 dark:text-slate-500 text-xs font-bold mt-1">Try modifying your search criteria or contact administration.</p>
        </div>
      ) : viewMode === "grid" ? (
        
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map(s => {
            // Pick card border/accent color dynamically based on subject name
            let accentColor = "from-purple-500 to-indigo-600";
            let textColor = "text-purple-500";
            let bgGlow = "bg-purple-500/10";
            const nameLower = s.name.toLowerCase();

            if (nameLower.includes("science") && !nameLower.includes("social")) {
              accentColor = "from-blue-400 to-blue-600";
              textColor = "text-blue-500";
              bgGlow = "bg-blue-500/10";
            } else if (nameLower.includes("english")) {
              accentColor = "from-rose-400 to-rose-600";
              textColor = "text-rose-500";
              bgGlow = "bg-rose-50/10";
            } else if (nameLower.includes("social")) {
              accentColor = "from-emerald-400 to-emerald-600";
              textColor = "text-emerald-500";
              bgGlow = "bg-emerald-500/10";
            } else if (nameLower.includes("hindi")) {
              accentColor = "from-amber-400 to-amber-600";
              textColor = "text-amber-500";
              bgGlow = "bg-amber-500/10";
            }

            return (
              <div 
                key={s._id}
                className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header name & code */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} text-white flex items-center justify-center shadow-md shadow-indigo-500/5 shrink-0 select-none`}>
                        <FaBook className="text-sm" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-tight">{s.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">{s.subjectCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                        Active
                      </span>
                      <button className="text-slate-450 hover:text-slate-900 dark:hover:text-white cursor-pointer p-1">
                        <FaEllipsisV className="text-[10px]" />
                      </button>
                    </div>
                  </div>

                  {/* Icon Panel metrics row */}
                  <div className="grid grid-cols-4 gap-2 py-2 mb-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-xl p-2 text-center select-none border border-slate-100 dark:border-white/[0.02]">
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white block">{s.classes?.length || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Classes</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white block">{s.studentsCount || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Students</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white block">{s.chapters || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                        {nameLower.includes("english") || nameLower.includes("hindi") ? "Units" : "Chapters"}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] font-black ${textColor} block`}>{s.progress || 0}%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Progress</span>
                    </div>
                  </div>

                  {/* Progress completion bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-450 uppercase tracking-wide mb-1 select-none">
                      <span>Syllabus Progress</span>
                      <span>{s.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${accentColor} rounded-full`}
                        style={{ width: `${s.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Classes Assigned tags list */}
                  <div className="mb-4">
                    <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mb-2 select-none">Classes Assigned</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.classes?.map((c, i) => (
                        <span 
                          key={c._id || i}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] text-[9px] font-bold text-slate-650 dark:text-slate-300 border border-slate-200/50 dark:border-white/[0.03] select-none"
                        >
                          Class {c.name} - {c.section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Details Navigation click */}
                <Link
                  to={`/teacher/my-subjects/${s._id}`}
                  className="w-full py-2 border border-slate-100 dark:border-white/[0.04] hover:border-purple-500/25 dark:hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl bg-slate-50/20 dark:bg-white/[0.01] hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  View Details
                  <FaChevronRight className="text-[7px]" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        
        // LIST VIEW
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4 text-center">Classes</th>
                <th className="px-6 py-4 text-center">Students</th>
                <th className="px-6 py-4 text-center">Syllabus Progress</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
              {filteredSubjects.map(s => {
                let badgeStyle = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                const nameLower = s.name.toLowerCase();
                if (nameLower.includes("science") && !nameLower.includes("social")) {
                  badgeStyle = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                } else if (nameLower.includes("english")) {
                  badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                } else if (nameLower.includes("social")) {
                  badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                }

                return (
                  <tr key={s._id} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-extrabold text-slate-800 dark:text-slate-200">
                        <span className={`inline-flex p-2 rounded-lg border uppercase tracking-wider ${badgeStyle}`}>
                          <FaBook className="text-[10px]" />
                        </span>
                        {s.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wide">{s.subjectCode}</td>
                    <td className="px-6 py-4 text-center font-bold">{s.classes?.length || 0}</td>
                    <td className="px-6 py-4 text-center font-bold">{s.studentsCount || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden shrink-0">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${s.progress || 0}%` }}
                          />
                        </div>
                        <span className="font-extrabold">{s.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/teacher/my-subjects/${s._id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/30 text-purple-500 font-bold hover:bg-purple-500/5 transition-all text-[10px] uppercase tracking-wide cursor-pointer"
                        >
                          Details
                        </Link>
                        <button className="text-slate-450 hover:text-slate-900 dark:hover:text-white p-1">
                          <FaEllipsisV className="text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      )}
    </div>
  );
}

export default MySubjects;
