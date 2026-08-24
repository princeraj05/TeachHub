import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const statuses = ["Pending", "Approved", "Rejected", "Cancelled"];

export default function TeacherLeaves() {
  const API = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/teacher-leaves`, { headers });
      setLeaves(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { load(); }, [load]);

  const review = async (leaveId, status) => {
    try {
      const response = await axios.put(`${API}/api/teacher-leaves/${leaveId}`, { status }, { headers });
      setLeaves((current) => current.map((leave) => leave._id === leaveId ? response.data : leave));
      setMessage(`Leave request ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update leave request.");
    }
  };

  return <div className="mx-auto max-w-5xl space-y-5">
    <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Staff</p><h1 className="text-2xl font-extrabold dark:text-white">Teacher Leave Requests</h1></div>
    {message && <p className="text-sm text-violet-700">{message}</p>}
    {loading ? <p className="text-sm text-slate-500">Loading leave requests…</p> : leaves.length === 0 ? <div className="rounded-2xl border bg-white p-8 text-sm text-slate-500 dark:bg-[#0B132A]">No teacher leave requests yet.</div> : <div className="space-y-3">{leaves.map((leave) => <article key={leave._id} className="flex flex-col gap-3 rounded-2xl border bg-white p-5 dark:bg-[#0B132A] dark:text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{leave.teacher?.name || "Teacher"}</p><p className="text-xs text-slate-500">{new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}</p>{leave.reason && <p className="mt-1 text-xs text-slate-500">Reason: {leave.reason}</p>}</div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{leave.status}</span>{leave.status === "Pending" && <select defaultValue="" onChange={(event) => event.target.value && review(leave._id, event.target.value)} className="rounded-xl border p-2 text-xs text-slate-700"><option value="" disabled>Review request</option>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select>}</div></article>)}</div>}
  </div>;
}
