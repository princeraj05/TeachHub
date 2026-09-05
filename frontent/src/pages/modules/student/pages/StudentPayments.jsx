import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaCreditCard, FaHistory } from "react-icons/fa";
import { startBackendPayment } from "../../../../utils/razorpayCheckout";
import socket from "../../../../socket";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((value || 0) / 100);

export default function StudentPayments() {
  const api = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const [payments, setPayments] = useState([]);
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [options, setOptions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/api/student-payments/dashboard`, { headers });
      setPayments(res.data.payments || []);
      setPlan(res.data.plan || null);
      setOptions(res.data.options || null);
      setSummary(res.data.summary || null);
    } catch {
      try {
        const [history, fee, modes, paymentSummary] = await Promise.all([
          axios.get(`${api}/api/payments`, { headers }),
          axios.get(`${api}/api/student-payments/fee-plan`, { headers }),
          axios.get(`${api}/api/payment-options`, { headers }),
          axios.get(`${api}/api/student-payments/summary`, { headers })
        ]);
        setPayments(history.data || []);
        setPlan(fee.data || null);
        setOptions(modes.data || null);
        setSummary(paymentSummary.data || null);
      } catch {
        setMessage("Payment information is currently unavailable.");
      }
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => {
    load();

    try {
      socket.connect();
    } catch (err) {
      console.error("Socket connect error:", err);
    }

    const handleRealtimeUpdate = () => {
      load();
    };

    socket.on("feePlan:updated", handleRealtimeUpdate);
    socket.on("paymentSettings:updated", handleRealtimeUpdate);
    socket.on("payment:updated", handleRealtimeUpdate);
    socket.on("payment:created", handleRealtimeUpdate);

    // 15-second background polling fallback to guarantee real-time updates even if WebSockets are blocked
    const intervalId = setInterval(load, 15000);

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      socket.off("feePlan:updated", handleRealtimeUpdate);
      socket.off("paymentSettings:updated", handleRealtimeUpdate);
      socket.off("payment:updated", handleRealtimeUpdate);
      socket.off("payment:created", handleRealtimeUpdate);
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [load]);

  const payOnline = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await startBackendPayment({
        apiBase: api,
        token,
        createOrderEndpoint: "/api/student-payments/create-order",
        customer: { name: localStorage.getItem("name") }
      });
      setMessage(result.status === "Successful" ? "Payment verified successfully." : "Payment is being verified.");
      await load();
    } catch (e) {
      try {
        await axios.post(`${api}/api/student-payments/cancel-processing`, {}, { headers });
      } catch (err) {
        console.error("Failed to cancel processing payment:", err.message);
      }
      setMessage(e.response?.data?.message || e.message || "Payment could not be completed.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const getReceipt = async (id, download = false) => {
    try {
      const response = await axios.get(`${api}/api/payments/${id}/receipt?download=1`, {
        headers,
        responseType: "blob"
      });
      const url = URL.createObjectURL(response.data);
      if (!download) {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt-${id}.html`;
        link.click();
      }
    } catch {
      setMessage("Receipt is not available.");
    }
  };

  const successfulPayments = payments.filter(p => p.status === "Successful");
  const totalPaid = summary?.totalPaid ?? successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const lastPayment = summary?.lastPayment || successfulPayments[0] || null;
  const isPlanConfigured = Boolean(plan && plan.active);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Secure payments</p>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Pay School Fee</h1>
        <p className="text-sm text-slate-500 mt-1">Amounts and payment status are verified by TeachHub.</p>
      </div>

      {message && <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Current Fee" value={isPlanConfigured ? money(plan.monthlyFee) : "Not Configured"} />
        <Stat label="Total Paid" value={money(totalPaid)} highlight={totalPaid > 0} />
        <Stat label="Last Paid" value={lastPayment ? money(lastPayment.amount) : "₹0.00"} />
        <Stat label="Payment Status" value={!isPlanConfigured ? "Not Configured" : (summary?.paymentStatus || "Pending")} />
        <Stat label="Validity Remaining" value={summary?.remainingDays ? `${summary.remainingDays} Days` : "—"} />
      </div>

      <section className="rounded-2.5xl sm:rounded-3xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[#7C3AED] font-bold"><FaCreditCard /> Current school fee</div>
          <p className="mt-3 text-3xl font-extrabold text-slate-800 dark:text-white">{isPlanConfigured ? money(plan.monthlyFee) : "Not configured"}</p>
          
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>• One verified payment is permitted per billing month.</p>
            {lastPayment && (
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Last payment made: <b>{money(lastPayment.amount)}</b> on {new Date(lastPayment.paidAt || lastPayment.createdAt).toLocaleDateString()}
              </p>
            )}
            <p className="font-semibold text-purple-600 dark:text-purple-400">
              • Total amount paid so far: <b>{money(totalPaid)}</b>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:w-56 gap-2 justify-center">
          {!isPlanConfigured ? (
            <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs font-bold text-amber-800 dark:text-amber-300">
              School fee is not configured by your admin yet.
            </p>
          ) : summary?.paymentStatus === "PendingVerification" ? (
            <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs font-bold text-amber-800 dark:text-amber-300">
              This billing month is awaiting verification.
            </p>
          ) : (summary?.remainingDays > 0 || summary?.paymentStatus === "Successful") ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 space-y-1">
              <p>✓ This billing month is already paid.</p>
              {summary?.remainingDays > 0 && <p className="text-[11px] font-normal">{summary.remainingDays} days validity remaining.</p>}
            </div>
          ) : options?.available === false ? (
            <p className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs font-bold text-amber-800 dark:text-amber-300">
              Payment is currently unavailable. Please contact your administrator.
            </p>
          ) : (
            <>
              {options?.onlineEnabled && (
                <button disabled={busy} onClick={payOnline} className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] px-4 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50 cursor-pointer">
                  {busy ? "Please wait…" : "Pay online"}
                </button>
              )}
              {options?.offlineEnabled && (
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 p-3 text-xs font-semibold text-purple-900 dark:text-purple-300 leading-normal">
                  For offline payment: Meet your principal and do payment
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="rounded-2.5xl sm:rounded-3xl bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-white/10 font-bold text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div><FaHistory className="inline mr-2 text-[#7C3AED]" />Payment history & receipts</div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900/50 self-start sm:self-auto">
            Total Paid: {money(totalPaid)}
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {payments.length ? payments.map(p => (
            <div key={p._id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  {money(p.amount)} · {p.purpose.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(p.createdAt).toLocaleDateString()} {p.receiptNumber ? ` · Receipt ${p.receiptNumber}` : ""}
                </p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  p.status === "Successful" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                  p.status === "PendingVerification" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                  "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}>
                  {p.status}
                </span>
                {["Pending", "Processing"].includes(p.status) && p.gateway === "razorpay" && (
                  <button onClick={async () => {
                    setMessage("Checking payment status with Razorpay...");
                    try {
                      const { data } = await axios.post(`${api}/api/payments/${p._id}/verify-status`, {}, { headers });
                      if (data.status === "Successful") {
                        setMessage("Payment verified successfully.");
                      } else {
                        setMessage(data.message || "Payment is still processing or failed.");
                      }
                      load();
                    } catch (err) {
                      setMessage(err.response?.data?.message || "Failed to verify payment status.");
                    }
                  }} className="rounded-lg border border-indigo-300 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                    Verify
                  </button>
                )}
                {p.receiptNumber && (
                  <>
                    <button onClick={() => getReceipt(p._id, false)} className="rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">View</button>
                    <button onClick={() => getReceipt(p._id, true)} className="rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Download</button>
                  </>
                )}
              </div>
            </div>
          )) : (
            <p className="p-5 text-sm text-slate-500 font-medium">No payments yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-2.5xl sm:rounded-3xl bg-white dark:bg-[#0B132A] border p-3 sm:p-4 text-sm ${highlight ? "border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/10" : "border-slate-200 dark:border-white/10"}`}>
      <b className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider block">{label}</b>
      <p className={`text-base sm:text-lg font-extrabold mt-1 truncate ${highlight ? "text-purple-600 dark:text-purple-400" : "text-slate-800 dark:text-white"}`}>{value}</p>
    </div>
  );
}
