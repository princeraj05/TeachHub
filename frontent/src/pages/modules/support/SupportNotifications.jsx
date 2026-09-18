import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaBell, 
  FaTicketAlt, 
  FaComments, 
  FaExclamationTriangle, 
  FaPhoneAlt, 
  FaCog, 
  FaCheck, 
  FaCheckDouble,
  FaPhoneSlash,
  FaSpinner,
  FaInbox,
  FaExternalLinkAlt
} from "react-icons/fa";
import API_URL from "../../../config/api";
import socket from "../../../socket";

export default function SupportNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [desktopPermission, setDesktopPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/app-notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching support notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Socket real-time listener
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    }

    const handleNewNotification = (newNotif) => {
      if (!newNotif || !newNotif._id) return;
      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        setUnreadCount((count) => count + 1);
        return [newNotif, ...prev];
      });

      // Trigger browser notification if granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(newNotif.title || "Support Notification", {
          body: newNotif.message || "",
          icon: "/logo.png"
        });
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("app-notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("app-notification:new", handleNewNotification);
    };
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setMarkingAll(true);
      await axios.put(`${API_URL}/api/app-notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      const token = localStorage.getItem("token");
      if (token) {
        axios.put(`${API_URL}/api/app-notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
      setNotifications((prev) => prev.map((n) => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notif.link) {
      navigate(notif.link);
    }
  };

  const requestDesktopPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
    }
  };

  // Helper to map notification type/title to icon & styling
  const getNotificationStyle = (n) => {
    const titleLower = (n.title || "").toLowerCase();
    const catLower = (n.category || "").toLowerCase();

    if (titleLower.includes("resolved")) {
      return { icon: FaCheck, iconColor: "bg-emerald-500/10 text-emerald-500", badge: "Resolved", type: "requests" };
    }
    if (titleLower.includes("closed")) {
      return { icon: FaCheckDouble, iconColor: "bg-slate-500/10 text-slate-400", badge: "Closed", type: "requests" };
    }
    if (titleLower.includes("escalat") || catLower.includes("escalat")) {
      return { icon: FaExclamationTriangle, iconColor: "bg-rose-500/10 text-rose-500", badge: "Escalated", type: "escalated" };
    }
    if (titleLower.includes("message") || titleLower.includes("replied")) {
      return { icon: FaComments, iconColor: "bg-purple-500/10 text-purple-500", badge: null, type: "messages" };
    }
    if (titleLower.includes("assign")) {
      return { icon: FaCheckDouble, iconColor: "bg-emerald-500/10 text-emerald-500", badge: null, type: "assigned" };
    }
    if (titleLower.includes("call") || catLower.includes("call")) {
      if (titleLower.includes("missed")) {
        return { icon: FaPhoneSlash, iconColor: "bg-amber-500/10 text-amber-500", badge: "Missed Call", type: "calls" };
      }
      return { icon: FaPhoneAlt, iconColor: "bg-blue-500/10 text-blue-500", badge: "Call", type: "calls" };
    }
    if (titleLower.includes("request") || titleLower.includes("ticket") || catLower.includes("support")) {
      return { icon: FaTicketAlt, iconColor: "bg-indigo-500/10 text-indigo-500", badge: !n.isRead ? "New" : null, type: "requests" };
    }
    return { icon: FaCog, iconColor: "bg-slate-500/10 text-slate-400", badge: null, type: "system" };
  };

  // Filter items based on active tab
  const filteredNotifications = notifications.filter((n) => {
    const style = getNotificationStyle(n);
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "requests") return style.type === "requests";
    if (activeTab === "messages") return style.type === "messages";
    if (activeTab === "assigned") return style.type === "assigned";
    if (activeTab === "escalations") return style.type === "escalated";
    if (activeTab === "calls") return style.type === "calls";
    if (activeTab === "system") return style.type === "system";
    return true;
  });

  // Categorize notifications into Today, Yesterday, Older
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const groupToday = filteredNotifications.filter((n) => new Date(n.createdAt) >= todayStart);
  const groupYesterday = filteredNotifications.filter((n) => {
    const d = new Date(n.createdAt);
    return d >= yesterdayStart && d < todayStart;
  });
  const groupOlder = filteredNotifications.filter((n) => new Date(n.createdAt) < yesterdayStart);

  // Unread breakdown stats
  const unreadStats = {
    requests: notifications.filter((n) => !n.isRead && getNotificationStyle(n).type === "requests").length,
    messages: notifications.filter((n) => !n.isRead && getNotificationStyle(n).type === "messages").length,
    assigned: notifications.filter((n) => !n.isRead && getNotificationStyle(n).type === "assigned").length,
    escalations: notifications.filter((n) => !n.isRead && getNotificationStyle(n).type === "escalated").length,
    calls: notifications.filter((n) => !n.isRead && getNotificationStyle(n).type === "calls").length
  };

  const renderNotificationGroup = (title, items, dateLabel) => {
    if (items.length === 0) return null;
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">{dateLabel}</span>
        </div>

        <div className="space-y-3">
          {items.map((n) => {
            const style = getNotificationStyle(n);
            const Icon = style.icon;
            const timeStr = new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div 
                key={n._id} 
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start justify-between p-3 rounded-xl transition cursor-pointer ${
                  !n.isRead 
                    ? "bg-purple-50/60 dark:bg-purple-900/10 hover:bg-purple-100/70 dark:hover:bg-purple-900/20" 
                    : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${style.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs ${!n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-200"}`}>
                        {n.title}
                      </h4>
                      {style.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400">
                          {style.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">{timeStr}</span>
                  {n.link && <FaExternalLinkAlt className="text-[10px] text-slate-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with real-time support requests, ticket assignments, replies, and escalations.
          </p>
        </div>

        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markingAll}
          className="flex items-center gap-2 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-purple-600 dark:text-purple-400 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {markingAll ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
          <span>Mark All as Read ({unreadCount})</span>
        </button>
      </div>

      {/* TOP TAB FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "requests", label: `New Requests (${notifications.filter(n => getNotificationStyle(n).type === "requests").length})` },
          { key: "messages", label: `Messages (${notifications.filter(n => getNotificationStyle(n).type === "messages").length})` },
          { key: "assigned", label: `Assigned (${notifications.filter(n => getNotificationStyle(n).type === "assigned").length})` },
          { key: "escalations", label: `Escalations (${notifications.filter(n => getNotificationStyle(n).type === "escalated").length})` },
          { key: "calls", label: `Calls (${notifications.filter(n => getNotificationStyle(n).type === "calls").length})` }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap border cursor-pointer ${
              activeTab === t.key 
                ? "bg-purple-600 text-white border-purple-600 shadow" 
                : "bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT: Notifications Stream & Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NOTIFICATIONS STREAM (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3">
              <FaSpinner className="text-2xl animate-spin text-purple-500" />
              <span>Loading real-time notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3">
              <FaInbox className="text-3xl text-slate-300 dark:text-slate-600" />
              <span>No notifications found in this view.</span>
            </div>
          ) : (
            <>
              {renderNotificationGroup("Today", groupToday, new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))}
              {renderNotificationGroup("Yesterday", groupYesterday, new Date(Date.now() - 86400000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))}
              {renderNotificationGroup("Earlier", groupOlder, "Older Notifications")}
            </>
          )}
        </div>

        {/* UNREAD SUMMARY & FILTERS SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Unread Summary Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs">Unread Summary</h3>
              <span className="text-[10px] font-bold text-purple-400">{unreadCount} Unread</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">New Requests</span>
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                  {unreadStats.requests}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">New Messages</span>
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] flex items-center justify-center">
                  {unreadStats.messages}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned to Me</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                  {unreadStats.assigned}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escalated Issues</span>
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center">
                  {unreadStats.escalations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Call Requests</span>
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">
                  {unreadStats.calls}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Notifications Banner */}
          <div className="bg-gradient-to-tr from-purple-900/40 via-indigo-900/30 to-[#0D1527] border border-purple-500/30 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Desktop Alerts</h4>
              <p className="text-xs text-slate-400 mt-1">Get instant desktop popup alerts whenever a new support ticket or message arrives.</p>
            </div>
            {desktopPermission === "granted" ? (
              <div className="py-2 px-3 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30">
                ✓ Desktop Notifications Enabled
              </div>
            ) : (
              <button 
                onClick={requestDesktopPermission}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                Enable Desktop Notifications
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
