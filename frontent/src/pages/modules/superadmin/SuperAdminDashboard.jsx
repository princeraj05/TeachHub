import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaSchool,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaHourglassHalf,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaCalendarAlt,
  FaComments,
  FaPhoneAlt,
  FaClock,
  FaShieldAlt
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 12,
    pendingApprovals: 6,
    totalSchools: 2,
    admins: 2,
    teachers: 2,
    students: 2,
    financials: {
      totalRevenue: 0,
      pendingAmount: 0,
      pendingSchools: 0,
      paidSchools: 0
    },
    support: {
      openConversations: 2,
      openTickets: 0,
      pendingCalls: 3,
      avgResponseTime: "1h 24m"
    }
  });

  const [recentActivity, setRecentActivity] = useState([
    { _id: "act-1", type: "New user registered", detail: "Satyam Sharma (Student)", time: "10:45 AM", dateText: "Today" },
    { _id: "act-2", type: "User approved", detail: "Gudiya Kumari (Admin)", time: "10:20 AM", dateText: "Today" },
    { _id: "act-3", type: "New school added", detail: "Prince School", time: "Yesterday", dateText: "Yesterday" },
    { _id: "act-4", type: "Payment received", detail: "G.D Academy - Annual Plan", time: "Yesterday", dateText: "Yesterday" },
    { _id: "act-5", type: "New event created", detail: "Independence Day Celebration - G.D Academy", time: "Aug 24", dateText: "Aug 24" }
  ]);

  // Management section visibility (Toggled via "Approve Users" or stats link)
  const [showUserManagement, setShowUserManagement] = useState(false);

  // User list states
  const [users, setUsers] = useState([]);
  const [userSection, setUserSection] = useState("pending");
  const [schools, setSchools] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Modal states
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formattedDay = new Date().toLocaleDateString("en-US", {
    weekday: "long"
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchSchools();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API}/api/superadmin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setStats(res.data.stats);
        if (res.data.recentActivity && res.data.recentActivity.length > 0) {
          setRecentActivity(res.data.recentActivity);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${API}/api/superadmin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${API}/api/superadmin/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchools(res.data);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const handleDeleteUser = (id, userName) => {
    setDeleteConfirmUser({ _id: id, name: userName });
  };

  const executeDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${API}/api/superadmin/users/${deleteConfirmUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`${deleteConfirmUser.name} has been successfully deleted.`);
      setDeleteConfirmUser(null);
      fetchUsers();
      fetchDashboardStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAssignModal = (user) => {
    setEditUser(user);
    setNewRole(user.role);
    setNewSchool(user.schoolName || "");
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(
        `${API}/api/superadmin/assign-role`,
        {
          userId: editUser._id,
          role: newRole,
          schoolName: newSchool
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Role/School assigned successfully!");
      setEditUser(null);
      fetchUsers();
      fetchSchools();
      fetchDashboardStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign role");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const nonSuperAdminUsers = users.filter((u) => u.role !== "superadmin");
  const isPendingUser = (user) => user.role === "unassigned" && user.requestStatus !== "rejected" || ["pending", "scheduled", "exam_completed"].includes(user.requestStatus);
  const approvalLabel = (user) => user.requestStatus === "rejected" ? "Rejected" : isPendingUser(user) ? "Pending" : "Approved";

  const filteredUsers = nonSuperAdminUsers.filter((u) => {
    const matchesSection = userSection === "pending" ? isPendingUser(u) : !isPendingUser(u);
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSection && matchesSearch && matchesRole;
  });

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">
      
      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 mb-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 text-rose-700 dark:text-rose-455 rounded-2xl px-5 py-4 mb-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaTimes className="text-rose-500 text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Welcome & Calendar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 select-none mb-3 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            Welcome back, Super Admin! 👋
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
            Here's what's happening across TeachHub today.
          </p>
        </div>

        {/* Date card */}
        <div className="flex items-center gap-2.5 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] px-3 py-1.5 sm:px-4.5 sm:py-3 rounded-xl shadow-sm self-start sm:self-auto">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-xs sm:text-base" />
          </div>
          <div>
            <h4 className="text-[11px] sm:text-xs font-black text-slate-805 dark:text-white leading-tight">
              {formattedDate}
            </h4>
            <p className="text-[9px] sm:text-[10px] text-slate-450 dark:text-slate-450 font-bold mt-0.5">
              {formattedDay}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid (6 items - 2 COLUMNS ON MOBILE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 select-none mb-4 sm:mb-6">
        
        {/* Stat 1: Total Users */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Total Users</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center text-xs shrink-0">
              <FaUsers />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalUsers}
          </p>
          <span className="block text-[8px] sm:text-[9px] font-black text-emerald-500 truncate mt-0.5">↗ 12% from last week</span>
        </div>

        {/* Stat 2: Pending Approvals */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Pending Appr.</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-555 flex items-center justify-center text-xs shrink-0">
              <FaHourglassHalf />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.pendingApprovals}
          </p>
          <button 
            onClick={() => navigate("/superadmin/users")}
            className="block text-[8px] sm:text-[9px] font-black text-amber-600 dark:text-amber-400 hover:underline text-left mt-0.5 cursor-pointer truncate"
          >
            View pending →
          </button>
        </div>

        {/* Stat 3: Total Schools */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Total Schools</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs shrink-0">
              <FaSchool />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalSchools}
          </p>
          <span className="block text-[8px] sm:text-[9px] font-black text-emerald-500 truncate mt-0.5">↗ 0 this month</span>
        </div>

        {/* Stat 4: Admins */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Admins</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center text-xs shrink-0">
              <FaUserShield />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.admins}
          </p>
          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-450 truncate mt-0.5">Active admins</span>
        </div>

        {/* Stat 5: Teachers */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Teachers</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs shrink-0">
              <FaChalkboardTeacher />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.teachers}
          </p>
          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-455 truncate mt-0.5">Active teachers</span>
        </div>

        {/* Stat 6: Students */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-2.5 sm:p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-24 sm:h-auto">
          <div className="flex items-center justify-between mb-1 gap-1">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Students</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs shrink-0">
              <FaUserGraduate />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.students}
          </p>
          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-450 truncate mt-0.5">Active students</span>
        </div>

      </div>

      {/* Financial Overview Segment */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-sm relative select-none">
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-widest">Financial Overview</span>
          
          <select className="appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white py-1.5 px-4 rounded-xl text-[10px] font-bold focus:outline-none cursor-pointer">
            <option>This Month</option>
            <option>Last Month</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Revenue */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.01]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                ₹{stats.financials.totalRevenue.toFixed(2)}
              </h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold uppercase mt-0.5">Total Revenue</p>
              <span className="text-[8px] text-slate-400 font-bold mt-0.5 block">0% from last month</span>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.01]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                ₹{stats.financials.pendingAmount.toFixed(2)}
              </h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold uppercase mt-0.5">Pending Amount</p>
              <span className="text-[8px] text-amber-500 font-black mt-0.5 block">{stats.financials.pendingSchools} schools</span>
            </div>
          </div>

          {/* Paid schools */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.01]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                {stats.financials.paidSchools}
              </h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold uppercase mt-0.5">Paid Schools</p>
              <span className="text-[8px] text-green-555 font-black mt-0.5 block">0% from last month</span>
            </div>
          </div>

        </div>

      </div>

      {/* QUICK ACTIONS Segment */}
      <div className="space-y-3 select-none">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quick Actions</span>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* Action 1 */}
          <div 
            onClick={() => navigate("/superadmin/users")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm h-36 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FaUsers className="text-sm" />
            </div>
            <h4 className="text-[11px] font-black text-slate-805 dark:text-white mt-3">Approve Users</h4>
            <p className="text-[9px] text-slate-455 mt-1">Review pending registrations</p>
          </div>

          {/* Action 2 */}
          <div 
            onClick={() => navigate("/superadmin/schools")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm h-36 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FaSchool className="text-sm" />
            </div>
            <h4 className="text-[11px] font-black text-slate-805 dark:text-white mt-3">Manage Schools</h4>
            <p className="text-[9px] text-slate-455 mt-1">Add / Edit schools</p>
          </div>

          {/* Action 3 */}
          <div 
            onClick={() => alert("Open payment logs dashboard.")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm h-36 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-[11px] font-black text-slate-805 dark:text-white mt-3">Manage Payments</h4>
            <p className="text-[9px] text-slate-450 mt-1">View payments & subscriptions</p>
          </div>

          {/* Action 4 */}
          <div 
            onClick={() => alert("Redirecting to support conversations.")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm h-36 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FaComments className="text-sm" />
            </div>
            <h4 className="text-[11px] font-black text-slate-805 dark:text-white mt-3">Support Inbox</h4>
            <p className="text-[9px] text-slate-450 mt-1">View all support conversations</p>
          </div>

          {/* Action 5 */}
          <div 
            onClick={() => alert("Audit dashboard events.")}
            className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm h-36 group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h4 className="text-[11px] font-black text-slate-805 dark:text-white mt-3">Event Audit</h4>
            <p className="text-[9px] text-slate-455 mt-1">Review events across schools</p>
          </div>

        </div>
      </div>


      {/* Toggled User management Directory table drawer section */}
      <div className="pt-4 select-none">
        <button
          onClick={() => setShowUserManagement(!showUserManagement)}
          className="w-full bg-[#7C3AED]/5 hover:bg-[#7C3AED]/10 border border-[#7C3AED]/15 py-3 rounded-2xl text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2"
        >
          {showUserManagement ? "Hide Directory Table ✕" : "Show User management Directory Table ↓"}
        </button>
      </div>

      {showUserManagement && (
        <div className="space-y-4 animate-fadeIn border-t border-slate-200 dark:border-white/5 pt-6">
          
          <div className="flex gap-2">
            <button 
              onClick={() => setUserSection("pending")} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                userSection === "pending" 
                  ? "bg-[#7C3AED] text-white shadow-sm" 
                  : "bg-white dark:bg-[#0B132A] text-slate-655 dark:text-slate-350 border border-slate-200 dark:border-white/10"
              }`}
            >
              Pending Users ({stats.pendingApprovals})
            </button>
            
            <button 
              onClick={() => setUserSection("approved")} 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                userSection === "approved" 
                  ? "bg-[#7C3AED] text-white shadow-sm" 
                  : "bg-white dark:bg-[#0B132A] text-slate-655 dark:text-slate-350 border border-slate-200 dark:border-white/10"
              }`}
            >
              Approved Users ({stats.totalUsers - stats.pendingApprovals})
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7C3AED] shadow-sm transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter by:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="unassigned">Pending (Unassigned)</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Directory log Table */}
          <div className="bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loadingUsers ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold text-xs">Loading users...</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/[0.04]">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Info</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Role</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned School</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <FaUsers className="text-slate-200 dark:text-slate-800 text-5xl mx-auto mb-4" />
                          <p className="text-slate-500 text-xs font-bold">No users found in directory</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-xs font-black text-slate-805 dark:text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-450 font-bold mt-0.5">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                              u.role === "superadmin" ? "bg-rose-50 border-rose-100 text-rose-700" :
                              u.role === "admin" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                              u.role === "teacher" ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                              u.role === "student" ? "bg-cyan-50 border-cyan-100 text-cyan-700" :
                              "bg-amber-50 border-amber-100 text-amber-700"
                            }`}>
                              {u.role === "unassigned" ? "Pending Approval" : u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-805 dark:text-white font-black">
                              {u.schoolName || <span className="text-slate-450 font-semibold italic">Not Assigned</span>}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                              approvalLabel(u) === "Pending" ? "bg-amber-50 text-amber-700" : 
                              approvalLabel(u) === "Rejected" ? "bg-rose-50 text-rose-700" : 
                              "bg-emerald-50 text-emerald-700"
                            }`}>
                              {approvalLabel(u)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {u.role === "superadmin" ? (
                              <span className="text-[10px] text-slate-450 font-semibold italic">ReadOnly</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenAssignModal(u)}
                                  className="bg-slate-100 hover:bg-[#7C3AED] hover:text-white p-2 rounded-xl text-slate-500 transition duration-150 inline-flex items-center justify-center cursor-pointer"
                                  title="Edit User"
                                >
                                  <FaEdit className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  className="bg-rose-50 hover:bg-rose-600 hover:text-white p-2 rounded-xl text-rose-600 transition duration-150 inline-flex items-center justify-center cursor-pointer"
                                  title="Delete User"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Assignment Modal Drawer */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-slate-800 dark:text-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" />
            <div className="p-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-black">Assign Role & School</h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{editUser.name}</p>
                </div>
                <button
                  onClick={() => setEditUser(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl transition cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-5">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-slate-700 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="unassigned">Pending (Unassigned)</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {newRole !== "unassigned" && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      list="school-suggestions"
                      placeholder="Enter school name (e.g. G.D. Academy)"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                    />
                    <datalist id="school-suggestions">
                      {schools.map((school, idx) => (
                        <option key={idx} value={school} />
                      ))}
                    </datalist>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl text-xs font-black shadow-md transition disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: Delete User Confirmation */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setDeleteConfirmUser(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaTrash className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete User</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Are you sure you want to permanently delete <span className="font-extrabold text-slate-800 dark:text-white">{deleteConfirmUser.name}</span>?
                This will remove all their records from the database and this action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteUser}
                  disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminDashboard;
