import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const toMinutes = (time) => { const [hours, minutes] = String(time).split(":").map(Number); return hours * 60 + minutes; };
const statusFor = (entry, now) => { const current = now.getHours() * 60 + now.getMinutes(); if (current < toMinutes(entry.startTime)) return "Coming"; return current < toMinutes(entry.endTime) ? "Going On" : "Completed"; };

export default function TodayTimetableWidget() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [entries, setEntries] = useState([]);
  const [now, setNow] = useState(new Date());
  const day = useMemo(() => new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()), []);

  useEffect(() => { axios.get(`${API}/api/timetable?day=${day}`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => setEntries(response.data)).catch(() => setEntries([])); }, [API, day, token]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(timer); }, []);
  const current = entries.find((entry) => statusFor(entry, now) === "Going On");
  const next = entries.find((entry) => statusFor(entry, now) === "Coming");
  const display = current || next || entries[entries.length - 1];

  return <section className="mt-8 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Today’s timetable</p><h2 className="text-base font-extrabold text-slate-800">{current ? "Current class" : next ? "Next class" : "Schedule"}</h2></div><Link to={`/${role}/showtimetable`} className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700">View Full Timetable</Link></div>{display ? <div className="mt-4 text-sm"><b>{display.subject?.name || "Subject"}</b><span className="text-slate-500"> · {display.startTime}–{display.endTime} · {statusFor(display, now)}</span><p className="mt-1 text-xs text-slate-500">Teacher: {display.teacher?.name || "—"} · Attendance: {display.teacherAttendance || "Not Marked"}</p></div> : <p className="mt-4 text-sm text-slate-500">No classes are scheduled for today.</p>}</section>;
}
