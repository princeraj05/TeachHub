import { useEffect, useState } from "react";
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
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";

function SuperAdminDashboard() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  // Modal states
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

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

  const handleOpenAssignModal = (user) => {
    setEditUser(user);
    setNewRole(user.role);
    setNewSchool(user.schoolName || "");
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
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
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign role");
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const nonSuperAdminUsers = users.filter((u) => u.role !== "superadmin");
  const totalUsers = nonSuperAdminUsers.length;
  const pendingCount = nonSuperAdminUsers.filter((u) => u.role === "unassigned").length;
  const adminCount = nonSuperAdminUsers.filter((u) => u.role === "admin").length;
  const teacherCount = nonSuperAdminUsers.filter((u) => u.role === "teacher").length;
  const studentCount = nonSuperAdminUsers.filter((u) => u.role === "student").length;
  const uniqueSchoolsCount = schools.length;

  const filteredUsers = nonSuperAdminUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="font-sans">
      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 mb-6 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Users", count: totalUsers, icon: <FaUsers />, color: "from-blue-500 to-sky-400" },
          { label: "Pending Users", count: pendingCount, icon: <FaHourglassHalf />, color: "from-amber-500 to-orange-400" },
          { label: "Total Schools", count: uniqueSchoolsCount, icon: <FaSchool />, color: "from-purple-500 to-indigo-400" },
          { label: "Admins", count: adminCount, icon: <FaUserShield />, color: "from-emerald-500 to-teal-400" },
          { label: "Teachers", count: teacherCount, icon: <FaChalkboardTeacher />, color: "from-indigo-500 to-violet-400" },
          { label: "Students", count: studentCount, icon: <FaUserGraduate />, color: "from-cyan-500 to-teal-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] shadow-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter by:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] cursor-pointer"
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">User Directory</h2>
          <span className="text-xs font-bold bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1.5 rounded-full">
            Showing {filteredUsers.length} of {totalUsers} users
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold text-sm">Loading users...</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 select-none">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Role</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned School</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <FaUsers className="text-slate-200 text-5xl mx-auto mb-4" />
                      <p className="text-slate-500 text-sm font-bold">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{u.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          u.role === "superadmin"
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : u.role === "admin"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : u.role === "teacher"
                            ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                            : u.role === "student"
                            ? "bg-cyan-50 border-cyan-100 text-cyan-700"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          {u.role === "unassigned" ? "Pending Approval" : u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-700 font-bold">
                          {u.schoolName || <span className="text-slate-400 font-medium italic">Not Assigned</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.role === "superadmin" ? (
                          <span className="text-xs text-slate-400 font-medium italic">ReadOnly</span>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(u)}
                            className="bg-slate-100 hover:bg-[#7C3AED] hover:text-white p-2 rounded-xl text-slate-500 transition duration-150 inline-flex items-center justify-center cursor-pointer"
                          >
                            <FaEdit className="text-xs" />
                          </button>
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

      {/* Assignment Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" />
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Assign Role & School</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{editUser.name}</p>
                </div>
                <button
                  onClick={() => setEditUser(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-xl transition"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveAssignment} className="space-y-5">
                {/* Select Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="unassigned">Pending (Unassigned)</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {/* Select School */}
                {newRole !== "unassigned" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      list="school-suggestions"
                      placeholder="Enter school name (e.g. G.D. Academy)"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#7C3AED]/15 transition-all cursor-pointer disabled:opacity-60"
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

export default SuperAdminDashboard;
