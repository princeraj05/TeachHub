import React, { useState, useMemo } from "react";
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
  FaUserTie
} from "react-icons/fa";

// Initial sample schools list matching design mockup
const initialSchools = [
  {
    id: "1",
    name: "G.D Academy",
    address: "New Delhi, India",
    principal: "Banny Thapar",
    students: 3120,
    teachers: 185,
    plan: "Enterprise",
    status: "Active",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    name: "Pine Academy",
    address: "Mumbai, India",
    principal: "Mr. James Wilson",
    students: 1850,
    teachers: 110,
    plan: "Pro",
    status: "Active",
    logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "3",
    name: "Bright Future High",
    address: "Bengaluru, India",
    principal: "Sarah Johnson",
    students: 2400,
    teachers: 140,
    plan: "Free",
    status: "Pending",
    logo: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "4",
    name: "Maplewood School",
    address: "Chandigarh, India",
    principal: "Michael Lee",
    students: 980,
    teachers: 55,
    plan: "Enterprise",
    status: "Active",
    logo: "https://images.unsplash.com/photo-1568667256549-094345857637?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "5",
    name: "City Arts School",
    address: "Pune, India",
    principal: "Sophie Dubois",
    students: 1210,
    teachers: 70,
    plan: "Pro",
    status: "Suspended",
    logo: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=150&auto=format&fit=crop&q=80"
  }
];

