import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserTimes, FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

export default function TeacherOnLeave() {
  const API = API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/api/teacher-leaves/active/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load leave information"))
      .finally(() => setLoading(false));
  }, [API]);

  return (
    <div style={{ fontFamily: SORA }} className="max-w-4xl mx-auto space-y-5 pb-12 select-none text-left">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA]">
          FACULTY UPDATES
        </p>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
          Teacher On Leave
        </h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
          View teachers who are currently on leave or scheduled absence.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-bold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-400">Checking faculty attendance...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-2xl">
            <FaUserTimes />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">All Teachers Present</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium max-w-sm">
            No teachers are currently on approved leave. All scheduled classes will proceed normally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {data.map((x) => (
            <div
              key={x._id}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/70 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {x.teacher?.name || x.name || "Instructor"}
                  </h3>
                  {(x.subject || x.leaveType) && (
                    <p className="text-[11px] font-bold text-[#7C3AED] dark:text-[#A78BFA] mt-1 flex items-center gap-1.5">
                      <FaBookOpen className="text-[10px]" /> {x.subject || x.leaveType}
                    </p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider shrink-0">
                  {x.status || "Approved"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-slate-400" />
                  {new Date(x.startDate || x.from).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })} – {new Date(x.endDate || x.to).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {x.duration && (
                  <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500 font-extrabold">
                    {typeof x.duration === 'number' ? `${x.duration} Days` : x.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
