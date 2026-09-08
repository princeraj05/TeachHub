import { FaAward, FaSearch, FaFilter, FaCalendarAlt } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function ExamResults() {
  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Reports</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Exam Results
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Visualize and export academic grade reports.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Control Panel / Mock Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <FaFilter className="text-teal-500 text-xs" />
          </div>
          <div>
            <h2 className="text-slate-800 font-bold text-sm">Control Center</h2>
            <p className="text-slate-400 text-[10px] font-medium mt-0.5">Filter results to view performance statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
          {/* Class Select Mock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Class</label>
            <select disabled className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed">
              <option>All Classes</option>
            </select>
          </div>

          {/* Subject Select Mock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subject</label>
            <select disabled className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed">
              <option>All Subjects</option>
            </select>
          </div>

          {/* Search Mock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Search Students</label>
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
              <input
                disabled
                type="text"
                placeholder="Search by student name..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Status Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between py-16 px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-teal-500/20 animate-pulse">
            <FaAward />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: SORA }}>No Results Recorded</h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
              Academic exam results will appear here once grade schedules and exams are evaluated by course instructors.
            </p>
          </div>
          <button disabled className="mt-2 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-5 py-2.5 cursor-not-allowed">
            Export Records
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamResults;
