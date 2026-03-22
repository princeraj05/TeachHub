import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaEnvelope, FaSearch, FaUsers } from "react-icons/fa";

function Students() {
  const API = import.meta.env.VITE_API_URL;
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/admin/users/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStudents();
  }, [API]);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    "from-cyan-400 to-teal-500",
    "from-teal-400 to-emerald-500",
    "from-emerald-400 to-green-500",
    "from-sky-400 to-cyan-500",
    "from-indigo-400 to-blue-500",
    "from-violet-400 to-indigo-500",
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Page Header ── */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Students</h1>
          <p className="text-sm text-slate-500 mt-1">All registered students in TeachHub</p>
        </div>
        <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-100 rounded-2xl px-4 py-2.5 w-fit">
          <FaUsers className="text-cyan-500" />
          <span className="text-sm font-bold text-cyan-700">{students.length} Students</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6 max-w-sm">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-sm transition"
        />
      </div>

      {/* ── Mobile: Cards ── */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-14 text-center shadow-sm">
            <FaUserGraduate className="text-slate-300 text-4xl mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">No students found</p>
          </div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-extrabold text-base shadow-md flex-shrink-0`}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{s.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                  <p className="text-xs text-slate-500 truncate">{s.email}</p>
                </div>
              </div>
              <span className="ml-auto flex-shrink-0 inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <FaUserGraduate className="text-xs" />
                Student
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: Table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">All Students</h2>
          <span className="text-xs font-semibold bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full border border-cyan-100">
            {filtered.length} of {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-10">#</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <FaUserGraduate className="text-slate-300 text-4xl mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-semibold">No students found</p>
                    <p className="text-slate-300 text-xs mt-1">Try a different search</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-extrabold text-sm shadow-sm flex-shrink-0`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FaEnvelope className="text-slate-300 text-xs flex-shrink-0" />
                        <span className="text-sm">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-100">
                        <FaUserGraduate className="text-xs" />
                        Student
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;