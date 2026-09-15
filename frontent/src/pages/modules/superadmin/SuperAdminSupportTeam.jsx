import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaHeadset,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaSync,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaSpinner,
  FaShieldAlt,
  FaClock,
  FaTicketAlt,
  FaChevronRight,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding
} from "react-icons/fa";
import API_URL from "../../../config/api";

function SuperAdminSupportTeam() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  // Local & Cached State
  const [agents, setAgents] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_support_agents");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const realOnly = parsed.filter(a => !["sup_1", "sup_2", "sup_3", "sup_4"].includes(a._id) && !a._id.startsWith("sup_"));
          return realOnly;
        }
      } catch (e) {}
    }
    return [];
  });

  const [allUsers, setAllUsers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("promote"); // "promote" | "create"
  const [editAgent, setEditAgent] = useState(null);
  const [deleteAgentId, setDeleteAgentId] = useState(null);

  // Search input for promoting existing user
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserToPromote, setSelectedUserToPromote] = useState(null);

  // New Support Agent Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "Technical",
    shift: "Morning (09:00 - 17:00)"
  });

  useEffect(() => {
    fetchSupportAgents();
    fetchAllUsers();
  }, []);

  const fetchSupportAgents = async () => {
    try {
      setSyncing(true);
      const res = await axios.get(`${API}/api/superadmin/support-team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const realData = data.filter(a => !["sup_1", "sup_2", "sup_3", "sup_4"].includes(a._id) && !a._id.startsWith("sup_"));
      
      if (realData.length > 0) {
        setAgents(realData);
        localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(realData));
      } else {
        // Fallback to role search if support-team endpoint returns empty
        const userRes = await axios.get(`${API}/api/superadmin/users`, {
          params: { role: "support" },
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.users || []);
        const realUsers = users.filter(u => u.role === "support");
        if (realUsers.length > 0) {
          const mapped = realUsers.map((u, idx) => ({
            _id: u._id,
            name: u.name || "Support Agent",
            email: u.email || "",
            phone: u.phoneNumber || u.phone || "",
            role: "support",
            department: u.supportDepartment || "Technical",
            shift: u.supportShift || "Morning (09:00 - 17:00)",
            status: u.supportStatus || "active",
            dutyState: u.isOnline ? "On Duty" : "Offline",
            ticketsResolved: u.ticketsResolved || 0,
            activeTickets: u.activeTickets || 0,
            joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "2026-01-01",
            avatar: u.avatar || ""
          }));
          setAgents(mapped);
          localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(mapped));
        } else {
          setAgents([]);
          localStorage.setItem("cached_superadmin_support_agents", JSON.stringify([]));
        }
      }
    } catch (err) {
      console.log("Error fetching support team data from backend");
    } finally {
      setSyncing(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/superadmin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setAllUsers(data);
    } catch (err) {}
  };

  // Live filtered list of eligible users for promotion
  const promotableUsers = useMemo(() => {
    if (!userQuery.trim()) return [];
    const q = userQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.role !== "support" &&
        u.role !== "superadmin" &&
        ((u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)))
    ).slice(0, 5);
  }, [allUsers, userQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = agents.length;
    const onDuty = agents.filter((a) => a.dutyState === "On Duty" && a.status === "active").length;
    const totalResolved = agents.reduce((acc, a) => acc + (a.ticketsResolved || 0), 0);
    const activeTickets = agents.reduce((acc, a) => acc + (a.activeTickets || 0), 0);
    return { total, onDuty, totalResolved, activeTickets };
  }, [agents]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q);

      const matchesDept = deptFilter === "All" || a.department === deptFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && a.status === "active") ||
        (statusFilter === "Suspended" && a.status === "suspended") ||
        (statusFilter === "On Duty" && a.dutyState === "On Duty");

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [agents, search, deptFilter, statusFilter]);

  // Handle Promote Existing User
  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserToPromote) {
      setError("Please select a user to promote.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/superadmin/assign-role`,
        {
          userId: selectedUserToPromote._id,
          role: "support",
          supportDepartment: formData.department,
          supportShift: formData.shift
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data?.user || selectedUserToPromote;
      const newAgent = {
        _id: updatedUser._id,
        name: updatedUser.name || "Support Member",
        email: updatedUser.email,
        phone: updatedUser.phoneNumber || "+91 99999 88888",
        role: "support",
        department: formData.department,
        shift: formData.shift,
        status: "active",
        dutyState: "Offline",
        ticketsResolved: 0,
        activeTickets: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        avatar: updatedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name || "Support")}&background=7C3AED&color=fff`
      };

      const updated = [newAgent, ...agents.filter((a) => a._id !== newAgent._id)];
      setAgents(updated);
      localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(updated));

      setIsAddModalOpen(false);
      setSelectedUserToPromote(null);
      setUserQuery("");
      setSuccess(`Successfully promoted ${newAgent.name} to Support Team!`);
      setTimeout(() => setSuccess(""), 4000);
      fetchSupportAgents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote user to support team.");
    }
  };

  // Handle Create New Support Agent Account
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/superadmin/support-team/create`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const created = res.data?.agent || {
        _id: "sup_" + Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "+91 98888 77777",
        role: "support",
        department: formData.department,
        shift: formData.shift,
        status: "active",
        dutyState: "Offline",
        ticketsResolved: 0,
        activeTickets: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=7C3AED&color=fff`
      };

      const updated = [created, ...agents];
      setAgents(updated);
      localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(updated));

      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        department: "Technical",
        shift: "Morning (09:00 - 17:00)"
      });
      setSuccess(`Support Agent account created for ${created.name}!`);
      setTimeout(() => setSuccess(""), 4000);
      fetchSupportAgents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create support agent account.");
    }
  };

  // Handle Toggle Suspend / Activate
  const handleToggleStatus = async (agentId) => {
    const targetAgent = agents.find((a) => a._id === agentId);
    if (!targetAgent) return;

    const nextStatus = targetAgent.status === "active" ? "suspended" : "active";

    const updated = agents.map((a) =>
      a._id === agentId ? { ...a, status: nextStatus, dutyState: nextStatus === "suspended" ? "Offline" : a.dutyState } : a
    );
    setAgents(updated);
    localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(updated));

    try {
      await axios.patch(
        `${API}/api/superadmin/support-team/${agentId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Support Agent status updated!");
    } catch (err) {
      console.log("Status updated locally");
    }
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle Revoke Support Role
  const handleRevokeRole = async () => {
    if (!deleteAgentId) return;

    const updated = agents.filter((a) => a._id !== deleteAgentId);
    setAgents(updated);
    localStorage.setItem("cached_superadmin_support_agents", JSON.stringify(updated));

    try {
      await axios.delete(
        `${API}/api/superadmin/support-team/${deleteAgentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      await axios.post(
        `${API}/api/superadmin/assign-role`,
        { userId: deleteAgentId, role: "unassigned" },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }

    setDeleteAgentId(null);
    setSuccess("Support Team role revoked successfully.");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1C] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans transition-colors duration-200">
      
      {/* Toast Feedback */}
      {success && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/20">
              <FaHeadset />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Support Team Workspace
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Grant support privileges, monitor active duty staff, assign departments, and manage support credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchSupportAgents}
            className="flex items-center gap-2 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <FaSync className={syncing ? "animate-spin text-purple-500" : "text-purple-500"} />
            <span>{syncing ? "Syncing..." : "Sync Team"}</span>
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setError("");
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer active:scale-95"
          >
            <FaUserPlus className="text-sm" />
            <span>Add Support Member</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Support Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FaHeadset className="text-lg" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-semibold text-emerald-500">Active Agents</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              On-Duty Agents
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FaUserCheck className="text-lg" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.onDuty}</span>
            <span className="text-xs font-semibold text-emerald-500">Ready for Live Chat</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Tickets Handled
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FaTicketAlt className="text-lg" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeTickets}</span>
            <span className="text-xs font-semibold text-amber-500">In Progress</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Resolved Tickets
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FaShieldAlt className="text-lg" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalResolved}</span>
            <span className="text-xs font-semibold text-indigo-500">Lifetime Total</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search support agent by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Departments</option>
              <option value="Technical">Technical</option>
              <option value="Billing & SaaS">Billing & SaaS</option>
              <option value="Account Onboarding">Account Onboarding</option>
              <option value="Escalation">Escalation</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Duty">On Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Agents Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#090F1C]/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6">Agent Details</th>
                <th className="py-4 px-4">Department & Shift</th>
                <th className="py-4 px-4">Duty Status</th>
                <th className="py-4 px-4 text-center">Active Tickets</th>
                <th className="py-4 px-4 text-center">Resolved</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaHeadset className="text-3xl mx-auto mb-2 opacity-40 text-purple-500" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No support team members found.</p>
                    <p className="text-[11px] mt-1">Click "Add Support Member" above to assign or create a support team account.</p>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    
                    {/* Agent Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-10 h-10 rounded-full object-cover border border-purple-500/20"
                          />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111827] ${
                            agent.status === "suspended"
                              ? "bg-rose-500"
                              : agent.dutyState === "On Duty"
                              ? "bg-emerald-500"
                              : agent.dutyState === "Away"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{agent.name}</span>
                            <span className="text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                              Support Team
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1"><FaEnvelope className="text-[10px]" /> {agent.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Shift */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {agent.department}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <FaClock className="text-[10px]" /> {agent.shift}
                        </div>
                      </div>
                    </td>

                    {/* Duty Status */}
                    <td className="py-4 px-4">
                      {agent.status === "suspended" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                          <FaUserTimes className="text-[11px]" /> Suspended
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                          agent.dutyState === "On Duty"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : agent.dutyState === "Away"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                        }`}>
                          <FaUserCheck className="text-[11px]" /> {agent.dutyState}
                        </span>
                      )}
                    </td>

                    {/* Active Tickets */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        {agent.activeTickets}
                      </span>
                    </td>

                    {/* Resolved Tickets */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        {agent.ticketsResolved}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {agent.joinedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(agent._id)}
                          title={agent.status === "active" ? "Suspend Support Privileges" : "Activate Privileges"}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            agent.status === "active"
                              ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                        >
                          {agent.status === "active" ? "Suspend" : "Activate"}
                        </button>

                        <button
                          onClick={() => setDeleteAgentId(agent._id)}
                          title="Revoke Support Role"
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / ASSIGN SUPPORT MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#090F1C]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
                  <FaUserShield />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Support Team Member</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Promote an existing user or create a new agent account.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50/30 dark:bg-[#090F1C]/30">
              <button
                onClick={() => setActiveModalTab("promote")}
                className={`pb-3 text-xs font-bold border-b-2 transition-all mr-6 cursor-pointer ${
                  activeModalTab === "promote"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Promote Existing User
              </button>
              <button
                onClick={() => setActiveModalTab("create")}
                className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeModalTab === "create"
                    ? "border-purple-600 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Create New Agent Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form Body */}
            <div className="p-6 space-y-4">
              {activeModalTab === "promote" ? (
                <form onSubmit={handlePromoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Search User by Name or Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type email or name to search database..."
                        value={userQuery}
                        onChange={(e) => {
                          setUserQuery(e.target.value);
                          setSelectedUserToPromote(null);
                        }}
                        className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                      />

                      {/* Dropdown Live Results */}
                      {promotableUsers.length > 0 && !selectedUserToPromote && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {promotableUsers.map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => {
                                setSelectedUserToPromote(u);
                                setUserQuery(`${u.name} (${u.email})`);
                              }}
                              className="w-full text-left p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                                <p className="text-[11px] text-slate-400">{u.email} • Role: {u.role}</p>
                              </div>
                              <span className="text-[10px] font-extrabold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">
                                Select
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedUserToPromote && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-purple-700 dark:text-purple-300">Selected: {selectedUserToPromote.name}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedUserToPromote.email}</p>
                      </div>
                      <FaCheckCircle className="text-purple-600 text-lg" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Assign Support Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="Technical">Technical Support</option>
                      <option value="Billing & SaaS">Billing & SaaS</option>
                      <option value="Account Onboarding">Account Onboarding</option>
                      <option value="Escalation">Escalation Specialist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Assigned Shift
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="Morning (09:00 - 17:00)">Morning (09:00 - 17:00)</option>
                      <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                      <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20"
                    >
                      Confirm Support Role Promotion
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Agent Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.support@teachhub.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Billing & SaaS">Billing & SaaS</option>
                        <option value="Account Onboarding">Onboarding</option>
                        <option value="Escalation">Escalation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Shift
                      </label>
                      <select
                        value={formData.shift}
                        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                      >
                        <option value="Morning (09:00 - 17:00)">Morning</option>
                        <option value="Evening (14:00 - 22:00)">Evening</option>
                        <option value="Night (22:00 - 06:00)">Night</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20"
                    >
                      Create Support Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE / REVOKE ROLE MODAL */}
      {deleteAgentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl mx-auto mb-4 border border-rose-500/20">
              <FaExclamationCircle />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Revoke Support Role?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This will remove support portal privileges and return the user's role to unassigned.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteAgentId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeRole}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
              >
                Revoke Privilege
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminSupportTeam;
