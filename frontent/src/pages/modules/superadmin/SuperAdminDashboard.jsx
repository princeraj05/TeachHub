import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSchool,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaHourglassHalf,
  FaDollarSign,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      setError(err.response?.data?.message || "Failed to load real dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Live platform metrics, real MongoDB stats, and recent system activity.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md self-start md:self-auto"
        >
          Sync Real Data
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-blue-400" />
          <p className="text-sm font-medium">Fetching real stats from MongoDB database...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {/* Total Users */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm">
                  <FaUsers />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{stats?.totalUsers || 0}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">Active on platform</p>
            </div>

            {/* Pending Approvals */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Appr.</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm">
                  <FaHourglassHalf />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-3">{stats?.pendingApprovals || 0}</h3>
              <button
                onClick={() => navigate("/superadmin/users")}
                className="text-[11px] text-amber-400 hover:underline font-medium mt-1 block"
              >
                View pending →
              </button>
            </div>

            {/* Total Schools */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Schools</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
                  <FaSchool />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{stats?.totalSchools || 0}</h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">Registered institutions</p>
            </div>

            {/* Admins */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admins</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
                  <FaUserShield />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{stats?.admins || 0}</h3>
              <p className="text-[11px] text-cyan-400 font-medium mt-1">Active owners</p>
            </div>

            {/* Teachers */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teachers</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm">
                  <FaChalkboardTeacher />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{stats?.teachers || 0}</h3>
              <p className="text-[11px] text-purple-400 font-medium mt-1">Teaching staff</p>
            </div>

            {/* Students */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-sm">
                  <FaUserGraduate />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{stats?.students || 0}</h3>
              <p className="text-[11px] text-sky-400 font-medium mt-1">Enrolled students</p>
            </div>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">
                ₹{(stats?.financials?.totalRevenue || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Verified Razorpay payments</p>
            </div>

            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Amount</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-2">
                ₹{(stats?.financials?.pendingAmount || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-amber-400/80 mt-1">
                {stats?.financials?.pendingSchools || 0} schools processing
              </p>
            </div>

            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Schools</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-2">
                {stats?.financials?.paidSchools || 0}
              </h3>
              <p className="text-xs text-purple-400/80 mt-1">Subscribed institutions</p>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Navigation Quick Actions */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/superadmin/users")}
                  className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
                >
                  <p className="text-sm font-bold text-blue-400 group-hover:text-blue-300">Users Directory →</p>
                  <p className="text-xs text-slate-400 mt-1">Manage platform accounts & roles</p>
                </button>

                <button
                  onClick={() => navigate("/superadmin/schools")}
                  className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
                >
                  <p className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300">Schools Directory →</p>
                  <p className="text-xs text-slate-400 mt-1">Manage institutions & plans</p>
                </button>

                <button
                  onClick={() => navigate("/superadmin/notifications")}
                  className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
                >
                  <p className="text-sm font-bold text-amber-400 group-hover:text-amber-300">Notifications Center →</p>
                  <p className="text-xs text-slate-400 mt-1">View system alerts & requests</p>
                </button>

                <button
                  onClick={() => navigate("/superadmin/support")}
                  className="p-4 rounded-xl bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/60 transition-all text-left group"
                >
                  <p className="text-sm font-bold text-purple-400 group-hover:text-purple-300">Support Inbox →</p>
                  <p className="text-xs text-slate-400 mt-1">Help desk & user messaging</p>
                </button>
              </div>
            </div>

            {/* Live Recent Activity */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Recent Database Activity</h3>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No recent activity logged in MongoDB</p>
                ) : (
                  recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-800/80 text-xs">
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
