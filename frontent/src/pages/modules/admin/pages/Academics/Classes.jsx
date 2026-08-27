import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaLayerGroup, FaTrash, FaPlus, FaSearch, FaGraduationCap, FaEdit, FaTimes, FaTimesCircle, FaCheckCircle } from "react-icons/fa";

function Classes() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: "", section: "" });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  
  const [editingClass, setEditingClass] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to fetch classes");
      setTimeout(() => setError(""), 5000);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.section) {
      setError("Please fill all fields");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (editingClass) {
        await axios.put(`${API}/api/admin/classes/${editingClass._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Class updated successfully!");
        setEditingClass(null);
      } else {
        await axios.post(`${API}/api/admin/classes`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Class added successfully!");
      }
      setForm({ name: "", section: "" });
      fetchClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to save class");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = (id) => {
    const cls = classes.find(c => c._id === id);
    setConfirmDelete(cls);
  };

  const executeDeleteClass = async () => {
    if (!confirmDelete) return;
    setDeleteId(confirmDelete._id);
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${API}/api/admin/classes/${confirmDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Class deleted successfully!");
      setConfirmDelete(null);
      fetchClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete class");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeleteId(null);
    }
  };

  const sectionColors = [
    { card: "from-teal-500 to-emerald-500", light: "bg-teal-50 border border-teal-100 text-teal-700", badge: "bg-teal-500" },
    { card: "from-cyan-500 to-teal-500",    light: "bg-cyan-50 border border-cyan-100 text-cyan-700",  badge: "bg-cyan-500" },
    { card: "from-emerald-500 to-green-500",light: "bg-emerald-50 border border-emerald-100 text-emerald-700", badge: "bg-emerald-500" },
    { card: "from-sky-500 to-cyan-500",     light: "bg-sky-50 border border-sky-100 text-sky-700",    badge: "bg-sky-500" },
    { card: "from-indigo-500 to-blue-500",  light: "bg-indigo-50 border border-indigo-100 text-indigo-700", badge: "bg-indigo-500" },
    { card: "from-violet-500 to-indigo-500",light: "bg-violet-50 border border-violet-100 text-violet-700", badge: "bg-violet-500" },
  ];

  const filtered = classes.filter(
    (c) =>
      c.name?.toString().toLowerCase().includes(search.toLowerCase()) ||
      c.section?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="font-sans">
      {/* ── Banners ── */}
      {success && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-155 text-emerald-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 bg-rose-50 border border-rose-155 text-rose-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaTimesCircle className="text-rose-500 text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Classes</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and organize all curriculum classes and classroom sections</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <FaSchool className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">{classes.length} Total Classes</span>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Class Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-7 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            {editingClass ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {editingClass ? "Edit Class Details" : "Create New Class"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {editingClass ? "Modify class level and classroom identifier code" : "Add a standard school level and classroom identifier code"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSchool className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <input
              name="name"
              placeholder="Class Level / Name  (e.g. 10)"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-inner transition-all duration-200"
            />
          </div>
          <div className="relative flex-1">
            <FaLayerGroup className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <input
              name="section"
              placeholder="Section Identifier  (e.g. A)"
              value={form.section}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-inner transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 active:scale-[0.98] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {editingClass ? <FaEdit className="text-xs" /> : <FaPlus className="text-xs" />}
                  {editingClass ? "Update Class" : "Add Class"}
                </>
              )}
            </button>
            {editingClass && (
              <button
                type="button"
                onClick={() => {
                  setEditingClass(null);
                  setForm({ name: "", section: "" });
                }}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Classes List ── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">

        {/* Table toolbar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Classes</h2>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search classes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50 focus:bg-white shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* ── Mobile: Card Grid ── */}
        <div className="sm:hidden p-4 grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center col-span-2">
              <FaGraduationCap className="text-slate-200 text-5xl mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">No classes found</p>
              <p className="text-slate-400 text-xs mt-1">Add class fields above.</p>
            </div>
          ) : (
            filtered.map((c, i) => {
              const color = sectionColors[i % sectionColors.length];
              return (
                <div key={c._id} className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-5 border border-slate-150 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.card} flex items-center justify-center shadow-md`}>
                      <span className="text-white font-black text-sm">{c.name}</span>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Class {c.name}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Section {c.section}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingClass(c);
                        setForm({ name: c.name, section: c.section });
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => deleteClass(c._id)}
                      disabled={deleteId === c._id}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white hover:border-transparent transition-all active:scale-95 disabled:opacity-50"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
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
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Level</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <FaGraduationCap className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No classes found</p>
                    <p className="text-slate-400 text-xs mt-1">Add your first class level above.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => {
                  const color = sectionColors[i % sectionColors.length];
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.card} flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-200`}>
                            <span className="text-white font-black text-xs">{c.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">Class {c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 ${color.light} px-3 py-1.5 rounded-full text-xs font-bold`}>
                          <FaLayerGroup className="text-xs" />
                          Section {c.section}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingClass(c);
                              setForm({ name: c.name, section: c.section });
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-150 active:scale-95"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteClass(c._id)}
                            disabled={deleteId === c._id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-150 disabled:opacity-50 active:scale-95"
                          >
                            <FaTrash className="text-xs" />
                            {deleteId === c._id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800">
            <button
              onClick={() => setConfirmDelete(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaTrash className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete Class</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to delete class <span className="font-extrabold text-slate-805">{confirmDelete.name} - {confirmDelete.section}</span>?
                This action will delete all assignments and records related to this class.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteClass}
                  disabled={deleteId === confirmDelete._id}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {deleteId === confirmDelete._id ? "Deleting..." : "Delete Class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;