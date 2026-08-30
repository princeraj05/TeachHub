import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim().toUpperCase();
  const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
  if (!match) {
    const parts = clean.split(":");
    return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
  }
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
};
const liveStatus = (entry, now) => { const current = now.getHours() * 60 + now.getMinutes(); return current < toMinutes(entry.startTime) ? "Coming" : current < toMinutes(entry.endTime) ? "Going On" : "Completed"; };
const displayTime = (timeStr) => {
  if (!timeStr) return "";
  const clean = String(timeStr).trim().toUpperCase();
  if (clean.includes("AM") || clean.includes("PM")) return clean;
  const [hStr, mStr] = clean.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  const displayM = String(m).padStart(2, "0");
  return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
};

export default function TimetableView() {
  const API = import.meta.env.VITE_API_URL;
  const role = localStorage.getItem("role");
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const [entries, setEntries] = useState([]); const [now, setNow] = useState(new Date()); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [teacherStatus, setTeacherStatus] = useState("");
  const load = () => axios.get(`${API}/api/timetable?day=${dayName.format(new Date())}`, { headers }).then((response) => setEntries(response.data)).catch((err) => setError(err.response?.data?.message || "Could not load timetable")).finally(() => setLoading(false));
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { load(); }, [API]);
  const markTeacherAttendance = async (status) => { try { await axios.put(`${API}/api/teacher-attendance/today`, { status }, { headers }); setTeacherStatus(`Today marked ${status}.`); load(); } catch (err) { setTeacherStatus(err.response?.data?.message || "Could not update attendance."); } };
  const sorted = useMemo(() => [...entries].sort((a, b) => a.startTime.localeCompare(b.startTime)), [entries]);
  if (loading) return <p className="p-8 text-sm text-slate-500">Loading today’s timetable…</p>;
  if (error) return <p className="p-8 text-sm text-rose-600">{error}</p>;
  return <div className="max-w-4xl mx-auto space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Today · {dayName.format(now)}</p><h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Show Timetable</h1></div>{role === "teacher" && <div className="flex gap-2"><button onClick={() => markTeacherAttendance("Present")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Mark Present</button><button onClick={() => markTeacherAttendance("Absent")} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white">Mark Absent</button></div>}</div>{teacherStatus && <p className="text-sm text-violet-700">{teacherStatus}</p>}{sorted.length === 0 ? <div className="rounded-2xl border bg-white dark:bg-[#0B132A] p-10 text-center text-sm text-slate-500">No classes are scheduled for today.</div> : sorted.map((entry) => { const status = liveStatus(entry, now); return <article key={entry._id} className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4"><div className="min-w-36"><p className="font-extrabold text-slate-800 dark:text-white">{entry.subject?.name}</p><p className="text-xs text-slate-500">{displayTime(entry.startTime)} – {displayTime(entry.endTime)}</p></div><div className="flex-1 text-xs text-slate-500">{entry.class?.name} {entry.class?.section && `· ${entry.class.section}`}<br />Teacher: {entry.teacher?.name || "—"}</div><div className="flex gap-2"><span className={`px-3 py-1 rounded-full text-xs font-bold ${status === "Going On" ? "bg-emerald-100 text-emerald-700" : status === "Coming" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{status}</span><span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700">Attendance: {entry.teacherAttendance}</span></div></article>; })}</div>;
}
