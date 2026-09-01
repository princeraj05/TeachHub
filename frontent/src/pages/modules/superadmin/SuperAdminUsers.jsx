import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  FaUsers,
  FaUserClock,
  FaUserShield,
  FaChalkboardTeacher,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaSync
} from "react-icons/fa";

const defaultUsers = [];

function SuperAdminUsers() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();

  const initialStatus = searchParams.get("status") || "All";
  const initialRole = searchParams.get("role") || "All";

  // Instant load state from local cache or pre-loaded defaults
  const [users, setUsers] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_users");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => !["u1","u2","u3","u4","u5","u6","u7","u8"].includes(u._id));
        }
      } catch (e) {}
    }
    return [];
  });

  const [schoolsList, setSchoolsList] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Sync state if URL query params change
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    const urlRole = searchParams.get("role");
    if (urlStatus && urlStatus !== statusFilter) setStatusFilter(urlStatus);
    if (urlRole && urlRole !== roleFilter) setRoleFilter(urlRole);
  }, [searchParams]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Form state for assigning/updating user
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    role: "student",
    schoolName: "",
    status: "Approved"
  });

  // Background fetch on mount & filter change
  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setSyncing(true);
      const params = {};
      if (roleFilter !== "All") params.role = roleFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      if (search) params.search = search;

      const res = await axios.get(`${API}/api/superadmin/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.users || res.data?.data || []);
      setUsers(data);
      localStorage.setItem("cached_superadmin_users", JSON.stringify(data));
    } catch (err) {
      console.log("Error loading users state");
    } finally {
      setSyncing(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${API}/api/superadmin/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setSchoolsList(res.data);
      }
    } catch (err) {}
  };

  // Instant statistics (Superadmin is excluded from Total, Pending, and Active Admins)
  const stats = useMemo(() => {
    const nonSuperAdminUsers = users.filter((u) => u.role !== "superadmin");
    const total = nonSuperAdminUsers.length;
    const pending = nonSuperAdminUsers.filter(
      (u) => u.role === "unassigned" || u.requestStatus === "pending" || u.requestStatus === "scheduled" || u.requestStatus === "exam_completed"
    ).length;
    const admins = users.filter((u) => u.role === "admin").length;
    const teachers = users.filter((u) => u.role === "teacher").length;
    return { total, pending, admins, teachers };
  }, [users]);

  // Instant filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.name || "";
      const email = u.email || "";
      const school = u.schoolName || u.requestedSchool || "";
      const role = u.role || "unassigned";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        school.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || role.toLowerCase() === roleFilter.toLowerCase();

      const isPending = (role === "unassigned" || u.requestStatus === "pending" || u.requestStatus === "scheduled" || u.requestStatus === "exam_completed");
      const userStatus = isPending ? "Pending" : (u.requestStatus === "rejected" ? "Rejected" : "Approved");
      const matchesStatus =
        statusFilter === "All" || userStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Handle Assign/Edit Role
  const handleAssignRoleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return;

    const updatedUsers = users.map((u) =>
      u._id === formData.userId
        ? { ...u, role: formData.role, schoolName: formData.schoolName, requestStatus: "approved" }
        : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("cached_superadmin_users", JSON.stringify(updatedUsers));
    setEditUser(null);
    setIsAddModalOpen(false);

    try {
      setActionLoading(true);
      await axios.post(
        `${API}/api/superadmin/assign-role`,
        {
          userId: formData.userId,
          role: formData.role,
          schoolName: formData.schoolName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Role & School updated in database!");
      setTimeout(() => setSuccess(""), 4000);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    const updatedUsers = users.filter((u) => u._id !== deleteUserId);
    setUsers(updatedUsers);
    localStorage.setItem("cached_superadmin_users", JSON.stringify(updatedUsers));
    const targetId = deleteUserId;
    setDeleteUserId(null);

    try {
      setActionLoading(true);
      await axios.delete(`${API}/api/superadmin/users/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("User deleted from database.");
      setTimeout(() => setSuccess(""), 4000);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "admin":
        return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
      case "teacher":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "student":
        return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
      default:
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-white"><FaTimes /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-white"><FaTimes /></button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Users Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage platform users, assigned roles, and access approvals.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all self-start md:self-auto"
        >
          <FaSync className={syncing ? "animate-spin text-blue-400" : "text-blue-400"} />
          <span>{syncing ? "Syncing..." : "Sync Database"}</span>
        </button>
      </div>

      {/* Summary Stat Cards - INSTANT LOAD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.total}</h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Instant Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaUsers />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pending}</h3>
            <span className="text-xs text-amber-400/80 font-medium mt-1 inline-block">Requires role assignment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaUserClock />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Admins</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.admins}</h3>
            <span className="text-xs text-cyan-400 font-medium mt-1 inline-block">School & System admins</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
            <FaUserShield />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Teachers</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.teachers}</h3>
            <span className="text-xs text-purple-400 font-medium mt-1 inline-block">Active staff</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
            <FaChalkboardTeacher />
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search users by name, email, school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300">
            <FaFilter className="text-xs text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#131B2E]">Filter by Role: All</option>
              <option value="superadmin" className="bg-[#131B2E]">SuperAdmin</option>
              <option value="admin" className="bg-[#131B2E]">Admin</option>
              <option value="teacher" className="bg-[#131B2E]">Teacher</option>
              <option value="student" className="bg-[#131B2E]">Student</option>
              <option value="unassigned" className="bg-[#131B2E]">Unassigned / Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#131B2E]">Filter by Status: All</option>
              <option value="Approved" className="bg-[#131B2E]">Approved</option>
              <option value="Pending" className="bg-[#131B2E]">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - INSTANT DISPLAY */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#0B0F19]/60 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">School</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <p className="text-base font-medium">No users found matching search</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleStr = user.role || "unassigned";
                  const isPending = roleStr === "unassigned" || user.requestStatus === "pending";
                  const displayStatus = isPending ? "Pending" : "Approved";
                  const schoolName = user.schoolName || user.requestedSchool || "N/A";

                  return (
                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white text-sm">{user.name || "Unnamed User"}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadgeStyle(roleStr)}`}>
                          {roleStr}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-slate-300 font-medium">
                        {schoolName}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          displayStatus === "Approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {displayStatus === "Approved" ? (
                            <FaCheckCircle className="text-[10px]" />
                          ) : (
                            <FaExclamationCircle className="text-[10px]" />
                          )}
                          {displayStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewUser(user)}
                            title="View Details"
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              setEditUser(user);
                              setFormData({
                                userId: user._id,
                                name: user.name,
                                email: user.email,
                                role: user.role === "unassigned" ? "student" : user.role,
                                schoolName: user.schoolName || user.requestedSchool || "",
                                status: displayStatus
                              });
                            }}
                            title="Assign Role / School"
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          {user.role !== "superadmin" && (
                            <button
                              onClick={() => setDeleteUserId(user._id)}
                              title="Delete User"
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Instant Cache & Live Sync
          </span>
        </div>
      </div>

      {/* MODAL 1: View User Details */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              {viewUser.photo ? (
                <img src={viewUser.photo} alt={viewUser.name} className="w-14 h-14 rounded-full object-cover border border-blue-500/50" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">
                  {getInitials(viewUser.name)}
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-white">{viewUser.name}</h4>
                <p className="text-xs text-slate-400">{viewUser.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getRoleBadgeStyle(viewUser.role)}`}>
                  {viewUser.role}
                </span>
              </div>
            </div>
            <div className="space-y-3 bg-[#0B0F19] p-4 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">School:</span>
                <span className="text-slate-200 font-medium">{viewUser.schoolName || viewUser.requestedSchool || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database ID:</span>
                <span className="text-slate-400 font-mono text-xs">{viewUser._id}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewUser(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign / Edit Role */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Assign Role & School</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleAssignRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">User Name</label>
                <input type="text" disabled value={formData.name} className="w-full bg-[#0B0F19]/50 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Admin (School Owner)</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="unassigned">Unassigned (Pending)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  placeholder="Enter school name..."
                  list="schools-datalist"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <datalist id="schools-datalist">
                  {schoolsList.map((s, i) => <option key={i} value={s} />)}
                </datalist>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-2">
                  {actionLoading && <FaSpinner className="animate-spin" />}
                  <span>Save Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-xl">
              <FaExclamationCircle />
            </div>
            <h3 className="text-lg font-bold text-white">Delete User?</h3>
            <p className="text-xs text-slate-400 mt-2">Are you sure you want to delete this user from database?</p>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteUserId(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 flex items-center gap-2">
                {actionLoading && <FaSpinner className="animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminUsers;
