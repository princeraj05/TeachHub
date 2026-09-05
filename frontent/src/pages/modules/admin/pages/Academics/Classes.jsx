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
  
  const [editingGroup, setEditingGroup] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null);

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
    if (!form.name || !form.name.trim()) {
      setError("Please enter class level / name");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API}/api/admin/classes`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Class and section(s) saved successfully!");
      setForm({ name: "", section: "" });
      setEditingGroup(null);
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

  const deleteSingleSection = async (secDoc) => {
    if (!window.confirm(`Are you sure you want to delete Section ${secDoc.section || "No Section"} from Class ${secDoc.name}?`)) return;
    setDeleteId(secDoc._id);
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${API}/api/admin/classes/${secDoc._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Section ${secDoc.section || "No Section"} deleted successfully!`);
      fetchClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete section");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeleteId(null);
    }
  };

  const executeDeleteGroup = async () => {
    if (!confirmDeleteGroup) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const deletePromises = confirmDeleteGroup.sections.map((s) =>
        axios.delete(`${API}/api/admin/classes/${s._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);
      setSuccess(`Class ${confirmDeleteGroup.name} and all its sections deleted successfully!`);
      setConfirmDeleteGroup(null);
      fetchClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to delete class level");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const sectionColors = [
    { card: "from-[#7C3AED] to-indigo-600", light: "bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300" },
    { card: "from-teal-500 to-emerald-500", light: "bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300" },
    { card: "from-cyan-500 to-blue-500",    light: "bg-cyan-50 border border-cyan-200 text-cyan-700 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300" },
    { card: "from-amber-500 to-orange-500", light: "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300" },
    { card: "from-rose-500 to-pink-500",    light: "bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300" },
  ];

  // Group classes by Class Name
  const groupedMap = new Map();
  classes.forEach((c) => {
    const key = String(c.name).trim();
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        name: c.name,
        sections: []
      });
    }
    groupedMap.get(key).sections.push(c);
  });

  const groupedClasses = Array.from(groupedMap.values()).sort((a, b) => {
    const numA = parseInt(String(a.name).replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(String(b.name).replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  const filteredGrouped = groupedClasses.filter((g) => {
    const nameMatch = g.name.toString().toLowerCase().includes(search.toLowerCase());
    const sectionMatch = g.sections.some((secDoc) =>
      (secDoc.section || "No Section").toLowerCase().includes(search.toLowerCase())
    );
    return nameMatch || sectionMatch;
  });

  return (
    <div className="font-sans">
      {/* ── Banners ── */}
      {success && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaTimesCircle className="text-rose-500 text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Classes</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage school class levels and section groups</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <FaSchool className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">
              {groupedClasses.length} Class Level{groupedClasses.length !== 1 ? "s" : ""} ({classes.length} Section{classes.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Class Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-7 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            {editingGroup ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {editingGroup ? `Manage Class ${editingGroup.name} Sections` : "Create or Add Class Sections"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {editingGroup ? "Add or update section identifiers for this class level" : "Enter class level and optional section codes (e.g. A, B, AB)"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSchool className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <input
              name="name"
              placeholder="Class Level / Name (e.g. 11)"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-inner transition-all duration-200"
            />
          </div>
          <div className="relative flex-1">
            <FaLayerGroup className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
            <input
              name="section"
              placeholder="Section Identifier (e.g. A, B or A, B, AB)"
              value={form.section}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-inner transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 active:scale-[0.98] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {editingGroup ? <FaEdit className="text-xs" /> : <FaPlus className="text-xs" />}
                  {editingGroup ? "Save Sections" : "Add Class"}
                </>
              )}
            </button>
            {editingGroup && (
              <button
                type="button"
                onClick={() => {
                  setEditingGroup(null);
                  setForm({ name: "", section: "" });
                }}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
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
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All School Classes ({groupedClasses.length})</h2>
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
          {filteredGrouped.length === 0 ? (
            <div className="py-16 text-center col-span-2">
              <FaGraduationCap className="text-slate-200 text-5xl mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">No classes found</p>
              <p className="text-slate-400 text-xs mt-1">Add class fields above.</p>
            </div>
          ) : (
            filteredGrouped.map((g, i) => {
              const color = sectionColors[i % sectionColors.length];
              return (
                <div key={g.name} className="flex flex-col gap-3 bg-slate-50/50 rounded-2xl p-5 border border-slate-150 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color.card} flex items-center justify-center shadow-md text-white font-black text-sm`}>
                        {g.name}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Class {g.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{g.sections.length} Section{g.sections.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGroup(g);
                          const secStr = g.sections.map(s => s.section).filter(Boolean).join(", ");
                          setForm({ name: g.name, section: secStr });
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Edit Sections"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteGroup(g)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-500 text-rose-500 hover:text-white transition cursor-pointer"
                        title="Delete Entire Class Level"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Section Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50">
                    {g.sections.map((secDoc) => (
                      <span
                        key={secDoc._id}
                        className={`inline-flex items-center gap-1.5 ${secDoc.section ? color.light : "bg-slate-100 border border-slate-200 text-slate-500"} px-2.5 py-1 rounded-full text-xs font-bold`}
                      >
                        <FaLayerGroup className="text-[10px]" />
                        {secDoc.section ? `Section ${secDoc.section}` : "No Section"}
                        <button
                          onClick={() => deleteSingleSection(secDoc)}
                          className="ml-0.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete section"
                        >
                          <FaTimes className="text-[9px]" />
                        </button>
                      </span>
                    ))}
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
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-44">Class Level</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Section Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredGrouped.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <FaGraduationCap className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No classes found</p>
                    <p className="text-slate-400 text-xs mt-1">Add your first class level above.</p>
                  </td>
                </tr>
              ) : (
                filteredGrouped.map((g, i) => {
                  const color = sectionColors[i % sectionColors.length];
                  return (
                    <tr key={g.name} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.card} flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-200`}>
                            <span className="text-white font-black text-xs">{g.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">
                            Class {g.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {g.sections.map((secDoc) => (
                            <span
                              key={secDoc._id}
                              className={`inline-flex items-center gap-1.5 ${secDoc.section ? color.light : "bg-slate-100 border border-slate-200 text-slate-500"} px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs`}
                            >
                              <FaLayerGroup className="text-xs" />
                              {secDoc.section ? `Section ${secDoc.section}` : "No Section"}
                              <button
                                onClick={() => deleteSingleSection(secDoc)}
                                className="ml-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title={`Delete Section ${secDoc.section || ""}`}
                              >
                                <FaTimes className="text-[10px]" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingGroup(g);
                              const secStr = g.sections.map(s => s.section).filter(Boolean).join(", ");
                              setForm({ name: g.name, section: secStr });
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-150 active:scale-95 cursor-pointer"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteGroup(g)}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-150 disabled:opacity-50 active:scale-95 cursor-pointer"
                          >
                            <FaTrash className="text-xs" />
                            Delete
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

      {/* ── Delete Group Confirmation Modal ── */}
      {confirmDeleteGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800">
            <button
              onClick={() => setConfirmDeleteGroup(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaTrash className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete Class {confirmDeleteGroup.name}</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to delete <span className="font-extrabold text-slate-800">Class {confirmDeleteGroup.name}</span> and all its {confirmDeleteGroup.sections.length} section(s)?
                This action will delete all assignments and records related to this class.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteGroup(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteGroup}
                  disabled={loading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Class"}
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