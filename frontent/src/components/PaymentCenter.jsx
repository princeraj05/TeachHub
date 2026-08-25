import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaCog, FaHistory, FaMoneyBillWave, FaReceipt } from "react-icons/fa";
import { startBackendPayment } from "../utils/razorpayCheckout";
import PaymentManagement from "./PaymentManagement";

const rupees = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((value || 0) / 100);
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function PaymentCenter({ role }) {
  const api = import.meta.env.VITE_API_URL;
  const [data, setData] = useState({ recentPayments: [] }); const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null); const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try {
    const calls = [axios.get(`${api}/api/payments/dashboard`, { headers: headers() }), axios.get(`${api}/api/payments`, { headers: headers() })];
    if (role === "admin") calls.push(axios.get(`${api}/api/admin/subscription`, { headers: headers() }));
    if (["superadmin", "admin", "teacher"].includes(role)) calls.push(axios.get(`${api}/api/payment-settings`, { headers: headers() }));
    const results = await Promise.all(calls); setData(results[0].data); setPayments(results[1].data);
    if (role === "admin") setSubscription(results[2].data); setSettings(results[role === "admin" ? 3 : 2]?.data || null);
  } catch (error) { setMessage(error.response?.data?.message || "Could not load payment data."); } }, [api, role]);
  useEffect(() => { load(); }, [load]);
  const paySubscription = async () => { setBusy(true); try { await startBackendPayment({ apiBase: api, token: localStorage.getItem("token"), createOrderEndpoint: "/api/school-subscription/create-order", customer: { name: localStorage.getItem("name") } }); setMessage("Subscription payment has been verified."); load(); } catch (error) { setMessage(error.response?.data?.message || error.message); } finally { setBusy(false); } };
  const decideOffline = async (id, action) => { const reason = action === "reject" ? window.prompt("Reason for rejection") : ""; if (action === "reject" && !reason) return; try { await axios.put(`${api}/api/payments/${id}/${action}-offline`, reason ? { reason } : {}, { headers: headers() }); setMessage(`Offline payment ${action}ed.`); load(); } catch (error) { setMessage(error.response?.data?.message || "Payment decision failed."); } };
  const changeSettings = async () => {
    const environment = window.prompt("Environment: test or live", settings?.environment || "test");
    if (environment === null) return;
    if (environment !== "test" && environment !== "live") return alert("Environment must be 'test' or 'live'");
    const onlineEnabled = window.confirm("Enable online Razorpay payments?");
    const offlineEnabled = window.confirm("Enable offline payment requests?");
    let keyId = "";
    let keySecret = "";
    let webhookSecret = "";
    if (onlineEnabled) {
      keyId = window.prompt("Enter Razorpay Key ID", settings?.keyId || "");
      if (keyId === null) return;
      keySecret = window.prompt("Enter Razorpay Key Secret (leave blank to keep existing)", "");
      if (keySecret === null) return;
      webhookSecret = window.prompt("Enter Razorpay Webhook Secret (optional, leave blank to keep existing)", "");
      if (webhookSecret === null) return;
    }
    try {
      await axios.put(`${api}/api/payment-settings`, {
        environment,
        onlineEnabled,
        offlineEnabled,
        ...(onlineEnabled && { razorpayKeyId: keyId, razorpayKeySecret: keySecret, razorpayWebhookSecret: webhookSecret })
      }, { headers: headers() });
      setMessage("Payment settings saved successfully. Credentials remain server-only.");
      load();
    } catch (error) { setMessage(error.response?.data?.message || "Settings update failed."); }
  };
  const receipt = async (id, download = false) => { try { const response = await axios.get(`${api}/api/payments/${id}/receipt${download ? "?download=1" : ""}`, { headers: headers(), responseType: download ? "blob" : "json" }); if (!download) return setMessage(`Receipt ${response.data.receiptNumber}: ${rupees(response.data.amount)} · ${response.data.status}`); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = "teachhub-receipt.html"; link.click(); URL.revokeObjectURL(url); } catch (error) { setMessage(error.response?.data?.message || "Receipt is not available."); } };
  const refund = async payment => { const rupeeAmount = window.prompt(`Refund amount (maximum ${rupees(payment.amount)})`, String(payment.amount / 100)); if (rupeeAmount === null) return; const reason = window.prompt("Refund reason") || ""; try { await axios.post(`${api}/api/payments/${payment._id}/refund`, { amount: Math.round(Number(rupeeAmount) * 100), reason }, { headers: headers() }); setMessage("Refund initiated through Razorpay."); load(); } catch (error) { setMessage(error.response?.data?.message || "Refund could not be initiated."); } };
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Secure payment center</p><h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{role === "teacher" ? "My Payments" : role === "admin" ? "School Payments" : "Payment Dashboard"}</h1></div>{["superadmin", "admin", "teacher"].includes(role) && <button onClick={changeSettings} className="rounded-xl border px-4 py-2 text-sm font-bold"><FaCog className="inline mr-2" />Payment settings</button>}</div>
    {message && <p className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
    {settings && <p className="text-xs text-slate-500">Gateway: Razorpay ({settings.environment}) · Online {settings.onlineEnabled ? "enabled" : "disabled"} · Offline {settings.offlineEnabled ? "enabled" : "disabled"}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Metric icon={<FaMoneyBillWave />} label={role === "teacher" ? "Salary received" : role === "superadmin" ? "Total revenue" : "Total received"} value={rupees(data.totalRevenue ?? data.totalReceived)} /><Metric icon={<FaHistory />} label={role === "superadmin" ? "Due schools" : "Pending payments"} value={role === "superadmin" ? data.dueSchools || 0 : data.pendingPayments || 0} /><Metric icon={<FaReceipt />} label={role === "admin" ? "Unpaid students" : role === "superadmin" ? "Free schools" : "Payment records"} value={role === "admin" ? data.unpaidStudents || 0 : role === "superadmin" ? data.freeSchools || 0 : data.paymentCount || 0} /></div>
    {role === "teacher" && <section className="rounded-2xl bg-white dark:bg-[#0B132A] border p-5 text-sm"><b>Current salary: {data.currentPayment ? rupees(data.currentPayment.amount) : "Not configured"}</b><p className="mt-1 text-slate-500">Due: {data.currentPayment?.dueDate ? new Date(data.currentPayment.dueDate).toLocaleDateString() : "Not set"} · Last payment: {data.lastPayment ? rupees(data.lastPayment.amount) : "None"}</p></section>}
    {role === "superadmin" && <section className="rounded-2xl bg-white dark:bg-[#0B132A] border p-5 text-sm"><b>Upcoming school payments</b><div className="mt-2 space-y-1 text-slate-500">{data.upcomingPayments?.slice(0, 5).map(item => <p key={item.schoolName}>{item.schoolName} · {rupees(item.amount)} · {item.status}</p>) || <p>None</p>}</div></section>}
    {role === "admin" && subscription && <section className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-5 flex flex-wrap justify-between gap-4"><div><b className="text-slate-800 dark:text-white">School subscription: {subscription.billing?.status}</b><p className="text-sm text-slate-500 mt-1">Amount due: {rupees(subscription.billing?.amountDue)} · Next billing: {subscription.subscription?.nextBillingDate ? new Date(subscription.subscription.nextBillingDate).toLocaleDateString() : "Not set"}</p></div>{subscription.billing?.paymentRequired && <button disabled={busy} onClick={paySubscription} className="rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white">Pay subscription</button>}</section>}
    <PaymentManagement role={role} apiBase={api} onChange={load} />
    <section className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 overflow-hidden"><div className="p-5 font-bold text-slate-800 dark:text-white">Payment history, pending payments & receipts</div><div className="divide-y divide-slate-100 dark:divide-white/10">{payments.length ? payments.map(payment => <div className="p-4 flex flex-wrap justify-between items-center gap-3" key={payment._id}><div><p className="font-bold text-sm text-slate-800 dark:text-white">{rupees(payment.amount)} · {payment.purpose.replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()} {payment.receiptNumber ? ` · ${payment.receiptNumber}` : ""}</p></div><div className="flex flex-wrap gap-2 items-center"><span className="text-xs font-bold rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1">{payment.status}</span>{payment.receiptNumber && <><button onClick={() => receipt(payment._id)} className="text-xs rounded-lg border px-3 py-1.5 font-bold">View receipt</button><button onClick={() => receipt(payment._id, true)} className="text-xs rounded-lg border px-3 py-1.5 font-bold">Download</button></>}{role === "superadmin" && ["Successful", "Partially Refunded"].includes(payment.status) && payment.gateway === "razorpay" && <button onClick={() => refund(payment)} className="text-xs rounded-lg border border-rose-300 px-3 py-1.5 font-bold text-rose-700">Refund</button>}{role === "admin" && payment.status === "PendingVerification" && <><button onClick={() => decideOffline(payment._id, "approve")} className="text-xs rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white"><FaCheck className="inline mr-1" />Approve</button><button onClick={() => decideOffline(payment._id, "reject")} className="text-xs rounded-lg border px-3 py-1.5 font-bold">Reject</button></>}</div></div>) : <p className="p-5 text-sm text-slate-500">No payment records found.</p>}</div></section>
  </div>;
}
function Metric({ icon, label, value }) { return <div className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-5"><div className="text-[#7C3AED]">{icon}</div><p className="mt-3 text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p></div>; }
