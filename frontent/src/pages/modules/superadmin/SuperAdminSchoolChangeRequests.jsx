import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSchool,
  FaUser,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaEnvelope,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaEye
} from "react-icons/fa";
import API_URL from "../../../config/api";

const SORA = "'Sora', sans-serif";

function SuperAdminSchoolChangeRequests() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All"); // All, Student, Teacher
  const [statusFilter, setStatusFilter] = useState("All"); // All, Pending, Completed, Rejected
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [roleFilter, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== "All") params.role = roleFilter.toLowerCase();
      if (statusFilter !== "All") params.status = statusFilter.toLowerCase();
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get(`${API}/api/superadmin/school-change-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching school change requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleAction = async (action) => {
    if (!selectedRequest) return;
    const confirmText = action === "approve"
      ? `Are you sure you want to approve the school release for ${selectedRequest.userName}? They will be released from ${selectedRequest.currentSchoolName} and can then select another school from Directory.`
      : `Are you sure you want to reject the school change request for ${selectedRequest.userName}?`;

    if (!window.confirm(confirmText)) return;

    try {
      setProcessing(true);
      const res = await axios.post(
        `${API}/api/superadmin/school-change-requests/${selectedRequest._id}/action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data?.message || `Request ${action}d successfully`);
      setShowDetailModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error(`Error performing ${action} action:`, err);
      alert(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <FaClock className="text-xs" /> Pending Review
          </span>
        );
      case "completed":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FaCheckCircle className="text-xs" /> Approved & Released
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <FaTimesCircle className="text-xs" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.userName?.toLowerCase().includes(q) ||
      req.userEmail?.toLowerCase().includes(q) ||
      req.currentSchoolName?.toLowerCase().includes(q) ||
      req.requestedSchoolName?.toLowerCase().includes(q) ||
      req.reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-6xl mx-auto space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center">
              <FaExchangeAlt className="text-sm" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8]">Super Admin Control</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            School Change Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Manage student & teacher requests to leave their current school and unlock new school selection.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-700 dark:text-purple-300 text-xs font-bold">
            Total Requests: <span className="font-black text-sm">{filteredRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 p-4 sm:p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Role Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-2xl shrink-0">
            {["All", "Student", "Teacher"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  roleFilter === role
                    ? "bg-white dark:bg-[#151D36] text-[#7C3AED] dark:text-[#38BDF8] shadow-sm border border-slate-200/60 dark:border-white/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {role === "Student" && <FaGraduationCap className="text-xs" />}
                {role === "Teacher" && <FaChalkboardTeacher className="text-xs" />}
                <span>{role === "All" ? "All Roles" : `${role}s`}</span>
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by user, email, or school name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#151D36] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50 dark:bg-[#151D36] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Approved & Released</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">Loading school change requests...</p>
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              {/* Card Header: User Info & Role Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center shrink-0 border border-purple-500/20">
                    {req.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">{req.userName}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                      <FaEnvelope className="text-[10px]" /> {req.userEmail}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                    req.userRole === "teacher"
                      ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                      : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                  }`}>
                    {req.userRole === "teacher" ? "Teacher" : "Student"}
                  </span>
                </div>
              </div>

              {/* Schools Transfer Row */}
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Current School</p>
                  <p className="font-black text-slate-800 dark:text-slate-200 truncate mt-0.5 flex items-center gap-1">
                    <FaSchool className="text-rose-500 text-[10px] shrink-0" />
                    <span className="truncate">{req.currentSchoolName}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Requested School</p>
                  <p className="font-black text-[#7C3AED] dark:text-[#38BDF8] truncate mt-0.5 flex items-center gap-1">
                    <FaSchool className="text-emerald-500 text-[10px] shrink-0" />
                    <span className="truncate">{req.requestedSchoolName}</span>
                  </p>
                </div>
              </div>

              {/* Reason Snippet */}
              {req.reason && (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50/50 dark:bg-white/[0.01] p-2.5 rounded-xl border border-slate-150 dark:border-white/5 italic">
                  "{req.reason}"
                </div>
              )}

              {/* Card Bottom: Status & Action Button */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                <div>{getStatusBadge(req.status)}</div>

                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setShowDetailModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#7C3AED] dark:text-[#38BDF8] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FaEye className="text-xs" /> View & Process
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6">
          <FaExchangeAlt className="text-slate-300 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">No School Change Requests Found</h3>
          <p className="text-xs text-slate-400 mt-1">There are currently no requests matching your filters.</p>
        </div>
      )}

      {/* Detail View & Action Modal */}
      {showDetailModal && selectedRequest && (
        <div style={{ fontFamily: SORA }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          />

          <div className="bg-white dark:bg-[#0B132A] rounded-3xl border border-slate-200/80 dark:border-white/10 w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl transition-all duration-200 text-left space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8]">Request #{selectedRequest._id.slice(-6).toUpperCase()}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">School Change Request Details</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Applicant Information */}
            <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">User Information</h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedRequest.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address</span>
                  <span className="text-slate-900 dark:text-white font-bold truncate block">{selectedRequest.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Role</span>
                  <span className="capitalize text-purple-600 dark:text-purple-400 font-bold">{selectedRequest.userRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Submitted Date</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* School Transfer Information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">Current School</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedRequest.currentSchoolName}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Active Association</span>
              </div>
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Requested New School</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedRequest.requestedSchoolName}</p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Target Center</span>
              </div>
            </div>

            {/* Reason Submitted */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Reason for Leaving</span>
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedRequest.reason || "No reason provided by applicant."}
              </div>
            </div>

            {/* Status Info Banner */}
            <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
              <div>{getStatusBadge(selectedRequest.status)}</div>
            </div>

            {/* Action Buttons (Only for Pending requests) */}
            {selectedRequest.status === "pending" ? (
              <div className="space-y-2 pt-2">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-2xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <FaCheck className="text-xs" />
                    <span>Approve School Change</span>
                  </button>

                  <button
                    onClick={() => handleAction("reject")}
                    disabled={processing}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl text-xs font-extrabold transition shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <FaTimes className="text-xs" />
                    <span>Reject Request</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-medium italic">
                  * Approving will release the user from {selectedRequest.currentSchoolName} while preserving their role ({selectedRequest.userRole}). They can then select and join another school.
                </p>
              </div>
            ) : (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-white/10"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminSchoolChangeRequests;
