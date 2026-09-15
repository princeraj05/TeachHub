import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell, FaCheckDouble, FaTrashAlt, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import API_URL from "../config/api";

export default function NotificationBell({ fullViewPath = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const API = API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/app-notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log("Error fetching notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto polling
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    const API = API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(`${API}/api/app-notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err.message);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      const API = API_URL;
      const token = localStorage.getItem("token");
      if (token) {
        axios.put(`${API}/api/app-notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredItems = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer transition-all duration-200 text-sm shadow-xs active:scale-95 flex items-center justify-center"
        title="Notifications"
        aria-label="View Notifications"
      >
        <FaBell className={`text-base ${unreadCount > 0 ? "text-[#7C3AED] dark:text-[#38BDF8] animate-bounce" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <FaBell className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
              <h3 className="text-xs font-black tracking-tight uppercase">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <FaCheckDouble /> Read all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 dark:border-white/10 text-xs font-bold px-3 pt-2 gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`pb-2 border-b-2 transition cursor-pointer ${filter === "all" ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#38BDF8]" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white"}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`pb-2 border-b-2 transition cursor-pointer ${filter === "unread" ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#38BDF8]" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white"}`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                Loading notifications...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No notifications found.
              </div>
            ) : (
              filteredItems.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] ${!n.isRead ? "bg-[#7C3AED]/5 dark:bg-[#38BDF8]/5 font-medium" : ""}`}
                >
                  <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.isRead ? "bg-[#7C3AED] dark:bg-[#38BDF8]" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${!n.isRead ? "text-slate-900 dark:text-white font-black" : "text-slate-700 dark:text-slate-300"}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-slate-400 shrink-0 font-semibold">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.category && (
                      <span className="inline-block mt-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {n.category}
                      </span>
                    )}
                  </div>
                  {n.link && (
                    <FaExternalLinkAlt className="text-[10px] text-slate-400 mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer view full notifications page link */}
          {fullViewPath && (
            <div className="p-2.5 border-t border-slate-100 dark:border-white/10 text-center bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate(fullViewPath);
                }}
                className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline cursor-pointer"
              >
                View Notification Center →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
