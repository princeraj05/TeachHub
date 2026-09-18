import { useState, useEffect } from "react";
import { 
  FaSchool, 
  FaSearch, 
  FaPlus, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEllipsisV, 
  FaEdit, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaEnvelope, 
  FaPhoneAlt,
  FaCheckCircle,
  FaFileAlt,
  FaSpinner
} from "react-icons/fa";
import { getSupportSchoolsList } from "../../../services/supportTicketApi";

export default function SupportSchools() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({
    totalSchools: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    totalTeachers: 0,
    totalStudents: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSupportSchoolsList({
        page,
        limit: 10,
        status: statusFilter,
        search
      });

      if (data) {
        setSchools(data.schools || []);
        setStats(data.stats || {
          totalSchools: 0,
          activeSchools: 0,
          inactiveSchools: 0,
          totalTeachers: 0,
          totalStudents: 0
        });
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        if (data.schools && data.schools.length > 0) {
          if (!selectedSchoolId || !data.schools.find(s => s.id === selectedSchoolId)) {
            setSelectedSchoolId(data.schools[0].id);
          }
        } else {
          setSelectedSchoolId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load schools list:", err);
      setError("Failed to load schools from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchools();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, statusFilter, search]);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || schools[0] || null;

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Schools</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all registered schools on TeachHub and their details.
          </p>
        </div>
      </div>

      {/* 5 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaSchool />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.totalSchools.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Total Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaCheckCircle />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.activeSchools.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Active Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaSchool />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.inactiveSchools.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Inactive Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaChalkboardTeacher />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.totalTeachers.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Total Teachers</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaUsers />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.totalStudents.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Total Students</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Schools Table (Col 8) & Selected School Details Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SCHOOLS TABLE AREA (Col 8) */}
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
                placeholder="Search by school name, admin name, location..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
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
                    <th className="p-3.5">School</th>
                    <th className="p-3.5">Admin</th>
                    <th className="p-3.5">Teachers</th>
                    <th className="p-3.5">Students</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Support History</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FaSpinner className="animate-spin text-purple-500 text-xl" />
                          <span>Loading schools data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="text-center py-8 text-rose-400 font-semibold">
                        {error}
                      </td>
                    </tr>
                  ) : schools.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-12 text-slate-400">
                        No schools matching the filters found.
                      </td>
                    </tr>
                  ) : (
                    schools.map((s, idx) => (
                      <tr 
                        key={s.id}
                        onClick={() => setSelectedSchoolId(s.id)}
                        className={`cursor-pointer transition ${
                          selectedSchoolId === s.id 
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
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                              <FaSchool />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white text-xs">{s.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{s.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs">{s.adminName}</div>
                            <div className="text-[10px] text-slate-400">{s.adminEmail}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-white">{s.teachers}</td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-white">{s.students}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.location}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-purple-400 font-semibold">{s.ticketsCount} tickets</td>
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
                Showing {schools.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalCount)} of {totalCount} schools
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

        {/* RIGHT SIDE DETAILS SIDEBAR FOR SELECTED SCHOOL (Col 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          
          {selectedSchool ? (
            <>
              {/* Header Profile Box */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-2xl shadow-md">
                    <FaSchool />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{selectedSchool.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-purple-400 font-bold">{selectedSchool.code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {selectedSchool.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">📍 {selectedSchool.location}</div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-white p-1">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "overview" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab("admins")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "admins" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Admins
                </button>
                <button 
                  onClick={() => setActiveTab("teachers")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "teachers" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Teachers
                </button>
                <button 
                  onClick={() => setActiveTab("students")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${activeTab === "students" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
                >
                  Students
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4 text-xs">
                  
                  {/* School Information */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">School Information</h4>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl p-3 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between"><span className="text-slate-400">School Name</span><span className="font-bold text-slate-800 dark:text-white">{selectedSchool.name}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Location</span><span>{selectedSchool.location}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Established</span><span>{selectedSchool.established}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Contact</span><span>{selectedSchool.contact}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-purple-400">{selectedSchool.email}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Address</span><span className="truncate max-w-[150px]">{selectedSchool.address}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Website</span><span className="text-cyan-400">{selectedSchool.website}</span></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] mb-2">Quick Stats</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="font-black text-purple-400 text-sm">{selectedSchool.students}</div>
                        <div className="text-[10px] text-slate-400">Students</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="font-black text-blue-400 text-sm">{selectedSchool.teachers}</div>
                        <div className="text-[10px] text-slate-400">Teachers</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="font-black text-emerald-400 text-sm">{selectedSchool.classes}</div>
                        <div className="text-[10px] text-slate-400">Classes</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Support History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">Recent Support History</h4>
                    </div>
                    <div className="space-y-1.5">
                      {selectedSchool.ticketsHistory && selectedSchool.ticketsHistory.length > 0 ? selectedSchool.ticketsHistory.map((t) => (
                        <div key={t.id} className="p-2 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-purple-400 font-mono text-[11px]">{t.id}</div>
                            <div className="text-[10px] text-slate-400">{t.title}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.color}`}>{t.status}</span>
                        </div>
                      )) : (
                        <div className="text-slate-400 text-center py-2 text-[11px]">No recent tickets</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ADMINS */}
              {activeTab === "admins" && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl space-y-1">
                    <div className="font-bold text-slate-800 dark:text-white">{selectedSchool.adminName}</div>
                    <div className="text-purple-400">{selectedSchool.adminEmail}</div>
                    <div className="text-[10px] text-slate-400">{selectedSchool.contact}</div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEACHERS */}
              {activeTab === "teachers" && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl text-center text-slate-400">
                    Total registered teachers: <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.teachers}</span>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDENTS */}
              {activeTab === "students" && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl text-center text-slate-400">
                    Total registered students: <span className="font-bold text-slate-800 dark:text-white">{selectedSchool.students}</span>
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a school from the table to view details.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
