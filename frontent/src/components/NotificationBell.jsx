import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import API_URL from "../config/api";

export default function NotificationBell({ fullViewPath = "" }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const getTargetPath = () => {
    if (fullViewPath) return fullViewPath;
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return "/admin/notifications";
    if (path.startsWith("/teacher")) return "/teacher/notifications";
    if (path.startsWith("/student")) return "/student/notifications";
    if (path.startsWith("/superadmin")) return "/superadmin/notifications";
    if (path.startsWith("/support")) return "/support/notifications";
    if (path.startsWith("/pending")) return "/pending/notifications";
    return "/notifications";
  };

  const fetchUnreadCount = async () => {
    const API = API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API}/api/app-notifications?limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log("Error fetching notification count:", err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s auto polling
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = getTargetPath();
    navigate(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
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
  );
}
