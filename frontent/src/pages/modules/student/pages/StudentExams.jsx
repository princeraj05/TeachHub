import { useEffect, useState } from "react";
import axios from "axios";
import { FaBookOpen, FaCalendarAlt, FaClock, FaSearch } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentExams() {
  const API = import.meta.env.VITE_API_URL;
  const [exams, setExams] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API}/api/student/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExams(res.data || []))
      .catch((err) => console.log(err));

    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [API, token]);

  const allExams = [...exams];
  if (profile && profile.admissionExamDate) {
    allExams.push({
      _id: "admission-exam-test",
      subject: `Admission Entrance Test (${profile.admissionExamMode})`,
      date: profile.admissionExamDate,
      isAdmission: true
    });
  }

  const filtered = allExams.filter((e) =>
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getBadge = (days) => {
    if (days < 0) return { label: "Passed", cls: "bg-slate-100 text-slate-400 border-slate-200/60" };
    if (days === 0) return { label: "Today!", cls: "bg-rose-550 text-rose-600 border-rose-200" };
    if (days <= 3) return { label: `${days}d left`, cls: "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" };
    if (days <= 7) return { label: `${days}d left`, cls: "bg-amber-50 text-amber-600 border-amber-100" };
    return { label: `${days}d left`, cls: "bg-teal-50 text-teal-600 border-teal-100" };
  };

  const nextExam = allExams.filter((e) => getDaysLeft(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date))[0]?.subject || "—";
  const thisWeekCount = allExams.filter((e) => { const d = getDaysLeft(e.date); return d >= 0 && d <= 7; }).length;

  const stats = [
    {
      label: "Total Exams",
      value: exams.length,
      desc: "scheduled syllabus",
      grad: "from-indigo-500 to-blue-500",
    },
    {
      label: "This Week",
      value: thisWeekCount,
      desc: "upcoming next 7d",
      grad: "from-teal-500 to-emerald-500",
    },
    {
      label: "Next Session",
      value: nextExam,
      desc: "upcoming course exam",
      grad: "from-amber-500 to-orange-500",
      isTruncate: true,
    },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Exams</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Exam Schedule
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Prepare and check your upcoming course exam timelines</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />
            <div className="p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
              <p className={`text-slate-800 tracking-tight my-1 ${s.isTruncate ? "text-lg font-extrabold leading-tight truncate h-8 mt-2" : "text-3xl font-extrabold"}`}>{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Exam Timelines</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Syllabus test timetable details</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 transition-all w-52"
            />
          </div>
        </div>

        {/* Table (md+) / Cards (mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Exam Date</th>
                <th className="px-6 py-4">Countdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaBookOpen className="text-2xl text-slate-200" />
                      <span className="text-xs font-semibold">No scheduled exams found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((e, i) => {
                  const days = getDaysLeft(e.date);
                  const badge = getBadge(days);
                  return (
                    <tr key={i} className={`transition-colors ${e.isAdmission ? "bg-teal-50/30 hover:bg-teal-50/50 dark:bg-teal-500/5 dark:hover:bg-teal-500/10" : "hover:bg-slate-50/50"}`}>
                      <td className="px-6 py-4 text-slate-400 font-bold text-xs">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            e.isAdmission 
                              ? "bg-teal-500 border-teal-600 text-white shadow-sm shadow-teal-500/20" 
                              : "bg-teal-50 border border-teal-100 text-teal-500"
                          }`}>
                            <FaBookOpen className="text-xs" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-850 text-xs">{e.subject}</span>
                            {e.isAdmission && (
                              <span className="text-[8px] font-black uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded tracking-wider">
                                Admission Exam
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                          <FaCalendarAlt className="text-teal-400 text-xs shrink-0" />
                          {new Date(e.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${badge.cls}`}>
                          <FaClock className="text-[9px]" />
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-slate-100/60">
          {filtered.length === 0 ? (
            <div className="text-center py-14 text-slate-400 flex flex-col items-center gap-2">
              <FaBookOpen className="text-2xl text-slate-200" />
              <span className="text-xs font-semibold">No exams found</span>
            </div>
          ) : (
            filtered.map((e, i) => {
              const days = getDaysLeft(e.date);
              const badge = getBadge(days);
              return (
                <div key={i} className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  e.isAdmission ? "bg-teal-50/30 dark:bg-teal-500/5 hover:bg-teal-50/50 dark:hover:bg-teal-500/10" : "hover:bg-slate-50/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      e.isAdmission
                        ? "bg-teal-500 border-teal-600 text-white shadow-sm shadow-teal-500/20"
                        : "bg-teal-50 border border-teal-100 text-teal-500"
                    }`}>
                      <FaBookOpen className="text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800 text-xs">{e.subject}</p>
                        {e.isAdmission && (
                          <span className="text-[7px] font-black uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1 py-0.5 rounded tracking-wider">
                            Admission
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <FaCalendarAlt className="text-[9px]" />
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${badge.cls}`}>
                    <FaClock className="text-[9px]" />
                    {badge.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Exam schedules are regulated by academic administrator console
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentExams;