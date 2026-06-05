import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarCheck, FaCalendarTimes, FaFilter, FaCalendarAlt } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentAttendance() {
  const API = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/student/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [API]);

  const filtered = filter === "All" ? data : data.filter((a) => a.status === filter);
  const present = data.filter((a) => a.status === "Present").length;
  const absent = data.filter((a) => a.status === "Absent").length;
  const percent = data.length ? Math.round((present / data.length) * 100) : 0;

  const stats = [
    {
      label: "Total Sessions",
      value: data.length,
      grad: "from-indigo-500 to-blue-500",
      shadow: "shadow-indigo-500/10",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Present Classes",
      value: present,
      grad: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/10",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Absent Classes",
      value: absent,
      grad: "from-rose-500 to-red-500",
      shadow: "shadow-rose-500/10",
      text: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Attendance</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            My Attendance Tracker
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Track and verify your attendance records history</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
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
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight my-1">{s.value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${s.bg.replace("bg-", "bg-").replace("-50", "-500")}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Live records</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance progress bar card */}
      {data.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Overall Attendance Rate</span>
            <span className={`font-bold ${percent >= 75 ? "text-teal-600" : "text-rose-500"}`}>{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percent >= 75
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                  : "bg-gradient-to-r from-rose-400 to-red-400"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-2.5">
            {percent >= 75 ? "✅ You meet the minimum academic attendance requirements." : "⚠️ Attendance is below the 75% minimum threshold."}
          </p>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Attendance Records Log</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Showing attendance history logs</p>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400 text-xs shrink-0 mr-1" />
            {["All", "Present", "Absent"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-extrabold uppercase tracking-wide px-3.5 py-2 rounded-xl transition-all cursor-pointer border ${
                  filter === f
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/60 border-slate-200/40 text-slate-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table Log */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Attendance Date</th>
                <th className="px-6 py-4">Session Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaCalendarCheck className="text-2xl text-slate-200" />
                      <span className="text-xs font-semibold">No attendance logs found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400 font-bold text-xs">{i + 1}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <FaCalendarCheck className="text-teal-400 text-xs shrink-0" />
                        {new Date(a.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${
                          a.status === "Present"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {a.status === "Present" ? (
                          <>
                            <FaCalendarCheck className="text-[9px]" />
                            Present
                          </>
                        ) : (
                          <>
                            <FaCalendarTimes className="text-[9px]" />
                            Absent
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Attendance reports update automatically after each class session
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendance;