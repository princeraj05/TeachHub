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

function SuperAdminDashboard() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/superadmin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success || res.data?.stats) {
        setStats(res.data.stats || {});
        setRecentActivity(res.data.recentActivity || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
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
          className="flex items-center gap-2 bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto"
        >
          <FaSync className={loading ? "animate-spin text-blue-400" : "text-blue-400"} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-blue-400" />
          <p className="text-sm font-medium">Loading workspace metrics...</p>
        </div>
      ) : (
        <>
          {/* 4 Essential Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* 1. Total Users */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {(stats?.totalUsers || 0).toLocaleString()}
                </h3>
                <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Registered accounts</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
                <FaUsers />
              </div>
            </div>

            {/* 2. Pending Approvals */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
                  {stats?.pendingApprovals || 0}
                </h3>
                <button
                  onClick={() => navigate("/superadmin/users")}
                  className="text-xs text-amber-400/90 hover:underline font-medium mt-1 inline-block"
                >
                  Requires review →
                </button>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                <FaUserClock />
              </div>
            </div>

            {/* 3. Total Schools */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Schools</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {stats?.totalSchools || 0}
                </h3>
                <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Active institutions</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                <FaSchool />
              </div>
            </div>

            {/* 4. Total Revenue */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                  ₹{(stats?.financials?.totalRevenue || 0).toLocaleString()}
                </h3>
                <span className="text-xs text-slate-400 font-medium mt-1 inline-block">Verified transactions</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                <FaDollarSign />
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Database Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Grid */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/superadmin/users")}
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

            {/* Recent Database Activity */}
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
        </>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
