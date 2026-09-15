import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClipboardList, FaCheck, FaTimes, FaCalendarCheck } from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function AttendanceReport() {
  const API = API_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/attendance/report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [API]);

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Reports</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Attendance Reports Log
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Historical verification records of marked class presence</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Directory count status pill */}
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl w-fit shadow-sm select-none mb-6">
        <FaClipboardList className="text-indigo-500 text-xs" />
        <span className="text-xs font-bold">
          {data.length} Log Record{data.length !== 1 ? "s" : ""} Checked
        </span>
      </div>

      {/* Main Table Card container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Roster History Logs</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Showing registered class attendance sheets</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Loading history logs...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto">
              <FaCalendarCheck />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm">No Attendance Logs Found</p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Evaluate active student classes to populate sheets.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Session Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {data.map((item) => {
                  const initials = item.student?.name
                    ? item.student.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "S";
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 select-none">
                            {initials}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{item.student?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-indigo-100">
                          {item.class?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-650 truncate">{item.teacher?.name || "—"}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${
                            item.status === "Present"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}
                        >
                          {item.status === "Present" ? (
                            <>
                              <FaCheck className="text-[9px]" />
                              Present
                            </>
                          ) : (
                            <>
                              <FaTimes className="text-[9px]" />
                              Absent
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Attendance ledger reports are logged securely on system storage logs
          </p>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReport;
