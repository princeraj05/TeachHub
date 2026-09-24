import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSchool,
  FaUserClock,
  FaDollarSign,
  FaArrowRight,
  FaSpinner,
  FaUserShield,
  FaComments,
  FaSync
} from "react-icons/fa";
import API_URL from "../../../config/api";

const defaultStats = {
  totalUsers: 0,
  pendingApprovals: 0,
  totalSchools: 0,
  admins: 0,
  teachers: 0,
  students: 0,
  financials: {
    totalRevenue: 0,
    pendingAmount: 0,
    pendingSchools: 0,
    paidSchools: 0
  }
};

const defaultActivity = [];

function SuperAdminDashboard() {
  const API = API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Instant load state from local cache or pre-loaded defaults
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_dashboard_stats");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && parsed.totalSchools !== 3 && parsed.totalUsers !== 8) return parsed;
      } catch (e) {}
    }
    return defaultStats;
  });

  const [recentActivity, setRecentActivity] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_dashboard_activity");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setSyncing(true);
      setError("");
      const res = await axios.get(`${API}/api/superadmin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success || res.data?.stats) {
        const newStats = res.data.stats || {};
        const newActivity = res.data.recentActivity || [];
        setStats(newStats);
        setRecentActivity(newActivity);
        localStorage.setItem("cached_superadmin_dashboard_stats", JSON.stringify(newStats));
        localStorage.setItem("cached_superadmin_dashboard_activity", JSON.stringify(newActivity));
      }
    } catch (err) {
      console.log("Using cached dashboard stats");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-3 sm:p-6 md:p-8 font-sans transition-colors duration-200">
      {/* Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Super Admin Workspace</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Overview of platform metrics, active institutions, and recent database events.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 bg-white dark:bg-[#131B2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <FaSync className={syncing ? "animate-spin text-blue-500" : "text-blue-500"} />
          <span>{syncing ? "Syncing..." : "Sync Database"}</span>
        </button>
      </div>

      {/* 4 Essential Stat Cards - RESPONSIVE 2-COLUMN ON MOBILE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-[#7C3AED]/40 transition-all duration-300">
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 25" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,20 Q25,5 50,15 T100,10 L100,25 L0,25 Z" fill="currentColor" className="text-blue-500" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-2 z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Total Users</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {(stats?.totalUsers || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 text-base sm:text-lg shrink-0">
              <FaUsers />
            </div>
          </div>
          <div className="mt-2.5 z-10 flex items-center gap-1">
            <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">Instant Ready</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 25" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,15 Q25,22 50,8 T100,18 L100,25 L0,25 Z" fill="currentColor" className="text-amber-500" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-2 z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Pending Approvals</p>
              <h3 className="text-lg sm:text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
                {stats?.pendingApprovals || 0}
              </h3>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 text-base sm:text-lg shrink-0">
              <FaUserClock />
            </div>
          </div>
          <div className="mt-2.5 z-10">
            <button
              onClick={() => navigate("/superadmin/users?status=Pending")}
              className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>Requires review</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 25" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,10 Q25,18 50,12 T100,5 L100,25 L0,25 Z" fill="currentColor" className="text-emerald-500" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-2 z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Total Schools</p>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {(stats?.totalSchools || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-base sm:text-lg shrink-0">
              <FaSchool />
            </div>
          </div>
          <div className="mt-2.5 z-10 flex items-center gap-1">
            <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">Active Institutions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-purple-500/30 rounded-2xl p-3.5 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/60 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 25" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,22 Q25,8 50,18 T100,6 L100,25 L0,25 Z" fill="currentColor" className="text-purple-500" />
            </svg>
          </div>

          <div className="flex items-start justify-between gap-2 z-10">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest truncate">Super Admin Revenue</p>
              <h3 className="text-lg sm:text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                ₹{(stats?.financials?.platformRevenue ?? stats?.financials?.totalRevenue ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-base sm:text-lg shrink-0 shadow-inner">
              <FaDollarSign />
            </div>
          </div>
          <div className="mt-2.5 z-10 flex items-center gap-1">
            <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-bold truncate">Actual SaaS / Subs Revenue</span>
          </div>
        </div>
      </div>

      {/* System Volume Banner & School Breakdown */}
      {stats?.financials?.schoolRevenueBreakdown && stats.financials.schoolRevenueBreakdown.length > 0 && (
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>School Platform Revenue Breakdown</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">Super Admin Special</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Actual platform earnings received per school vs total system volume</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F19] px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total System Volume:</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">₹{(stats?.financials?.totalSystemVolume || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">School Name</th>
                  <th className="py-2.5 px-3">Super Admin Revenue (SaaS)</th>
                  <th className="py-2.5 px-3">Student Fees Collected</th>
                  <th className="py-2.5 px-3">Teacher Salaries Paid</th>
                  <th className="py-2.5 px-3 text-right">Total Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {stats.financials.schoolRevenueBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FaSchool className="text-slate-400 dark:text-slate-500 text-xs" />
                      <span>{item.schoolName}</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-purple-600 dark:text-purple-400">
                      ₹{(item.superAdminRevenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      ₹{(item.totalStudentFees || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      ₹{(item.totalTeacherSalaries || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(item.totalVolume || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Database Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate("/superadmin/users?status=Pending")}
              className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 transition-all text-left group cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 flex items-center justify-between">
                <span>Approve Users</span>
                <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">Pending user registrations</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/schools")}
              className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 transition-all text-left group cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 flex items-center justify-between">
                <span>Manage Schools</span>
                <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">List & settings</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/notifications")}
              className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 transition-all text-left group cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500 dark:group-hover:text-amber-300 flex items-center justify-between">
                <span>Notifications</span>
                <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">System alerts & logs</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/support")}
              className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 transition-all text-left group cursor-pointer"
            >
              <p className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 flex items-center justify-between">
                <span>Support Inbox</span>
                <FaArrowRight className="text-[10px] sm:text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">Tickets & user chats</p>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4">Recent Database Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No recent database activity logged</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{act.type}</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.detail}</p>
                  </div>
                  <span className="text-slate-500 font-medium">{act.time || act.dateText}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
