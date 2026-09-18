import { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaSearch, 
  FaSchool, 
  FaEnvelope, 
  FaPhone, 
  FaTicketAlt, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEllipsisV, 
  FaEdit, 
  FaComments, 
  FaPhoneAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaSpinner
} from "react-icons/fa";
import { getSupportUsersList } from "../../../services/supportTicketApi";

export default function SupportUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    schoolAdmins: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSupportUsersList({
        page,
        limit: 10,
        role: roleFilter,
        status: statusFilter,
        search
      });

      if (data) {
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, students: 0, teachers: 0, schoolAdmins: 0 });
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        if (data.users && data.users.length > 0) {
          if (!selectedUserId || !data.users.find(u => u.id === selectedUserId)) {
            setSelectedUserId(data.users[0].id);
          }
        } else {
          setSelectedUserId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load users list:", err);
      setError("Failed to load users from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, roleFilter, statusFilter, search]);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0] || null;

  const totalUsersNum = stats.totalUsers || 1;
  const studentPct = Math.round(((stats.students || 0) / totalUsersNum) * 100);
  const teacherPct = Math.round(((stats.teachers || 0) / totalUsersNum) * 100);
  const adminPct = Math.round(((stats.schoolAdmins || 0) / totalUsersNum) * 100);

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Users</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search and view all students, teachers and school admins across all schools.
          </p>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">All Users</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Total System Users</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <FaUserGraduate className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Students</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.students.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">{studentPct}%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <FaChalkboardTeacher className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Teachers</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.teachers.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">{teacherPct}%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <FaUserShield className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">School Admins</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.schoolAdmins.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">{adminPct}%</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Users Table (Col 8) & Selected User Details Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* USERS TABLE AREA (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="text-xs" />
              </div>
              <input 
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, phone, school..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <select 
                value={roleFilter} 
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="schooladmin">School Admin</option>
                <option value="support">Support Agent</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 w-10">
                      <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                    </th>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">School</th>
                    <th className="p-3.5">Email / Phone</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined On</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FaSpinner className="animate-spin text-purple-500 text-xl" />
                          <span>Loading users data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-rose-400 font-semibold">
                        {error}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-slate-400">
                        No users matching the filters found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr 
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`cursor-pointer transition ${
                          selectedUserId === u.id 
                            ? "bg-purple-600/10 dark:bg-purple-600/15" 
                            : "hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <td className="p-3.5">
                          <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                        </td>
                        <td className="p-3.5 font-bold text-slate-500">{(page - 1) * 10 + idx + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${u.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                              {(u.name || "U").substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white leading-tight">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{u.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "Student" ? "bg-purple-500/10 text-purple-400" :
                            u.role === "Teacher" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs">{u.school}</div>
                            <div className="text-[10px] text-slate-400">{u.schoolLocation}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300 text-xs">{u.email}</div>
                            <div className="text-[10px] text-slate-400">{u.phone}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">{u.joinedOn}</td>
                        <td className="p-3.5 text-center">
                          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                            <FaEllipsisV className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {users.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-xl">{page}</span>
                <span className="text-slate-400 font-medium">/ {totalPages}</span>
                <button 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE DETAILS SIDEBAR FOR SELECTED USER (Col 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          
          {selectedUser ? (
            <>
              {/* Header Profile Box */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full ${selectedUser.avatarBg} text-white font-bold text-lg flex items-center justify-center shadow-md`}>
                    {(selectedUser.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{selectedUser.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-semibold">{selectedUser.role} {selectedUser.class !== "N/A" ? `• Class ${selectedUser.class}` : ""}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-400 font-medium mt-0.5">🏢 {selectedUser.school}</div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white p-1">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Details Sub-Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "overview" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab("school")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "school" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  School Info
                </button>
                <button 
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "history" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Support History
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4 text-xs">
                  
                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">Basic Information</h4>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Full Name</span>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedUser.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Role</span>
                        <span className="font-semibold">{selectedUser.role}</span>
                      </div>
                      {selectedUser.class !== "N/A" && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Class</span>
                          <span className="font-semibold">{selectedUser.class}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email</span>
                        <span className="font-semibold text-purple-400">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone</span>
                        <span className="font-semibold">{selectedUser.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Joined On</span>
                        <span>{selectedUser.joinedOn}</span>
                      </div>
                    </div>
                  </div>

                  {/* School Information */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] mb-2">School Information</h4>
                    <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                            <FaSchool />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs">{selectedUser.school}</div>
                            <div className="text-[10px] text-slate-400">{selectedUser.schoolLocation}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Support History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">Recent Support History</h4>
                    </div>
                    <div className="space-y-1.5">
                      {selectedUser.tickets && selectedUser.tickets.length > 0 ? selectedUser.tickets.map((t) => (
                        <div key={t.id} className="p-2 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-purple-400 font-mono text-[11px]">{t.id}</div>
                            <div className="text-[10px] text-slate-400">{t.title}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.color}`}>{t.status}</span>
                        </div>
                      )) : (
                        <div className="text-slate-400 text-center py-2 text-[11px]">No previous support tickets</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: SCHOOL INFO */}
              {activeTab === "school" && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">School Name</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedUser.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location</span>
                      <span>{selectedUser.schoolLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact</span>
                      <span>{selectedUser.schoolContact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUPPORT HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-2 text-xs">
                  {selectedUser.tickets && selectedUser.tickets.length > 0 ? selectedUser.tickets.map((t) => (
                    <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-purple-400">{t.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.color}`}>{t.status}</span>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-white">{t.title}</div>
                      <div className="text-[10px] text-slate-400">{t.date}</div>
                    </div>
                  )) : (
                    <div className="text-slate-400 text-center py-4 text-xs">No support history recorded</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a user from the table to view details.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
