import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const toMinutes = (time) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
const currentMinutes = (date) => date.getHours() * 60 + date.getMinutes();
const liveStatus = (entry, now) => { const current = currentMinutes(now); if (current < toMinutes(entry.startTime)) return "Coming"; if (current < toMinutes(entry.endTime)) return "Going On"; return "Completed"; };
const displayTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function TimetableView() {
  const API = import.meta.env.VITE_API_URL;
  const [entries, setEntries] = useState([]); const [now, setNow] = useState(new Date()); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { axios.get(`${API}/api/timetable?day=${dayName.format(new Date())}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).then(r => setEntries(r.data)).catch(e => setError(e.response?.data?.message || "Could not load timetable")).finally(() => setLoading(false)); }, [API]);
  const sorted = useMemo(() => [...entries].sort((a,b) => a.startTime.localeCompare(b.startTime)), [entries]);
  if (loading) return <p className="p-8 text-sm text-slate-500">Loading today’s timetable…</p>;
  if (error) return <p className="p-8 text-sm text-rose-600">{error}</p>;
  return <div className="max-w-4xl mx-auto space-y-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Today · {dayName.format(now)}</p><h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Show Timetable</h1></div>{sorted.length === 0 ? <div className="rounded-2xl border bg-white dark:bg-[#0B132A] p-10 text-center text-sm text-slate-500">No classes are scheduled for today.</div> : sorted.map(entry => { const status = liveStatus(entry, now); return <article key={entry._id} className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4"><div className="min-w-36"><p className="font-extrabold text-slate-800 dark:text-white">{entry.subject?.name}</p><p className="text-xs text-slate-500">{displayTime(entry.startTime)} – {displayTime(entry.endTime)}</p></div><div className="flex-1 text-xs text-slate-500">{entry.class?.name} {entry.class?.section && `· ${entry.class.section}`}<br/>Teacher: {entry.teacher?.name || "—"}</div><div className="flex gap-2"><span className={`px-3 py-1 rounded-full text-xs font-bold ${status === "Going On" ? "bg-emerald-100 text-emerald-700" : status === "Coming" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{status}</span><span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700">Attendance: {entry.teacherAttendance}</span></div></article>; })}</div>;
}
