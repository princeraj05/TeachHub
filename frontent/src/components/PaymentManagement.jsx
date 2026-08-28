import { useEffect, useState } from "react";
import axios from "axios";
import { startBackendPayment } from "../utils/razorpayCheckout";

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((value || 0) / 100);

// Management controls only submit administrative intent. The server derives all
// financial values used to create a payment, and enforces roles/school scope.
export default function PaymentManagement({ role, apiBase, onChange }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [schoolNames, setSchoolNames] = useState([]);
  const [fee, setFee] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [teachers, setTeachers] = useState([]);
  const [compensations, setCompensations] = useState([]);
  const [notice, setNotice] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});

  const load = async () => {
    try {
      if (role === "superadmin") {
        const [subRes, schoolRes] = await Promise.all([
          axios.get(`${apiBase}/api/superadmin/subscriptions`, { headers: auth() }),
          axios.get(`${apiBase}/api/superadmin/schools`, { headers: auth() })
        ]);
        setSubscriptions(subRes.data);
        setSchoolNames(schoolRes.data || []);
      }
      if (role === "admin") {
        const [plan, staff, compensation] = await Promise.all([
          axios.get(`${apiBase}/api/admin/fee-plan`, { headers: auth() }),
          axios.get(`${apiBase}/api/admin/users/teachers`, { headers: auth() }),
          axios.get(`${apiBase}/api/admin/teacher-compensations`, { headers: auth() })
        ]);
        setFee(plan.data?.monthlyFee ? String(plan.data.monthlyFee / 100) : "");
        setValidityDays(plan.data?.validityDays ? String(plan.data.validityDays) : "30");
        setTeachers(staff.data || []); setCompensations(compensation.data || []);
      }
    } catch (error) { setNotice(error.response?.data?.message || "Management data could not be loaded."); }
  };
  useEffect(() => { load(); }, [role, apiBase]);

  const saveFee = async e => {
    e.preventDefault();
    const monthlyFee = Math.round(Number(fee) * 100);
    const days = Math.round(Number(validityDays));
    try { await axios.put(`${apiBase}/api/admin/fee-plan`, { monthlyFee, validityDays: days }, { headers: auth() }); setNotice("Student fee plan saved."); onChange?.(); }
    catch (error) { setNotice(error.response?.data?.message || "Fee plan could not be saved."); }
  };

  const saveSalary = (teacher) => {
    const existing = compensations.find(item => String(item.teacher?._id || item.teacher) === String(teacher._id));
    setActiveModal("salary");
    setModalData({
      teacher,
      salary: existing ? String(existing.salary / 100) : "",
      dueDate: existing?.dueDate ? existing.dueDate.slice(0, 10) : ""
    });
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBase}/api/admin/teacher-compensations/${modalData.teacher._id}`, {
        salary: Math.round(Number(modalData.salary) * 100),
        paymentCycle: "MONTHLY",
        dueDate: modalData.dueDate || null
      }, { headers: auth() });
      setNotice("Teacher salary saved.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Salary could not be saved.");
    }
  };

  const payTeacher = async (teacher, offline = false) => {
    if (offline) {
      setActiveModal("payTeacher");
      setModalData({
        teacher,
        method: "BANK_TRANSFER",
        reference: ""
      });
      return;
    }
    try {
      await startBackendPayment({ apiBase, token: localStorage.getItem("token"), createOrderEndpoint: `/api/teacher-payments/${teacher._id}/create-order`, customer: { name: localStorage.getItem("name") } });
      setNotice("Teacher payment was verified.");
      load(); onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || "Teacher payment could not be created.");
    }
  };

  const handlePayTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/api/admin/teacher-payments/${modalData.teacher._id}/offline-request`, {
        method: modalData.method,
        reference: modalData.reference
      }, { headers: auth() });
      setNotice("Teacher payment is awaiting verification.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Teacher payment could not be created.");
    }
  };

  const grantFree = (item) => {
    setActiveModal("grantFree");
    setModalData({
      item,
      type: "PROMOTIONAL",
      startDate: "",
      endDate: "",
      days: "30"
    });
  };

  const handleGrantFreeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(modalData.item.subscription.schoolName)}/free-period`, {
        ...(modalData.startDate && { startDate: modalData.startDate }),
        ...(modalData.endDate ? { endDate: modalData.endDate } : { days: Number(modalData.days) }),
        type: modalData.type.toUpperCase(),
        reason: "Administrative free period"
      }, { headers: auth() });
      setNotice("Free period granted.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Free period could not be granted.");
    }
  };

  const changeStatus = (item) => {
    setActiveModal("changeStatus");
    setModalData({
      item,
      status: item.subscription.status || "Active"
    });
  };

  const handleChangeStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(modalData.item.subscription.schoolName)}/status`, {
        status: modalData.status
      }, { headers: auth() });
      setNotice("Subscription status updated.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Status could not be updated.");
    }
  };

  const cancelFree = (period) => {
    setActiveModal("cancelFree");
    setModalData({
      period,
      reason: ""
    });
  };

  const handleCancelFreeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBase}/api/superadmin/free-periods/${modalData.period._id}/cancel`, {
        reason: modalData.reason
      }, { headers: auth() });
      setNotice("Free period cancelled.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Free period could not be cancelled.");
    }
  };

  const configureSubscription = () => {
    setActiveModal("configureSubscription");
    setModalData({
      schoolName: schoolNames[0] || "",
      fee: "",
      billingStartDate: new Date().toISOString().slice(0, 10),
      gracePeriodDays: "0"
    });
  };

  const handleConfigureSubscriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBase}/api/superadmin/subscriptions/${encodeURIComponent(modalData.schoolName)}`, {
        monthlyFee: Math.round(Number(modalData.fee) * 100),
        billingStartDate: modalData.billingStartDate,
        gracePeriodDays: Number(modalData.gracePeriodDays)
      }, { headers: auth() });
      setNotice("School subscription configured.");
      setActiveModal(null);
      load();
      onChange?.();
    } catch (error) {
      setNotice(error.response?.data?.message || "Subscription could not be configured.");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B132A] relative">
      <h2 className="font-bold text-slate-800 dark:text-white">Payment management</h2>
      {notice && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-800">{notice}</p>}
      {role === "admin" && (
        <>
          <form onSubmit={saveFee} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold">
              Monthly student fee (₹)
              <input
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                required
                className="mt-1 block rounded-lg border p-2 bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white w-32"
              />
            </label>
            <label className="text-sm font-semibold">
              Validity cycle (Days)
              <input
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                type="number"
                min="1"
                required
                className="mt-1 block rounded-lg border p-2 bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white w-24"
              />
            </label>
            <button className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-purple-700">Save fee plan</button>
          </form>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-white/10">
            {teachers.map((teacher) => {
              const item = compensations.find((c) => String(c.teacher?._id || c.teacher) === String(teacher._id));
              return (
                <div key={teacher._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span className="text-slate-800 dark:text-slate-200">
                    {teacher.name} {item ? `· ${money(item.salary)}/${item.paymentCycle?.toLowerCase() || "month"}` : "· Salary not set"}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => saveSalary(teacher)} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                      Set salary
                    </button>
                    {item && (
                      <>
                        <button onClick={() => payTeacher(teacher)} className="rounded-lg bg-[#7C3AED] px-3 py-1.5 font-bold text-white cursor-pointer hover:bg-purple-750">
                          Pay online
                        </button>
                        <button onClick={() => payTeacher(teacher, true)} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                          Pay offline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {role === "superadmin" && (
        <>
          <button onClick={configureSubscription} className="mt-4 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-purple-700">
            Configure school subscription
          </button>
          <div className="mt-2 divide-y divide-slate-100 dark:divide-white/10">
            {subscriptions.map((item) => (
              <div key={item.subscription._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <b className="text-slate-800 dark:text-white">{item.subscription.schoolName}</b>
                  <p className="text-slate-500">
                    {money(item.subscription.monthlyFee)} · {item.billing.status} · next {new Date(item.subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                  {item.freePeriods
                    ?.filter((period) => period.status === "Active")
                    .map((period) => (
                      <p key={period._id} className="mt-1 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                        Free: {new Date(period.startDate).toLocaleDateString()}–{new Date(period.endDate).toLocaleDateString()}{" "}
                        <button onClick={() => cancelFree(period)} className="underline cursor-pointer text-rose-600 hover:text-rose-700">
                          cancel
                        </button>
                      </p>
                    ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => grantFree(item)} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                    Grant free period
                  </button>
                  <button onClick={() => changeStatus(item)} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                    Change status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MODALS CONTAINER ── */}
      {activeModal === "salary" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Set Monthly Salary for {modalData.teacher.name}</h3>
            <form onSubmit={handleSalarySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Salary (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={modalData.salary}
                  onChange={(e) => setModalData({ ...modalData, salary: e.target.value })}
                  placeholder="Enter monthly salary..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={modalData.dueDate}
                  onChange={(e) => setModalData({ ...modalData, dueDate: e.target.value })}
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "payTeacher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Record Offline Salary Payment</h3>
            <form onSubmit={handlePayTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Payment Method
                </label>
                <select
                  value={modalData.method}
                  onChange={(e) => setModalData({ ...modalData, method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MANUAL_UPI">Manual UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Payment Reference / Transaction ID
                </label>
                <input
                  type="text"
                  required
                  value={modalData.reference}
                  onChange={(e) => setModalData({ ...modalData, reference: e.target.value })}
                  placeholder="e.g. TXN10293848..."
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "grantFree" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Grant Free Subscription Period</h3>
            <form onSubmit={handleGrantFreeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Free Period Type
                </label>
                <select
                  value={modalData.type}
                  onChange={(e) => setModalData({ ...modalData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                >
                  <option value="PROMOTIONAL">Promotional</option>
                  <option value="FREE_TRIAL">Free Trial</option>
                  <option value="COMPENSATION">Compensation</option>
                  <option value="SPECIAL_OFFER">Special Offer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Start Date (Optional - leave blank for today)
                </label>
                <input
                  type="date"
                  value={modalData.startDate}
                  onChange={(e) => setModalData({ ...modalData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  End Date (Optional - overrides duration)
                </label>
                <input
                  type="date"
                  value={modalData.endDate}
                  onChange={(e) => setModalData({ ...modalData, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              {!modalData.endDate && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={modalData.days}
                    onChange={(e) => setModalData({ ...modalData, days: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                  />
                </div>
              )}

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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Grant Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "changeStatus" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Change Subscription Status</h3>
            <form onSubmit={handleChangeStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Subscription Status
                </label>
                <select
                  value={modalData.status}
                  onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Payment Due">Payment Due</option>
                </select>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "cancelFree" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Cancel Free Subscription Period</h3>
            <form onSubmit={handleCancelFreeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Reason for Cancellation
                </label>
                <textarea
                  required
                  value={modalData.reason}
                  onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                  placeholder="Enter cancellation reason..."
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
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "configureSubscription" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-white mb-4">Configure School Subscription</h3>
            <form onSubmit={handleConfigureSubscriptionSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  School Name
                </label>
                {schoolNames.length > 0 ? (
                  <select
                    required
                    value={modalData.schoolName}
                    onChange={(e) => setModalData({ ...modalData, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                  >
                    {schoolNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={modalData.schoolName}
                    onChange={(e) => setModalData({ ...modalData, schoolName: e.target.value })}
                    placeholder="Enter exact school name..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Monthly Subscription Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={modalData.fee}
                  onChange={(e) => setModalData({ ...modalData, fee: e.target.value })}
                  placeholder="Enter monthly fee amount..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Billing Start Date
                </label>
                <input
                  type="date"
                  required
                  value={modalData.billingStartDate}
                  onChange={(e) => setModalData({ ...modalData, billingStartDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={modalData.gracePeriodDays}
                  onChange={(e) => setModalData({ ...modalData, gracePeriodDays: e.target.value })}
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
