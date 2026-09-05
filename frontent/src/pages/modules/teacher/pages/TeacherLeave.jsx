import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaPlaneDeparture, 
  FaFilter, 
  FaEye, 
  FaFileUpload, 
  FaPaperPlane, 
  FaExclamationCircle, 
  FaCalendarDay 
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function LeaveBalanceDoughnut({ left, total }) {
  const radius = 32;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (left / (total || 15)) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center select-none shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r={radius} className="stroke-slate-100 dark:stroke-white/[0.04] fill-none" strokeWidth={strokeWidth} />
        <circle 
          cx="40" 
          cy="40" 
          r={radius} 
          className="stroke-blue-500 fill-none" 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center leading-none">
        <span className="text-sm font-black text-slate-900 dark:text-white">{left}</span>
        <span className="text-[6px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">Days Left</span>
      </div>
    </div>
  );
}

function TeacherLeave() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({
    totalBalance: 15,
    approved: 8,
    pending: 2,
    rejected: 1
  });
  const [overview, setOverview] = useState({
    casual: 10,
    sick: 3,
    special: 2,
    compOff: 0
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Leave History"); // Leave History, Pending Requests, Leave Balance
  const [statusFilter, setStatusFilter] = useState("All");

  // Form State
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
  
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const loadData = async () => {
    try {
      const leavesRes = await axios.get(`${API}/api/teacher-leaves`, { headers });
      setLeaves(leavesRes.data || []);

      const summaryRes = await axios.get(`${API}/api/teacher-leaves/summary`, { headers });
      if (summaryRes.data) {
        setSummary(summaryRes.data.summary);
        setOverview(summaryRes.data.overview);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading leave data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [API, token]);

  // Calculate total days from date inputs
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        const diff = Math.abs(end - start);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  }, [startDate, endDate]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitError("");

    if (!startDate) {
      setSubmitError("Please select a start date.");
      return;
    }

    try {
      await axios.post(`${API}/api/teacher-leaves`, {
        startDate,
        endDate: endDate || startDate,
        reason,
        leaveType,
        attachmentName: attachment ? attachment.name : "",
        attachmentSize: attachment ? `${Math.round(attachment.size / 1024)} KB` : ""
      }, { headers });

      setSubmitMessage("Leave request submitted successfully!");
      // Reset form
      setLeaveType("Casual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");
      setAttachment(null);
      
      // Reload lists and counts
      loadData();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Could not submit leave request.");
    }
  };

  // Helper date day formatter
  const formatDateWithDay = (dateStr) => {
    if (!dateStr) return { dateText: "—", dayText: "—" };
    const d = new Date(dateStr);
    const dateText = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const dayText = d.toLocaleDateString("en-IN", { weekday: "long" });
    return { dateText, dayText };
  };

  const getFilteredLeaves = () => {
    let list = leaves;
    // Tab filter
    if (activeTab === "Pending Requests") {
      list = list.filter(l => l.status === "Pending");
    }
    // Status drop dropdown filter
    if (statusFilter !== "All") {
      list = list.filter(l => l.status === statusFilter);
    }
    return list;
  };

  const filteredLeavesList = getFilteredLeaves();

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10 animate-none" style={{ fontFamily: SORA }}>
      
      {/* Title & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">On Leave / Leave Requests</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Apply for leave and track your leave requests
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-purple-500">On Leave</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (2 COLUMNS ON MOBILE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
        
        {/* Total Balance */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
            <FaCalendarDay className="text-xs sm:text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total Leave Balance</p>
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{summary.totalBalance} Days</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">As of today</p>
          </div>
        </div>

        {/* Approved Leaves */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
            <FaCheckCircle className="text-xs sm:text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Approved Leaves</p>
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{summary.approved} Days</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">This Year</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 flex items-center justify-center shrink-0">
            <FaClock className="text-xs sm:text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Pending Requests</p>
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{summary.pending} Day(s)</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">Awaiting Approval</p>
          </div>
        </div>

        {/* Rejected Leaves */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-4 rounded-2.5xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/15 flex items-center justify-center shrink-0">
            <FaTimesCircle className="text-xs sm:text-sm" />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Rejected Leaves</p>
            <span className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-0.5 block">{summary.rejected} Day(s)</span>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">This Year</p>
          </div>
        </div>

      </div>

      {/* Split layout block: Left (table) and Right (Overview + Request Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Column Table Panel (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            
            {/* Table controls */}
            <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              
              {/* Navigation tabs */}
              <div className="flex gap-2">
                {["Leave History", "Pending Requests"].map(tabName => (
                  <button
                    key={tabName}
                    onClick={() => setActiveTab(tabName)}
                    className={`px-4 py-2 font-black text-xs border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tabName
                        ? "border-purple-650 text-purple-650 dark:text-purple-400"
                        : "border-transparent text-slate-450 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tabName}
                  </button>
                ))}
              </div>

              {/* Filtering drop and button */}
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
                  <FaFilter className="text-[10px]" /> Filter
                </button>
              </div>

            </div>

            {/* Leaves Grid Table list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-slate-400 text-xs font-semibold">Loading leave requests...</p>
              </div>
            ) : filteredLeavesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-450 text-base shadow-inner mx-auto mb-1">
                  <FaPlaneDeparture />
                </div>
                <div>
                  <p className="text-slate-805 dark:text-white font-extrabold text-sm">No Leave Requests Found</p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">There are no leave requests under this criteria.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-[#1f2937]/30 border-b border-slate-200/50 dark:border-white/[0.05] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 w-12 text-center">#</th>
                      <th className="px-6 py-4">Leave Type</th>
                      <th className="px-6 py-4">From</th>
                      <th className="px-6 py-4">To</th>
                      <th className="px-6 py-4 text-center">Days</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4">Applied On</th>
                      <th className="px-6 py-4 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                    {filteredLeavesList.map((l, idx) => {
                      const fromFormat = formatDateWithDay(l.startDate);
                      const toFormat = formatDateWithDay(l.endDate || l.startDate);

                      // Style badges dynamically based on status and type
                      let badgeColor = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                      const tKey = l.leaveType?.toLowerCase() || "";
                      if (tKey.includes("sick") || tKey.includes("medical")) {
                        badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                      } else if (tKey.includes("special")) {
                        badgeColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                      }

                      return (
                        <tr key={l._id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all">
                          <td className="px-6 py-4 text-center font-bold text-slate-455 select-none">{idx + 1}</td>
                          
                          {/* Leave Type */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-slate-200">
                              <span className={`p-1.5 rounded-lg border ${badgeColor} select-none`}>
                                <FaPlaneDeparture className="text-[10px]" />
                              </span>
                              {l.leaveType}
                            </div>
                          </td>

                          {/* From Date */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200">{fromFormat.dateText}</p>
                            <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">{fromFormat.dayText}</p>
                          </td>

                          {/* To Date */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200">{toFormat.dateText}</p>
                            <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">{toFormat.dayText}</p>
                          </td>

                          {/* Days duration */}
                          <td className="px-6 py-4 text-center font-extrabold text-slate-900 dark:text-white select-none">
                            {l.duration}
                          </td>

                          {/* Reason */}
                          <td className="px-6 py-4 font-semibold text-slate-450 dark:text-slate-400 max-w-[140px] truncate">
                            {l.reason || "Personal work"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center select-none">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest leading-none ${
                              l.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : l.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-550 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}>
                              {l.status}
                            </span>
                          </td>

                          {/* Applied Date */}
                          <td className="px-6 py-4 font-bold text-slate-450 dark:text-slate-450 whitespace-nowrap">
                            {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-center">
                            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-450 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">
                              <FaEye className="text-[10px]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table pagination ledger */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/20 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider select-none">
              <span>Showing 1 to {filteredLeavesList.length} of {filteredLeavesList.length} requests</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">Prev</button>
                <span className="px-2 py-0.5 bg-purple-650 text-white rounded font-extrabold shadow-sm">1</span>
                <button className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer">Next</button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Balance overview + Request Form (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Leave Balance Overview widget */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Leave Balance Overview</h3>
            </div>

            <div className="flex items-center gap-5 py-1 select-none">
              <LeaveBalanceDoughnut left={summary.totalBalance} total={15} />

              <div className="flex-1 flex flex-col gap-2 text-[10px] font-bold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Casual Leave</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{overview.casual} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Sick Leave</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{overview.sick} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Special Leave</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{overview.special} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> Comp. Off</span>
                  <span className="text-slate-800 dark:text-white font-extrabold">{overview.compOff} Day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply for Leave Form widget */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Apply for Leave</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              
              {/* Leave Type Select */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Leave Type <span className="text-rose-500">*</span></label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Special Leave">Special Leave</option>
                  <option value="Comp. Off">Comp. Off</option>
                </select>
              </div>

              {/* Datepicker From */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">From Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Datepicker To */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">To Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Total Days */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Total Days</label>
                <input
                  type="number"
                  readOnly
                  value={totalDays}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.02] text-xs font-black text-slate-550 select-all"
                />
              </div>

              {/* Reason Description */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Reason <span className="text-rose-500">*</span></label>
                <textarea
                  placeholder="Enter reason for leave"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows="3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* File Upload Attachment drag & drop */}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Upload Document <span className="text-slate-400 font-semibold">(Optional)</span></label>
                <div className="border border-dashed border-slate-250 dark:border-white/10 hover:border-purple-500/40 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/[0.01] text-center transition-all cursor-pointer relative">
                  <input 
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FaFileUpload className="text-slate-400 text-lg mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {attachment ? attachment.name : "Drag & drop file here"}
                  </p>
                  <p className="text-[8px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                    {attachment ? `${Math.round(attachment.size / 1024)} KB` : "or browse"}
                  </p>
                </div>
              </div>

              {/* Alert Feedback Messages */}
              {submitMessage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold select-none leading-relaxed">
                  <FaCheckCircle className="text-xs shrink-0" /> {submitMessage}
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold select-none leading-relaxed">
                  <FaExclamationCircle className="text-xs shrink-0" /> {submitError}
                </div>
              )}

              {/* Submit button */}
              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <FaPaperPlane className="text-[10px]" /> Submit Leave Request
              </button>

            </form>
          </div>

        </div>

      </div>

      {/* Bottom Alert advance banner warning */}
      <div className="bg-purple-600/5 border border-purple-500/10 p-3.5 rounded-2xl flex items-center gap-2.5 select-none text-[10px] font-semibold text-slate-650 dark:text-slate-350">
        <FaExclamationCircle className="text-xs text-purple-600 shrink-0" />
        <span>Note: Please apply for leave at least 2 days in advance for approval.</span>
      </div>

    </div>
  );
}

export default TeacherLeave;
