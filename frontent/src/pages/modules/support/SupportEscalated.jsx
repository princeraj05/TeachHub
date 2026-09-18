import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaSpinner, FaSync, FaExclamationCircle, FaSearch, FaFilter, FaUserCheck } from "react-icons/fa";
import { getEscalatedTickets } from "../../../services/supportTicketApi";

export default function SupportEscalated() {
  const navigate = useNavigate();
  const [escalatedTickets, setEscalatedTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const userRole = localStorage.getItem("userRole") || localStorage.getItem("role") || "";
  const isSuperAdmin = userRole.toLowerCase() === "superadmin";

  const fetchEscalated = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept) params.department = selectedDept;
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedStatus) params.status = selectedStatus;

      const data = await getEscalatedTickets(params);
      setEscalatedTickets(data.tickets || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch escalated issues.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, selectedPriority, selectedStatus]);

  useEffect(() => {
    fetchEscalated();
  }, [fetchEscalated]);

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "Urgent": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "High": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Medium": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Escalated Issues</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {pagination.total || escalatedTickets.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Critical technical and platform issues escalated directly to Super Admin for resolution.
          </p>
        </div>

        <button 
          onClick={fetchEscalated}
          disabled={loading}
          className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FaSearch className="text-xs" />
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, subject, reason..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {isSuperAdmin && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none text-xs"
            >
              <option value="">All Departments</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Onboarding">Onboarding</option>
            </select>
          )}

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none text-xs"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Escalated">Escalated</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING / EMPTY */}
      {loading ? (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
          <FaSpinner className="animate-spin text-2xl text-purple-500 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-semibold">Loading escalated tickets...</p>
        </div>
      ) : escalatedTickets.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
          <FaExclamationTriangle className="text-3xl text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Escalated Tickets Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently no tickets matching your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalatedTickets.map((item) => {
            const requesterName = item.requester?.name || "Unknown User";
            const requesterRole = item.requesterRole || item.requester?.role || "User";
            const school = item.schoolName || item.requester?.schoolName || "TeachHub HQ";
            const assignedAgent = item.assignedTo?.name || "Unassigned";

            return (
              <div 
                key={item._id} 
                onClick={() => navigate(`/support/requests/${item._id}`)}
                className="bg-white dark:bg-[#0D1527] border border-rose-500/20 hover:border-rose-500/50 rounded-2xl p-5 shadow-sm space-y-3 cursor-pointer transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-rose-500 text-base" />
                    <span className="font-mono font-bold text-rose-400 text-sm">{item.ticketNumber}</span>
                    <span className="text-xs text-slate-400">• {requesterName} ({requesterRole})</span>
                    <span className="text-xs text-slate-500">[{school}]</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority || "Medium"}
                    </span>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      item.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Subject: {item.subject}</h3>
                  <div className="mt-1 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
                    <strong>Escalation Reason:</strong> {item.escalatedReason || "No reason specified."}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span>Department: <strong className="text-slate-200">{item.assignedDepartment || item.department}</strong></span>
                    <span className="flex items-center gap-1">
                      <FaUserCheck className="text-purple-400 text-[10px]" />
                      <span>Agent: <strong className="text-slate-200">{assignedAgent}</strong></span>
                    </span>
                  </div>
                  <span>Escalated: <strong>{item.escalatedAt ? new Date(item.escalatedAt).toLocaleString() : new Date(item.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
