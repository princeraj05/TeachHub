import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, 
  FaPlus, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock,
  FaHourglassHalf,
  FaCheckCircle,
  FaSpinner,
  FaSync,
  FaExclamationCircle
} from "react-icons/fa";
import { getMyAssignedTickets } from "../../../services/supportTicketApi";
import CreateSupportTicketModal from "../../../components/CreateSupportTicketModal";

export default function SupportMyAssigned() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAssigned = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: pagination.page, limit: 20 };
      
      const statusMap = {
        new: "New",
        inProgress: "In Progress",
        waiting: "Waiting",
        resolved: "Resolved"
      };
      if (activeTab !== "all" && statusMap[activeTab]) {
        params.status = statusMap[activeTab];
      }
      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      const data = await getMyAssignedTickets(params);
      setTickets(data.tickets || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assigned tickets.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, priorityFilter, pagination.page]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const counts = {
    total: pagination.total || tickets.length,
    new: tickets.filter(t => t.status === "New").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    waiting: tickets.filter(t => t.status === "Waiting").length,
    resolved: tickets.filter(t => t.status === "Resolved").length
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>My Assigned Requests</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {counts.total}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and process support requests assigned specifically to your agent profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAssigned}
            disabled={loading}
            className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      <CreateSupportTicketModal 
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false);
          fetchAssigned();
        }}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-rose-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaTicketAlt className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{counts.new}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">New</div>
            <div className="text-[10px] text-slate-400">Assigned & unaddressed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-blue-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaClock className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{counts.inProgress}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">In Progress</div>
            <div className="text-[10px] text-slate-400">Currently working</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-amber-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaHourglassHalf className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{counts.waiting}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Waiting</div>
            <div className="text-[10px] text-slate-400">Awaiting requester</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-emerald-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaCheckCircle className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{counts.resolved}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Resolved</div>
            <div className="text-[10px] text-slate-400">Successfully closed</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TICKETS TABLE AREA */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs & Controls */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl w-full sm:w-auto overflow-x-auto select-none">
              {[
                { key: "all", label: "All" },
                { key: "new", label: "New" },
                { key: "inProgress", label: "In Progress" },
                { key: "waiting", label: "Waiting" },
                { key: "resolved", label: "Resolved" }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === t.key ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <FaExclamationCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOADING OR EMPTY */}
          {loading ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <FaSpinner className="animate-spin text-2xl text-purple-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-semibold">Loading assigned tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <FaTicketAlt className="text-3xl text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Assigned Tickets</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You currently have no tickets assigned matching this filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {tickets.map((t) => {
                      const requesterName = t.requester?.name || "Unknown User";
                      const requesterRole = t.requesterRole || t.requester?.role || "User";
                      const schoolName = t.schoolName || t.requester?.schoolName || "TeachHub HQ";

                      return (
                        <tr 
                          key={t._id} 
                          onClick={() => navigate(`/support/requests/${t._id}`)}
                          className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 cursor-pointer transition"
                        >
                          <td className="p-3.5 font-mono font-black text-purple-400">{t.ticketNumber}</td>
                          <td className="p-3.5 font-bold text-slate-800 dark:text-white">{t.subject}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {requesterName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white text-xs">{requesterName}</div>
                                <div className="text-[10px] text-slate-400 uppercase">{requesterRole}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{schoolName}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                              {t.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === "Urgent" ? "bg-rose-600 text-white" :
                              t.priority === "High" ? "bg-rose-500/10 text-rose-400" :
                              t.priority === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                            }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === "New" ? "bg-rose-500/20 text-rose-400" :
                              t.status === "In Progress" ? "bg-blue-500/20 text-blue-400" :
                              t.status === "Waiting" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>Showing page {pagination.page} of {pagination.pages} ({pagination.total} assigned requests)</div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-xl">{pagination.page}</span>
                  <button 
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">My Assignment Stats</h3>
            </div>
            <div className="flex justify-between"><span className="text-slate-400">Total Assigned</span><span className="font-bold text-slate-800 dark:text-white">{counts.total}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Resolved</span><span className="font-semibold text-emerald-400">{counts.resolved}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">In Progress</span><span className="font-semibold text-blue-400">{counts.inProgress}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Waiting</span><span className="font-semibold text-amber-400">{counts.waiting}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">New / Unaddressed</span><span className="font-semibold text-rose-400">{counts.new}</span></div>
          </div>

          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Filter Assigned</h3>
            
            <div className="space-y-2">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)} 
                className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Attendance Issue">Attendance Issue</option>
                <option value="Exam / Proctoring Problem">Exam / Proctoring Problem</option>
                <option value="Result Calculation Error">Result Calculation Error</option>
                <option value="School Subscription">School Subscription</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => fetchAssigned()} className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer">Apply</button>
              <button onClick={() => { setCategoryFilter("all"); setPriorityFilter("all"); setActiveTab("all"); }} className="px-4 py-2 bg-slate-100 dark:bg-[#162238] text-slate-400 font-bold rounded-xl text-xs cursor-pointer">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
