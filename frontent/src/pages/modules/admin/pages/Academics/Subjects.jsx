import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBook, FaSchool, FaTrash, FaPlus,
  FaLayerGroup, FaSearch
} from "react-icons/fa";

function Subjects() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: "", classId: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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

  useEffect(() => { fetchSubjects(); fetchClasses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/admin/subjects`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", classId: "" });
      fetchSubjects();
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    setDeleteId(id);
    try {
      await axios.delete(`${API}/api/admin/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubjects();
    } catch (err) { console.log(err); }
    finally { setDeleteId(null); }
  };

  const palette = [
    { grad: "from-teal-500 to-emerald-500",   light: "bg-teal-50 border border-teal-100 text-teal-700",     cls: "bg-slate-100 text-slate-600" },
    { grad: "from-cyan-500 to-teal-500",       light: "bg-cyan-50 border border-cyan-100 text-cyan-700",     cls: "bg-slate-100 text-slate-600" },
    { grad: "from-emerald-500 to-green-500",   light: "bg-emerald-50 border border-emerald-100 text-emerald-700", cls: "bg-slate-100 text-slate-600" },
    { grad: "from-sky-500 to-cyan-500",        light: "bg-sky-50 border border-sky-100 text-sky-700",       cls: "bg-slate-100 text-slate-600" },
    { grad: "from-indigo-500 to-blue-500",     light: "bg-indigo-50 border border-indigo-100 text-indigo-700", cls: "bg-slate-100 text-slate-600" },
    { grad: "from-violet-500 to-indigo-500",   light: "bg-violet-50 border border-violet-100 text-violet-700", cls: "bg-slate-100 text-slate-600" },
  ];

  const filtered = subjects.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.class?.name?.toString().includes(search)
  );

  return (
    <div className="font-sans">
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Subjects</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage academic course subjects mapped to class levels</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit shadow-sm">
          <FaBook className="text-teal-600" />
          <span className="text-xs font-bold text-teal-700">{subjects.length} Total Subjects</span>
        </div>
      </div>

      {/* ── Add Subject Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-7 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <FaPlus className="text-white text-sm" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Add New Subject</h2>
            <p className="text-xs text-slate-400 font-medium">Create a new subject course and assign it to an academic class</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          {/* Subject name */}
          <div className="relative flex-1">
            <FaBook className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <input
              name="name"
              placeholder="Subject Name  (e.g. Mathematics)"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-inner transition-all duration-200"
            />
          </div>

          {/* Class select */}
          <div className="relative flex-1">
            <FaSchool className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <select
              name="classId"
              value={form.classId}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  Class {c.name} — Section {c.section}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 active:scale-[0.98] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaPlus className="text-xs" />
                Add Subject
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Subjects List ── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Subjects</h2>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search subjects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50 focus:bg-white shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* ── Mobile: Cards ── */}
        <div className="sm:hidden p-4 grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FaBook className="text-slate-200 text-5xl mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">No subjects found</p>
              <p className="text-slate-400 text-xs mt-1">Try creating a subject above.</p>
            </div>
          ) : (
            filtered.map((s, i) => {
              const p = palette[i % palette.length];
              return (
                <div key={s._id} className="flex items-center justify-between bg-slate-50/50 border border-slate-150 rounded-2xl p-5 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center shadow-md`}>
                      <FaBook className="text-[#0b132b] text-base" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Class {s.class?.name} · Section {s.class?.section}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubject(s._id)}
                    disabled={deleteId === s._id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white hover:border-transparent transition-all active:scale-95 disabled:opacity-50"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ── Desktop: Table ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 select-none">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-14">#</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject Title</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Associated Class</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <FaBook className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No subjects found</p>
                    <p className="text-slate-400 text-xs mt-1">Create your first subject course level above.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const p = palette[i % palette.length];
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-200`}>
                            <FaBook className="text-[#0b132b] text-xs" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <FaSchool className="text-xs" />
                          Class {s.class?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 ${p.light} px-3 py-1.5 rounded-full text-xs font-bold`}>
                          <FaLayerGroup className="text-xs" />
                          Section {s.class?.section}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          onClick={() => deleteSubject(s._id)}
                          disabled={deleteId === s._id}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-150 disabled:opacity-50 active:scale-95"
                        >
                          <FaTrash className="text-xs" />
                          {deleteId === s._id ? "Deleting…" : "Delete"}
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