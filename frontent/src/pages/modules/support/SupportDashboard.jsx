import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, 
  FaClock, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaArrowUp, 
  FaArrowDown, 
  FaUser, 
  FaSchool, 
  FaPlus, 
  FaSearch, 
  FaBookOpen, 
  FaChartBar, 
  FaStar, 
  FaExclamationTriangle, 
  FaComments,
  FaArrowRight
} from "react-icons/fa";

export default function SupportDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Prince Raj";

  // Mock Recent Support Requests
  const recentRequests = [
    { id: "#TH-1052", user: "Prince Raj", email: "prince@gmail.com", role: "Student", school: "G.D Academy", subject: "How to join school?", priority: "Medium", status: "Open", time: "5 min ago", avatarBg: "bg-purple-600" },
    { id: "#TH-1051", user: "Anjali Verma", email: "anjali@school.com", role: "Teacher", school: "Saraswati Vidya...", subject: "Attendance issue", priority: "High", status: "In Progress", time: "18 min ago", avatarBg: "bg-emerald-600" },
    { id: "#TH-1050", user: "Rahul Kumar", email: "rahul@gmail.com", role: "Student", school: "G.D Academy", subject: "App not opening", priority: "High", status: "Open", time: "32 min ago", avatarBg: "bg-blue-600" },
    { id: "#TH-1049", user: "Neha Singh", email: "admin@school.com", role: "Admin", school: "Bright Future School", subject: "Fee module setup", priority: "Medium", status: "In Progress", time: "1 hour ago", avatarBg: "bg-amber-600" },
    { id: "#TH-1048", user: "Amit Sharma", email: "amit@gmail.com", role: "Teacher", school: "Sunrise Public School", subject: "Homework not sh...", priority: "Low", status: "Waiting", time: "2 hours ago", avatarBg: "bg-indigo-600" }
  ];

  // Category statistics
  const categoryStats = [
    { label: "Account & Login", count: 32, percentage: 80, color: "bg-purple-500" },
    { label: "How to Use", count: 28, percentage: 70, color: "bg-blue-500" },
    { label: "School Joining", count: 18, percentage: 45, color: "bg-cyan-500" },
    { label: "Fee & Payments", count: 12, percentage: 30, color: "bg-amber-500" },
    { label: "Teacher Features", count: 10, percentage: 25, color: "bg-rose-500" },
    { label: "Technical Issue", count: 8, percentage: 20, color: "bg-purple-400" },
    { label: "Other", count: 6, percentage: 15, color: "bg-slate-500" }
  ];

  // Recent activity stream
  const activityStream = [
    { icon: FaTicketAlt, color: "text-purple-400 bg-purple-500/10", title: "New support request received", desc: "#TH-1052 from Prince Raj (Student)", time: "5 min ago" },
    { icon: FaCheckCircle, color: "text-emerald-400 bg-emerald-500/10", title: "Request marked as resolved", desc: "#TH-1046 resolved by Amit Sharma", time: "28 min ago" },
    { icon: FaComments, color: "text-blue-400 bg-blue-500/10", title: "New message in support chat", desc: "Anjali Verma (Teacher)", time: "45 min ago" },
    { icon: FaExclamationTriangle, color: "text-rose-400 bg-rose-500/10", title: "Request escalated to Super Admin", desc: "#TH-1044 by Rahul Kumar", time: "1 hour ago" },
    { icon: FaSchool, color: "text-cyan-400 bg-cyan-500/10", title: "New school registered", desc: "Bright Future School", time: "2 hours ago" }
  ];

  return (
    <div className="space-y-6">
      
      {/* WELCOME BANNER & DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with TeachHub support today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
          <FaCalendarAlt className="text-purple-500" />
          <span>Wednesday, 10 Sept 2026</span>
        </div>
      </div>

      {/* 5 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Open Requests */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <FaTicketAlt className="text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">28</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Open Requests</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-3">
            <FaArrowUp className="text-[10px]" />
            <span>+12% vs yesterday</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
              <FaClock className="text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">15</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">In Progress</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500 mt-3">
            <FaArrowDown className="text-[10px]" />
            <span>-8% vs yesterday</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <FaHourglassHalf className="text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">7</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Pending</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-3">
            <FaArrowUp className="text-[10px]" />
            <span>+2% vs yesterday</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">64</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Resolved</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-3">
            <FaArrowUp className="text-[10px]" />
            <span>+18% vs yesterday</span>
          </div>
        </div>

        {/* Today's Requests */}
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
              <FaCalendarAlt className="text-lg" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">42</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Today's Requests</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 mt-3">
            <FaArrowUp className="text-[10px]" />
            <span>+25% vs yesterday</span>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Recent Requests (Left 7) & Support Performance (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Support Requests Table */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-purple-500 text-base" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Support Requests</h3>
              </div>
              <button 
                onClick={() => navigate("/support/requests")}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">#</th>
                    <th className="pb-3 px-2">User</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2">School</th>
                    <th className="pb-3 px-2">Subject</th>
                    <th className="pb-3 px-2">Priority</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentRequests.map((req) => (
                    <tr 
                      key={req.id}
                      onClick={() => navigate("/support/requests")}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition"
                    >
                      <td className="py-3 px-2 font-mono font-bold text-slate-600 dark:text-slate-300">{req.id}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${req.avatarBg} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0`}>
                            {req.user.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white leading-tight">{req.user}</div>
                            <div className="text-[10px] text-slate-400">{req.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.role === "Student" ? "bg-purple-500/10 text-purple-400" :
                          req.role === "Teacher" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {req.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[110px]">{req.school}</td>
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[130px]">{req.subject}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.priority === "High" ? "bg-rose-500/10 text-rose-400" :
                          req.priority === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === "Open" ? "bg-rose-500/20 text-rose-400" :
                          req.status === "In Progress" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-400 text-[11px] whitespace-nowrap">{req.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Support Performance Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaChartBar className="text-purple-500 text-base" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Support Performance</h3>
              </div>
              <select className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>

            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-base" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-800 dark:text-white leading-tight">85%</div>
                  <div className="text-[10px] font-medium text-slate-400">Resolution Rate</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-base" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-800 dark:text-white leading-tight">2h 18m</div>
                  <div className="text-[10px] font-medium text-slate-400">Avg. Response Time</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-base" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-800 dark:text-white leading-tight">6h 42m</div>
                  <div className="text-[10px] font-medium text-slate-400">Avg. Resolution Time</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <FaStar className="text-base" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-800 dark:text-white leading-tight">4.8/5</div>
                  <div className="text-[10px] font-medium text-slate-400">User Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Weekly Bar Chart Representation */}
            <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-4">
              <div className="h-32 flex items-end justify-between gap-2 pt-2">
                {[
                  { day: "Mon", val: 35, color: "bg-purple-600" },
                  { day: "Tue", val: 50, color: "bg-purple-600" },
                  { day: "Wed", val: 42, color: "bg-purple-600" },
                  { day: "Thu", val: 65, color: "bg-purple-600" },
                  { day: "Fri", val: 48, color: "bg-purple-600" },
                  { day: "Sat", val: 30, color: "bg-purple-600" },
                  { day: "Sun", val: 55, color: "bg-purple-600" }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div 
                      className={`w-full ${bar.color} rounded-t-lg transition-all duration-500 hover:opacity-80`}
                      style={{ height: `${bar.val}%` }}
                    />
                    <span className="text-[10px] font-medium text-slate-400">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Quick Actions (3), Requests by Category (5), Recent Activity (4) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Quick Actions (Col 4) */}
        <div className="md:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate("/support/requests")}
              className="p-3.5 bg-slate-50 dark:bg-[#121B2E] hover:bg-purple-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <FaPlus className="text-sm" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">New Support Request</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Create a manual request</div>
            </button>

            <button 
              onClick={() => navigate("/support/users")}
              className="p-3.5 bg-slate-50 dark:bg-[#121B2E] hover:bg-blue-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <FaSearch className="text-sm" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">Search User</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Find and view user details</div>
            </button>

            <button 
              onClick={() => navigate("/support/schools")}
              className="p-3.5 bg-slate-50 dark:bg-[#121B2E] hover:bg-cyan-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <FaSchool className="text-sm" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">View Schools</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Browse all schools</div>
            </button>

            <button 
              onClick={() => navigate("/support/help-center")}
              className="p-3.5 bg-slate-50 dark:bg-[#121B2E] hover:bg-amber-500/10 border border-slate-200 dark:border-white/5 rounded-xl text-left transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <FaBookOpen className="text-sm" />
              </div>
              <div className="font-bold text-slate-800 dark:text-white text-xs">Help Center</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Access guides & FAQs</div>
            </button>
          </div>
        </div>

        {/* Requests by Category (Col 4) */}
        <div className="md:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Requests by Category</h3>
            <span className="text-xs font-semibold text-slate-400">This Week</span>
          </div>

          <div className="space-y-2.5">
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">{cat.label}</span>
                  <span className="text-slate-800 dark:text-white font-mono">{cat.count}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity (Col 4) */}
        <div className="md:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Activity</h3>
            <button onClick={() => navigate("/support/notifications")} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {activityStream.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{act.title}</h5>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
