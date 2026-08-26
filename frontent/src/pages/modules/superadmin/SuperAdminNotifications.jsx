import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBell,
  FaFileAlt,
  FaRupeeSign,
  FaComments,
  FaSchool,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaRegClock,
  FaCog,
  FaFolderOpen,
  FaRupeeSign as FaMoney,
  FaWrench,
  FaPlusCircle,
  FaServer,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SuperAdminNotifications() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All"); // All, approval, payment, support, school, system
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");

  // Notification settings status mockup
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [dndStatus, setDndStatus] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSuccessMsg("All notifications marked as read!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Derived Category statistics
  const stats = useMemo(() => {
    const approvals = notifications.filter(n => n.category === "approval").length;
    const payments = notifications.filter(n => n.category === "payment").length;
    const support = notifications.filter(n => n.category === "support").length;
    const schools = notifications.filter(n => n.category === "school").length;
    const system = notifications.filter(n => n.category === "system").length;
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;

    return { approvals, payments, support, schools, system, total, unread };
  }, [notifications]);

  // Donut chart calculations
  const chartSegments = useMemo(() => {
    const data = [
      { key: "approval", value: stats.approvals, color: "#7C3AED" }, // purple
      { key: "payment", value: stats.payments, color: "#10B981" }, // green
      { key: "support", value: stats.support, color: "#F59E0B" }, // orange
      { key: "school", value: stats.schools, color: "#3B82F6" }, // blue
      { key: "system", value: stats.system, color: "#EF4444" } // red
    ];

    const totalVal = stats.total || 1;
    let accumulatedAngle = 0;

    return data.map(seg => {
      const percentage = (seg.value / totalVal) * 100;
      const angle = (seg.value / totalVal) * 360;
      const currentAccumulated = accumulatedAngle;
      accumulatedAngle += angle;

      return {
        ...seg,
        percentage: percentage.toFixed(1),
        strokeDasharray: `${angle} ${360 - angle}`,
        strokeDashoffset: -currentAccumulated
      };
    });
  }, [stats]);

  // Filtered Notifications list
  const filteredList = useMemo(() => {
    return notifications
      .filter(n => {
        if (filterCategory === "All") return true;
        return n.category === filterCategory;
      })
      .filter(n => {
        const term = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(term) ||
          n.message.toLowerCase().includes(term)
        );
      });
  }, [notifications, filterCategory, searchQuery]);

  // Paginated List
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  // Format creation date into Today, Yesterday, or exact Date
  const formatNotificationDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    paginatedList.forEach(n => {
      const dateHeader = formatNotificationDate(n.createdAt);
      if (!groups[dateHeader]) {
        groups[dateHeader] = [];
      }
      groups[dateHeader].push(n);
    });
    return groups;
  }, [paginatedList]);

  const getCategoryTagClass = (cat) => {
    switch (cat) {
      case "approval":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400";
      case "payment":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "support":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      case "school":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
      case "system":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "approval": return "Pending Approval";
      case "payment": return "Payment";
      case "support": return "Support";
      case "school": return "New School";
      case "system": return "System Alert";
      default: return cat;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "approval":
        return <FaFileAlt className="text-sm" />;
      case "payment":
        return <FaRupeeSign className="text-sm" />;
      case "support":
        return <FaComments className="text-sm" />;
      case "school":
        return <FaSchool className="text-sm" />;
      case "system":
        return <FaShieldAlt className="text-sm" />;
      default:
        return <FaBell className="text-sm" />;
    }
  };

  const getCategoryBgColor = (cat) => {
    switch (cat) {
      case "approval": return "bg-[#7C3AED] text-white";
      case "payment": return "bg-[#10B981] text-white";
      case "support": return "bg-[#F59E0B] text-white";
      case "school": return "bg-[#3B82F6] text-white";
      case "system": return "bg-[#EF4444] text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">Loading notifications center...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-805 dark:text-white text-left max-w-5xl mx-auto pb-12 select-none animate-fadeIn">
      
      {/* 1. Page Header breadcrumbs and mark all triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Notifications Center</h2>
          <p className="text-[10px] text-slate-455 dark:text-slate-400 font-extrabold uppercase mt-1">
            Home &gt; Notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15 uppercase tracking-wider"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm">
          <FaCheckCircle className="text-emerald-500 text-base shrink-0" />
          {successMsg}
        </div>
      )}

      {/* 2. KPI Stats Cards Grid (5 cards with count and click filter link) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 select-none">
        {[
          { id: "approval", label: "Pending Approvals", count: stats.approvals, color: "bg-purple-500/10 text-purple-650", icon: <FaFileAlt className="text-sm" /> },
          { id: "payment", label: "Payments & Billing", count: stats.payments, color: "bg-emerald-500/10 text-emerald-600", icon: <FaRupeeSign className="text-sm" /> },
          { id: "support", label: "Support Messages", count: stats.support, color: "bg-amber-500/10 text-amber-600", icon: <FaComments className="text-sm" /> },
          { id: "school", label: "New Schools", count: stats.schools, color: "bg-blue-500/10 text-blue-600", icon: <FaSchool className="text-sm" /> },
          { id: "system", label: "System Alerts", count: stats.system, color: "bg-rose-500/10 text-rose-600", icon: <FaShieldAlt className="text-sm" /> }
        ].map((card) => (
          <div key={card.id} className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4 rounded-2.5xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{card.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xl font-black leading-none">{card.count}</p>
            <button 
              onClick={() => { setFilterCategory(card.id); setCurrentPage(1); }}
              className="text-[9px] font-black text-[#7C3AED] dark:text-[#38BDF8] mt-2 block hover:underline cursor-pointer uppercase tracking-wider bg-transparent"
            >
              View all →
            </button>
          </div>
        ))}
      </div>

      {/* 3. Category Tab Selectors */}
      <div className="flex gap-2.5 border-b border-slate-200 dark:border-white/5 pb-1 select-none overflow-x-auto">
        {[
          { id: "All", label: "All", count: stats.total },
          { id: "approval", label: "Pending Approvals", count: stats.approvals },
          { id: "payment", label: "Payments", count: stats.payments },
          { id: "support", label: "Support", count: stats.support },
          { id: "school", label: "New Schools", count: stats.schools },
          { id: "system", label: "System Alerts", count: stats.system }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setFilterCategory(tab.id); setCurrentPage(1); }}
            className={`pb-3 px-3 text-xs font-black transition cursor-pointer relative shrink-0 ${
              filterCategory === tab.id
                ? "text-[#7C3AED] dark:text-[#38BDF8]"
                : "text-slate-500 hover:text-slate-750"
            }`}
          >
            {tab.label} <span className="text-[10px] font-bold text-slate-400 ml-0.5">({tab.count})</span>
            {filterCategory === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#38BDF8]" />
            )}
          </button>
        ))}
      </div>

      {/* 4. Filter & Search Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-805 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none"
          />
        </div>

        <button className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-slate-350">
          <FaFilter className="text-slate-400" /> Filter
        </button>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 px-4 rounded-xl text-xs font-bold focus:outline-none cursor-pointer hover:border-slate-350 shadow-sm"
        >
          <option>All Time</option>
          <option>Today</option>
          <option>Yesterday</option>
        </select>
      </div>

      {/* 5. Main split layout: Timelines List & Side Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Timeline Logs list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-6">
            
            {filteredList.length === 0 ? (
              <div className="py-20 text-center text-slate-405 font-bold">
                No notifications found matching your search.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedNotifications).map((dateHeader) => (
                  <div key={dateHeader} className="space-y-3">
                    {/* Timeline Date header title */}
                    <h4 className="text-[10px] font-black text-slate-405 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-1 select-none">
                      {dateHeader}
                    </h4>

                    {/* Timeline Rows */}
                    <div className="space-y-3">
                      {groupedNotifications[dateHeader].map((item) => (
                        <div 
                          key={item._id}
                          onClick={() => markSingleAsRead(item._id)}
                          className={`p-3.5 rounded-2.5xl flex items-center justify-between gap-4 border transition-colors cursor-pointer ${
                            item.isRead 
                              ? "bg-transparent border-slate-100 dark:border-white/5 opacity-70" 
                              : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/10 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Icon circle */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBgColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                            </div>

                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-snug">{item.title}</h5>
                              <p className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold mt-0.5">{item.message}</p>
                            </div>
                          </div>

                          {/* Time & status badge */}
                          <div className="text-right shrink-0 flex items-center gap-3 select-none">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getCategoryTagClass(item.category)}`}>
                              {getCategoryLabel(item.category)}
                            </span>
                            
                            <span className="text-[9px] text-slate-400 font-extrabold font-mono shrink-0">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>

                            {/* Blue unread dot */}
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#7C3AED] shrink-0 block" />
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-white/5 pt-4 gap-3 select-none text-[10px] font-bold text-slate-455">
                <span>
                  Showing {Math.min(filteredList.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredList.length, currentPage * itemsPerPage)} of {filteredList.length} notifications
                </span>
                
                <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    &lt;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition ${
                        currentPage === i + 1
                          ? "bg-[#7C3AED] text-white"
                          : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column (1/3 width) - Summary & Settings Panels */}
        <div className="space-y-6 select-none text-left">
          
          {/* Notification Donut Chart summary */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notification Summary</span>
            
            <div className="flex items-center justify-center p-3 relative h-40">
              {/* SVG Donut Circle */}
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                {stats.total > 0 && chartSegments.map((seg, idx) => {
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius; // ~314.16
                  const strokeLength = (seg.value / stats.total) * circumference;
                  const offsetLength = circumference - strokeLength;
                  
                  // Calculate accumulated stroke offset
                  let previousTotal = 0;
                  for (let i = 0; i < idx; i++) {
                    previousTotal += chartSegments[i].value;
                  }
                  const strokeOffset = (previousTotal / stats.total) * circumference;

                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r="50"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={`${strokeLength} ${offsetLength}`}
                      strokeDashoffset={-strokeOffset}
                    />
                  );
                })}
              </svg>
              {/* Inner absolute text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-black font-mono leading-none">{stats.total}</p>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-[10px] font-bold text-slate-500">
              {chartSegments.map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 block" style={{ backgroundColor: seg.color }} />
                    {getCategoryLabel(seg.key)}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {seg.value} ({seg.percentage}%)
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Recent Unread preview panel */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Recent Unread</span>
            
            <div className="space-y-3">
              {notifications.filter(n => !n.isRead).slice(0, 5).map((item) => (
                <div key={item._id} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1 shrink-0 block" />
                  <div className="min-w-0">
                    <h6 className="text-[11px] font-black text-slate-805 dark:text-white leading-snug truncate">{item.title}</h6>
                    <span className="text-[8.5px] font-extrabold text-slate-400 font-mono block mt-0.5">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => { setFilterCategory("All"); setSearchQuery(""); }}
              className="text-[9px] font-black text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-widest hover:underline cursor-pointer block bg-transparent border-0"
            >
              View all unread →
            </button>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quick Actions</span>
            
            <div className="space-y-2">
              <button onClick={() => alert("Open pending approvals logs...")} className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-xl text-slate-705 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-0">
                <FaFolderOpen className="text-purple-500 shrink-0" /> View Pending Approvals
              </button>

              <button onClick={() => alert("Open payments logs...")} className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-xl text-slate-705 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-0">
                <FaMoney className="text-emerald-500 shrink-0" /> View Payments
              </button>

              <button onClick={() => alert("Open support center...")} className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-xl text-slate-705 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-0">
                <FaComments className="text-amber-500 shrink-0" /> Open Support Center
              </button>

              <button onClick={() => alert("Open add campus panel...")} className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-xl text-slate-705 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-0">
                <FaPlusCircle className="text-blue-500 shrink-0" /> Add New School
              </button>

              <button onClick={() => alert("Open server status overview...")} className="w-full text-left bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 p-2.5 rounded-xl text-slate-705 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-0">
                <FaServer className="text-rose-500 shrink-0" /> System Status
              </button>
            </div>
          </div>

          {/* Notification Settings checkboxes */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Notification Settings</span>
            
            <div className="space-y-1.5">
              {[
                { label: "Email Notifications", value: emailAlerts, setter: setEmailAlerts },
                { label: "SMS Notifications", value: smsAlerts, setter: setSmsAlerts },
                { label: "Push Notifications", value: pushAlerts, setter: setPushAlerts },
                { label: "Do Not Disturb", value: dndStatus, setter: setDndStatus }
              ].map((setting, idx) => (
                <div 
                  key={idx}
                  onClick={() => setting.setter(p => !p)}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/[0.01] rounded-xl transition cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-750 dark:text-slate-350">{setting.label}</span>
                    <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">
                      {setting.value ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <FaChevronRight className="text-slate-400 text-[10px]" />
                </div>
              ))}
            </div>

            <button 
              onClick={() => alert("Open advanced preferences page details.")}
              className="text-[9px] font-black text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-widest hover:underline cursor-pointer block bg-transparent border-0"
            >
              Manage Preferences →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SuperAdminNotifications;
