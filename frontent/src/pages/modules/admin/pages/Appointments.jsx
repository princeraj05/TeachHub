import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../../../config/api";

const STATUSES = ["Pending", "Approved", "Rejected", "Completed", "Cancelled"];

export default function Appointments() {
  const API = API_URL;
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setLoading(true); const response = await axios.get(`${API}/api/appointments`, { headers }); setAppointments(response.data); }
    catch (error) { setMessage(error.response?.data?.message || "Could not load appointments."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const update = async (id, status) => {
    try {
      const response = await axios.put(`${API}/api/appointments/${id}`, { status }, { headers });
      setAppointments((current) => current.map((item) => item._id === id ? response.data : item));
      setMessage("Appointment updated.");
    } catch (error) { setMessage(error.response?.data?.message || "Could not update appointment."); }
  };

  return <div className="max-w-5xl mx-auto space-y-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Admissions</p><h1 className="text-2xl font-extrabold dark:text-white">Teacher Appointments</h1></div>{message && <p className="text-sm text-violet-700">{message}</p>}{loading ? <p className="text-sm text-slate-500">Loading appointments…</p> : appointments.length === 0 ? <div className="rounded-2xl border bg-white dark:bg-[#0B132A] p-8 text-sm text-slate-500">No teacher appointments yet.</div> : <div className="space-y-3">{appointments.map((appointment) => <article key={appointment._id} className="rounded-2xl border bg-white dark:bg-[#0B132A] p-5 dark:text-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{appointment.user?.name || "Applicant"}</p><p className="text-xs text-slate-500">{appointment.user?.email} · {new Date(appointment.date).toLocaleDateString()} at {appointment.time} · {appointment.mode}</p>{appointment.notes && <p className="mt-1 text-xs text-slate-500">Note: {appointment.notes}</p>}</div><select aria-label="Appointment status" value={appointment.status} onChange={(event) => update(appointment._id, event.target.value)} className="rounded-xl border p-2 text-sm text-slate-700"><>{STATUSES.map((status) => <option key={status}>{status}</option>)}</></select></article>)}</div>}</div>;
}
