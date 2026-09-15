import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  FaBell, 
  FaCheck, 
  FaCalendarCheck, 
  FaCalendarAlt, 
  FaCalendarWeek,
  FaBullhorn, 
  FaUsers, 
  FaTimes, 
  FaInfoCircle, 
  FaChevronRight, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaComments,
  FaPhoneAlt 
} from "react-icons/fa";
import API_URL from "../../../../../config/api";

const SORA = "'Sora', sans-serif";

function NotificationsAndActivity() {
  const API = API_URL;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/api/teacher/notifications/dashboard`, { headers });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading notification dashboard:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [API, token]);

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API}/api/teacher/notifications/read-all`, {}, { headers });
      loadData();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await axios.put(`${API}/api/teacher/notifications/${id}/read`, {}, { headers });
      loadData();
    } catch (err) {
      console.error("Error marking single read:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-slate-400" style={{ fontFamily: SORA }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold">Loading notifications & activity log...</p>
      </div>
    );
  }

  const { notifications, summary, types, recentActivities, reminders } = data;

  // Category filters helper
  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory === "All") return true;
    return n.category === selectedCategory;
  });

  // Category Icon Map Helper
  const getCategoryIcon = (category, isRead) => {
    let iconColor = "bg-purple-500/10 text-purple-500 border-purple-500/20";
    let icon = <FaUsers className="text-xs" />;

    if (category === "Leave Updates") {
      iconColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      icon = <FaCalendarAlt className="text-xs" />;
    } else if (category === "Exam Updates") {
      iconColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      icon = <FaCalendarCheck className="text-xs" />;
    } else if (category === "Announcements") {
      iconColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
      icon = <FaBullhorn className="text-xs" />;
    } else if (category === "Chat Messages") {
      iconColor = "bg-teal-500/10 text-teal-500 border-teal-500/20";
      icon = <FaComments className="text-xs" />;
    } else if (category === "Call Alerts") {
      iconColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
      icon = <FaPhoneAlt className="text-xs" />;
    } else if (category === "System Updates") {
      iconColor = "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      icon = <FaInfoCircle className="text-xs" />;
    }

    if (isRead) {
      // Dull color if read
      iconColor = "bg-slate-100 dark:bg-white/[0.02] text-slate-450 border-slate-200 dark:border-white/[0.05]";
    }

    return <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconColor}`}>{icon}</div>;
  };

  // Helper date formatter
  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="w-full text-slate-800 dark:text-white pb-10" style={{ fontFamily: SORA }}>
      
      {/* Title Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 select-none">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Teacher Notifications & Activity</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Stay updated with important notifications and recent activity
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-450 font-bold uppercase tracking-wide">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-purple-500">Notifications & Activity</span>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Notifications Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            
            {/* Header controls */}
            <div className="p-4 border-b border-slate-200/50 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">All Notifications</h2>
                {summary.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 leading-none">
                    {summary.unread}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {summary.unread > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-650 hover:text-purple-500 cursor-pointer transition-all border border-slate-200 dark:border-white/[0.08] hover:border-purple-500/20 px-3.5 py-1.5 rounded-xl bg-slate-50/20 dark:bg-white/[0.01]"
                  >
                    <FaCheck className="text-[10px]" /> Mark all as read
                  </button>
                )}

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="All">All Types</option>
                  <option value="Exam Updates">Exam Updates</option>
                  <option value="Chat Messages">Chat Messages</option>
                  <option value="Call Alerts">Call Alerts</option>
                  <option value="Appointment Requests">Appointment Requests</option>
                  <option value="Leave Updates">Leave Updates</option>
                  <option value="Announcements">Announcements</option>
                  <option value="System Updates">System Updates</option>
                </select>
              </div>
            </div>

            {/* Notification Rows List */}
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6 select-none">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] flex items-center justify-center text-slate-450 text-base shadow-inner mx-auto mb-1">
                  <FaBell />
                </div>
                <div>
                  <p className="text-slate-805 dark:text-white font-extrabold text-sm">No Notifications</p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">You do not have any notification alerts matching criteria.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {filteredNotifications.map(n => (
                  <div 
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
                    className={`p-4 flex items-start justify-between gap-4 transition-all ${
                      n.isRead 
                        ? "bg-transparent opacity-75" 
                        : "bg-purple-500/[0.01] hover:bg-purple-500/[0.02] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(n.category, n.isRead)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{n.title}</span>
                          {!n.isRead && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-550/10 text-purple-600 uppercase tracking-wide leading-none border border-purple-500/10 select-none">New</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 font-semibold leading-relaxed max-w-xl">{n.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 select-none">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {formatTime(n.createdAt)}
                      </span>
                      {/* Unread indicator dot */}
                      <span className={`w-2 h-2 rounded-full border ${
                        n.isRead 
                          ? "bg-transparent border-slate-200 dark:border-white/10" 
                          : "bg-purple-600 border-purple-500"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/20 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider select-none">
              <span>Showing 1 to {filteredNotifications.length} of {filteredNotifications.length} notifications</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] hover:bg-slate-55 dark:hover:bg-white/[0.02] cursor-pointer">Prev</button>
                <span className="px-2 py-0.5 bg-purple-600 text-white rounded font-extrabold shadow-sm">1</span>
                <button className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] hover:bg-slate-55 dark:hover:bg-white/[0.02] cursor-pointer">Next</button>
              </div>
            </div>

          </div>

          {/* Recent Activity Log Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Recent Activity</h3>
            </div>

            <div className="flex flex-col gap-4 select-none relative ml-2.5 pl-4 border-l border-slate-150 dark:border-white/10">
              {recentActivities.map(act => {
                let dotColor = "bg-purple-500 ring-purple-500/20";
                if (act.category === "Leave") dotColor = "bg-emerald-500 ring-emerald-500/20";
                else if (act.category === "Exam") dotColor = "bg-amber-500 ring-amber-500/20";
                else if (act.category === "Announcement") dotColor = "bg-blue-500 ring-blue-500/20";

                return (
                  <div key={act.id} className="relative flex items-start gap-4 justify-between">
                    {/* Circle Node indicator */}
                    <span className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full ring-4 ${dotColor}`} />
                    
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs">{act.title}</p>
                      <p className="text-[10px] text-slate-450 mt-1 font-semibold leading-relaxed">{act.message}</p>
                    </div>

                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                      {act.timeText}
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer mt-5 select-none">
              View Full Activity Log &rarr;
            </button>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Notification Summary */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-3.5 sm:p-5 rounded-2.5xl sm:rounded-3xl shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Notification Summary</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 select-none">
              {/* Total Box */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03] flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
                  <FaBell className="text-xs" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none block">{summary.total}</span>
                  <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide block mt-1">Total alerts</span>
                </div>
              </div>

              {/* Unread Box */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03] flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
                  <FaCheckCircle className="text-xs" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none block">{summary.unread}</span>
                  <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide block mt-1">Unread Alerts</span>
                </div>
              </div>

              {/* This Week */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03] flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
                  <FaCalendarWeek className="text-xs" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none block">{summary.thisWeek}</span>
                  <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide block mt-1">This Week</span>
                </div>
              </div>

              {/* This Month */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03] flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/15 flex items-center justify-center shrink-0">
                  <FaCalendarCheck className="text-xs" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none block">{summary.thisMonth}</span>
                  <span className="text-[7px] font-bold text-slate-450 uppercase tracking-wide block mt-1">This Month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Notification Types</h3>
            </div>

            <div className="flex flex-col gap-3.5 select-none text-[10px] font-bold">
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Exam Updates</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.exam || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Chat Messages</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.chat || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Call Alerts</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.call || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Appointment Requests</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.appointment || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Leave Updates</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.leave || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Announcements</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.announcement || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-450 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> System Updates</span>
                <span className="text-slate-800 dark:text-white font-extrabold">{types.system || 0}</span>
              </div>
            </div>

            <button className="w-full py-2 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer mt-4 select-none">
              View All Types &rarr;
            </button>
          </div>

          {/* Quick Actions links */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm select-none">
            <div className="pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Quick Actions</h3>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link 
                to="/teacher/support"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] hover:bg-purple-500/5 transition-all text-[10px] font-bold text-slate-650 dark:text-slate-350"
              >
                <span>Request Appointment</span> <FaChevronRight className="text-[7px]" />
              </Link>
              <Link 
                to="/teacher/on-leave"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] hover:bg-purple-500/5 transition-all text-[10px] font-bold text-slate-650 dark:text-slate-350"
              >
                <span>Apply for Leave</span> <FaChevronRight className="text-[7px]" />
              </Link>
              <Link 
                to="/teacher/showtimetable"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] hover:bg-purple-500/5 transition-all text-[10px] font-bold text-slate-650 dark:text-slate-350"
              >
                <span>View Timetable</span> <FaChevronRight className="text-[7px]" />
              </Link>
              <Link 
                to="/teacher/exam-schedule"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] hover:border-purple-500/20 bg-slate-50/40 dark:bg-white/[0.01] hover:bg-purple-500/5 transition-all text-[10px] font-bold text-slate-650 dark:text-slate-350"
              >
                <span>View Exam Schedule</span> <FaChevronRight className="text-[7px]" />
              </Link>
            </div>
          </div>

          {/* Upcoming Reminders widget */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/[0.05] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.03] mb-4 select-none">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Upcoming Reminders</h3>
              <button className="text-[10px] font-bold text-purple-500 hover:underline cursor-pointer">View All</button>
            </div>

            <div className="flex flex-col gap-3 select-none">
              {reminders.map(rem => {
                let badgeStyle = "bg-slate-100 dark:bg-white/[0.02] text-slate-500 border border-slate-200 dark:border-white/[0.05]";
                if (rem.countdown.includes("Today") || rem.countdown.includes("Completed")) {
                  badgeStyle = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15";
                }

                return (
                  <div key={rem.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.03]">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">{rem.title}</p>
                      <p className="text-[8px] font-bold text-slate-450 uppercase mt-1 leading-none">{rem.detail}</p>
                    </div>

                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none shrink-0 ${badgeStyle}`}>
                      {rem.countdown}
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="w-full py-2.5 border border-slate-150 dark:border-white/[0.05] hover:border-purple-500/20 text-center font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-purple-500/5 hover:text-purple-500 dark:hover:text-purple-400 transition-all cursor-pointer mt-5 select-none">
              View All Reminders &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default NotificationsAndActivity;
