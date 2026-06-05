import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaSearch, FaCalendarAlt, FaEnvelope } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function MyStudents() {
  const API = import.meta.env.VITE_API_URL;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/teacher/my-students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const unique = [];
        const seen = new Set();
        for (const s of res.data) {
          if (!seen.has(s._id)) {
            seen.add(s._id);
            unique.push(s);
          }
        }
        setStudents(unique);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, [API]);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Directory</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            My Students Directory
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Contact directory of all students registered under your classes</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Directory Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl w-fit shadow-sm select-none">
          <FaUserGraduate className="text-indigo-500 text-xs" />
          <span className="text-xs font-bold">
            {students.length} Student{students.length !== 1 ? "s" : ""} Assigned
          </span>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 transition-all w-60 shadow-sm"
          />
        </div>
      </div>

      {/* Table Card container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Student Directory</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and communicate with student listings</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Loading student list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto">
              <FaUserGraduate />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm">No Students Found</p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Please check with your dashboard or clear search terms.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {filtered.map((s) => {
                  const initials = s.name
                    ? s.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "S";
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md shadow-teal-500/10 shrink-0">
                            {initials}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs truncate">
                          <FaEnvelope className="text-slate-400 shrink-0" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full select-none">
                          Registered
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
            Registered students have access to course content and attendance schedules
          </p>
        </div>
      </div>
    </div>
  );
}

export default MyStudents;