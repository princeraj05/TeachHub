import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaCog, FaHistory, FaMoneyBillWave, FaReceipt } from "react-icons/fa";
import { startBackendPayment } from "../utils/razorpayCheckout";
import PaymentManagement from "./PaymentManagement";

const rupees = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((value || 0) / 100);
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function PaymentCenter({ role }) {
  const api = import.meta.env.VITE_API_URL;
  const [data, setData] = useState({ recentPayments: [] });
  const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});

  const load = useCallback(async () => {
    try {
      const calls = [
        axios.get(`${api}/api/payments/dashboard`, { headers: headers() }),
        axios.get(`${api}/api/payments`, { headers: headers() })
      ];
      if (role === "admin") calls.push(axios.get(`${api}/api/admin/subscription`, { headers: headers() }));
      if (["superadmin", "admin", "teacher"].includes(role)) calls.push(axios.get(`${api}/api/payment-settings`, { headers: headers() }));
      const results = await Promise.all(calls);
      setData(results[0].data);
      setPayments(results[1].data);
      if (role === "admin") setSubscription(results[2].data);
      setSettings(results[role === "admin" ? 3 : 2]?.data || null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load payment data.");
    }
  }, [api, role]);

  useEffect(() => {
    load();
  }, [load]);

  const paySubscription = async () => {
    setBusy(true);
    try {
      await startBackendPayment({
        apiBase: api,
        token: localStorage.getItem("token"),
        createOrderEndpoint: "/api/school-subscription/create-order",
        customer: { name: localStorage.getItem("name") }
      });
      setMessage("Subscription payment has been verified.");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setBusy(false);
    }
  };

  const decideOffline = async (id, action) => {
    if (action === "reject") {
      setActiveModal("reject");
      setModalData({ id, reason: "" });
      return;
    }
    try {
      await axios.put(`${api}/api/payments/${id}/approve-offline`, {}, { headers: headers() });
      setMessage("Offline payment approved.");
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment approval failed.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.reason) return;
    try {
      await axios.put(`${api}/api/payments/${modalData.id}/reject-offline`, { reason: modalData.reason }, { headers: headers() });
      setMessage("Offline payment rejected.");
      setActiveModal(null);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment rejection failed.");
    }
  };

  const changeSettings = () => {
    setActiveModal("settings");
    setModalData({
      environment: settings?.environment || "test",
      onlineEnabled: settings?.onlineEnabled !== false,
      offlineEnabled: settings?.offlineEnabled !== false,
      keyId: settings?.keyId || "",
      keySecret: "",
      webhookSecret: ""
    });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${api}/api/payment-settings`, {
        environment: modalData.environment,
        onlineEnabled: modalData.onlineEnabled,
        offlineEnabled: modalData.offlineEnabled,
        ...(modalData.onlineEnabled && {
          razorpayKeyId: modalData.keyId,
          razorpayKeySecret: modalData.keySecret,
          razorpayWebhookSecret: modalData.webhookSecret
        })
      }, { headers: headers() });
      setMessage("Payment settings saved successfully. Credentials remain server-only.");
      setActiveModal(null);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Settings update failed.");
    }
  };

  const receipt = async (id, download = false) => {
    try {
      const response = await axios.get(`${api}/api/payments/${id}/receipt${download ? "?download=1" : ""}`, {
        headers: headers(),
        responseType: download ? "blob" : "json"
      });
      if (!download) return setMessage(`Receipt ${response.data.receiptNumber}: ${rupees(response.data.amount)} · ${response.data.status}`);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${response.data.receiptNumber || "payment"}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.response?.data?.message || "Receipt is not available.");
    }
  };

  const refund = (payment) => {
    setActiveModal("refund");
    setModalData({
      payment,
      rupeeAmount: String(payment.amount / 100),
      reason: ""
    });
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${api}/api/payments/${modalData.payment._id}/refund`, {
        amount: Math.round(Number(modalData.rupeeAmount) * 100),
        reason: modalData.reason
      }, { headers: headers() });
      setMessage("Refund initiated through Razorpay.");
      setActiveModal(null);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Refund could not be initiated.");
    }
  };
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
      {/* ── MODALS CONTAINER ── */}
      {activeModal === "reject" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Reject Payment Request</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  value={modalData.reason}
                  onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                  placeholder="Enter rejection details..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium text-slate-800 dark:text-white"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Reject Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "settings" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Payment Settings</h3>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Environment
                </label>
                <select
                  value={modalData.environment}
                  onChange={(e) => setModalData({ ...modalData, environment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                >
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-white">Enable Online Payments</span>
                  <span className="text-[10px] text-slate-450">Process Razorpay checkouts</span>
                </div>
                <input
                  type="checkbox"
                  checked={modalData.onlineEnabled}
                  onChange={(e) => setModalData({ ...modalData, onlineEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-white">Enable Offline Payments</span>
                  <span className="text-[10px] text-slate-450">Accept manual slip uploads</span>
                </div>
                <input
                  type="checkbox"
                  checked={modalData.offlineEnabled}
                  onChange={(e) => setModalData({ ...modalData, offlineEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {modalData.onlineEnabled && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      required
                      value={modalData.keyId}
                      onChange={(e) => setModalData({ ...modalData, keyId: e.target.value })}
                      placeholder="rzp_test_..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      value={modalData.keySecret}
                      onChange={(e) => setModalData({ ...modalData, keySecret: e.target.value })}
                      placeholder="Leave blank to keep existing"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Razorpay Webhook Secret
                    </label>
                    <input
                      type="password"
                      value={modalData.webhookSecret}
                      onChange={(e) => setModalData({ ...modalData, webhookSecret: e.target.value })}
                      placeholder="Optional, leave blank to keep existing"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "refund" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Refund Payment</h3>
            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Refund Amount (₹) - Maximum {rupees(modalData.payment.amount)}
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={modalData.payment.amount / 100}
                  step="0.01"
                  value={modalData.rupeeAmount}
                  onChange={(e) => setModalData({ ...modalData, rupeeAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Refund Reason
                </label>
                <input
                  type="text"
                  required
                  value={modalData.reason}
                  onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                  placeholder="Enter reason for refund..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Initiate Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>;
  }
  function Metric({ icon, label, value }) { return <div className="rounded-2xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-5"><div className="text-[#7C3AED]">{icon}</div><p className="mt-3 text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p></div>; }
