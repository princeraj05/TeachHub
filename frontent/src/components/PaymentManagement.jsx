import { useEffect, useState } from "react";
import axios from "axios";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((value || 0) / 100);

// Management controls only submit administrative intent. The server derives all
// financial values used to create a payment, and enforces roles/school scope.
export default function PaymentManagement({ role, apiBase, onChange }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [fee, setFee] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [compensations, setCompensations] = useState([]);
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      if (role === "superadmin") {
        const { data } = await axios.get(`${apiBase}/api/superadmin/subscriptions`, { headers: auth() });
        setSubscriptions(data);
      }
      if (role === "admin") {
        const [plan, staff, compensation] = await Promise.all([
          axios.get(`${apiBase}/api/admin/fee-plan`, { headers: auth() }),
          axios.get(`${apiBase}/api/admin/users/teachers`, { headers: auth() }),
          axios.get(`${apiBase}/api/admin/teacher-compensations`, { headers: auth() })
        ]);
        setFee(plan.data?.monthlyFee ? String(plan.data.monthlyFee / 100) : "");
        setTeachers(staff.data || []); setCompensations(compensation.data || []);
      }
    } catch (error) { setNotice(error.response?.data?.message || "Management data could not be loaded."); }
  };
  useEffect(() => { load(); }, [role, apiBase]);

  const saveFee = async e => {
    e.preventDefault();
    const monthlyFee = Math.round(Number(fee) * 100);
    try { await axios.put(`${apiBase}/api/admin/fee-plan`, { monthlyFee }, { headers: auth() }); setNotice("Student fee plan saved."); onChange?.(); }
    catch (error) { setNotice(error.response?.data?.message || "Fee plan could not be saved."); }
  };
  const saveSalary = async teacher => {
    const existing = compensations.find(item => String(item.teacher?._id || item.teacher) === String(teacher._id));
    const value = window.prompt(`Monthly salary for ${teacher.name} (₹)`, existing ? String(existing.salary / 100) : "");
    if (value === null) return;
    const dueDate = window.prompt("Due date (YYYY-MM-DD, optional)", existing?.dueDate ? existing.dueDate.slice(0, 10) : "");
    try {
      await axios.put(`${apiBase}/api/admin/teacher-compensations/${teacher._id}`, { salary: Math.round(Number(value) * 100), paymentCycle: "MONTHLY", dueDate: dueDate || null }, { headers: auth() });
      setNotice("Teacher salary saved."); load(); onChange?.();
    } catch (error) { setNotice(error.response?.data?.message || "Salary could not be saved."); }
  };
  const grantFree = async item => {
    const days = window.prompt(`Free period for ${item.subscription.schoolName}: number of days`, "30");
    if (days === null) return;
    try {
      await axios.post(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(item.subscription.schoolName)}/free-period`, { days: Number(days), type: "PROMOTIONAL", reason: "Administrative free period" }, { headers: auth() });
      setNotice("Free period granted."); load(); onChange?.();
    } catch (error) { setNotice(error.response?.data?.message || "Free period could not be granted."); }
  };
  const changeStatus = async item => {
    const status = window.prompt("Status: Active, Suspended, Cancelled, or Payment Due", item.subscription.status);
    if (!status) return;
    try {
      await axios.put(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(item.subscription.schoolName)}/status`, { status }, { headers: auth() });
      setNotice("Subscription status updated."); load(); onChange?.();
    } catch (error) { setNotice(error.response?.data?.message || "Status could not be updated."); }
  };
  const configureSubscription = async () => {
    const schoolName = window.prompt("Exact school name"); if (!schoolName) return;
    const fee = window.prompt("Monthly subscription fee (₹)"); if (fee === null) return;
    const billingStartDate = window.prompt("Billing start date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
    const gracePeriodDays = window.prompt("Grace period in days", "0");
    try {
      await axios.put(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(schoolName)}`, { monthlyFee: Math.round(Number(fee) * 100), billingStartDate, gracePeriodDays: Number(gracePeriodDays) }, { headers: auth() });
      setNotice("School subscription configured."); load(); onChange?.();
    } catch (error) { setNotice(error.response?.data?.message || "Subscription could not be configured."); }
  };

  if (!['admin', 'superadmin'].includes(role)) return null;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B132A]">
    <h2 className="font-bold text-slate-800 dark:text-white">Payment management</h2>
    {notice && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">{notice}</p>}
    {role === "admin" && <>
      <form onSubmit={saveFee} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">Monthly student fee (₹)<input value={fee} onChange={e => setFee(e.target.value)} type="number" min="0.01" step="0.01" required className="mt-1 block rounded-lg border p-2" /></label>
        <button className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white">Save fee plan</button>
      </form>
      <div className="mt-5 divide-y divide-slate-100 dark:divide-white/10">{teachers.map(teacher => { const item = compensations.find(c => String(c.teacher?._id || c.teacher) === String(teacher._id)); return <div key={teacher._id} className="flex items-center justify-between gap-3 py-3 text-sm"><span>{teacher.name} {item ? `· ${money(item.salary)}/month` : "· Salary not set"}</span><button onClick={() => saveSalary(teacher)} className="rounded-lg border px-3 py-1.5 font-bold">Set salary</button></div>; })}</div>
    </>}
    {role === "superadmin" && <><button onClick={configureSubscription} className="mt-4 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white">Configure school subscription</button><div className="mt-2 divide-y divide-slate-100 dark:divide-white/10">{subscriptions.map(item => <div key={item.subscription._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><b>{item.subscription.schoolName}</b><p className="text-slate-500">{money(item.subscription.monthlyFee)} · {item.billing.status} · next {new Date(item.subscription.nextBillingDate).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => grantFree(item)} className="rounded-lg border px-3 py-1.5 font-bold">Grant free period</button><button onClick={() => changeStatus(item)} className="rounded-lg border px-3 py-1.5 font-bold">Change status</button></div></div>)}</div></>}
  </section>;
}
