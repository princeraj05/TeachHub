import { useEffect, useState } from "react";
import axiosInstance from "axios";
import { FaUserGraduate, FaEnvelope, FaSearch, FaUsers } from "react-icons/fa";

function Students() {
  const API = import.meta.env.VITE_API_URL;
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`${API}/api/admin/users/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`${API}/api/admin/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchStudents();
    fetchClasses();
  }, [API]);

  const handleAssignClass = async (studentId, classId) => {
    if (!classId) return; // Keep option to reset class if needed, or handle empty string
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `${API}/api/admin/assign/assign-student-class`,
        { studentId, classId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh students
      const res = await axiosInstance.get(`${API}/api/admin/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
      alert("Class assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign class");
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    "from-cyan-500 to-teal-500",
    "from-teal-500 to-emerald-500",
    "from-emerald-500 to-emerald-600",
    "from-sky-500 to-cyan-500",
    "from-indigo-500 to-blue-500",
    "from-violet-500 to-indigo-500",
  ];

  return (
    <div className="font-sans">
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Students</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">View and manage all registered students inside TeachHub</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit shadow-sm">
          <FaUsers className="text-teal-600" />
          <span className="text-xs font-bold text-teal-700">{students.length} Registered Students</span>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="relative mb-6 max-w-md">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Search by student name or email address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all duration-200"
        />
      </div>

      {/* ── Mobile: Cards ── */}
      <div className="sm:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 py-16 text-center shadow-sm">
            <FaUserGraduate className="text-slate-200 text-5xl mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No students found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different query or register a new user.</p>
          </div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4 hover-lift relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-base shadow-md flex-shrink-0`}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-800 text-sm truncate">{s.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                  <p className="text-xs text-slate-500 truncate font-medium">{s.email}</p>
                </div>
              </div>
              <span className="flex-shrink-0 inline-flex items-center gap-1 bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                Student
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: Table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Students</h2>
          <span className="text-xs font-bold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1.5 rounded-full">
            Showing {filtered.length} of {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 select-none">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-14">#</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class & Section</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <FaUserGraduate className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No students found</p>
                    <p className="text-slate-400 text-xs mt-1">Try searching for a different user.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                        <span className="text-sm">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <select
                        value={s.classId?._id || ""}
                        onChange={(e) => handleAssignClass(s._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all duration-150"
                      >
                        <option value="">Select Class & Section</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            Class {cls.name} — Section {cls.section}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100">
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