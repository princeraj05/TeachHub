import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const belongsToClass = (subject, classId) => (subject.classes || []).some(item => String(item?._id || item) === String(classId)) || (Array.isArray(subject.class) ? subject.class : [subject.class]).filter(Boolean).some(item => String(item?._id || item) === String(classId));

export default function CreateTimetable() {
  const api = import.meta.env.VITE_API_URL;
  const headers = { Authorization: "Bearer " + localStorage.getItem("token") };
  const [classes, setClasses] = useState([]); const [subjects, setSubjects] = useState([]); const [teachers, setTeachers] = useState([]); const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ classId: "", subjectId: "", teacherId: "", day: "Monday", startTime: "09:00", durationMinutes: 60 });
  const availableSubjects = useMemo(() => subjects.filter(subject => belongsToClass(subject, form.classId)), [subjects, form.classId]);
  const load = async () => {
    setLoading(true);
    try { const [classResult, subjectResult, teacherResult, entryResult] = await Promise.all([axios.get(api + "/api/admin/classes", { headers }), axios.get(api + "/api/admin/subjects", { headers }), axios.get(api + "/api/admin/users/teachers", { headers }), axios.get(api + "/api/timetable", { headers })]); setClasses(classResult.data); setSubjects(subjectResult.data); setTeachers(teacherResult.data); setEntries(entryResult.data); }
    catch { setMessage("Could not load timetable setup data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [api]);
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value, ...(event.target.name === "classId" ? { subjectId: "" } : {}) }));
  const submit = async event => {
    event.preventDefault(); setMessage("");
    try { await axios.post(api + "/api/timetable", { ...form, durationMinutes: Number(form.durationMinutes) }, { headers }); setMessage("Timetable entry created."); setForm(current => ({ ...current, subjectId: "", startTime: "09:00" })); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Could not create timetable entry."); }
  };
  const remove = async id => { try { await axios.delete(api + "/api/timetable/" + id, { headers }); await load(); } catch { setMessage("Could not delete timetable entry."); } };
  return <div className="max-w-5xl mx-auto space-y-6">
    <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Academics</p><h1 className="text-2xl font-extrabold dark:text-white">Create Timetable</h1><p className="mt-1 text-sm text-slate-500">Select a class first; only subjects assigned to that class are shown.</p></div>
    {message && <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700">{message}</p>}
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 rounded-2xl bg-white dark:bg-[#0B132A] border p-5 sm:grid-cols-3">
      <select name="classId" required value={form.classId} onChange={change}><option value="">Select class</option>{classes.map(item => <option value={item._id} key={item._id}>Class {item.name} — Section {item.section}</option>)}</select>
      <select name="subjectId" required disabled={!form.classId || loading} value={form.subjectId} onChange={change}><option value="">{form.classId ? availableSubjects.length ? "Select subject" : "No subject assigned to this class" : "Select class first"}</option>{availableSubjects.map(item => <option value={item._id} key={item._id}>{item.name}</option>)}</select>
      <select name="teacherId" required value={form.teacherId} onChange={change}><option value="">Select teacher</option>{teachers.map(item => <option value={item._id} key={item._id}>{item.name}</option>)}</select>
      <select name="day" value={form.day} onChange={change}>{days.map(day => <option key={day}>{day}</option>)}</select>
      <input name="startTime" type="time" required value={form.startTime} onChange={change} />
      <input name="durationMinutes" type="number" min="1" max="600" value={form.durationMinutes} onChange={change} placeholder="Minutes" />
      <button disabled={loading || !form.classId || !form.subjectId || !form.teacherId} className="sm:col-span-3 rounded-xl bg-[#7C3AED] py-3 font-bold text-white disabled:opacity-50">Create entry</button>
    </form>
    <div className="space-y-2">{entries.map(item => <div className="flex justify-between rounded-xl border bg-white p-3 text-sm dark:bg-[#0B132A] dark:text-white" key={item._id}>{item.day} · {item.subject?.name} · {item.startTime}–{item.endTime}<button onClick={() => remove(item._id)} className="text-rose-600">Delete</button></div>)}</div>
  </div>;
}
