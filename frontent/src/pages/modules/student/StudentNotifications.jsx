import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaCheckDouble, FaTrashAlt, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/app-notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(`${API}/api/app-notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(`${API}/api/app-notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDelete = async (id) => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API}/api/app-notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const categories = ["All", "Attendance", "Exams", "Events", "System", "Support"];

  const filtered = notifications.filter(n => {
    const matchesCategory = categoryFilter === "All" || n.category === categoryFilter;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B132A] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8]">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">Student Notifications</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Stay updated on attendance, exam schedules, and school announcements</p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <FaCheckDouble /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#7C3AED] text-white shadow-xs"
                  : "bg-white dark:bg-[#0B132A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">No notifications found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(n => (
              <div
                key={n._id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition ${
                  !n.isRead ? "bg-[#7C3AED]/5 dark:bg-[#38BDF8]/5" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                }`}
              >
                <div className={`w-2.5 h-2.5 mt-2 rounded-full shrink-0 ${!n.isRead ? "bg-[#7C3AED] dark:bg-[#38BDF8]" : "bg-slate-300 dark:bg-white/20"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm ${!n.isRead ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300"}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-semibold">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.link && (
                      <button
                        type="button"
                        onClick={() => navigate(n.link)}
                        className="text-[#7C3AED] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        View Details <FaExternalLinkAlt className="text-[9px]" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkSingleRead(n._id)}
                      className="p-2 text-slate-400 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] transition cursor-pointer"
                      title="Mark as Read"
                    >
                      <FaCheckDouble className="text-xs" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="Delete Notification"
                  >
                    <FaTrashAlt className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
