import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaSchool,
  FaCheckCircle,
  FaCreditCard,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaMapMarkerAlt,
  FaPlus,
  FaRedo,
  FaTimesCircle,
  FaExclamationTriangle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function DonutChart({ value, total, color, label }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 select-none shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="8"
        />
        {/* Fill arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-base font-black leading-none">{value}</span>
        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{label}</span>
      </div>
    </div>
  );
}

function SuperAdminSchools() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Schools list states
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Modals / Adding states
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({ name: "", email: "", address: "", plan: "yet not set" });
  const [editSchool, setEditSchool] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirmSchool, setDeleteConfirmSchool] = useState(null);

  useEffect(() => {
    fetchSchoolsDetail();
  }, []);

  const fetchSchoolsDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/superadmin/schools-detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchools(res.data);
    } catch (err) {
      console.error("Error fetching schools detail:", err);
      setError(err.response?.data?.message || "Failed to fetch schools detail");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchoolSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(
        `${API}/api/superadmin/schools`,
        {
          name: newSchoolData.name,
          email: newSchoolData.email,
          address: newSchoolData.address,
          plan: newSchoolData.plan
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("New School added successfully!");
      setShowAddSchoolModal(false);
      setNewSchoolData({ name: "", email: "", address: "", plan: "yet not set" });
      fetchSchoolsDetail();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create school");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchoolSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.put(
        `${API}/api/superadmin/schools/${editSchool._id}`,
        {
          name: newSchoolData.name,
          email: newSchoolData.email,
          address: newSchoolData.address,
          plan: newSchoolData.plan
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("School details updated successfully!");
      setEditSchool(null);
      setNewSchoolData({ name: "", email: "", address: "", plan: "yet not set" });
      fetchSchoolsDetail();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update school details");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchool = (schoolId, schoolName) => {
    setDeleteConfirmSchool({ _id: schoolId, name: schoolName });
  };

  const executeDeleteSchool = async () => {
    if (!deleteConfirmSchool) return;
    setSaving(true);
    setError("");
    try {
      await axios.delete(`${API}/api/superadmin/schools/${deleteConfirmSchool._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Deleted ${deleteConfirmSchool.name} successfully!`);
      setDeleteConfirmSchool(null);
      fetchSchoolsDetail();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete school");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Stats summaries
  const totalSchoolsCount = schools.length;
  const activeSchoolsCount = schools.filter(s => s.status === "Active").length;
  const onPaidPlanCount = schools.filter(s => s.plan === "Pro Plan" || s.plan === "Basic Plan").length;

  const totalAdmins = useMemo(() => schools.reduce((sum, s) => sum + (s.stats?.admins || 0), 0), [schools]);
  const totalTeachers = useMemo(() => schools.reduce((sum, s) => sum + (s.stats?.teachers || 0), 0), [schools]);
  const totalStudents = useMemo(() => schools.reduce((sum, s) => sum + (s.stats?.students || 0), 0), [schools]);

  // Filters logic
  const filteredSchools = useMemo(() => {
    return schools
      .filter(s => {
        const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || s.status === statusFilter;
        const matchesPlan = planFilter === "All" || s.plan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
      });
  }, [schools, search, statusFilter, planFilter]);

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-800 dark:text-white">
      
      {/* Success banner notifications */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error banner notifications */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 text-rose-700 dark:text-rose-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaTimesCircle className="text-rose-500 text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header section titles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <FaSchool className="text-[#7C3AED]" /> Schools Management
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">
            Manage all schools, their admins, subscriptions & activity.
          </p>
        </div>

        <button
          onClick={() => setShowAddSchoolModal(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 px-5 rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <FaPlus /> Add New School
        </button>
      </div>

      {/* KPI Stats Cards Grid (6 items) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 select-none">
        
        {/* Total Schools */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Schools</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center">
              <FaSchool className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{totalSchoolsCount}</p>
          <span className="block text-[9px] font-bold text-slate-450 mt-2">All registered schools</span>
        </div>

        {/* Active Schools */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schools</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FaCheckCircle className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{activeSchoolsCount}</p>
          <span className="block text-[9px] font-black text-green-555 mt-2">100% Active</span>
        </div>

        {/* On Paid Plan */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On Paid Plan</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FaCreditCard className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{onPaidPlanCount}</p>
          <span className="block text-[9px] font-black text-amber-500 mt-2">100% Paid</span>
        </div>

        {/* Total Admins */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Admins</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FaUserShield className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{totalAdmins}</p>
          <span className="block text-[9px] font-bold text-slate-450 mt-2">Across all schools</span>
        </div>

        {/* Total Teachers */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Teachers</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-550 flex items-center justify-center">
              <FaChalkboardTeacher className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{totalTeachers}</p>
          <span className="block text-[9px] font-bold text-slate-450 mt-2">Across all schools</span>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</span>
            <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center">
              <FaUserGraduate className="text-sm" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black leading-none">{totalStudents}</p>
          <span className="block text-[9px] font-bold text-slate-450 mt-2">Across all schools</span>
        </div>

      </div>

      {/* Filters Segment */}
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search schools by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-805 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        </div>

        {/* Filter Plan */}
        <div className="relative">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Plans</option>
            <option value="Pro Plan">Pro Plan</option>
            <option value="Basic Plan">Basic Plan</option>
            <option value="Free Plan">Free Plan</option>
          </select>
          <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        </div>

      </div>

      {/* Schools Directory Table */}
      <div className="bg-white dark:bg-[#0B132A] rounded-2.5xl border border-slate-200/60 dark:border-white/[0.08] shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold text-xs">Loading schools...</p>
            </div>
          ) : (
            <table className="min-w-full text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/[0.04] text-slate-450 dark:text-slate-400">
                  <th className="px-6 py-4 text-left uppercase tracking-wider">School Info</th>
                  <th className="px-6 py-4 text-left uppercase tracking-wider">Plan & Status</th>
                  <th className="px-6 py-4 text-left uppercase tracking-wider">Users</th>
                  <th className="px-6 py-4 text-left uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-4 text-center uppercase tracking-wider w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-slate-700 dark:text-slate-300">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <FaSchool className="text-slate-200 dark:text-slate-800 text-5xl mx-auto mb-4" />
                      <p className="text-slate-500 text-xs font-bold">No schools found in the directory</p>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      
                      {/* School Name, Email, Address */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                            <FaSchool className="text-sm" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-850 dark:text-white leading-tight">{school.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{school.email}</p>
                            <p className="text-[9px] text-slate-450 font-extrabold flex items-center gap-1 mt-1 text-purple-650 dark:text-purple-400">
                              <FaMapMarkerAlt className="text-[8px]" /> {school.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Status */}
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${school.plan === "yet not set" ? "border-slate-500/20 bg-slate-500/10 text-slate-500" : "border-green-500/20 bg-green-500/10 text-green-600"}`}>
                            {school.plan === "yet not set" ? "yet not set" : school.plan}
                          </span>
                          <p className="text-[9px] text-green-555 font-black mt-2 flex items-center gap-1 leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                          </p>
                        </div>
                      </td>

                      {/* Users Count breakdown */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-[9px] font-bold text-slate-450 dark:text-slate-400">
                          <p className="flex items-center gap-1.5 font-extrabold text-purple-500">
                            👤 {school.stats?.admins || 1} Admin
                          </p>
                          <p className="flex items-center gap-1.5 font-extrabold text-blue-500">
                            🖥️ {school.stats?.teachers || 1} Teachers
                          </p>
                          <p className="flex items-center gap-1.5 font-extrabold text-emerald-500">
                            🎓 {school.stats?.students || 1} Students
                          </p>
                        </div>
                      </td>

                      {/* Subscription price details */}
                      <td className="px-6 py-4">
                        {school.plan === "yet not set" ? (
                          <span className="text-xs font-bold text-slate-400">yet not set</span>
                        ) : (
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">{school.price}</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">
                              Valid till <span className="text-green-555 font-extrabold">{school.validTill}</span>
                            </p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border border-green-500/25 text-green-600 bg-green-500/5 mt-2">
                              <FaRedo className="text-[7px]" /> Auto Renew
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1.5 max-w-[120px] mx-auto select-none">
                          <button
                            onClick={() => alert(`Showing school records for ${school.name}`)}
                            className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-blue-500/20 text-blue-600 text-[10px] font-black py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FaEye className="text-[9px]" /> View Details
                          </button>
                          <button
                            onClick={() => {
                              setEditSchool(school);
                              setNewSchoolData({ name: school.name, email: school.email, address: school.location, plan: school.plan });
                            }}
                            className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-blue-500/20 text-blue-650 text-[10px] font-black py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FaEdit className="text-[9px]" /> Edit School
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(school._id, school.name)}
                            className="w-full bg-transparent hover:bg-rose-50 dark:hover:bg-white/5 border border-rose-500/20 text-rose-600 text-[10px] font-black py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FaTrash className="text-[9px]" /> Delete School
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black text-slate-455 dark:text-slate-400">
          <span>Showing 1 to {filteredSchools.length} of {filteredSchools.length} schools</span>
          
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

      {/* Bottom Donut Charts row (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        
        {/* Chart 1: Subscription Overview */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-4 flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Subscription Overview</span>
            
            <div className="space-y-2.5 text-[11px] font-bold">
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-green-500" /> Active Schools</span>
                <span className="font-extrabold">{activeSchoolsCount} (100%)</span>
              </div>
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-red-500" /> Expired Schools</span>
                <span className="font-extrabold">0 (0%)</span>
              </div>
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Trial Schools</span>
                <span className="font-extrabold">0 (0%)</span>
              </div>
            </div>
          </div>

          <DonutChart value={activeSchoolsCount} total={totalSchoolsCount} color="#10B981" label="Total Schools" />
        </div>

        {/* Chart 2: Plan Distribution */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-4 flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Plan Distribution</span>
            
            <div className="space-y-2.5 text-[11px] font-bold">
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-purple-500" /> Pro Plan</span>
                <span className="font-extrabold">{onPaidPlanCount} (100%)</span>
              </div>
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-blue-500" /> Basic Plan</span>
                <span className="font-extrabold">0 (0%)</span>
              </div>
              <div className="flex justify-between items-center gap-6">
                <span className="flex items-center gap-2 text-slate-655"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Free Plan</span>
                <span className="font-extrabold">0 (0%)</span>
              </div>
            </div>
          </div>

          <DonutChart value={onPaidPlanCount} total={totalSchoolsCount} color="#8B5CF6" label="Schools" />
        </div>

      </div>

      {/* OVERLAY MODAL: Add New School Form */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => {
                setShowAddSchoolModal(false);
                setNewSchoolData({ name: "", email: "", address: "", plan: "yet not set" });
              }}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaPlus className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black">Add New School</h3>
            </div>

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prince School"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@school.com"
                  value={newSchoolData.email}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patna, Bihar"
                  value={newSchoolData.address}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Subscription Plan</label>
                <select
                  value={newSchoolData.plan}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                >
                  <option value="yet not set">Yet not set</option>
                  <option value="Free Plan">Free Plan (Trial)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl text-xs font-black transition cursor-pointer"
              >
                Register School
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: Edit School Details Form */}
      {editSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setEditSchool(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaEdit className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black">Edit School Information</h3>
            </div>

            <form onSubmit={handleUpdateSchoolSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">School Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prince School"
                  value={newSchoolData.name}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@school.com"
                  value={newSchoolData.email}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Location Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patna, Bihar"
                  value={newSchoolData.address}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5">Subscription Plan</label>
                <select
                  value={newSchoolData.plan}
                  onChange={(e) => setNewSchoolData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-4 py-3 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-705 dark:text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                >
                  <option value="yet not set">Yet not set</option>
                  <option value="Free Plan">Free Plan (Trial)</option>
                  {["Pro Plan", "Basic Plan"].includes(newSchoolData.plan) && (
                    <option value={newSchoolData.plan}>{newSchoolData.plan}</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl text-xs font-black transition cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: Delete School Confirmation */}
      {deleteConfirmSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => setDeleteConfirmSchool(null)}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaTrash className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-600">Delete School</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Are you sure you want to delete <span className="font-extrabold text-slate-800 dark:text-white">{deleteConfirmSchool.name}</span>?
                This action is permanent and will cascade delete all student, teacher, and class records associated with this school.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSchool(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteSchool}
                  disabled={saving}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Deleting..." : "Delete School"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminSchools;
