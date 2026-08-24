import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaCheckSquare, FaPlus, FaSchool, FaSearch, FaTrash } from "react-icons/fa";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const classLabel = item => `Class ${item.name} — Section ${item.section}`;

export default function Subjects() {
  const api = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState([]); const [classes, setClasses] = useState([]);
  const [name, setName] = useState(""); const [classIds, setClassIds] = useState([]);
  const [search, setSearch] = useState(""); const [notice, setNotice] = useState(""); const [loading, setLoading] = useState(false);
  const load = async () => { try { const [subjectResult, classResult] = await Promise.all([axios.get(`${api}/api/admin/subjects`, { headers: headers() }), axios.get(`${api}/api/admin/classes`, { headers: headers() })]); setSubjects(subjectResult.data); setClasses(classResult.data); } catch (error) { setNotice(error.response?.data?.message || "Subjects could not be loaded."); } };
  useEffect(() => { load(); }, [api]);
  const submit = async event => { event.preventDefault(); setLoading(true); setNotice(""); try { const response = await axios.post(`${api}/api/admin/subjects`, { name, classIds }, { headers: headers() }); setName(""); setClassIds([]); setNotice(response.data.message); await load(); } catch (error) { setNotice(error.response?.data?.message || "Subject could not be saved."); } finally { setLoading(false); } };
  const remove = async id => { if (!window.confirm("Delete this subject from all its assigned classes?")) return; try { await axios.delete(`${api}/api/admin/subjects/${id}`, { headers: headers() }); await load(); } catch (error) { setNotice(error.response?.data?.message || "Subject could not be deleted."); } };
  const toggleClass = id => setClassIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const filtered = subjects.filter(subject => `${subject.name} ${(subject.classes || []).map(item => classLabel(item)).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="font-sans">
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Subjects</h1><p className="mt-1 text-xs font-medium text-slate-400">Create one subject and assign it to as many classes as needed.</p></div><div className="w-fit rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700"><FaBook className="mr-2 inline" />{subjects.length} Total Subjects</div></div>
    <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white"><FaPlus /></div><div><h2 className="font-bold text-slate-800">Add or update a subject</h2><p className="text-xs text-slate-400">Selecting an existing subject name adds the chosen classes to it.</p></div></div>
      {notice && <p className="mb-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{notice}</p>}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]"><label className="relative"><FaBook className="pointer-events-none absolute left-4 top-4 text-slate-400" /><input value={name} onChange={event => setName(event.target.value)} placeholder="Subject name (e.g. Mathematics)" required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-teal-500" /></label>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-xs font-bold text-slate-600">Assign classes</p><div className="grid max-h-32 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{classes.map(item => <label key={item._id} className="flex cursor-pointer items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={classIds.includes(item._id)} onChange={() => toggleClass(item._id)} className="accent-teal-600" />{classLabel(item)}</label>)}</div></div>
        <button disabled={loading || !classIds.length} className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? "Saving…" : <><FaPlus className="mr-2 inline" />Save subject</>}</button></div>
    </form>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">All subjects</h2><label className="relative"><FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search subjects…" className="rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none" /></label></div>
      <div className="divide-y divide-slate-100">{filtered.length ? filtered.map(subject => <div key={subject._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-800"><FaBook className="mr-2 inline text-teal-600" />{subject.name}</p><div className="mt-2 flex flex-wrap gap-2">{subject.classes?.map(item => <span key={item._id} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700"><FaSchool className="mr-1 inline" />{classLabel(item)}</span>)}</div></div><button onClick={() => remove(subject._id)} className="w-fit rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-500"><FaTrash className="mr-1 inline" />Delete subject</button></div>) : <p className="p-12 text-center text-sm text-slate-400"><FaCheckSquare className="mr-2 inline" />No subjects found.</p>}</div>
    </section>
  </div>;
}
