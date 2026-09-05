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
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Super Admin Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of platform metrics, active institutions, and recent database events.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto"
        >
          <FaSync className={syncing ? "animate-spin text-blue-400" : "text-blue-400"} />
          <span>{syncing ? "Syncing..." : "Sync Database"}</span>
        </button>
      </div>

      {/* 4 Essential Stat Cards - INSTANT DISPLAY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {(stats?.totalUsers || 0).toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Instant Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaUsers />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
              {stats?.pendingApprovals || 0}
            </h3>
            <button
              onClick={() => navigate("/superadmin/users?status=Pending")}
              className="text-xs text-amber-400/90 hover:underline font-medium mt-1 inline-block"
            >
              Requires review →
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaUserClock />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Schools</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {(stats?.totalSchools || 0).toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Active Institutions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
            <FaSchool />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-purple-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Super Admin Revenue</p>
            <h3 className="text-2xl font-extrabold text-purple-300 mt-1">
              ₹{(stats?.financials?.platformRevenue ?? stats?.financials?.totalRevenue ?? 0).toLocaleString()}
            </h3>
            <span className="text-xs text-purple-400/80 font-medium mt-1 inline-block">Actual SaaS / Subs Revenue</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl shadow-inner">
            <FaDollarSign />
          </div>
        </div>
      </div>

      {/* System Volume Banner & School Breakdown */}
      {stats?.financials?.schoolRevenueBreakdown && stats.financials.schoolRevenueBreakdown.length > 0 && (
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>School Platform Revenue Breakdown</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Super Admin Special</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Actual platform earnings received per school vs total system volume</p>
            </div>
            <div className="bg-[#0B0F19] px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Total System Volume:</span>
              <span className="text-sm font-extrabold text-emerald-400">₹{(stats?.financials?.totalSystemVolume || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">School Name</th>
                  <th className="py-2.5 px-3">Super Admin Revenue (SaaS)</th>
                  <th className="py-2.5 px-3">Student Fees Collected</th>
                  <th className="py-2.5 px-3">Teacher Salaries Paid</th>
                  <th className="py-2.5 px-3 text-right">Total Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.financials.schoolRevenueBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <FaSchool className="text-slate-500 text-xs" />
                      <span>{item.schoolName}</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-purple-400">
                      ₹{(item.superAdminRevenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      ₹{(item.totalStudentFees || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      ₹{(item.totalTeacherSalaries || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
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
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/superadmin/users?status=Pending")}
              className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800/70 border border-slate-700/60 transition-all text-left group"
            >
              <p className="text-sm font-bold text-blue-400 group-hover:text-blue-300 flex items-center justify-between">
                <span>Approve Users</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-xs text-slate-400 mt-1">Review pending user registrations</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/schools")}
              className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800/70 border border-slate-700/60 transition-all text-left group"
            >
              <p className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                <span>Manage Schools</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-xs text-slate-400 mt-1">View list & configure settings</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/notifications")}
              className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800/70 border border-slate-700/60 transition-all text-left group"
            >
              <p className="text-sm font-bold text-amber-400 group-hover:text-amber-300 flex items-center justify-between">
                <span>Notifications</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-xs text-slate-400 mt-1">System alerts & platform logs</p>
            </button>

            <button
              onClick={() => navigate("/superadmin/support")}
              className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800/70 border border-slate-700/60 transition-all text-left group"
            >
              <p className="text-sm font-bold text-purple-400 group-hover:text-purple-300 flex items-center justify-between">
                <span>Support Inbox</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </p>
              <p className="text-xs text-slate-400 mt-1">Manage user tickets & chats</p>
            </button>
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Recent Database Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No recent database activity logged</p>
            ) : (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/80 text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{act.type}</p>
                    <p className="text-slate-400 mt-0.5">{act.detail}</p>
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
