import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { 
  FaCalendarAlt, 
  FaDownload, 
  FaShareAlt, 
  FaFileExport, 
  FaCalendarCheck, 
  FaUserGraduate, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaChevronRight, 
  FaSearch, 
  FaFilter, 
  FaChevronDown, 
  FaEye, 
  FaEllipsisV, 
  FaClock, 
  FaRegCalendarAlt 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

// Doughnut Chart helper component
function DoughnutRing({ value }) {
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center select-none">
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
      <div className="absolute text-center leading-none">
        <span className="text-base font-black text-slate-900 dark:text-white">{value}%</span>
        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Class Avg</span>
      </div>
    </div>
  );
}

// Custom SVG Bar Chart
function BarChart({ items }) {
  if (!items || items.length === 0) return null;
  const maxVal = Math.max(...items.map(i => i.count)) || 10;
  const height = 120;
  const barWidth = 28;
  const gap = 12;

  return (
    <div className="flex flex-col items-center select-none w-full py-1">
      <svg width="100%" height={height} className="overflow-visible max-w-[240px]">
        {items.map((item, idx) => {
          const barHeight = (item.count / maxVal) * (height - 30);
          const x = 10 + idx * (barWidth + gap);
          const y = height - 20 - barHeight;

          let fill = "fill-purple-500";
          if (idx === 0) fill = "fill-emerald-500";
          else if (idx === 1) fill = "fill-blue-500";
          else if (idx === 2) fill = "fill-amber-500";
          else if (idx === 3) fill = "fill-orange-450";
          else fill = "fill-rose-500";

          return (
            <g key={item.range}>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-[8px] font-black fill-slate-500 dark:fill-slate-400"
              >
                {item.count}
              </text>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                rx="3"
                className={`${fill} transition-all duration-350 opacity-90 hover:opacity-100`}
              />
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-[8px] font-bold fill-slate-450 dark:fill-slate-500"
              >
                {item.range}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ExamDetailsAndResults() {
  const { examId } = useParams();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState("All");

  useEffect(() => {
    axios.get(`${API}/api/teacher/exams/${examId}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error loading exam details:", err);
      setLoading(false);
    });
  }, [examId, API, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-450" style={{ fontFamily: SORA }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading results details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-slate-400" style={{ fontFamily: SORA }}>
        <FaTimesCircle className="text-2xl mx-auto mb-3 text-rose-500" />
        <p className="text-sm font-bold text-slate-800 dark:text-white">Exam details not found</p>
        <Link to="/teacher/exam-schedule" className="text-xs text-purple-500 hover:underline mt-2 inline-block">Back to schedule</Link>
      </div>
    );
  }

  const { examInfo, overview, performanceOverview, distribution, subjectSummary, students } = data;

  // Filter students based on search input & pass/fail filter
  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.rollNo?.includes(searchQuery);
    const resultMatch = filterResult === "All" || s.result === filterResult;
    return nameMatch && resultMatch;
  });

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Exam Details & Results</h1>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <Link to="/teacher/dashboard" className="hover:underline">Dashboard</Link>
            <span>&gt;</span>
            <Link to="/teacher/exam-schedule" className="hover:underline">Exam Schedule</Link>
            <span>&gt;</span>
            <span className="text-purple-500">{examInfo.title}</span>
            <span>&gt;</span>
            <span className="text-slate-400 dark:text-slate-500">Results</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-transparent text-purple-650 hover:bg-purple-500/10 border border-purple-500/20 transition-all cursor-pointer">
            <FaDownload /> Download Report
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-transparent text-purple-650 hover:bg-purple-500/10 border border-purple-500/20 transition-all cursor-pointer">
            <FaShareAlt /> Share Results
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-650 text-white hover:bg-purple-700 shadow-md transition-all cursor-pointer">
            <FaFileExport /> Export Results
          </button>
        </div>
      </div>

      {/* Main Metadata Info Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-stretch gap-6 relative overflow-hidden">
        
        {/* Left Column: Exam summary details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 select-none">
                <FaCalendarCheck className="text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">{examInfo.title}</h2>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider select-none">Completed</span>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">{examInfo.subject} &bull; {examInfo.className}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-450 uppercase tracking-wide mt-3 select-none">
              <div>Exam Type: <span className="text-slate-800 dark:text-white font-extrabold">Unit Test</span></div>
              <div>Max Marks: <span className="text-slate-800 dark:text-white font-extrabold">{examInfo.maxMarks}</span></div>
              <div>Passing Marks: <span className="text-slate-800 dark:text-white font-extrabold">{examInfo.passingMarks}</span></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-450 uppercase tracking-wide border-t border-slate-100 dark:border-white/[0.03] pt-4 select-none mt-4">
            <div className="flex items-center gap-1.5"><FaRegCalendarAlt className="text-slate-400 text-xs" /> {new Date(examInfo.examDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</div>
            <div className="flex items-center gap-1.5"><FaClock className="text-slate-400 text-xs" /> {examInfo.time}</div>
            <div className="flex items-center gap-1.5">Duration: <span className="text-slate-800 dark:text-white font-extrabold">{examInfo.duration}</span></div>
            <div className="flex items-center gap-1.5">Students Appeared: <span className="text-purple-500 font-extrabold">{examInfo.studentsAppeared}</span></div>
          </div>
        </div>

        {/* Right Column: Result Publishing status */}
        <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/[0.04] pl-0 md:pl-6 py-4 md:py-0 flex flex-col justify-center select-none">
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Result Status</p>
          <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm mb-1.5">
            <FaCheckCircle className="text-base" />
            <span>Published</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
            Published on: <span className="text-slate-700 dark:text-slate-350">{examInfo.publishedDate}</span>
          </p>
        </div>

      </div>

      {/* Quick Overview KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none">
        
        {/* Appeared */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Students Appeared</p>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{overview.appeared}</span>
          <p className="text-[8px] text-emerald-500 mt-2 font-semibold">100% Attendance</p>
        </div>

        {/* Passed */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Passed</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-slate-950 dark:text-white text-emerald-500">{overview.passed}</span>
            <span className="text-[9px] font-extrabold text-slate-400">({overview.passedPct}%)</span>
          </div>
          <p className="text-[8px] text-slate-400 mt-2 font-semibold">Score &gt;= 33</p>
        </div>

        {/* Failed */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Failed</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-rose-500">{overview.failed}</span>
            <span className="text-[9px] font-extrabold text-slate-400">({overview.failedPct}%)</span>
          </div>
          <p className="text-[8px] text-slate-400 mt-2 font-semibold">Score &lt; 33</p>
        </div>

        {/* Class Average */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Class Average</p>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block text-purple-500">{overview.average}%</span>
          <p className="text-[8px] text-slate-400 mt-2 font-semibold">Average class percentage score</p>
        </div>

      </div>

      {/* Performance Statistics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left: Performance overview Circular details */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Performance Overview</h3>
          </div>

          <div className="flex items-center gap-6 py-2">
            <DoughnutRing value={Math.round(overview.average)} />
            
            <div className="flex-1 flex flex-col gap-2 text-[10px] font-bold">
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (90-100)</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{performanceOverview.excellent.count} ({performanceOverview.excellent.pct}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Good (75-89)</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{performanceOverview.good.count} ({performanceOverview.good.pct}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Average (50-74)</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{performanceOverview.average.count} ({performanceOverview.average.pct}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Poor (&lt;50)</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{performanceOverview.poor.count} ({performanceOverview.poor.pct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Marks Distribution custom bar chart */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Marks Distribution</h3>
          </div>

          <BarChart items={distribution} />
        </div>

        {/* Right: Subject summary details */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
            <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Subject Summary</h3>
          </div>

          <div className="flex flex-col gap-2.5 text-[10px] font-bold">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Marks</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold">{subjectSummary.totalMarks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Highest Marks</span>
              <span className="text-emerald-500 font-extrabold">{subjectSummary.highestMarks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lowest Marks</span>
              <span className="text-rose-500 font-extrabold">{subjectSummary.lowestMarks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Class Average</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold">{subjectSummary.classAverage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Median</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold">{subjectSummary.median}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Standard Deviation</span>
              <span className="text-slate-850 dark:text-slate-200 font-extrabold">{subjectSummary.standardDeviation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pass Percentage</span>
              <span className="text-emerald-500 font-extrabold">{subjectSummary.passPercentage}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Student Results List table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Table controls */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Student Results ({filteredStudents.length})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 text-xs pointer-events-none" />
            </div>

            {/* Filter pass/fail */}
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 animate-none"
            >
              <option value="All">All Results</option>
              <option value="Pass">Pass Only</option>
              <option value="Fail">Fail Only</option>
            </select>

            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
              <span>Bulk Actions</span> <FaChevronDown className="text-[8px]" />
            </button>
          </div>
        </div>

        {/* Results grid list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll No.</th>
                <th className="px-6 py-4 text-center">Marks Obtained (100)</th>
                <th className="px-6 py-4 text-center">Percentage (%)</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Performance</th>
                <th className="px-6 py-4 text-center">Result</th>
                <th className="px-6 py-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
              {filteredStudents.map((s, idx) => {
                const initials = s.name ? s.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "S";
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    
                    {/* Student Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {s.avatar ? (
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 font-black flex items-center justify-center border border-purple-500/15 shrink-0 select-none">
                            {initials}
                          </div>
                        )}
                        <span className="font-extrabold text-slate-900 dark:text-slate-200">{s.name}</span>
                      </div>
                    </td>

                    {/* Roll No */}
                    <td className="px-6 py-4 font-black text-slate-450 dark:text-slate-450">{s.rollNo}</td>

                    {/* Marks */}
                    <td className="px-6 py-4 text-center font-extrabold text-slate-850 dark:text-slate-200">{s.marksObtained}</td>

                    {/* Percentage */}
                    <td className="px-6 py-4 text-center font-bold text-slate-650 dark:text-slate-350">{s.percentage}%</td>

                    {/* Grade */}
                    <td className={`px-6 py-4 text-center font-black ${s.result === "Pass" ? "text-slate-850 dark:text-slate-200" : "text-rose-500"}`}>
                      {s.grade}
                    </td>

                    {/* Performance */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-wider ${
                        s.performance === "Excellent" 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : s.performance === "Good"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : s.performance === "Average"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        {s.performance}
                      </span>
                    </td>

                    {/* Result */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-wider ${
                        s.result === "Pass"
                          ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/15 text-rose-500 border-rose-500/20"
                      }`}>
                        {s.result}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-450 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">
                          <FaEye className="text-xs" />
                        </button>
                        <button className="p-2 text-slate-450 hover:text-slate-900 dark:hover:text-white cursor-pointer">
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

        {/* Table footer Pagination */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/20 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider select-none">
          <span>Showing 1 to {filteredStudents.length} of {students.length} students</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
              Prev
            </button>
            <span className="px-2.5 py-1 rounded bg-purple-650 text-white font-extrabold shadow-sm">1</span>
            <button className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]">
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default ExamDetailsAndResults;
