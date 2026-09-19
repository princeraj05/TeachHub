import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, 
  FaSpinner, 
  FaExclamationCircle, 
  FaSearch, 
  FaSync, 
  FaChevronRight,
  FaClock
} from "react-icons/fa";
import { getMyRequests } from "../services/supportTicketApi";

export default function RequesterTicketHistory({ refreshTrigger }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const rawRole = localStorage.getItem("role") || localStorage.getItem("userRole") || "student";
  const userRole = rawRole === "unassigned" ? "pending" : rawRole.toLowerCase();

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyRequests({ limit: 50 });
      setTickets(res.tickets || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your support requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets, refreshTrigger]);

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const sQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = !sQuery || 
      t.ticketNumber?.toLowerCase().includes(sQuery) ||
      t.subject?.toLowerCase().includes(sQuery) ||
      t.category?.toLowerCase().includes(sQuery) ||
      t.department?.toLowerCase().includes(sQuery);

    return matchesStatus && matchesSearch;
  });

  const statuses = ["All", "New", "In Progress", "Waiting", "Resolved", "Closed"];

  return (
    <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 font-sans">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-lg shrink-0">
            <FaTicketAlt />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              My Support Requests
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              View status and conversation history for your submitted tickets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMyTickets}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Refresh ticket list"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? "bg-[#7C3AED] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-[#121B2E] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search my tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </div>
      </div>

      {/* TICKETS LIST CONTAINER */}
      {loading && tickets.length === 0 ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2">
          <FaSpinner className="animate-spin text-2xl text-[#7C3AED] dark:text-[#38BDF8]" />
          <span>Loading your support requests...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold space-y-3">
          <FaExclamationCircle className="text-2xl mx-auto" />
          <p>{error}</p>
          <button
            onClick={fetchMyTickets}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-600 transition"
          >
            Retry
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-xs space-y-2">
          <FaTicketAlt className="text-3xl text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No support requests found</p>
          <p className="text-slate-400 text-[11px] font-medium">
            {searchQuery || statusFilter !== "All" 
              ? "Try adjusting your search or filter options above." 
              : "Select a department above to submit a new support ticket."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map(t => (
            <div
              key={t._id}
              onClick={() => navigate(`/${userRole}/support-team/requests/${t._id}`)}
              className="p-4 bg-slate-50 dark:bg-[#121B2E] hover:bg-purple-500/5 dark:hover:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 hover:border-[#7C3AED]/40 dark:hover:border-[#38BDF8]/40 rounded-2xl transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-black text-xs text-[#7C3AED] dark:text-[#38BDF8] group-hover:underline">
                    {t.ticketNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                    t.status === "Resolved" ? "bg-emerald-500/20 text-emerald-500" :
                    t.status === "Closed" ? "bg-slate-500/20 text-slate-400" :
                    t.status === "Escalated" ? "bg-rose-600 text-white" :
                    t.status === "In Progress" ? "bg-amber-500/20 text-amber-500" : "bg-purple-500/20 text-[#7C3AED] dark:text-[#38BDF8]"
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {t.department || t.assignedDepartment}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {t.subject}
                </h3>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold flex-wrap">
                  <span>Category: <strong className="text-slate-700 dark:text-slate-300">{t.category}</strong></span>
                  <span>Priority: <strong className="text-amber-500">{t.priority}</strong></span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-[9px]" />
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-extrabold text-[#7C3AED] dark:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View Conversation <FaChevronRight className="text-[10px]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
