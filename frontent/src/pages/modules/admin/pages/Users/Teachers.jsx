import { useEffect, useState } from "react";
import axios from "axios";
import { FaChalkboardTeacher, FaEnvelope, FaSearch, FaUsers, FaSchool, FaBook, FaTrash } from "react-icons/fa";

function Teachers() {
  const API = import.meta.env.VITE_API_URL;
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/users/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAssignClass = async (teacherId, classId) => {
    if (!classId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/admin/assign/assign-teacher-class`,
        { teacherId, classId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeachers();
      alert("Teacher assigned to class successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign class");
    }
  };

  const handleAssignSubject = async (teacherId, subjectId) => {
    if (!subjectId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/admin/assign/assign-subject-teacher`,
        { teacherId, subjectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeachers();
      alert("Subject assigned to teacher successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign subject");
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteTeacher = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete teacher ${name}? This will remove all their records from the database.`)) {
      const token = localStorage.getItem("token");
      axios
        .delete(`${API}/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          alert(`${name} has been successfully deleted.`);
          setTeachers(prev => prev.filter(t => t._id !== id));
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Failed to delete teacher");
        });
    }
  };

  const avatarColors = [
    "from-teal-500 to-emerald-500",
    "from-emerald-500 to-green-500",
    "from-cyan-500 to-teal-500",
    "from-sky-500 to-cyan-500",
    "from-indigo-500 to-blue-500",
    "from-violet-500 to-indigo-500",
  ];

  return (
    <div className="font-sans">
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Teachers</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">View and manage all registered teachers inside TeachHub</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit shadow-sm">
          <FaUsers className="text-teal-600" />
          <span className="text-xs font-bold text-teal-700">{teachers.length} Registered Teachers</span>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="relative mb-6 max-w-md">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Search by teacher name or email address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all duration-200"
        />
      </div>

      {/* ── Mobile: Cards ── */}
      <div className="sm:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 py-16 text-center shadow-sm">
            <FaChalkboardTeacher className="text-slate-200 text-5xl mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No teachers found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different query or register a new user.</p>
          </div>
        ) : (
          filtered.map((t, i) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex items-center gap-4 hover-lift relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-base shadow-md flex-shrink-0`}>
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-800 text-sm truncate">{t.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                  <p className="text-xs text-slate-500 truncate font-medium">{t.email}</p>
                </div>
              </div>
              <span className="flex-shrink-0 inline-flex items-center gap-1 bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                Teacher
              </span>
              <button
                onClick={() => handleDeleteTeacher(t._id, t.name)}
                className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition shrink-0 cursor-pointer"
                title="Delete Teacher"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: Table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Teachers</h2>
          <span className="text-xs font-bold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1.5 rounded-full">
            Showing {filtered.length} of {teachers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 select-none">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-14">#</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teacher Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assign Class</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assign Subject</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">System Role</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <FaChalkboardTeacher className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No teachers found</p>
                    <p className="text-slate-400 text-xs mt-1">Try searching for a different user.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0`}>
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150 block">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {t.classes && t.classes.length > 0 ? `Classes: ${t.classes.map(c => `${c.name}-${c.section}`).join(', ')}` : 'No Class Assigned'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                        <span className="text-sm">{t.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <select
                        value={t.classes?.[0]?._id || ""}
                        onChange={(e) => handleAssignClass(t._id, e.target.value)}
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
                      <select
                        value={t.subjects?.[0]?._id || ""}
                        onChange={(e) => handleAssignSubject(t._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all duration-150"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name} {sub.class ? `(Class ${sub.class.name}-${sub.class.section})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100">
                        <FaChalkboardTeacher className="text-xs" />
                        Teacher
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleDeleteTeacher(t._id, t.name)}
                        className="bg-rose-50 hover:bg-rose-600 hover:text-white p-2 rounded-xl text-rose-600 transition duration-150 inline-flex items-center justify-center cursor-pointer"
                        title="Delete Teacher"
                      >
                        <FaTrash className="text-xs" />
                      </button>
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

export default Teachers;