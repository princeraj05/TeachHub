import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaBookOpen, 
  FaPlus, 
  FaLayerGroup, 
  FaPlay, 
  FaCheckCircle, 
  FaBook, 
  FaFilter, 
  FaSearch, 
  FaEllipsisV, 
  FaEye, 
  FaCalendarCheck,
  FaLaptop,
  FaFileAlt 
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function ExamSchedule() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Upcoming"); // Upcoming or Past
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/api/teacher/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setExams(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading exams:", err);
        setLoading(false);
      });
  }, [API, token]);

  // Dynamic Calculations from Database Exams Array
  const upcomingExams = exams.filter(e => e.status === "Upcoming");
  const ongoingExams = exams.filter(e => e.status === "Ongoing");
  const pastExams = exams.filter(e => e.status === "Completed");

  // Dynamic unique subjects and classes with exams
  const uniqueSubjectsCount = new Set(exams.map(e => e.subject).filter(Boolean)).size;
  const uniqueClassesCount = new Set(exams.map(e => e.className).filter(Boolean)).size;

  // Dynamic next upcoming exam date
  const sortedUpcoming = [...upcomingExams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextExamDateText = sortedUpcoming[0]?.date
    ? `Next: ${new Date(sortedUpcoming[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
    : "No Upcoming Exam";

  // Filter based on class select & search query
  const getFilteredList = (list) => {
    return list.filter(e => {
      const classMatch = selectedClass === "All" || e.className?.includes(selectedClass);
      const searchMatch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      const termMatch = selectedTerm === "All" || e.examTerm === selectedTerm;
      return classMatch && termMatch && searchMatch;
    });
  };

  const displayedList = activeTab === "Upcoming" ? getFilteredList(upcomingExams) : getFilteredList(pastExams);

  // Extract classes list for filters dropdown
  const classesList = [...new Set(exams.map(e => e.className?.split(" - ")[0]))].filter(Boolean);

  // Date helper formatter
  const formatDateWithDay = (dateStr) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const dayPart = d.toLocaleDateString("en-IN", { weekday: "long" });
    return { datePart, dayPart };
  };

  return (
    <div className="w-full text-slate-800 dark:text-white pb-32" style={{ fontFamily: SORA }}>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Exam Schedule</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            View and manage upcoming and past exams
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-purple-500">Exam Schedule</span>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/10 transition-all cursor-pointer whitespace-nowrap">
          <FaPlus className="text-[10px]" /> Add Exam
        </button>
      </div>

      {/* Summary KPI Cards - 100% Real Database Data */}
      <div className="hidden grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-6">
        {/* Upcoming Exams */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Upcoming Exams</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{upcomingExams.length}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{nextExamDateText}</p>
          </div>
        </div>

        {/* Ongoing Exams */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
            <FaPlay className="text-xs ml-0.5" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Ongoing Exams</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{ongoingExams.length}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              {ongoingExams.length > 0 ? "Active Now" : "None Active"}
            </p>
          </div>
        </div>

        {/* Completed Exams */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
            <FaCheckCircle className="text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Completed Exams</p>
            <span className="text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{pastExams.length}</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              {pastExams.length > 0 ? "Finished Log" : "0 Completed"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation and filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-white/[0.05] pb-0.5 select-none">
        
        {/* Tabs */}
        <div className="flex gap-4">
          {["Upcoming Exams", "Past Exams"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.split(" ")[0])}
              className={`px-4 py-2.5 font-black text-xs border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.split(" ")[0]
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-450 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar filters */}
        <div className="flex items-center gap-3 pb-2 sm:pb-0">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111827] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          </div>

          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111827] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All">All Classes</option>
            {classesList.map(clsName => (
              <option key={clsName} value={clsName}>{clsName}</option>
            ))}
          </select>

          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111827] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="All">All Terms</option>
            <option value="THREE_MONTH">3-Month Exam</option>
            <option value="SIX_MONTH">6-Month Exam (Mid-Term)</option>
            <option value="NINE_MONTH">9-Month Exam</option>
            <option value="FINAL_YEAR">Final Year Exam (Annual)</option>
            
            
          </select>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
            <FaFilter className="text-[10px]" /> Filter
          </button>
        </div>

      </div>

      {/* Main Exams lists table container */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-white/[0.05]">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {activeTab === "Upcoming" ? "Upcoming Exams" : "Past Exams"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Roster details of examinations scheduled for subjects</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-semibold">Loading exam list...</p>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-400 text-lg shadow-inner mx-auto">
              <FaCalendarCheck />
            </div>
            <div>
              <p className="text-slate-800 dark:text-white font-bold text-sm">No Exams Found</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">There are no {activeTab.toLowerCase()} exams matching filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Exam Name</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Room / Venue</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">
                    {activeTab === "Upcoming" ? "Action" : "Result"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {displayedList.map((e, idx) => {
                  const { datePart, dayPart } = formatDateWithDay(e.date);
                  let subjectColor = "bg-purple-500/15 text-purple-500 border-purple-500/20";
                  const subKey = e.subject?.toLowerCase() || "";
                  if (subKey.includes("science")) {
                    subjectColor = "bg-blue-500/15 text-blue-500 border-blue-500/20";
                  } else if (subKey.includes("english")) {
                    subjectColor = "bg-rose-500/15 text-rose-500 border-rose-500/20";
                  }

                  return (
                    <tr key={e._id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      
                      {/* Exam Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${subjectColor} border flex items-center justify-center shrink-0 select-none`}>
                            <FaCalendarCheck className="text-xs" />
                          </div>
                          {activeTab === "Upcoming" ? (
                            <span className="font-extrabold text-slate-900 dark:text-slate-200">{e.title}</span>
                          ) : (
                            <Link 
                              to={`/teacher/exam-schedule/${e._id}`}
                              className="font-extrabold text-slate-900 dark:text-slate-200 hover:text-purple-500 dark:hover:text-purple-400 hover:underline transition-all"
                            >
                              {e.title}
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase select-none ${subjectColor}`}>
                          {e.subject}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 font-extrabold text-slate-650 dark:text-slate-300">
                        {e.className}
                      </td>

                      {/* Mode (Online / Offline) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border select-none ${
                          e.mode === "online"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}>
                          {e.mode === "online" ? <FaLaptop className="text-[10px]" /> : <FaFileAlt className="text-[10px]" />}
                          {e.mode === "online" ? "Online" : "Offline"}
                        </span>
                      </td>

                      {/* Room / Venue */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {e.roomNumber ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-xs">
                            {e.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">N/A</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-extrabold text-slate-800 dark:text-slate-200">{datePart}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-semibold uppercase">{dayPart}</p>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 font-bold text-slate-650 dark:text-slate-300 whitespace-nowrap">
                        {e.time}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {e.duration}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {activeTab === "Upcoming" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-widest leading-none select-none">
                            Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest leading-none select-none">
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Action / Result */}
                      <td className="px-6 py-4 text-center">
                        {activeTab === "Upcoming" ? (
                          <button className="text-slate-450 hover:text-slate-900 dark:hover:text-white cursor-pointer p-1">
                            <FaEllipsisV className="text-[10px]" />
                          </button>
                        ) : (
                          <Link
                            to={`/teacher/exam-schedule/${e._id}`}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-purple-600 hover:text-purple-750 transition-all uppercase tracking-wider select-none hover:underline"
                          >
                            <FaEye className="text-xs" /> View Results
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


      </div>

    </div>
  );
}

export default ExamSchedule;
