import { useState } from "react";
import { 
  FaTicketAlt, 
  FaPlus, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEllipsisV, 
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaStar,
  FaHistory
} from "react-icons/fa";

export default function SupportMyAssigned() {
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const myTickets = [
    { id: "#TH-1052", subject: "How to join school?", user: "Amit Kumar", role: "Student", school: "G.D Academy", category: "School Joining", priority: "High", status: "New", assignedOn: "10 Sept 2026, 10:20 AM", avatarBg: "bg-purple-600" },
    { id: "#TH-1048", subject: "Fee payment failed", user: "Neha Singh", role: "Parent", school: "Sunrise Public School", category: "Fees", priority: "Medium", status: "In Progress", assignedOn: "9 Sept 2026, 04:12 PM", avatarBg: "bg-blue-600" },
    { id: "#TH-1041", subject: "Attendance not visible", user: "Ramesh Kumar", role: "Teacher", school: "Bright Future School", category: "Attendance", priority: "Low", status: "Waiting", assignedOn: "9 Sept 2026, 11:30 AM", avatarBg: "bg-amber-600" },
    { id: "#TH-1039", subject: "App not working", user: "Pooja Sharma", role: "Student", school: "R.K Public School", category: "Technical Issues", priority: "High", status: "In Progress", assignedOn: "8 Sept 2026, 03:45 PM", avatarBg: "bg-rose-600" },
    { id: "#TH-1035", subject: "How to create exam?", user: "Vikram Patel", role: "Teacher", school: "Model Children School", category: "Exams", priority: "Medium", status: "Resolved", assignedOn: "8 Sept 2026, 11:20 AM", avatarBg: "bg-emerald-600" },
    { id: "#TH-1029", subject: "Add new teacher", user: "Anjali Verma", role: "Admin", school: "Little Flower School", category: "Admin", priority: "Low", status: "Resolved", assignedOn: "7 Sept 2026, 02:15 PM", avatarBg: "bg-cyan-600" },
    { id: "#TH-1021", subject: "Password reset", user: "Suresh Yadav", role: "Student", school: "Green Valley School", category: "Login", priority: "Medium", status: "New", assignedOn: "7 Sept 2026, 10:05 AM", avatarBg: "bg-indigo-600" },
    { id: "#TH-1019", subject: "Student not visible", user: "Kavita Singh", role: "Teacher", school: "Holy Cross School", category: "Student", priority: "Low", status: "In Progress", assignedOn: "6 Sept 2026, 04:10 PM", avatarBg: "bg-[#7C3AED]" }
  ];

  const filteredTickets = myTickets.filter(t => {
    if (activeTab === "new" && t.status !== "New") return false;
    if (activeTab === "inProgress" && t.status !== "In Progress") return false;
    if (activeTab === "waiting" && t.status !== "Waiting") return false;
    if (activeTab === "resolved" && t.status !== "Resolved") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>My Assigned Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage all tickets assigned to you.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25">
          <FaPlus className="text-xs" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* 4 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-rose-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaTicketAlt className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">8</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">New</div>
            <div className="text-[10px] text-slate-400">Assigned to you</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-blue-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaClock className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">12</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">In Progress</div>
            <div className="text-[10px] text-slate-400">Being worked on</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-amber-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaHourglassHalf className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">4</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Waiting</div>
            <div className="text-[10px] text-slate-400">Awaiting user/school</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-emerald-500/20 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaCheckCircle className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">20</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Resolved</div>
            <div className="text-[10px] text-slate-400">Successfully closed</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Tickets Table (Col 8) & Performance/Quick Filters Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TICKETS TABLE AREA (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Tabs & Controls */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {[
                { key: "all", label: "All (44)" },
                { key: "new", label: "New (8)" },
                { key: "inProgress", label: "In Progress (12)" },
                { key: "waiting", label: "Waiting (4)" },
                { key: "resolved", label: "Resolved (20)" }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    activeTab === t.key ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
              <button className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-slate-400 hover:text-white">
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 w-10">
                      <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                    </th>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">School</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Assigned On</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="p-3.5">
                        <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                      </td>
                      <td className="p-3.5 font-mono font-bold text-purple-400">{t.id}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-white">{t.subject}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${t.avatarBg} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0`}>
                            {t.user.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs">{t.user}</div>
                            <div className="text-[10px] text-slate-400">{t.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{t.school}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{t.assignedOn}</td>
                      <td className="p-3.5 text-center">
                        <button className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                          <FaEllipsisV className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>Showing 1 to {filteredTickets.length} of 44 requests</div>
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

        </div>

        {/* RIGHT SIDE PERFORMANCE & QUICK FILTERS SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* My Performance Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">My Performance</h3>
              <span className="text-[10px] text-slate-400">This Month</span>
            </div>

            <div className="flex justify-between"><span className="text-slate-400">Total Assigned</span><span className="font-bold text-slate-800 dark:text-white">44</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Resolved</span><span className="font-semibold text-emerald-400">20</span></div>
            <div className="flex justify-between"><span className="text-slate-400">In Progress</span><span className="font-semibold text-blue-400">12</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Waiting</span><span className="font-semibold text-amber-400">4</span></div>
            <div className="flex justify-between"><span className="text-slate-400">New</span><span className="font-semibold text-rose-400">8</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Avg. Response Time</span><span className="font-mono text-purple-400">2h 15m</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Customer Satisfaction</span><span className="font-bold text-amber-400">⭐ 4.8/5</span></div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Quick Filters</h3>
            
            <div className="space-y-2">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none">
                <option value="all">All Categories</option>
                <option value="School Joining">School Joining</option>
                <option value="Fees">Fees</option>
                <option value="Attendance">Attendance</option>
                <option value="Exams">Exams</option>
              </select>

              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none">
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs shadow">Apply Filters</button>
              <button onClick={() => { setCategoryFilter("all"); setPriorityFilter("all"); }} className="px-4 py-2 bg-slate-100 dark:bg-[#162238] text-slate-400 font-bold rounded-xl text-xs">Clear</button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Recent Activity</h3>
              <span className="text-[10px] text-purple-400 font-bold">View All</span>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-slate-50 dark:bg-[#121B2E] rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white text-[11px] truncate">TH-1052 assigned to you</div>
                  <div className="text-[9px] text-slate-400">10 Sept 2026, 10:20 AM</div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-[#121B2E] rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white text-[11px] truncate">TH-1048 status updated to In Progress</div>
                  <div className="text-[9px] text-slate-400">9 Sept 2026, 04:12 PM</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
