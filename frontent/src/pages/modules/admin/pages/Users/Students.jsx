import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBook,
  FaSchool,
  FaTrash,
  FaPlus,
  FaLayerGroup,
  FaSearch,
} from "react-icons/fa";

function Subjects() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: "", classId: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchClasses = async () => {
    const res = await axios.get(`${API}/api/admin/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setClasses(res.data);
  };

  const fetchSubjects = async () => {
    const res = await axios.get(`${API}/api/admin/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubjects(res.data);
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/admin/subjects`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", classId: "" });
      fetchSubjects();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await axios.delete(`${API}/api/admin/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubjects();
    } catch (err) {
      console.log(err);
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.class?.name?.toString().includes(search)
  );

  const subjectColors = [
    { bg: "bg-teal-50", text: "text-teal-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700" },
    { bg: "bg-cyan-50", text: "text-cyan-700" },
    { bg: "bg-sky-50", text: "text-sky-700" },
    { bg: "bg-indigo-50", text: "text-indigo-700" },
    { bg: "bg-violet-50", text: "text-violet-700" },
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Subjects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage subjects assigned to each class</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit">
          <FaBook className="text-teal-500 text-base" />
          <span className="text-sm font-bold text-teal-700">{subjects.length} Subjects</span>
        </div>
      </div>

      {/* Add Subject Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/25">
            <FaPlus className="text-white text-xs" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-700">Add New Subject</h2>
            <p className="text-xs text-slate-400">Fill details and click Add</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaBook className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm pointer-events-none" />
            <input
              name="name"
              placeholder="Subject Name (e.g. Mathematics)"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-slate-50"
            />
          </div>

          <div className="relative flex-1">
            <FaSchool className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm pointer-events-none" />
            <select
              name="classId"
              value={form.classId}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-slate-50 appearance-none cursor-pointer"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  Class {c.name} — Section {c.section}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-teal-500/25 transition-all disabled:opacity-60 whitespace-nowrap"
          >
            <FaPlus className="text-xs" />
            {loading ? "Adding…" : "Add Subject"}
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <h2 className="text-base font-bold text-slate-700">All Subjects</h2>
          <div className="relative w-full sm:w-56">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search subjects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 transition"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FaBook className="text-slate-300 text-3xl mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No subjects found</p>
            </div>
          ) : (
            filtered.map((s, i) => {
              const color = subjectColors[i % subjectColors.length];
              return (
                <div key={s._id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${color.bg} flex items-center justify-center`}>
                      <FaBook className={`${color.text} text-sm`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Class {s.class?.name} · Section {s.class?.section}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubject(s._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <FaBook className="text-slate-300 text-3xl mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">No subjects found</p>
                    <p className="text-slate-300 text-xs mt-1">Add your first subject above</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const color = subjectColors[i % subjectColors.length];
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                            <FaBook className={`${color.text} text-xs`} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                          <FaSchool className="text-xs" />
                          Class {s.class?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                          <FaLayerGroup className="text-xs" />
                          Section {s.class?.section}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteSubject(s._id)}
                          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Subjects;