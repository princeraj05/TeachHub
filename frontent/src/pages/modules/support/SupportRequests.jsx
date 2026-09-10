import { useState, useMemo } from "react";
import { 
  FaTicketAlt, 
  FaPlus, 
  FaFilter, 
  FaSearch, 
  FaDownload, 
  FaThList, 
  FaThLarge, 
  FaEllipsisV, 
  FaChevronLeft, 
  FaChevronRight,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaSchool,
  FaUser,
  FaFileAlt
} from "react-icons/fa";

export default function SupportRequests() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [showNewModal, setShowNewModal] = useState(false);

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState({
    user: "",
    email: "",
    role: "Student",
    school: "G.D Academy",
    subject: "",
    category: "How to Use",
    priority: "Medium",
    description: ""
  });

  // Mock Tickets Dataset matching screenshots
  const [tickets, setTickets] = useState([
    { id: "#TH-1052", user: "Prince Raj", email: "prince@gmail.com", role: "Student", school: "G.D Academy", subject: "How to join school?", category: "How to Use", priority: "Medium", status: "New", createdAt: "5 min ago", avatarBg: "bg-purple-600" },
    { id: "#TH-1051", user: "Anjali Verma", email: "anjali@school.com", role: "Teacher", school: "Saraswati Vidya Niketan", subject: "Attendance not showing", category: "Technical Issue", priority: "High", status: "Open", createdAt: "18 min ago", avatarBg: "bg-emerald-600" },
    { id: "#TH-1050", user: "Rahul Kumar", email: "rahul@gmail.com", role: "Student", school: "G.D Academy", subject: "App not opening", category: "App Issue", priority: "High", status: "In Progress", createdAt: "32 min ago", avatarBg: "bg-blue-600" },
    { id: "#TH-1049", user: "Neha Singh", email: "admin@school.com", role: "Admin", school: "Bright Future School", subject: "Fee module setup help", category: "Fees & Payments", priority: "Medium", status: "Waiting", createdAt: "1 hour ago", avatarBg: "bg-amber-600" },
    { id: "#TH-1048", user: "Amit Sharma", email: "amit@gmail.com", role: "Teacher", school: "Sunrise Public School", subject: "Homework not visible", category: "Teacher Features", priority: "Low", status: "Resolved", createdAt: "2 hours ago", avatarBg: "bg-indigo-600" },
    { id: "#TH-1047", user: "Pooja Kumari", email: "pooja@gmail.com", role: "Student", school: "Bright Future School", subject: "Exam schedule?", category: "How to Use", priority: "Low", status: "Closed", createdAt: "3 hours ago", avatarBg: "bg-rose-600" },
    { id: "#TH-1046", user: "Vikram Patel", email: "vikram@school.com", role: "Admin", school: "Saraswati Vidya Niketan", subject: "Razorpay payment issue", category: "Fees & Payments", priority: "High", status: "Open", createdAt: "4 hours ago", avatarBg: "bg-[#7C3AED]" },
    { id: "#TH-1045", user: "Sneha Gupta", email: "sneha@gmail.com", role: "Student", school: "G.D Academy", subject: "Profile update problem", category: "Account & Login", priority: "Medium", status: "In Progress", createdAt: "5 hours ago", avatarBg: "bg-cyan-600" },
    { id: "#TH-1044", user: "Manish Yadav", email: "manish@gmail.com", role: "Teacher", school: "Bright Future School", subject: "Class notes not uploading", category: "Technical Issue", priority: "Medium", status: "Waiting", createdAt: "6 hours ago", avatarBg: "bg-amber-700" },
    { id: "#TH-1043", user: "Kavita Sharma", email: "kavita@gmail.com", role: "Student", school: "Sunrise Public School", subject: "Can't find my school", category: "School Joining", priority: "Low", status: "Resolved", createdAt: "8 hours ago", avatarBg: "bg-blue-700" }
  ]);

  // Tab counts
  const counts = useMemo(() => ({
    all: 270,
    new: 28,
    open: 56,
    inProgress: 32,
    waiting: 18,
    resolved: 124,
    closed: 12
  }), []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (activeTab === "new" && t.status !== "New") return false;
      if (activeTab === "open" && t.status !== "Open") return false;
      if (activeTab === "inProgress" && t.status !== "In Progress") return false;
      if (activeTab === "waiting" && t.status !== "Waiting") return false;
      if (activeTab === "resolved" && t.status !== "Resolved") return false;
      if (activeTab === "closed" && t.status !== "Closed") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = t.id.toLowerCase().includes(q) || 
                      t.user.toLowerCase().includes(q) || 
                      t.school.toLowerCase().includes(q) || 
                      t.subject.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (roleFilter !== "all" && t.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && t.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      return true;
    });
  }, [tickets, activeTab, searchQuery, roleFilter, categoryFilter, priorityFilter, statusFilter]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.user || !newTicket.subject) return;

    const created = {
      id: `#TH-${Math.floor(1053 + Math.random() * 100)}`,
      user: newTicket.user,
      email: newTicket.email || `${newTicket.user.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      role: newTicket.role,
      school: newTicket.school,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "New",
      createdAt: "Just now",
      avatarBg: "bg-purple-600"
    };

    setTickets([created, ...tickets]);
    setShowNewModal(false);
    setNewTicket({ user: "", email: "", role: "Student", school: "G.D Academy", subject: "", category: "How to Use", priority: "Medium", description: "" });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setSchoolFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Requests</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {tickets.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage all help & technical requests from students, teachers and school admins.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FaDownload className="text-xs" />
            <span>Export</span>
          </button>

          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/25"
          >
            <FaPlus className="text-xs" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STAT PILLS / TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key: "all", label: "All Requests", count: counts.all, color: "border-purple-500/30 text-purple-400" },
          { key: "new", label: "New", count: counts.new, color: "border-blue-500/30 text-blue-400" },
          { key: "open", label: "Open", count: counts.open, color: "border-rose-500/30 text-rose-400" },
          { key: "inProgress", label: "In Progress", count: counts.inProgress, color: "border-amber-500/30 text-amber-400" },
          { key: "waiting", label: "Waiting", count: counts.waiting, color: "border-indigo-500/30 text-indigo-400" },
          { key: "resolved", label: "Resolved", count: counts.resolved, color: "border-emerald-500/30 text-emerald-400" },
          { key: "closed", label: "Closed", count: counts.closed, color: "border-slate-500/30 text-slate-400" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              p-3 rounded-2xl border transition-all text-left flex flex-col justify-between
              ${activeTab === tab.key 
                ? `bg-white dark:bg-[#0D1527] border-purple-500 shadow-md ring-2 ring-purple-500/20` 
                : `bg-white/60 dark:bg-[#0D1527]/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20`
              }
            `}
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{tab.label}</div>
            <div className={`text-xl font-black mt-1 ${tab.color}`}>{tab.count}</div>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA WITH OPTIONAL FILTERS SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* REQUESTS LIST CONTAINER (Col 8 or 12 depending on filter sidebar) */}
        <div className={`${showFiltersPanel ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"} space-y-4`}>
          
          {/* SEARCH & CONTROLS BAR */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="text-xs" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, user name, school, subject..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Controls Right */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
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
                  className={`p-1.5 rounded-lg text-xs transition ${viewMode === "table" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  title="Table View"
                >
                  <FaThList />
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs transition ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  title="Grid View"
                >
                  <FaThLarge />
                </button>
              </div>
            </div>

          </div>

          {/* TABLE VIEW */}
          {viewMode === "table" ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5 w-10">
                        <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                      </th>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5">Subject / Issue</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created At</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition"
                      >
                        <td className="p-3.5">
                          <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                        </td>
                        <td className="p-3.5 font-mono font-bold text-purple-600 dark:text-purple-400">{ticket.id}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${ticket.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                              {ticket.user.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white leading-tight">{ticket.user}</div>
                              <div className="text-[10px] text-slate-400">{ticket.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.role === "Student" ? "bg-purple-500/10 text-purple-400" :
                            ticket.role === "Teacher" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {ticket.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{ticket.school}</td>
                        <td className="p-3.5 text-slate-800 dark:text-white font-semibold">{ticket.subject}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                            ticket.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{ticket.createdAt}</td>
                        <td className="p-3.5 text-center">
                          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                            <FaEllipsisV className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>Showing 1 to {filteredTickets.length} of {tickets.length} requests</div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white">
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-xl">1</span>
                  <span className="px-3 py-1 hover:bg-white/5 rounded-xl cursor-pointer">2</span>
                  <span className="px-3 py-1 hover:bg-white/5 rounded-xl cursor-pointer">3</span>
                  <button className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white">
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${ticket.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                        {ticket.user.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ticket.user}</h4>
                        <p className="text-xs text-slate-400">{ticket.role} • {ticket.school}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-400">{ticket.id}</span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">{ticket.subject}</h5>
                    <p className="text-xs text-slate-400 mt-1">Category: {ticket.category}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                    <span className="text-slate-400">{ticket.createdAt}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR FILTERS PANEL (Col 4 or 3) */}
        {showFiltersPanel && (
          <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm h-fit space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaFilter className="text-purple-500 text-sm" />
                <span>Filters</span>
              </h3>
              <button 
                onClick={resetFilters}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Filter Form Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">User Role</label>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">School Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">School</label>
                <select 
                  value={schoolFilter} 
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">All Schools</option>
                  <option value="gd">G.D Academy</option>
                  <option value="saraswati">Saraswati Vidya Niketan</option>
                  <option value="bright">Bright Future School</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="How to Use">How to Use</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Fees & Payments">Fees & Payments</option>
                  <option value="Account & Login">Account & Login</option>
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
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <label className="block font-bold text-slate-500 dark:text-slate-400 mb-2 text-xs">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPriorityFilter("high")} className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold">
                  High Priority
                </button>
                <button onClick={() => setStatusFilter("open")} className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold">
                  Unresolved
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* NEW REQUEST MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-white/10 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold">Create New Support Request</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">User Name</label>
                <input 
                  type="text"
                  required
                  value={newTicket.user}
                  onChange={(e) => setNewTicket({ ...newTicket, user: e.target.value })}
                  placeholder="e.g. Amit Kumar"
                  className="w-full bg-[#162238] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Subject / Issue Summary</label>
                <input 
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Cannot view exam schedule"
                  className="w-full bg-[#162238] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Role</label>
                  <select 
                    value={newTicket.role}
                    onChange={(e) => setNewTicket({ ...newTicket, role: e.target.value })}
                    className="w-full bg-[#162238] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-[#162238] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg mt-2"
              >
                Create Support Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
