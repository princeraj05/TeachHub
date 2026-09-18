import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, 
  FaPlus, 
  FaFilter, 
  FaSearch, 
  FaThList, 
  FaThLarge, 
  FaChevronLeft, 
  FaChevronRight,
  FaSpinner,
  FaSync,
  FaExclamationCircle
} from "react-icons/fa";
import { getSupportTickets } from "../../../services/supportTicketApi";
import CreateSupportTicketModal from "../../../components/CreateSupportTicketModal";

export default function SupportRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [showNewModal, setShowNewModal] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: pagination.page, limit: 20 };
      
      const statusMap = {
        new: "New",
        open: "Open",
        inProgress: "In Progress",
        waiting: "Waiting",
        resolved: "Resolved",
        closed: "Closed",
        escalated: "Escalated"
      };
      if (activeTab !== "all" && statusMap[activeTab]) {
        params.status = statusMap[activeTab];
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      const data = await getSupportTickets(params);
      setTickets(data.tickets || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch support requests.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, priorityFilter, categoryFilter, pagination.page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setActiveTab("all");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Requests</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {pagination.total}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage real support tickets from students, teachers, and school admins.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      <CreateSupportTicketModal 
        isOpen={showNewModal} 
        onClose={() => {
          setShowNewModal(false);
          fetchTickets();
        }} 
      />

      {/* SUMMARY STAT TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 select-none">
        {[
          { key: "all", label: "All Requests", color: "text-purple-400" },
          { key: "new", label: "New", color: "text-blue-400" },
          { key: "open", label: "Open", color: "text-rose-400" },
          { key: "inProgress", label: "In Progress", color: "text-amber-400" },
          { key: "waiting", label: "Waiting", color: "text-indigo-400" },
          { key: "resolved", label: "Resolved", color: "text-emerald-400" },
          { key: "escalated", label: "Escalated", color: "text-rose-500" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`
              p-3 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer
              ${activeTab === tab.key 
                ? `bg-white dark:bg-[#0D1527] border-purple-500 shadow-md ring-2 ring-purple-500/20` 
                : `bg-white/60 dark:bg-[#0D1527]/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20`
              }
            `}
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{tab.label}</div>
            <div className={`text-base font-black mt-1 ${tab.color}`}>View</div>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* REQUESTS LIST CONTAINER */}
        <div className={`${showFiltersPanel ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"} space-y-4`}>
          
          {/* SEARCH & CONTROLS BAR */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="text-xs" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, subject, category..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showFiltersPanel 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30" 
                    : "bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                }`}
              >
                <FaFilter className="text-xs" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode === "table" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  title="Table View"
                >
                  <FaThList />
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  title="Grid View"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <FaExclamationCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOADING SPINNER */}
          {loading ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <FaSpinner className="animate-spin text-2xl text-purple-500 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-semibold">Loading support tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <FaTicketAlt className="text-3xl text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Support Requests Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No support tickets match the current filter or search criteria.
              </p>
            </div>
          ) : viewMode === "table" ? (
            /* TABLE VIEW */
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {tickets.map((ticket) => {
                      const requesterName = ticket.requester?.name || "Unknown User";
                      const requesterEmail = ticket.requester?.email || "";
                      const requesterRole = ticket.requesterRole || ticket.requester?.role || "User";
                      const schoolName = ticket.schoolName || ticket.requester?.schoolName || "TeachHub HQ";

                      return (
                        <tr 
                          key={ticket._id}
                          onClick={() => navigate(`/support/requests/${ticket._id}`)}
                          className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 cursor-pointer transition"
                        >
                          <td className="p-3.5 font-mono font-black text-purple-600 dark:text-purple-400">
                            {ticket.ticketNumber}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {requesterName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white leading-tight">{requesterName}</div>
                                <div className="text-[10px] text-slate-400">{requesterEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400">
                              {requesterRole}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{schoolName}</td>
                          <td className="p-3.5 text-slate-800 dark:text-white font-semibold truncate max-w-[160px]">{ticket.subject}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {ticket.department || ticket.assignedDepartment}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ticket.priority === "Urgent" ? "bg-rose-600 text-white" :
                              ticket.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              ticket.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-500/10 text-slate-400"
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ticket.status === "New" ? "bg-blue-500/20 text-blue-400" :
                              ticket.status === "Open" ? "bg-rose-500/20 text-rose-400" :
                              ticket.status === "In Progress" ? "bg-amber-500/20 text-amber-400" :
                              ticket.status === "Waiting" ? "bg-purple-500/20 text-purple-400" :
                              ticket.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400" :
                              ticket.status === "Escalated" ? "bg-rose-600 text-white" : "bg-slate-500/20 text-slate-400"
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total requests)</div>
                
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
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tickets.map((ticket) => {
                const requesterName = ticket.requester?.name || "Unknown User";
                const requesterRole = ticket.requesterRole || ticket.requester?.role || "User";
                const schoolName = ticket.schoolName || ticket.requester?.schoolName || "TeachHub HQ";

                return (
                  <div 
                    key={ticket._id}
                    onClick={() => navigate(`/support/requests/${ticket._id}`)}
                    className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:border-purple-500/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {requesterName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{requesterName}</h4>
                          <p className="text-xs text-slate-400">{requesterRole} • {schoolName}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-purple-400">{ticket.ticketNumber}</span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white">{ticket.subject}</h5>
                      <p className="text-xs text-slate-400 mt-1">Category: {ticket.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                      <span className="text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR FILTERS PANEL */}
        {showFiltersPanel && (
          <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm h-fit space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaFilter className="text-purple-500 text-sm" />
                <span>Filters</span>
              </h3>
              <button 
                onClick={resetFilters}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Attendance Issue">Attendance Issue</option>
                  <option value="Exam / Proctoring Problem">Exam / Proctoring Problem</option>
                  <option value="Result Calculation Error">Result Calculation Error</option>
                  <option value="App Crash / Error">App Crash / Error</option>
                  <option value="School Subscription">School Subscription</option>
                  <option value="Student Payment">Student Payment</option>
                  <option value="Admin Account Setup">Admin Account Setup</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">Priority</label>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <label className="block font-bold text-slate-500 dark:text-slate-400 mb-2 text-xs">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPriorityFilter("Urgent")} className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold cursor-pointer">
                  Urgent Priority
                </button>
                <button onClick={() => handleTabChange("open")} className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold cursor-pointer">
                  Open Tickets
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
