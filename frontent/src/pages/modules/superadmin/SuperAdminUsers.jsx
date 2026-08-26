import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaUsers,
  FaHourglassHalf,
  FaCheckCircle,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaClock,
  FaListUl,
  FaPlus,
  FaEnvelope,
  FaUser,
  FaTimes,
  FaInfoCircle,
  FaCopy
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

function SuperAdminUsers() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const { theme, toggleTheme } = useTheme();

  // Navigation states
  const [selectedUser, setSelectedUser] = useState(null); // When a user is selected for detail view
  const [detailTab, setDetailTab] = useState("overview"); // overview, details, roleSchool, activity, actions (Teacher) or profileOverview, schoolAccess, activityLog, documents (Student)

  // List states
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, approved, deactivated
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest
  
  // Selection states (for bulk actions)
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal / Editing states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", role: "student" });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalData, setRoleModalData] = useState({ userId: "", name: "", role: "student", schoolName: "" });
  const [adminNotes, setAdminNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/superadmin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
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

  // Bulk / Single actions handlers
  const handleApproveUser = async (userId, userName) => {
    try {
      setSaving(true);
      const targetUser = users.find(u => u._id === userId);
      // Approve defaults to student with G.D Academy if unassigned
      const finalRole = targetUser?.role === "unassigned" ? "student" : targetUser?.role;
      const finalSchool = targetUser?.schoolName || "G.D Academy";

      await axios.post(
        `${API}/api/superadmin/assign-role`,
        { userId, role: finalRole, schoolName: finalSchool },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`User ${userName} approved successfully!`);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, role: finalRole, schoolName: finalSchool, requestStatus: "approved" }));
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (id, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${userName}? This will remove all their records from the database.`)) {
      axios
        .delete(`${API}/api/superadmin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          setSuccess(`${userName} has been successfully deleted.`);
          setSelectedUser(null);
          fetchUsers();
          setTimeout(() => setSuccess(""), 3000);
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Failed to delete user");
        });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      setSaving(true);
      for (const id of selectedIds) {
        const u = users.find(user => user._id === id);
        if (u) {
          const finalRole = u.role === "unassigned" ? "student" : u.role;
          const finalSchool = u.schoolName || "G.D Academy";
          await axios.post(
            `${API}/api/superadmin/assign-role`,
            { userId: id, role: finalRole, schoolName: finalSchool },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      setSuccess(`Selected users approved successfully!`);
      setSelectedIds([]);
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed during bulk approval");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected users?`)) {
      try {
        setSaving(true);
        for (const id of selectedIds) {
          await axios.delete(`${API}/api/superadmin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setSuccess(`Selected users deleted successfully!`);
        setSelectedIds([]);
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        alert("Failed during bulk deletion");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Call register auth controller or custom superadmin creation endpoint
      await axios.post(`${API}/api/auth/firebase-sync`, {
        uid: `sa-gen-${Date.now()}`,
        email: newUserData.email,
        name: newUserData.name,
        role: newUserData.role
      });
      setSuccess("New user added successfully!");
      setShowAddUserModal(false);
      setNewUserData({ name: "", email: "", password: "", role: "student" });
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRoleModal = (user) => {
    setRoleModalData({
      userId: user._id,
      name: user.name,
      role: user.role === "unassigned" ? "student" : user.role,
      schoolName: user.schoolName || "G.D Academy"
    });
    setShowRoleModal(true);
  };

  const handleSaveRoleAssignment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(
        `${API}/api/superadmin/assign-role`,
        {
          userId: roleModalData.userId,
          role: roleModalData.role,
          schoolName: roleModalData.schoolName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("User role/school assigned successfully!");
      setShowRoleModal(false);
      fetchUsers();
      if (selectedUser && selectedUser._id === roleModalData.userId) {
        setSelectedUser(prev => ({ ...prev, role: roleModalData.role, schoolName: roleModalData.schoolName, requestStatus: "approved" }));
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  // Stats Calculations
  const totalUsersCount = users.filter(u => u.role !== "superadmin").length;
  
  const isPending = (u) => u.role === "unassigned" && u.requestStatus !== "rejected" || ["pending", "scheduled", "exam_completed"].includes(u.requestStatus);
  const pendingUsersCount = users.filter(u => u.role !== "superadmin" && isPending(u)).length;
  
  const approvedUsersCount = users.filter(u => u.role !== "superadmin" && !isPending(u) && u.requestStatus !== "rejected").length;
  const deactivatedUsersCount = 0; // mockup deactivations count

  // Filtered Users List
  const displayedUsers = useMemo(() => {
    return users
      .filter(u => u.role !== "superadmin")
      .filter(u => {
        // Tab Filters
        if (activeTab === "pending") return isPending(u);
        if (activeTab === "approved") return !isPending(u);
        if (activeTab === "deactivated") return false;
        return true;
      })
      .filter(u => {
        // Search Filter
        const term = search.toLowerCase();
        return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
      })
      .filter(u => {
        // Role Dropdown Filter
        return roleFilter === "All" || u.role === roleFilter;
      })
      .filter(u => {
        // School Dropdown Filter
        return schoolFilter === "All" || u.schoolName === schoolFilter;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [users, activeTab, search, roleFilter, schoolFilter, sortOrder]);

  const initials = (nameText) => {
    if (!nameText) return "U";
    return nameText.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-800 dark:text-white">
      
      {/* 1. Success message notifications banner */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW A: USERS MANAGEMENT LIST PAGE */}
      {!selectedUser ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header titles */}
          <div className="select-none">
            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <FaUsers className="text-[#7C3AED]" /> Users Management
            </h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">
              Manage all platform users and their access.
            </p>
          </div>

          {/* Stats Cards grid (4 items) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            {/* Total Users */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase tracking-widest">Total Users</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center">
                  <FaUsers className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">{totalUsersCount}</p>
              <span className="block text-[9px] font-black text-green-555 mt-2">↗ 12% from last week</span>
            </div>

            {/* Pending Users */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase tracking-widest">Pending Users</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FaHourglassHalf className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">{pendingUsersCount}</p>
              <span className="block text-[9px] font-black text-amber-500 mt-2">Approval required</span>
            </div>

            {/* Approved Users */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase tracking-widest">Approved Users</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FaCheckCircle className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">{approvedUsersCount}</p>
              <span className="block text-[9px] font-black text-green-555 mt-2">Active on platform</span>
            </div>

            {/* Deactivated */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase tracking-widest">Deactivated</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FaShieldAlt className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">{deactivatedUsersCount}</p>
              <span className="block text-[9px] font-bold text-slate-400 mt-2">No deactivated users</span>
            </div>
          </div>

          {/* Navigation tab pills */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-1 select-none overflow-x-auto">
            {[
              { id: "all", label: `All Users (${totalUsersCount})` },
              { id: "pending", label: `Pending (${pendingUsersCount})` },
              { id: "approved", label: `Approved (${approvedUsersCount})` },
              { id: "deactivated", label: `Deactivated (${deactivatedUsersCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedIds([]); }}
                className={`pb-3 px-3 text-xs font-black transition cursor-pointer relative shrink-0 ${
                  activeTab === tab.id
                    ? "text-[#7C3AED] dark:text-[#38BDF8]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#38BDF8]" />
                )}
              </button>
            ))}
          </div>

          {/* Filters, search input row */}
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Filter by role */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="unassigned">Pending (Unassigned)</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>

            {/* Filter by schools */}
            <div className="relative">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Schools</option>
                {schools.map((school, i) => (
                  <option key={i} value={school}>{school}</option>
                ))}
              </select>
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>

            {/* Sort order toggle */}
            <button 
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-slate-350"
            >
              <FaSort className="text-slate-400" /> Sort ({sortOrder})
            </button>

          </div>

          {/* Table List Container */}
          <div className="bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold text-xs">Loading directory...</p>
                </div>
              ) : (
                <table className="min-w-full text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/[0.04] text-slate-450 dark:text-slate-400 select-none">
                      <th className="px-5 py-4 text-left w-12">
                        <input
                          type="checkbox"
                          checked={displayedUsers.length > 0 && selectedIds.length === displayedUsers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(displayedUsers.map(u => u._id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          className="rounded border-slate-300 dark:border-white/10 text-[#7C3AED] focus:ring-[#7C3AED]"
                        />
                      </th>
                      <th className="px-5 py-4 text-left uppercase tracking-wider">User</th>
                      <th className="px-5 py-4 text-left uppercase tracking-wider">Role</th>
                      <th className="px-5 py-4 text-left uppercase tracking-wider">School</th>
                      <th className="px-5 py-4 text-left uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-left uppercase tracking-wider">Created</th>
                      <th className="px-5 py-4 text-center uppercase tracking-wider w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-slate-700 dark:text-slate-300">
                    {displayedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-20 text-center select-none">
                          <FaUsers className="text-slate-200 dark:text-slate-800 text-5xl mx-auto mb-4" />
                          <p className="text-slate-550 text-xs font-bold">No users matches current filter presets</p>
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((user) => {
                        const isUserPending = isPending(user);
                        const isChecked = selectedIds.includes(user._id);

                        return (
                          <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                            {/* Checkbox */}
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedIds(prev => 
                                    prev.includes(user._id)
                                      ? prev.filter(id => id !== user._id)
                                      : [...prev, user._id]
                                  );
                                }}
                                className="rounded border-slate-300 dark:border-white/10 text-[#7C3AED] focus:ring-[#7C3AED]"
                              />
                            </td>

                            {/* Name & Email info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0 font-black text-xs">
                                  {initials(user.name)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-black text-slate-850 dark:text-white leading-tight truncate">{user.name}</h4>
                                  <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold truncate mt-0.5">{user.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role badge */}
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                user.role === "admin" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                user.role === "teacher" ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                                user.role === "student" ? "bg-cyan-50 border-cyan-100 text-cyan-700" :
                                "bg-amber-50 border-amber-100 text-amber-700"
                              }`}>
                                {user.role === "unassigned" ? "Pending" : user.role}
                              </span>
                            </td>

                            {/* School */}
                            <td className="px-5 py-4 font-black">
                              {user.schoolName || <span className="text-slate-400 font-bold italic">Not Assigned</span>}
                            </td>

                            {/* Status badge */}
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isUserPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {isUserPending ? "Pending" : "Approved"}
                              </span>
                            </td>

                            {/* Created date */}
                            <td className="px-5 py-4 text-slate-455 dark:text-slate-500">
                              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>

                            {/* Action links */}
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5 select-none">
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-500 dark:text-slate-350 flex items-center justify-center transition cursor-pointer"
                                  title="View Details"
                                >
                                  <FaEye className="text-[10px]" />
                                </button>
                                
                                {isUserPending ? (
                                  <button
                                    onClick={() => handleApproveUser(user._id, user.name)}
                                    className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 transition flex items-center justify-center cursor-pointer"
                                    title="Quick Approve"
                                  >
                                    <FaCheckCircle className="text-[10px]" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenRoleModal(user)}
                                    className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-[#7C3AED] hover:text-white text-blue-600 transition flex items-center justify-center cursor-pointer"
                                    title="Edit assignment"
                                  >
                                    <FaEdit className="text-[10px]" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition flex items-center justify-center cursor-pointer"
                                  title="Delete User"
                                >
                                  <FaTrash className="text-[10px]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Segment */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black text-slate-455 dark:text-slate-400 select-none">
              <span>Showing 1 to {displayedUsers.length} of {displayedUsers.length} users</span>
              
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition">&lt;</button>
                <button className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white border border-[#7C3AED]">1</button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition">&gt;</button>
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select className="bg-transparent border border-slate-200 dark:border-white/10 rounded px-1.5 py-1 text-[10px] font-bold focus:outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk actions control bar */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm select-none">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black">{selectedIds.length} Selected</span>
              <button 
                onClick={handleBulkApprove}
                disabled={selectedIds.length === 0}
                className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-emerald-500/20 text-emerald-600 text-[10px] font-black py-2 px-4 rounded-xl transition disabled:opacity-40 cursor-pointer"
              >
                ✓ Approve
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-rose-500/20 text-rose-600 text-[10px] font-black py-2 px-4 rounded-xl transition disabled:opacity-40 cursor-pointer"
              >
                ✕ Reject
              </button>
              <button 
                onClick={() => {
                  if (selectedIds.length === 1) {
                    const user = users.find(u => u._id === selectedIds[0]);
                    if (user) handleOpenRoleModal(user);
                  } else {
                    alert("Please select exactly 1 user to change role.");
                  }
                }}
                disabled={selectedIds.length === 0}
                className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-blue-500/20 text-blue-600 text-[10px] font-black py-2 px-4 rounded-xl transition disabled:opacity-40 cursor-pointer"
              >
                👤 Change Role
              </button>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2 px-5 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <FaPlus /> Add User
            </button>
          </div>

        </div>
      ) : (
        /* ======================================= */
        /* VIEW B: USER DETAILS COMPONENT */
        <div className="space-y-6 animate-fadeIn select-none text-slate-800 dark:text-white">
          
          {/* Detailed View Breadcrumbs & Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
                Users &gt; User Details
              </p>
              <h2 className="text-lg font-black mt-1.5">{selectedUser.name}</h2>
            </div>
            
            <button 
              onClick={() => { setSelectedUser(null); setDetailTab("overview"); }}
              className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 text-[10px] font-black py-2 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FaArrowLeft className="text-[9px]" /> Back to Users
            </button>
          </div>

          {/* CHECKING ROLE: If Student (Pending/Approved) or Teacher/Admin details view */}
          {selectedUser.role === "student" || selectedUser.role === "unassigned" ? (
            
            /* ======================================= */
            /* VIEW B1: STUDENT DETAILED LAYOUT */
            <div className="space-y-6">
              
              {/* Profile Card Header */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-violet-600/10 text-violet-500 border border-violet-500/25 flex items-center justify-center text-xl font-black shrink-0 relative">
                    {initials(selectedUser.name)}
                  </div>
                  <div className="text-center sm:text-left min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-black leading-tight truncate">{selectedUser.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-orange-50 border border-orange-100 text-orange-700">
                        {selectedUser.requestStatus === "pending" || selectedUser.role === "unassigned" ? "Pending Approval" : "Approved"}
                      </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-[10px] font-semibold text-slate-455">
                      <span className="truncate">{selectedUser.email}</span>
                      <FaCopy 
                        onClick={() => copyToClipboard(selectedUser.email)}
                        className="text-xs text-slate-400 hover:text-slate-605 cursor-pointer shrink-0" 
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-[10px] text-slate-400 font-extrabold font-mono">
                      <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(selectedUser.updatedAt || selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0 flex flex-col items-center sm:items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Role</span>
                  <span className="px-3 py-1 rounded bg-cyan-50 text-cyan-700 text-xs font-black mt-1 uppercase tracking-wider">
                    {selectedUser.role}
                  </span>
                  <span className="text-[9px] text-orange-500 font-black mt-2 font-mono">● {selectedUser.requestStatus === "pending" || selectedUser.role === "unassigned" ? "Pending Approval" : "Approved"}</span>
                </div>
              </div>

              {/* Selection sub-tabs (Student) */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-1 select-none overflow-x-auto">
                {[
                  { id: "overview", label: "Profile Overview" },
                  { id: "schoolAccess", label: "School & Access" },
                  { id: "activity", label: "Activity Log" },
                  { id: "documents", label: "Documents" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`pb-3 px-3 text-xs font-black transition cursor-pointer relative shrink-0 ${
                      detailTab === tab.id
                        ? "text-[#7C3AED] dark:text-[#38BDF8]"
                        : "text-slate-505 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    {detailTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#38BDF8]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sub-tab display content (Student) */}
              {detailTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Personal info & Account info */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Personal Information */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                        <FaUser className="text-[#7C3AED]" /> Personal Information
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-semibold text-slate-655 dark:text-slate-400">
                        <div className="py-2.5 flex justify-between">
                          <span>Full Name</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.name}</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span>Email Address</span>
                          <span className="text-slate-900 dark:text-white font-extrabold flex items-center gap-1.5">
                            {selectedUser.email}
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">Verified</span>
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span>Phone Number</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.phoneNumber || "—"}</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span>Date of Birth</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">—</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span>Gender</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">—</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span>Address</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">—</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                        <FaShieldAlt className="text-[#7C3AED]" /> Account Information
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655 dark:text-slate-455">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Account Type</span>
                          <p className="text-slate-900 dark:text-white font-black mt-0.5 uppercase">Student</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Registration Method</span>
                          <p className="text-slate-900 dark:text-white font-black mt-0.5">Email</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Account Status</span>
                          <p className="text-orange-500 font-black mt-0.5 font-mono">● Pending Approval</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Created By</span>
                          <p className="text-slate-900 dark:text-white font-black mt-0.5">Self Registration</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Created At</span>
                          <p className="text-slate-900 dark:text-white font-black mt-0.5 font-mono">
                            {new Date(selectedUser.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Updated At</span>
                          <p className="text-slate-900 dark:text-white font-black mt-0.5 font-mono">
                            {new Date(selectedUser.updatedAt || selectedUser.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes textarea card */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-3">
                      <label className="block text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                        Notes (Admin Only)
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Add admin notes about this user..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="block text-[9px] text-slate-455 font-bold">These notes are only visible to super admin.</span>
                    </div>

                  </div>

                  {/* Right Column: Roles & permissions list, School assignment, actions */}
                  <div className="space-y-6">
                    
                    {/* Role & permissions */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                        <span className="text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">Role & Permissions</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 text-[8px] font-black uppercase">Student</span>
                      </div>
                      
                      <div className="space-y-2.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Permissions</p>
                        <div className="flex items-center gap-2">✓ View own profile</div>
                        <div className="flex items-center gap-2">✓ View subjects</div>
                        <div className="flex items-center gap-2">✓ View exams</div>
                        <div className="flex items-center gap-2">✓ View events</div>
                        <div className="flex items-center gap-2">✓ Access support</div>
                      </div>
                    </div>

                    {/* School assignment */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                        <span className="text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">School Assignment</span>
                        <span className="text-[8px] font-black text-green-555">✓ Verified</span>
                      </div>

                      <div className="space-y-2.5 text-xs font-semibold text-slate-655 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Assigned School</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.schoolName || "G.D Academy"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assign Date</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned By</span>
                          <span className="text-slate-900 dark:text-white font-extrabold">Self</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions box */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-3">
                      <span className="text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider block">Quick Actions</span>
                      
                      <button 
                        onClick={() => handleApproveUser(selectedUser._id, selectedUser.name)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✓ Approve User
                      </button>

                      <button 
                        onClick={() => alert("User registration rejected.")}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✕ Reject User
                      </button>

                      <button 
                        onClick={() => handleOpenRoleModal(selectedUser)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ✏️ Edit User Details
                      </button>

                      <a 
                        href={`mailto:${selectedUser.email}`}
                        className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        ✉️ Send Email
                      </a>

                      <button 
                        onClick={() => handleDeleteUser(selectedUser._id, selectedUser.name)}
                        className="w-full bg-transparent hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-600 py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        🗑️ Delete User
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* Inactive sub-tabs fallbacks */}
              {detailTab !== "overview" && (
                <div className="py-20 text-center text-slate-400 text-xs font-semibold bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 select-none">
                  No records configured in this segment yet. Please check back later.
                </div>
              )}

              <div className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
                <FaInfoCircle className="text-base text-[#38BDF8] shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Review the user information carefully before approving or rejecting the account.
                </p>
              </div>

            </div>

          ) : (
            
            /* ======================================= */
            /* VIEW B2: TEACHER DETAILED LAYOUT */
            <div className="space-y-6">
              
              {/* Profile Card Header */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-violet-600/10 text-violet-500 border border-violet-500/25 flex items-center justify-center text-xl font-black shrink-0 relative">
                    {initials(selectedUser.name)}
                    <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full" />
                  </div>
                  <div className="text-center sm:text-left min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-black leading-tight truncate">{selectedUser.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-purple-550/15 border border-purple-500/10 text-[#7C3AED]">
                        {selectedUser.role.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-455 dark:text-slate-400 font-bold mt-1.5">{selectedUser.email}</p>
                    <p className="text-[10px] text-slate-455 dark:text-slate-400 font-bold mt-0.5">{selectedUser.phoneNumber || "7479845306"}</p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-[10px] text-slate-400 font-extrabold font-mono">
                      <span>Created: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      <span>Last Updated: {new Date(selectedUser.updatedAt || selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3.5 py-1 text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                  Approved
                </span>
              </div>

              {/* Selection sub-tabs (Teacher) */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-1 select-none overflow-x-auto">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "details", label: "Details" },
                  { id: "roleSchool", label: "Role & School" },
                  { id: "activity", label: "Activity" },
                  { id: "actions", label: "Actions" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`pb-3 px-3 text-xs font-black transition cursor-pointer relative shrink-0 ${
                      detailTab === tab.id
                        ? "text-[#7C3AED] dark:text-[#38BDF8]"
                        : "text-slate-505 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    {detailTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#38BDF8]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sub-tabs displays (Teacher) */}
              {detailTab === "overview" && (
                <div className="space-y-6">
                  
                  {/* Grid cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Role */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5"><FaUser className="text-[#7C3AED]" /> Role</span>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white mt-1.5 uppercase leading-none">{selectedUser.role}</h4>
                      <p className="text-[8px] text-green-555 font-black mt-2">Active Role</p>
                    </div>

                    {/* School */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5"><FaSchool className="text-[#7C3AED]" /> School</span>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white mt-1.5 leading-none">{selectedUser.schoolName || "G.D Academy"}</h4>
                      <p className="text-[8px] text-slate-455 font-black mt-2">Assigned School</p>
                    </div>

                    {/* Status */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5"><FaCheckCircle className="text-[#7C3AED]" /> Status</span>
                      <h4 className="text-sm font-black text-green-555 mt-1.5 leading-none">Approved</h4>
                      <p className="text-[8px] text-slate-455 font-black mt-2">User Status</p>
                    </div>

                    {/* Login Status */}
                    <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5"><FaClock className="text-[#7C3AED]" /> Login Status</span>
                      <h4 className="text-sm font-black text-green-555 mt-1.5 leading-none">Online</h4>
                      <p className="text-[8px] text-slate-455 font-black mt-2">Currently Active</p>
                    </div>
                  </div>

                  {/* Personal info details */}
                  <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                      <FaUser className="text-[#7C3AED]" /> Personal Information
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-semibold text-slate-655 dark:text-slate-400">
                      <div className="py-2.5 flex justify-between">
                        <span>Full Name</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.name}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Email Address</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.email}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Phone Number</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.phoneNumber || "7479845306"}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Date of Birth</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">—</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Gender</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">—</span>
                      </div>
                    </div>
                  </div>

                  {/* Role School info details */}
                  <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                      <FaSchool className="text-[#7C3AED]" /> Role & School Information
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-semibold text-slate-655 dark:text-slate-400">
                      <div className="py-2.5 flex justify-between">
                        <span>Role</span>
                        <span className="text-slate-900 dark:text-white font-extrabold uppercase">{selectedUser.role}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Assigned School</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{selectedUser.schoolName || "G.D Academy"}</span>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <span>Role Assigned On</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity logs details */}
                  <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-805 dark:text-white uppercase tracking-wider">
                      <FaClock className="text-[#7C3AED]" /> Recent Activity
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">✓</div>
                          <div>
                            <h5 className="text-slate-805 dark:text-white font-black leading-tight">User approved</h5>
                            <p className="text-[9px] text-slate-450 mt-0.5">Approved by Super Admin</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-455 font-mono">{new Date(selectedUser.createdAt).toLocaleDateString()} 10:45 AM</span>
                      </div>

                      <div className="flex justify-between items-center gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">👤</div>
                          <div>
                            <h5 className="text-slate-805 dark:text-white font-black leading-tight">User registered</h5>
                            <p className="text-[9px] text-slate-450 mt-0.5">User registered on the platform</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-455 font-mono">{new Date(selectedUser.createdAt).toLocaleDateString()} 10:20 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Options Actions CTA bottom buttons */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleOpenRoleModal(selectedUser)}
                      className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      ✏️ Edit User
                    </button>
                    
                    <button 
                      onClick={() => handleOpenRoleModal(selectedUser)}
                      className="flex-1 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-blue-500/30 text-blue-600 py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      🔒 Change Role
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteUser(selectedUser._id, selectedUser.name)}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      🗑️ Delete User
                    </button>
                  </div>

                </div>
              )}

              {/* Inactive tab selections */}
              {detailTab !== "overview" && (
                <div className="py-20 text-center text-slate-400 text-xs font-semibold bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 select-none">
                  No records configured in this segment yet. Please check back later.
                </div>
              )}

            </div>

          )}

        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY MODAL C1: Add New User Form */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => {
                setShowAddUserModal(false);
                setNewUserData({ name: "", email: "", password: "", role: "student" });
              }}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaPlus className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black">Add New User</h3>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">User Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satyam Sharma"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@gmail.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">Desired Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="unassigned">Pending (Unassigned)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl text-xs font-black transition cursor-pointer"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL C2: Change Role Assignment Form */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl max-w-md w-full overflow-hidden text-slate-800 dark:text-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" />
            <div className="p-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-black">Assign Role & School</h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{roleModalData.name}</p>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-slate-400 hover:text-slate-655 bg-slate-50 dark:bg-white/5 p-1.5 rounded-xl transition cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveRoleAssignment} className="space-y-5">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    System Role
                  </label>
                  <select
                    value={roleModalData.role}
                    onChange={(e) => setRoleModalData(prev => ({ ...prev, role: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-extrabold text-slate-750 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="unassigned">Pending (Unassigned)</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {roleModalData.role !== "unassigned" && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      list="school-suggestions-detail"
                      placeholder="Enter school name (e.g. G.D. Academy)"
                      value={roleModalData.schoolName}
                      onChange={(e) => setRoleModalData(prev => ({ ...prev, schoolName: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white focus:outline-none"
                    />
                    <datalist id="school-suggestions-detail">
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

    </div>
  );
}

export default SuperAdminUsers;
