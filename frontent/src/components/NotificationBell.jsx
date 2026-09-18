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

      {/* Popover Dropdown / Floating Mobile Card */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[90] sm:hidden"
          />

          {/* Popover Card Container */}
          <div className="fixed inset-x-2.5 top-16 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-3.5 w-auto sm:w-96 max-w-md sm:max-w-none bg-white dark:bg-[#0D1326] border border-slate-200/90 dark:border-white/10 rounded-2.5xl shadow-2xl z-[100] overflow-hidden animate-fadeIn text-slate-800 dark:text-slate-100 select-none">
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center text-xs shrink-0">
                  <FaBell />
                </div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-[#7C3AED]/15 dark:bg-[#38BDF8]/15 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#7C3AED]/20 dark:border-[#38BDF8]/20">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer bg-purple-500/10 dark:bg-[#38BDF8]/10 px-2 py-1 rounded-lg border border-[#7C3AED]/20 transition-all"
                    title="Mark all as read"
                  >
                    <FaCheckDouble className="text-[10px]" /> Read all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex border-b border-slate-100 dark:border-white/10 text-xs font-bold px-3.5 pt-2.5 gap-4 bg-slate-50/40 dark:bg-white/[0.01]">
              <button
                onClick={() => setFilter("all")}
                className={`pb-2 border-b-2 transition-all cursor-pointer font-black ${
                  filter === "all"
                    ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#38BDF8]"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`pb-2 border-b-2 transition-all cursor-pointer font-black ${
                  filter === "unread"
                    ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#38BDF8]"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-[340px] sm:max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                  <span>Loading notifications...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                  No notifications found.
                </div>
              ) : (
                filteredItems.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] ${
                      !n.isRead ? "bg-[#7C3AED]/[0.06] dark:bg-[#38BDF8]/[0.06]" : ""
                    }`}
                  >
                    <span
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        !n.isRead ? "bg-[#7C3AED] dark:bg-[#38BDF8] shadow-sm shadow-[#7C3AED]" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            !n.isRead
                              ? "text-slate-900 dark:text-white font-black"
                              : "text-slate-700 dark:text-slate-300 font-bold"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[9px] text-slate-400 shrink-0 font-extrabold font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-semibold">
                        {n.message}
                      </p>
                      {n.category && (
                        <span className="inline-block mt-1.5 text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20">
                          {n.category}
                        </span>
                      )}
                    </div>
                    {n.link && <FaExternalLinkAlt className="text-[10px] text-slate-400 mt-1 shrink-0 opacity-70" />}
                  </div>
                ))
              )}
            </div>

            {/* Footer View Notification Center */}
            {fullViewPath && (
              <div className="p-3 border-t border-slate-100 dark:border-white/10 text-center bg-slate-50/80 dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(fullViewPath);
                  }}
                  className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <span>View Notification Center</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
