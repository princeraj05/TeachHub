import { useState } from "react";
import { 
  FaBell, 
  FaTicketAlt, 
  FaComments, 
  FaExclamationTriangle, 
  FaPhoneAlt, 
  FaCog, 
  FaCheck, 
  FaEllipsisV, 
  FaPhoneSlash,
  FaCheckDouble
} from "react-icons/fa";

export default function SupportNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  // Mock Notifications Stream matching Screenshot 4
  const notificationsToday = [
    { id: "n1", type: "request", title: "New Support Request", badge: "New", desc: 'Amit Kumar (G.D Academy) raised a new request: "How to join school?"', time: "10:20 AM", icon: FaTicketAlt, iconColor: "bg-rose-500/10 text-rose-500" },
    { id: "n2", type: "message", title: "New Message", desc: "Neha Singh sent a new message in ticket #TH-1048", time: "10:05 AM", icon: FaComments, iconColor: "bg-purple-500/10 text-purple-500" },
    { id: "n3", type: "assigned", title: "Ticket Assigned to You", desc: "Ticket #TH-1052 has been assigned to you by Admin.", time: "09:45 AM", icon: FaCheckDouble, iconColor: "bg-emerald-500/10 text-emerald-500" },
    { id: "n4", type: "escalated", title: "Escalated Issue", desc: "Ticket #TH-0987 has been escalated to high priority.", time: "08:30 AM", icon: FaExclamationTriangle, iconColor: "bg-rose-500/10 text-rose-500" },
    { id: "n5", type: "call", title: "Call Request", desc: "Ramesh Kumar (Bright Future School) requested an audio call.", time: "08:15 AM", icon: FaPhoneAlt, iconColor: "bg-blue-500/10 text-blue-500" }
  ];

  const notificationsYesterday = [
    { id: "n6", type: "message", title: "New Message", desc: "Pooja Sharma sent a new message in ticket #TH-1021", time: "06:40 PM", icon: FaComments, iconColor: "bg-purple-500/10 text-purple-500" },
    { id: "n7", type: "assigned", title: "Ticket Assigned to You", desc: "Ticket #TH-1019 has been assigned to you.", time: "04:12 PM", icon: FaCheckDouble, iconColor: "bg-emerald-500/10 text-emerald-500" },
    { id: "n8", type: "request", title: "New Support Request", desc: 'Vikram Patel (R.K Public School) raised a new request: "Fee module issue"', time: "11:30 AM", icon: FaTicketAlt, iconColor: "bg-rose-500/10 text-rose-500" }
  ];

  const notificationsThisWeek = [
    { id: "n9", type: "call", title: "Missed Call", desc: "You missed a call from Anjali Verma (Sunrise Public School).", time: "8 Sept, 04:20 PM", icon: FaPhoneSlash, iconColor: "bg-blue-500/10 text-blue-500" },
    { id: "n10", type: "system", title: "System Notification", desc: "New version of support portal is now available.", time: "8 Sept, 11:10 AM", icon: FaCog, iconColor: "bg-slate-500/10 text-slate-400" }
  ];

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with all support activities and never miss an important update.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-purple-600 dark:text-purple-400 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
          <FaCheck className="text-xs" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* TOP TAB FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: "All (12)" },
          { key: "requests", label: "New Requests (3)" },
          { key: "messages", label: "New Messages (4)" },
          { key: "assigned", label: "Assigned to Me (2)" },
          { key: "escalations", label: "Escalations (1)" },
          { key: "calls", label: "Call Requests (2)" },
          { key: "system", label: "System (0)" }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap border ${
              activeTab === t.key 
                ? "bg-purple-600 text-white border-purple-600 shadow" 
                : "bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT: Notifications Stream (Col 8) & Unread Summary Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NOTIFICATIONS STREAM (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Group 1: Today */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Today</h3>
              <span className="text-xs text-slate-400 font-medium">Thursday, 10 Sept 2026</span>
            </div>

            <div className="space-y-3">
              {notificationsToday.map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${n.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-xs">{n.title}</h4>
                          {n.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400">
                              {n.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      <button className="text-slate-400 hover:text-white p-1">
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Yesterday */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Yesterday</h3>
              <span className="text-xs text-slate-400 font-medium">Wednesday, 9 Sept 2026</span>
            </div>

            <div className="space-y-3">
              {notificationsYesterday.map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${n.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs">{n.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      <button className="text-slate-400 hover:text-white p-1">
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: This Week */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">This Week</h3>
              <span className="text-xs text-slate-400 font-medium">Monday, 8 Sept 2026</span>
            </div>

            <div className="space-y-3">
              {notificationsThisWeek.map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${n.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs">{n.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      <button className="text-slate-400 hover:text-white p-1">
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* UNREAD SUMMARY & FILTERS SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Unread Summary Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs">Unread Summary</h3>
              <span className="text-[10px] font-bold text-purple-400">12 Unread</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between"><span className="text-slate-400">New Requests</span><span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">3</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">New Messages</span><span className="w-5 h-5 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center">4</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Assigned to Me</span><span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">2</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Escalated Issues</span><span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">1</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Call Requests</span><span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center">2</span></div>
            </div>
          </div>

          {/* Desktop Notifications Banner */}
          <div className="bg-gradient-to-tr from-purple-900/40 via-indigo-900/30 to-[#0D1527] border border-purple-500/30 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Stay Updated</h4>
              <p className="text-xs text-slate-400 mt-1">Get real-time notifications for all your support activities.</p>
            </div>
            <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow">
              Enable Desktop Notifications
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
