import React, { useState, useMemo } from "react";
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
  FaUser
} from "react-icons/fa";

// Initial sample users list
const initialUsers = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex.t@example.com",
    role: "SuperAdmin",
    school: "Oakwood High",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    name: "Adna Thompson",
    email: "admin@example.com",
    role: "Admin",
    school: "Lincoln Academy",
    status: "Pending",
    avatar: ""
  },
  {
    id: "3",
    name: "Maya Smith",
    email: "adns.t@example.com",
    role: "Teacher",
    school: "Oakwood High",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "4",
    name: "Amna Smith",
    email: "alex.t2@example.com",
    role: "Teacher",
    school: "Oakwood High",
    status: "Pending",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "5",
    name: "Maria Burson",
    email: "maria.t@example.com",
    role: "Student",
    school: "Oakwood High",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "6",
    name: "Maria Turson",
    email: "maris@example.com",
    role: "Student",
    school: "Lincoln Academy",
    status: "Approved",
    avatar: ""
  },
  {
    id: "7",
    name: "Jania Burson",
    email: "jania.t@example.com",
    role: "Student",
    school: "Lincoln Academy",
    status: "Approved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "8",
    name: "Alex Turson",
    email: "alext@example.com",
    role: "Student",
    school: "Lincoln Academy",
    status: "Pending",
    avatar: ""
  }
];

function SuperAdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Form state for adding/editing user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    school: "Oakwood High",
    status: "Approved"
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.length;
    const pending = users.filter((u) => u.status === "Pending").length;
    const admins = users.filter((u) => u.role === "Admin" || u.role === "SuperAdmin").length;
    const teachers = users.filter((u) => u.role === "Teacher").length;
    return { total, pending, admins, teachers };
  }, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.school.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === "All" || u.role.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === "All" || u.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Handle Add User
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      school: formData.school,
      status: formData.status,
      avatar: ""
    };

    setUsers([newUser, ...users]);
    setFormData({ name: "", email: "", role: "Student", school: "Oakwood High", status: "Approved" });
    setIsAddModalOpen(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map((u) => (u.id === editUser.id ? { ...u, ...formData } : u)));
    setEditUser(null);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    setUsers(users.filter((u) => u.id !== deleteUserId));
    setDeleteUserId(null);
  };

  // Helper function for Role badge styling
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Admin":
        return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
      case "Teacher":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "Student":
        return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  // Helper function for Status badge styling
  const getStatusBadgeStyle = (status) => {
    return status === "Approved"
      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
      : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  };

  // Helper for Initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Users Management</h1>
        <p className="text-sm text-slate-400 mt-1">Manage platform users, assigned roles, and access approvals.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Users */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.total}</h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">↑ 8.4% growth</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaUsers />
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pending}</h3>
            <span className="text-xs text-amber-400/80 font-medium mt-1 inline-block">Requires review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaUserClock />
          </div>
        </div>

        {/* Card 3: Active Admins */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Admins</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.admins}</h3>
            <span className="text-xs text-cyan-400 font-medium mt-1 inline-block">System owners</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
            <FaUserShield />
          </div>
        </div>

        {/* Card 4: Teachers */}
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

      {/* Control Bar: Search, Filters & Add User */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
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

        {/* Filter Dropdowns & Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300">
            <FaFilter className="text-xs text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#131B2E]">Filter by Role: All</option>
              <option value="SuperAdmin" className="bg-[#131B2E]">SuperAdmin</option>
              <option value="Admin" className="bg-[#131B2E]">Admin</option>
              <option value="Teacher" className="bg-[#131B2E]">Teacher</option>
              <option value="Student" className="bg-[#131B2E]">Student</option>
            </select>
          </div>

          {/* Status Filter */}
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

          {/* Add User Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all ml-auto md:ml-0"
          >
            <FaPlus className="text-xs" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Data Table */}
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
                    <p className="text-base font-medium">No users found matching your criteria</p>
                    <p className="text-xs text-slate-600 mt-1">Try clearing filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* School Name */}
                    <td className="py-3.5 px-5 text-slate-300 font-medium">
                      {user.school || "N/A"}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(user.status)}`}>
                        {user.status === "Approved" ? (
                          <FaCheckCircle className="text-[10px]" />
                        ) : (
                          <FaExclamationCircle className="text-[10px]" />
                        )}
                        {user.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
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
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              school: user.school,
                              status: user.status
                            });
                          }}
                          title="Edit User"
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          title="Delete User"
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* MODAL 1: Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School</label>
                <input
                  type="text"
                  placeholder="Oakwood High"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View User Details */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">User Details</h3>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              {viewUser.avatar ? (
                <img src={viewUser.avatar} alt={viewUser.name} className="w-14 h-14 rounded-full object-cover border border-blue-500/50" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-400">
                  {getInitials(viewUser.name)}
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-white">{viewUser.name}</h4>
                <p className="text-xs text-slate-400">{viewUser.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeStyle(viewUser.role)}`}>
                  {viewUser.role}
                </span>
              </div>
            </div>
            <div className="space-y-3 bg-[#0B0F19] p-4 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">School:</span>
                <span className="text-slate-200 font-medium">{viewUser.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Status:</span>
                <span className={`font-semibold ${viewUser.status === "Approved" ? "text-emerald-400" : "text-amber-400"}`}>
                  {viewUser.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="text-slate-400 font-mono text-xs">{viewUser.id}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit User */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-xl">
              <FaExclamationCircle />
            </div>
            <h3 className="text-lg font-bold text-white">Delete User?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to remove this user? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminUsers;
