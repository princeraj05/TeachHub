import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaSchool, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChartLine } from "react-icons/fa";

function AttendanceReport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API}/api/attendance/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filtered =
    filter === "All" ? data : data.filter((d) => d.status === filter);

  const presentCount = data.filter((d) => d.status === "Present").length;
  const absentCount = data.filter((d) => d.status === "Absent").length;
  const rate =
    data.length > 0 ? Math.round((presentCount / data.length) * 100) : 0;

  const initials = (name) =>
    name
      ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <div className="font-sans">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Attendance Report</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Live student attendance logs and record analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Records */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-teal-500 absolute top-0 left-0" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Records</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{data.length}</span>
            <span className="text-xs text-slate-400 font-semibold">entries</span>
          </div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Present Count</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{presentCount}</span>
            <span className="text-xs text-slate-400 font-semibold">attended</span>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-rose-500 absolute top-0 left-0" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Absent Count</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{absentCount}</span>
            <span className="text-xs text-slate-400 font-semibold">missed</span>
          </div>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
              <FaChartLine className="text-sm" />
            </div>
            <span className="text-sm font-bold text-slate-700">Overall Student Attendance Rate</span>
          </div>
          <span className="text-sm font-black text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl">{rate}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/30">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Attendance Logs</h2>
          
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "All", label: "All Logs", activeClass: "bg-slate-800 border-slate-800 text-white shadow-sm" },
              { id: "Present", label: "Present Only", activeClass: "bg-emerald-550 border-emerald-500 text-emerald-700 bg-emerald-50" },
              { id: "Absent", label: "Absent Only", activeClass: "bg-rose-550 border-rose-500 text-rose-700 bg-rose-50" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-150 ${
                  filter === btn.id
                    ? btn.activeClass
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table/Loaders */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Log Data…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              📋
            </div>
            <p className="text-slate-500 font-bold text-sm">No logs found</p>
            <p className="text-slate-400 text-xs mt-1">Try changing your filter options above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 select-none">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Level</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Logged By</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Status</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-40">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Student */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0 ${
                            item.status === "Present"
                              ? "bg-gradient-to-br from-teal-400 to-emerald-400"
                              : "bg-gradient-to-br from-rose-400 to-orange-400"
                          }`}
                        >
                          {initials(item.student?.name)}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">
                          {item.student?.name || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4.5">
                      <span className="text-sm font-bold text-slate-600">
                        {item.class?.name ? `Class ${item.class.name} (${item.class.section})` : "—"}
                      </span>
                    </td>

                    {/* Teacher */}
                    <td className="px-6 py-4.5">
                      <span className="text-sm font-medium text-slate-500">
                        {item.teacher?.name || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          item.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-550/10 text-rose-700 bg-rose-50 border border-rose-100"
                        }`}
                      >
                        {item.status === "Present" ? (
                          <>
                            <FaCheckCircle className="text-xs text-emerald-500" />
                            Present
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-xs text-rose-500" />
                            Absent
                          </>
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/50 select-none">
          <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
            Report verified · Data sync completed
          </p>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReport;
