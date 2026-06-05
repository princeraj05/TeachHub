import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaChalkboardTeacher, FaSearch, FaLayerGroup } from "react-icons/fa";

const CARD_ACCENTS = [
  { bg: "bg-indigo-50/50", border: "border-indigo-100/80", icon: "text-indigo-600", iconBg: "bg-indigo-100/50", dot: "bg-indigo-500" },
  { bg: "bg-teal-50/50", border: "border-teal-100/80", icon: "text-teal-600", iconBg: "bg-teal-100/50", dot: "bg-teal-500" },
  { bg: "bg-cyan-50/50", border: "border-cyan-100/80", icon: "text-cyan-600", iconBg: "bg-cyan-100/50", dot: "bg-cyan-500" },
  { bg: "bg-amber-50/50", border: "border-amber-100/80", icon: "text-amber-600", iconBg: "bg-amber-100/50", dot: "bg-amber-500" },
  { bg: "bg-violet-50/50", border: "border-violet-100/80", icon: "text-violet-600", iconBg: "bg-violet-100/50", dot: "bg-violet-500" },
  { bg: "bg-emerald-50/50", border: "border-emerald-100/80", icon: "text-emerald-600", iconBg: "bg-emerald-100/50", dot: "bg-emerald-500" },
];

const SORA = "'Sora', sans-serif";

function StudentSubjects() {
  const API = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/student/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubjects(res.data))
      .catch((err) => console.log(err));
  }, [API]);

  const filtered = subjects.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.teacher?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Academics</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          My Enrolled Subjects
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">All course subjects registered for this academic session</p>
      </div>

      {/* Summary + Search Bar row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* count indicator */}
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl w-fit shadow-sm select-none">
          <FaLayerGroup className="text-indigo-500 text-xs" />
          <span className="text-xs font-bold">
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""} Active
          </span>
        </div>

        {/* search input */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search subjects or teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 transition-all w-60 shadow-sm"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto mb-3">
            <FaBook />
          </div>
          <p className="text-slate-800 font-bold text-sm">No Subjects Found</p>
          <p className="text-slate-400 text-xs font-medium mt-0.5">Try searching with a different term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <div
                key={i}
                className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative blob in corner */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-xl ${accent.dot}`} />

                <div className="flex items-start gap-4">
                  {/* Icon Panel */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg} ${accent.border} shadow-inner`}>
                    <FaBook className={`text-base ${accent.icon}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate group-hover:text-teal-600 transition-colors">
                      {s.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-2">
                      <FaChalkboardTeacher className="text-slate-400 text-xs shrink-0" />
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {s.teacher ? s.teacher.name : "No Teacher Assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress highlight visual bar */}
                <div className="mt-5">
                  <div className={`h-1.5 w-full rounded-full ${accent.iconBg}`}>
                    <div className={`h-1.5 w-1/3 rounded-full ${accent.dot} group-hover:w-full transition-all duration-700`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentSubjects;