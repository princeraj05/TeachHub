import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaSchool,
  FaFileContract,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBan,
  FaMapMarkerAlt,
  FaUserTie,
  FaSpinner,
  FaSync
} from "react-icons/fa";

const defaultSchools = [];

function SuperAdminSchools() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");

  // Instant load state from local cache or pre-loaded defaults
  const [schools, setSchools] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_schools");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s._id !== "s1" && s._id !== "s2" && s._id !== "s3" && s.name !== "Pine Academy" && s.name !== "Lincoln Academy");
        }
      } catch (e) {}
    }
    return [];
  });

  const [syncing, setSyncing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewSchool, setViewSchool] = useState(null);
  const [editSchool, setEditSchool] = useState(null);
  const [deleteSchoolId, setDeleteSchoolId] = useState(null);

  // Form state for adding/editing school
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    address: "",
    plan: "Free Plan (Trial)",
    status: "Active"
  });

  // Background fetch on mount
  useEffect(() => {
    fetchSchoolsDetail();
  }, []);

  const fetchSchoolsDetail = async () => {
    try {
      setSyncing(true);
      const res = await axios.get(`${API}/api/superadmin/schools-detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setSchools(data);
      localStorage.setItem("cached_superadmin_schools", JSON.stringify(data));
    } catch (err) {
      console.log("Error loading live schools");
    } finally {
      setSyncing(false);
    }
  };

  // Instant statistics
  const stats = useMemo(() => {
    const total = schools.length;
    const activeSub = schools.filter((s) => s.status === "Active").length;
    const totalStudents = schools.reduce((sum, s) => sum + (s.stats?.students || 0), 0);
    const totalTeachers = schools.reduce((sum, s) => sum + (s.stats?.teachers || 0), 0);
    return { total, activeSub, totalStudents, totalTeachers };
  }, [schools]);

  // Instant filtering
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const name = s.name || "";
      const address = s.location || s.address || "";
      const email = s.email || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchesPlan = planFilter === "All" || (s.plan || "").toLowerCase().includes(planFilter.toLowerCase());
      const matchesStatus = statusFilter === "All" || (s.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [schools, search, planFilter, statusFilter]);

  // Handle Add School
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSchoolObj = {
      _id: `s-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      location: formData.address || "Main Campus",
      plan: formData.plan,
      status: "Active",
      stats: { admins: 1, teachers: 0, students: 0 }
    };

    const updated = [newSchoolObj, ...schools];
    setSchools(updated);
    localStorage.setItem("cached_superadmin_schools", JSON.stringify(updated));
    setIsAddModalOpen(false);

    try {
      setActionLoading(true);
      await axios.post(
        `${API}/api/superadmin/schools`,
        {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          plan: formData.plan
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("New school created in database!");
      setTimeout(() => setSuccess(""), 4000);
      fetchSchoolsDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit School
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editSchool?._id) return;

    const updated = schools.map((s) =>
      s._id === editSchool._id ? { ...s, name: formData.name, email: formData.email, location: formData.address, plan: formData.plan, status: formData.status } : s
    );
    setSchools(updated);
    localStorage.setItem("cached_superadmin_schools", JSON.stringify(updated));
    setEditSchool(null);

    try {
      setActionLoading(true);
      await axios.put(
        `${API}/api/superadmin/schools/${editSchool._id}`,
        {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          plan: formData.plan,
          status: formData.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("School updated in database!");
      setTimeout(() => setSuccess(""), 4000);
      fetchSchoolsDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete School
  const handleDeleteConfirm = async () => {
    if (!deleteSchoolId) return;

    const targetId = deleteSchoolId;
    const updated = schools.filter((s) => s._id !== targetId);
    setSchools(updated);
    localStorage.setItem("cached_superadmin_schools", JSON.stringify(updated));
    setDeleteSchoolId(null);

    try {
      setActionLoading(true);
      await axios.delete(`${API}/api/superadmin/schools/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("School deleted from database!");
      setTimeout(() => setSuccess(""), 4000);
      fetchSchoolsDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanBadgeStyle = (plan) => {
    if (plan?.includes("Paid") || plan?.includes("Configured")) return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    return "bg-slate-700/60 text-slate-300 border border-slate-600/40";
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Pending":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Suspended":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
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
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Schools Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage registered institutions, subscriptions, and access.</p>
        </div>
        <button
          onClick={fetchSchoolsDetail}
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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Schools</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.total}</h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Instant Ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaSchool />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.activeSub}</h3>
            <span className="text-xs text-emerald-400/80 font-medium mt-1 inline-block">Configured</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
            <FaFileContract />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.totalStudents.toLocaleString()}</h3>
            <span className="text-xs text-amber-400 font-medium mt-1 inline-block">Across schools</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaUserGraduate />
          </div>
        </div>

        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Teachers</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.totalTeachers.toLocaleString()}</h3>
            <span className="text-xs text-purple-400 font-medium mt-1 inline-block">Faculty staff</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
            <FaChalkboardTeacher />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search schools by name, address, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setFormData({ id: "", name: "", email: "", address: "", plan: "Free Plan (Trial)", status: "Active" });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all ml-auto md:ml-0"
          >
            <FaPlus className="text-xs" />
            <span>Add New School</span>
          </button>
        </div>
      </div>

      {/* Table - INSTANT DISPLAY */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#0B0F19]/60 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Address</th>
                <th className="py-4 px-5">Contact Email</th>
                <th className="py-4 px-5 text-center">Students</th>
                <th className="py-4 px-5 text-center">Teachers</th>
                <th className="py-4 px-5">Plan</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <p className="text-base font-medium">No schools found</p>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                          <FaSchool />
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">{school.name}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Student Fee: {school.financials?.studentMonthlyFee ? `₹${school.financials.studentMonthlyFee.toFixed(2)}/mo` : "Not set"} · Recv: ₹{(school.financials?.totalStudentReceived || 0).toFixed(2)} · Paid: ₹{(school.financials?.totalSubscriptionPaid || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FaMapMarkerAlt className="text-slate-500 text-[10px]" />
                        <span>{school.location || "Patna, Bihar"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-300 text-xs">
                      {school.email || "N/A"}
                    </td>

                    <td className="py-3.5 px-5 text-center font-bold text-slate-200">
                      {(school.stats?.students || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-5 text-center font-bold text-slate-200">
                      {(school.stats?.teachers || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPlanBadgeStyle(school.plan)}`}>
                        {school.plan && school.plan !== "yet not set" && school.plan !== "Configured" ? school.plan : (school.configuredPlan || "Free Plan (Trial)")}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(school.status)}`}>
                        <FaCheckCircle className="text-[10px]" />
                        {school.status || "Active"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewSchool(school)}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => {
                            setEditSchool(school);
                            setFormData({
                              id: school._id,
                              name: school.name,
                              email: school.email || "",
                              address: school.location || "",
                              plan: school.plan && school.plan !== "yet not set" ? school.plan : (school.configuredPlan || "Free Plan (Trial)"),
                              status: school.status || "Active"
                            });
                          }}
                          title="Edit School"
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteSchoolId(school._id)}
                          title="Delete School"
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
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredSchools.length} of {schools.length} schools</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Instant Cache & Live Sync
          </span>
        </div>
      </div>

      {/* MODAL 1: Add School */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New School</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier High School"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@school.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Subscription Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Free Plan (Trial)">Free Plan (Trial)</option>
                  <option value="Paid Subscription">Paid Subscription</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-2">
                  {actionLoading && <FaSpinner className="animate-spin" />}
                  <span>Create School</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Details */}
      {viewSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">School Details</h3>
              <button onClick={() => setViewSchool(null)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl font-bold">
                <FaSchool />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{viewSchool.name}</h4>
                <p className="text-xs text-slate-400">{viewSchool.location || "Patna, Bihar"}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getPlanBadgeStyle(viewSchool.plan)}`}>
                  {viewSchool.plan && viewSchool.plan !== "yet not set" ? viewSchool.plan : (viewSchool.configuredPlan || "Free Plan (Trial)")}
                </span>
              </div>
            </div>
            <div className="space-y-3 bg-[#0B0F19] p-4 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Email:</span>
                <span className="text-slate-200 font-medium">{viewSchool.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Admins:</span>
                <span className="text-slate-200 font-bold">{viewSchool.stats?.admins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Teachers:</span>
                <span className="text-slate-200 font-bold">{viewSchool.stats?.teachers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Students:</span>
                <span className="text-slate-200 font-bold">{viewSchool.stats?.students || 0}</span>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-3 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Overview</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Student Monthly Fee Set:</span>
                  <span className="text-purple-400 font-bold">{viewSchool.financials?.studentMonthlyFee ? `₹${viewSchool.financials.studentMonthlyFee.toFixed(2)}` : "Not Configured"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Revenue Received (Students):</span>
                  <span className="text-emerald-400 font-bold">₹{(viewSchool.financials?.totalStudentReceived || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subscription Paid (to Super Admin):</span>
                  <span className="text-blue-400 font-bold">₹{(viewSchool.financials?.totalSubscriptionPaid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Teacher Salary Configured:</span>
                  <span className="text-amber-400 font-bold">₹{(viewSchool.financials?.teacherSalariesTotal || 0).toFixed(2)} ({viewSchool.financials?.teacherSalaryCount || 0} teachers set)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewSchool(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit School */}
      {editSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Edit School</h3>
              <button onClick={() => setEditSchool(null)} className="text-slate-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {editSchool?.hasSubscription || editSchool?.plan?.includes("Paid") || editSchool?.plan?.includes("Configured") ? (
                      <>
                        <option value={editSchool.configuredPlan || editSchool.plan || "Paid Subscription"}>
                          {editSchool.configuredPlan || editSchool.plan || "Paid Subscription"}
                        </option>
                        <option value="Free Plan (Trial)">Free Plan (Trial)</option>
                      </>
                    ) : (
                      <>
                        <option value="Free Plan (Trial)">Free Plan (Trial)</option>
                        <option value={editSchool?.configuredPlan || "Paid Subscription"}>
                          {editSchool?.configuredPlan || "Paid Subscription"}
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditSchool(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500 flex items-center gap-2">
                  {actionLoading && <FaSpinner className="animate-spin" />}
                  <span>Update School</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteSchoolId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-xl">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-lg font-bold text-white">Delete School?</h3>
            <p className="text-xs text-slate-400 mt-2">Are you sure you want to delete this school from database?</p>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteSchoolId(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
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

export default SuperAdminSchools;
