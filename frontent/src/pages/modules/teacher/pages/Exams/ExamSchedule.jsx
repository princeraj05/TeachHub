import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaBookOpen, FaCalendarCheck } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function ExamSchedule() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/api/teacher/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setExams(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [API, token]);

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Exams</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Exam Timetable
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Upcoming exams scheduled for classes under your instruction</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Directory count status pill */}
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl w-fit shadow-sm select-none mb-6">
        <FaCalendarCheck className="text-indigo-500 text-xs" />
        <span className="text-xs font-bold">
          {exams.length} Exam{exams.length !== 1 ? "s" : ""} Scheduled
        </span>
      </div>

      {/* Table Card container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Exam Schedules</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Timetable details for course subjects</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Loading timetable...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm">No Exams Scheduled</p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Please check back later or verify with admin console.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Class Room</th>
                  <th className="px-6 py-4">Subject Course</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {exams.map((e) => {
                  const isUpcoming = new Date(e.date) >= new Date();
                  return (
                    <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-indigo-100">
                          Class {e.class?.name} ({e.class?.section || "—"})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                            <FaBookOpen className="text-teal-500 text-xs" />
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{e.subject?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${
                          isUpcoming
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-100 text-slate-400 border-slate-200/60"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {isUpcoming ? "Upcoming" : "Past"}
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
            Exam evaluation schedules are managed by school administrator panels
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExamSchedule;