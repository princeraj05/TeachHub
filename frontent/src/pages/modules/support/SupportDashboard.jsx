import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, 
  FaClock, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaPlus, 
  FaSearch, 
  FaBookOpen, 
  FaChartBar, 
  FaExclamationTriangle, 
  FaArrowRight,
  FaSpinner,
  FaSync,
  FaExclamationCircle,
  FaSchool,
  FaUserCheck,
  FaLayerGroup
} from "react-icons/fa";
import { getSupportDashboardStats } from "../../../services/supportTicketApi";
import CreateSupportTicketModal from "../../../components/CreateSupportTicketModal";

export default function SupportDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Support Agent";
  const userRole = localStorage.getItem("userRole") || localStorage.getItem("role") || "support";
  const userDepartment = localStorage.getItem("supportDepartment") || "";

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSupportDashboardStats();
      setDashboardData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load support dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const totals = dashboardData?.totals || {
    all: 0,
    new: 0,
    open: 0,
    inProgress: 0,
    waiting: 0,
    resolved: 0,
    closed: 0,
    escalated: 0,
    unassigned: 0,
    myAssigned: 0
  };

  const priority = dashboardData?.priority || { urgent: 0, high: 0, medium: 0, low: 0 };
  const myWorkload = dashboardData?.myWorkload || { total: 0, new: 0, inProgress: 0, waiting: 0 };
  const recentTickets = dashboardData?.recentTickets || [];
  const departmentName = dashboardData?.department || userDepartment || "Department View";

  return (
    <div className="space-y-6">
      {/* WELCOME BANNER & DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Support Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {departmentName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time backend ticket metrics and operation overview for {departmentName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-2xl shadow-sm text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2.5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
            <FaCalendarAlt className="text-purple-500" />
            <span>{currentDateStr}</span>
          </div>
        </div>
      </div>

      <CreateSupportTicketModal 
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          fetchDashboardData();
        }}
      />

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.all}
          </div>
        </div>

        {/* New */}
        <div className="bg-white dark:bg-[#0D1527] border border-blue-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">New</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.new}
          </div>
        </div>

        {/* Open */}
        <div className="bg-white dark:bg-[#0D1527] border border-rose-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Open</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.open}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-[#0D1527] border border-amber-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">In Progress</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.inProgress}
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white dark:bg-[#0D1527] border border-purple-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Waiting</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.waiting}
          </div>
        </div>

        {/* Escalated */}
        <div className="bg-white dark:bg-[#0D1527] border border-rose-600/30 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Escalated</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-500 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.escalated}
          </div>
        </div>

        {/* Unassigned */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unassigned</div>
          <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.unassigned}
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white dark:bg-[#0D1527] border border-emerald-500/20 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Resolved</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {loading ? <FaSpinner className="animate-spin text-sm" /> : totals.resolved}
          </div>
        </div>
      </div>

      {/* WORKLOAD & PRIORITY BREAKDOWN ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Workload Card */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <FaUserCheck className="text-purple-500" />
              <span>My Assigned Workload</span>
            </h3>
            <button onClick={() => navigate("/support/my-assigned")} className="text-purple-400 text-xs font-bold hover:underline cursor-pointer">
              View All ({myWorkload.total})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
              <span className="text-slate-400 block text-[10px]">Total Assigned</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{myWorkload.total}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
              <span className="text-slate-400 block text-[10px]">New Assigned</span>
              <span className="text-lg font-black text-blue-400">{myWorkload.new}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
              <span className="text-slate-400 block text-[10px]">In Progress</span>
              <span className="text-lg font-black text-amber-400">{myWorkload.inProgress}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
              <span className="text-slate-400 block text-[10px]">Waiting</span>
              <span className="text-lg font-black text-purple-400">{myWorkload.waiting}</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <FaLayerGroup className="text-amber-500" />
              <span>Priority Breakdown</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <span className="text-rose-400 block text-[10px] font-bold">Urgent Priority</span>
              <span className="text-lg font-black text-rose-500">{priority.urgent}</span>
            </div>
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <span className="text-rose-400 block text-[10px] font-bold">High Priority</span>
              <span className="text-lg font-black text-rose-400">{priority.high}</span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-amber-400 block text-[10px] font-bold">Medium Priority</span>
              <span className="text-lg font-black text-amber-400">{priority.medium}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
              <span className="text-slate-400 block text-[10px] font-bold">Low Priority</span>
              <span className="text-lg font-black text-slate-400">{priority.low}</span>
            </div>
          </div>
        </div>

        {/* Quick Operational Actions Card */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <FaChartBar className="text-purple-500" />
              <span>Quick Operational Actions</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              onClick={() => setShowNewModal(true)}
              className="p-3 bg-slate-50 dark:bg-[#121B2E] hover:bg-purple-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <FaPlus className="text-xs" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">Create Ticket</div>
              <div className="text-[9px] text-slate-400">Manual submission</div>
            </button>

            <button 
              onClick={() => navigate("/support/my-assigned")}
              className="p-3 bg-slate-50 dark:bg-[#121B2E] hover:bg-blue-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <FaTicketAlt className="text-xs" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">My Assigned</div>
              <div className="text-[9px] text-slate-400">Your tickets</div>
            </button>

            <button 
              onClick={() => navigate("/support/escalated")}
              className="p-3 bg-slate-50 dark:bg-[#121B2E] hover:bg-rose-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <FaExclamationTriangle className="text-xs" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">Escalated</div>
              <div className="text-[9px] text-slate-400">Critical issues</div>
            </button>

            <button 
              onClick={() => navigate("/support/requests")}
              className="p-3 bg-slate-50 dark:bg-[#121B2E] hover:bg-cyan-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1 group-hover:scale-110 transition">
                <FaSchool className="text-xs" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">All Requests</div>
              <div className="text-[9px] text-slate-400">Department list</div>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT TICKETS TABLE */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTicketAlt className="text-purple-500 text-base" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Department Tickets</h3>
          </div>
          <button 
            onClick={() => navigate("/support/requests")}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({totals.all})</span>
            <FaArrowRight className="text-[10px]" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            <FaSpinner className="animate-spin text-xl text-purple-500 mx-auto mb-2" />
            Loading recent tickets...
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No recent tickets found in {departmentName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">#</th>
                  <th className="pb-3 px-2">Requester</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">School</th>
                  <th className="pb-3 px-2">Subject</th>
                  <th className="pb-3 px-2">Assigned Agent</th>
                  <th className="pb-3 px-2">Priority</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentTickets.map((req) => {
                  const requesterName = req.requester?.name || "Unknown User";
                  const requesterRole = req.requesterRole || req.requester?.role || "User";
                  const schoolName = req.schoolName || req.requester?.schoolName || "TeachHub HQ";

                  return (
                    <tr 
                      key={req._id}
                      onClick={() => navigate(`/support/requests/${req._id}`)}
                      className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 cursor-pointer transition"
                    >
                      <td className="py-3 px-2 font-mono font-black text-purple-600 dark:text-purple-400">{req.ticketNumber}</td>
                      <td className="py-3 px-2 font-bold text-slate-800 dark:text-white">{requesterName}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">
                          {requesterRole}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">{schoolName}</td>
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[150px]">{req.subject}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-medium">
                        {req.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.priority === "Urgent" ? "bg-rose-600 text-white" :
                          req.priority === "High" ? "bg-rose-500/10 text-rose-400" :
                          req.priority === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === "New" ? "bg-blue-500/20 text-blue-400" :
                          req.status === "Open" ? "bg-rose-500/20 text-rose-400" :
                          req.status === "In Progress" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
