import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBell,
  FaCheckCircle,
  FaDollarSign,
  FaComments,
  FaSchool,
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
  FaCheckDouble,
  FaTrash,
  FaEye,
  FaSpinner,
  FaInfoCircle,
  FaSync
} from "react-icons/fa";

const defaultNotifications = [];

function SuperAdminNotifications() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");

  // Instant load state from local cache or pre-loaded defaults
  const [notifications, setNotifications] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_notifications");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(n => !["notif-1", "notif-2", "notif-3", "notif-4"].includes(n.id));
        }
      } catch (e) {}
    }
    return [];
  });

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewItem, setViewItem] = useState(null);

  // Background fetch on mount
  useEffect(() => {
    fetchLiveNotifications();
  }, []);

  const fetchLiveNotifications = async () => {
    try {
      setSyncing(true);
      setError("");

      const statsRes = await axios.get(`${API}/api/superadmin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const recentActivity = statsRes.data?.recentActivity || [];
      const liveItems = recentActivity.map((act, index) => {
        let category = "System";
        if (act.type?.includes("user") || act.type?.includes("registration")) {
          category = "Approvals";
        } else if (act.type?.includes("Payment") || act.type?.includes("received")) {
          category = "Payments";
        } else if (act.type?.includes("Support") || act.type?.includes("Ticket")) {
          category = "Support";
        }

        return {
          id: act._id || `notif-${index}`,
          title: act.type || "System Activity",
          description: act.detail || "Platform event recorded.",
          category: category,
          time: act.time || act.dateText || "Recently",
          unread: true
        };
      });

      setNotifications(liveItems);
      localStorage.setItem("cached_superadmin_notifications", JSON.stringify(liveItems));
    } catch (err) {
      console.log("Error fetching live notifications");
    } finally {
      setSyncing(false);
    }
  };

  // Instant statistics calculation
  const stats = useMemo(() => {
    const approvals = notifications.filter((n) => n.category === "Approvals").length;
    const payments = notifications.filter((n) => n.category === "Payments").length;
    const support = notifications.filter((n) => n.category === "Support").length;
    const system = notifications.filter((n) => n.category === "System").length;
    return { approvals, payments, support, system };
  }, [notifications]);

  // Instant filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "All" || n.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [notifications, search, categoryFilter]);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem("cached_superadmin_notifications", JSON.stringify(updated));
  };

  const handleToggleRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n));
    setNotifications(updated);
    localStorage.setItem("cached_superadmin_notifications", JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("cached_superadmin_notifications", JSON.stringify(updated));
  };

  const getCategoryMeta = (category) => {
    switch (category) {
      case "Approvals":
        return { icon: <FaExclamationTriangle />, bg: "bg-amber-500/10 border-amber-500/30 text-amber-400" };
      case "Payments":
        return { icon: <FaDollarSign />, bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" };
      case "Support":
        return { icon: <FaComments />, bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" };
      case "System":
        return { icon: <FaBell />, bg: "bg-blue-500/10 border-blue-500/30 text-blue-400" };
      default:
        return { icon: <FaInfoCircle />, bg: "bg-slate-700 text-slate-300" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notifications Center</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time system alerts, user requests, and platform notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLiveNotifications}
            className="flex items-center gap-2 bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
          >
            <FaSync className={syncing ? "animate-spin text-blue-400" : "text-blue-400"} />
            <span>{syncing ? "Syncing..." : "Sync"}</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <FaCheckDouble className="text-xs" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Stat Cards - INSTANT LOAD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{stats.approvals}</h3>
            <span className="text-xs text-amber-400/80 font-medium mt-1 inline-block">Requires review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payments & Billing</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.payments}</h3>
            <span className="text-xs text-emerald-400/80 font-medium mt-1 inline-block">Transactions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
            <FaDollarSign />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Messages</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">{stats.support}</h3>
            <span className="text-xs text-cyan-400/80 font-medium mt-1 inline-block">Inquiries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
            <FaComments />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Alerts</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{stats.system}</h3>
            <span className="text-xs text-blue-400/80 font-medium mt-1 inline-block">Platform logs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaBell />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["All", "Approvals", "Payments", "Support", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white border border-slate-700/60"
              }`}
            >
              {cat} {cat === "All" && `(${notifications.length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Notifications List - INSTANT DISPLAY */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
            <FaBell className="text-3xl mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const meta = getCategoryMeta(item.category);
            return (
              <div
                key={item.id}
                className={`bg-[#131B2E] border rounded-2xl p-4 md:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg ${
                  item.unread ? "border-blue-500/40 bg-[#131B2E]" : "border-slate-800/80 opacity-80"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${meta.bg}`}>
                    {meta.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm md:text-base font-bold text-white tracking-tight">{item.title}</h4>
                      {item.unread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{item.description}</p>
                    <span className="text-[11px] text-slate-500 mt-2 block font-medium">{item.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <button
                    onClick={() => setViewItem(item)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0B0F19] text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <FaEye className="text-slate-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleToggleRead(item.id)}
                    title={item.unread ? "Mark as Read" : "Mark as Unread"}
                    className="p-2 text-slate-400 hover:text-blue-400 bg-[#0B0F19] border border-slate-700/60 rounded-xl transition-colors"
                  >
                    <FaCheckCircle className={item.unread ? "text-slate-500" : "text-blue-400"} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Dismiss Notification"
                    className="p-2 text-slate-400 hover:text-rose-400 bg-[#0B0F19] border border-slate-700/60 rounded-xl transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FaBell className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Notification Details</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>

            <div className="space-y-3">
              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${getCategoryMeta(viewItem.category).bg}`}>
                {viewItem.category}
              </span>
              <h4 className="text-base font-bold text-white">{viewItem.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800">
                {viewItem.description}
              </p>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                <span>Received: {viewItem.time}</span>
                <span className={viewItem.unread ? "text-amber-400 font-semibold" : "text-slate-500"}>
                  {viewItem.unread ? "Unread" : "Read"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminNotifications;