function SuperAdminSchools() {
  const [schools, setSchools] = useState(initialSchools);
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
    name: "",
    address: "",
    principal: "",
    students: 100,
    teachers: 10,
    plan: "Pro",
    status: "Active"
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = schools.length;
    const activeSub = schools.filter((s) => s.status === "Active").length;
    const totalStudents = schools.reduce((sum, s) => sum + Number(s.students || 0), 0);
    const totalTeachers = schools.reduce((sum, s) => sum + Number(s.teachers || 0), 0);
    return { total, activeSub, totalStudents, totalTeachers };
  }, [schools]);

  // Filtered schools list
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase()) ||
        s.principal.toLowerCase().includes(search.toLowerCase());

      const matchesPlan = planFilter === "All" || s.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [schools, search, planFilter, statusFilter]);

  // Handle Add School
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.principal) return;

    const newSchool = {
      id: Date.now().toString(),
      name: formData.name,
      address: formData.address || "Main Campus",
      principal: formData.principal,
      students: Number(formData.students) || 0,
      teachers: Number(formData.teachers) || 0,
      plan: formData.plan,
      status: formData.status,
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80"
    };

    setSchools([newSchool, ...schools]);
    setFormData({ name: "", address: "", principal: "", students: 100, teachers: 10, plan: "Pro", status: "Active" });
    setIsAddModalOpen(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setSchools(schools.map((s) => (s.id === editSchool.id ? { ...s, ...formData } : s)));
    setEditSchool(null);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    setSchools(schools.filter((s) => s.id !== deleteSchoolId));
    setDeleteSchoolId(null);
  };

  // Helper for Plan pill style
  const getPlanBadgeStyle = (plan) => {
    switch (plan) {
      case "Enterprise":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "Pro":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Free":
        return "bg-slate-700/60 text-slate-300 border border-slate-600/40";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  // Helper for Status pill style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Pending":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Suspended":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Schools Management</h1>
        <p className="text-sm text-slate-400 mt-1">Overview of registered institutions, principals, and subscriptions.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Schools */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Schools</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.total}</h3>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">↑ 8.1% active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl">
            <FaSchool />
          </div>
        </div>

        {/* Card 2: Active Subscriptions */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.activeSub}</h3>
            <span className="text-xs text-emerald-400/80 font-medium mt-1 inline-block">↑ 12.5% paid</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
            <FaFileContract />
          </div>
        </div>

        {/* Card 3: Total Students */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.totalStudents.toLocaleString()}</h3>
            <span className="text-xs text-amber-400 font-medium mt-1 inline-block">Across all schools</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
            <FaUserGraduate />
          </div>
        </div>

        {/* Card 4: Total Teachers */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Teachers</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{stats.totalTeachers.toLocaleString()}</h3>
            <span className="text-xs text-purple-400 font-medium mt-1 inline-block">Staff members</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl">
            <FaChalkboardTeacher />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add School */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search schools by name, address, principal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns & Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Plan Filter */}
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-300">
            <FaFilter className="text-xs text-slate-500" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#131B2E]">Filter by Plan: All</option>
              <option value="Enterprise" className="bg-[#131B2E]">Enterprise</option>
              <option value="Pro" className="bg-[#131B2E]">Pro</option>
              <option value="Free" className="bg-[#131B2E]">Free</option>
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
              <option value="Active" className="bg-[#131B2E]">Active</option>
              <option value="Pending" className="bg-[#131B2E]">Pending</option>
              <option value="Suspended" className="bg-[#131B2E]">Suspended</option>
            </select>
          </div>

          {/* Add School Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all ml-auto md:ml-0"
          >
            <FaPlus className="text-xs" />
            <span>Add New School</span>
          </button>
        </div>
      </div>

      {/* Schools Data Table */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#0B0F19]/60 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                <th className="py-4 px-5">School Name</th>
                <th className="py-4 px-5">Address / City</th>
                <th className="py-4 px-5">Principal</th>
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
                    <p className="text-base font-medium">No schools found matching your search</p>
                    <p className="text-xs text-slate-600 mt-1">Try adjusting plan or status filters</p>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* School Profile */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={school.logo}
                          alt={school.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <span className="font-semibold text-white text-sm">{school.name}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-5 text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FaMapMarkerAlt className="text-slate-500 text-[10px]" />
                        <span>{school.address}</span>
                      </div>
                    </td>

                    {/* Principal */}
                    <td className="py-3.5 px-5 text-slate-200 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FaUserTie className="text-blue-400/80 text-xs" />
                        <span>{school.principal}</span>
                      </div>
                    </td>

                    {/* Students Count */}
                    <td className="py-3.5 px-5 text-center font-bold text-slate-200">
                      {school.students.toLocaleString()}
                    </td>

                    {/* Teachers Count */}
                    <td className="py-3.5 px-5 text-center font-bold text-slate-200">
                      {school.teachers.toLocaleString()}
                    </td>

                    {/* Plan Pill */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPlanBadgeStyle(school.plan)}`}>
                        {school.plan}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(school.status)}`}>
                        {school.status === "Active" && <FaCheckCircle className="text-[10px]" />}
                        {school.status === "Pending" && <FaExclamationTriangle className="text-[10px]" />}
                        {school.status === "Suspended" && <FaBan className="text-[10px]" />}
                        {school.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
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
                              name: school.name,
                              address: school.address,
                              principal: school.principal,
                              students: school.students,
                              teachers: school.teachers,
                              plan: school.plan,
                              status: school.status
                            });
                          }}
                          title="Edit School"
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteSchoolId(school.id)}
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

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredSchools.length} of {schools.length} schools</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* MODAL 1: Add School */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New School</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saint Mary's High"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="New Delhi, India"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Principal Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Aisha Khan"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Students</label>
                  <input
                    type="number"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Teachers</label>
                  <input
                    type="number"
                    value={formData.teachers}
                    onChange={(e) => setFormData({ ...formData, teachers: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Free">Free</option>
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
                  Save School
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
              <button onClick={() => setViewSchool(null)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <img src={viewSchool.logo} alt={viewSchool.name} className="w-14 h-14 rounded-2xl object-cover border border-blue-500/40" />
              <div>
                <h4 className="text-base font-bold text-white">{viewSchool.name}</h4>
                <p className="text-xs text-slate-400">{viewSchool.address}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getPlanBadgeStyle(viewSchool.plan)}`}>
                  {viewSchool.plan} Plan
                </span>
              </div>
            </div>
            <div className="space-y-3 bg-[#0B0F19] p-4 rounded-xl text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Principal:</span>
                <span className="text-slate-200 font-medium">{viewSchool.principal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Students:</span>
                <span className="text-slate-200 font-bold">{viewSchool.students.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Teachers:</span>
                <span className="text-slate-200 font-bold">{viewSchool.teachers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-semibold ${viewSchool.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                  {viewSchool.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewSchool(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
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
              <button onClick={() => setEditSchool(null)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Principal Name</label>
                <input
                  type="text"
                  required
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
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
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Free">Free</option>
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
                <button
                  type="button"
                  onClick={() => setEditSchool(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500"
                >
                  Update School
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
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to remove this school? This will remove associated records.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteSchoolId(null)}
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

export default SuperAdminSchools;
