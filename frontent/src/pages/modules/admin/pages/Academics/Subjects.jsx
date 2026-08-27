import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaCheckSquare, FaPlus, FaSchool, FaSearch, FaTrash, FaEdit, FaTimes } from "react-icons/fa";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const classLabel = item => `Class ${item.name} — Section ${item.section}`;

export default function Subjects() {
  const api = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [classIds, setClassIds] = useState([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [editingSubject, setEditingSubject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      const [subjectResult, classResult] = await Promise.all([
        axios.get(`${api}/api/admin/subjects`, { headers: headers() }),
        axios.get(`${api}/api/admin/classes`, { headers: headers() })
      ]);
      setSubjects(subjectResult.data);
      setClasses(classResult.data);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subjects could not be loaded.");
      setTimeout(() => setErrorNotice(""), 5000);
    }
  };

  useEffect(() => { load(); }, [api]);

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    setErrorNotice("");
    try {
      if (editingSubject) {
        const response = await axios.put(`${api}/api/admin/subjects/${editingSubject._id}`, { name, classIds }, { headers: headers() });
        setNotice(response.data.message || "Subject updated successfully!");
        setEditingSubject(null);
      } else {
        const response = await axios.post(`${api}/api/admin/subjects`, { name, classIds }, { headers: headers() });
        setNotice(response.data.message || "Subject created successfully!");
      }
      setName("");
      setClassIds([]);
      await load();
      setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subject could not be saved.");
      setTimeout(() => setErrorNotice(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const remove = (subject) => {
    setConfirmDelete(subject);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setLoading(true);
    setNotice("");
    setErrorNotice("");
    try {
      const response = await axios.delete(`${api}/api/admin/subjects/${confirmDelete._id}`, { headers: headers() });
      setNotice(response.data.message || "Subject deleted successfully!");
      setConfirmDelete(null);
      await load();
      setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setErrorNotice(error.response?.data?.message || "Subject could not be deleted.");
      setTimeout(() => setErrorNotice(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = id => setClassIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);

  const filtered = subjects.filter(subject => `${subject.name} ${(subject.classes || []).map(item => classLabel(item)).join(" ")}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Subjects</h1>
          <p className="mt-1 text-xs font-medium text-slate-400">Create one subject and assign it to as many classes as needed.</p>
        </div>
        <div className="w-fit rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700">
          <FaBook className="mr-2 inline" />{subjects.length} Total Subjects
        </div>
      </div>

      <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
            {editingSubject ? <FaEdit /> : <FaPlus />}
          </div>
          <div>
            <h2 className="font-bold text-slate-800">
              {editingSubject ? "Edit subject details" : "Add or update a subject"}
            </h2>
            <p className="text-xs text-slate-400">
              {editingSubject ? "Modify subject name and class assignments." : "Selecting an existing subject name adds the chosen classes to it."}
            </p>
          </div>
        </div>

        {notice && <p className="mb-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
        {errorNotice && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorNotice}</p>}

        <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]">
          <label className="relative">
            <FaBook className="pointer-events-none absolute left-4 top-4 text-slate-400" />
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Subject name (e.g. Mathematics)"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500"
            />
          </label>
          
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-bold text-slate-600">Assign classes</p>
            <div className="grid max-h-32 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {classes.map(item => (
                <label key={item._id} className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={classIds.includes(item._id)}
                    onChange={() => toggleClass(item._id)}
                    className="accent-teal-600"
                  />
                  {classLabel(item)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-center">
            <button
              type="submit"
              disabled={loading || !classIds.length}
              className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "Saving…" : <><FaPlus className="mr-2 inline" />Save subject</>}
            </button>
            {editingSubject && (
              <button
                type="button"
                onClick={() => {
                  setEditingSubject(null);
                  setName("");
                  setClassIds([]);
                }}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">All subjects</h2>
          <label className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search subjects…"
              className="rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none"
            />
          </label>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length ? filtered.map(subject => (
            <div key={subject._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  <FaBook className="mr-2 inline text-teal-600" />{subject.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subject.classes?.map(item => (
                    <span key={item._id} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                      <FaSchool className="mr-1 inline" />{classLabel(item)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSubject(subject);
                    setName(subject.name);
                    setClassIds((subject.classes || []).map(item => item._id));
                  }}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition"
                >
                  <FaEdit className="mr-1 inline" />Edit subject
                </button>
                <button
                  onClick={() => remove(subject)}
                  className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-500 hover:text-white"
                >
                  <FaTrash className="mr-1 inline" />Delete subject
                </button>
              </div>
            </div>
          )) : (
            <p className="p-12 text-center text-sm text-slate-400">
              <FaCheckSquare className="mr-2 inline" />No subjects found.
            </p>
          )}
        </div>
      </section>

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
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete Subject</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to delete subject <span className="font-extrabold text-slate-805">{confirmDelete.name}</span> from all its assigned classes?
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
                  onClick={executeDelete}
                  disabled={loading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Subject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
