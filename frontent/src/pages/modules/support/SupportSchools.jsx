import { useState } from "react";
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
  FaFileAlt
} from "react-icons/fa";

export default function SupportSchools() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedSchoolId, setSelectedSchoolId] = useState("1");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "admins", "teachers", "students"

  // Mock Schools Dataset matching Screenshot 2
  const schools = [
    {
      id: "1",
      code: "SCH-001",
      name: "G.D Academy",
      location: "Siwan, Bihar",
      established: "2015",
      contact: "+91 98765 43210",
      email: "info@gdacademy.in",
      address: "Main Road, Siwan, Bihar 841226",
      website: "www.gdacademy.in",
      adminName: "Ramesh Kumar",
      adminEmail: "ramesh@gdacademy.in",
      teachers: 18,
      students: 320,
      classes: 5,
      status: "Active",
      ticketsCount: 12,
      ticketsHistory: [
        { id: "#TH-1052", title: "How to join school?", status: "Open", date: "10 Sept 2026", color: "text-rose-400 bg-rose-500/10" },
        { id: "#TH-0987", title: "App not working", status: "Resolved", date: "22 Aug 2026", color: "text-emerald-400 bg-emerald-500/10" },
        { id: "#TH-0876", title: "Fee module issue", status: "Closed", date: "12 Jul 2026", color: "text-slate-400 bg-slate-500/10" },
        { id: "#TH-0765", title: "Teacher login problem", status: "Resolved", date: "5 Jun 2026", color: "text-emerald-400 bg-emerald-500/10" }
      ]
    },
    {
      id: "2",
      code: "SCH-002",
      name: "Bright Future School",
      location: "Muzaffarpur, Bihar",
      established: "2018",
      contact: "+91 99887 76655",
      email: "neha@bfschool.com",
      address: "Station Road, Muzaffarpur, Bihar",
      website: "www.brightfutureschool.in",
      adminName: "Neha Singh",
      adminEmail: "neha@bfschool.com",
      teachers: 25,
      students: 540,
      classes: 8,
      status: "Active",
      ticketsCount: 8,
      ticketsHistory: []
    },
    {
      id: "3",
      code: "SCH-003",
      name: "Sunrise Public School",
      location: "Patna, Bihar",
      established: "2012",
      contact: "+91 98711 22334",
      email: "amit@sunriseedu.in",
      address: "Boring Road, Patna, Bihar",
      website: "www.sunriseschool.in",
      adminName: "Amit Verma",
      adminEmail: "amit@sunriseedu.in",
      teachers: 32,
      students: 680,
      classes: 10,
      status: "Active",
      ticketsCount: 15,
      ticketsHistory: []
    },
    {
      id: "4",
      code: "SCH-004",
      name: "Saraswati Vidya Niketan",
      location: "Gaya, Bihar",
      established: "2016",
      contact: "+91 87664 32109",
      email: "anjali@svm.edu.in",
      address: "GT Road, Gaya, Bihar",
      website: "www.svngaya.in",
      adminName: "Anjali Sharma",
      adminEmail: "anjali@svm.edu.in",
      teachers: 16,
      students: 410,
      classes: 6,
      status: "Active",
      ticketsCount: 6,
      ticketsHistory: []
    },
    {
      id: "5",
      code: "SCH-005",
      name: "R.K Public School",
      location: "Chapra, Bihar",
      established: "2014",
      contact: "+91 88776 65544",
      email: "vikram@rkps.edu.in",
      address: "College Road, Chapra, Bihar",
      website: "www.rkpschapra.in",
      adminName: "Vikram Patel",
      adminEmail: "vikram@rkps.edu.in",
      teachers: 22,
      students: 520,
      classes: 8,
      status: "Active",
      ticketsCount: 10,
      ticketsHistory: []
    },
    {
      id: "6",
      code: "SCH-006",
      name: "Model Children School",
      location: "Darbhanga, Bihar",
      established: "2019",
      contact: "+91 96543 23110",
      email: "suresh@mcs.edu.in",
      address: "Tower Chowk, Darbhanga",
      website: "www.mcsdarbhanga.in",
      adminName: "Suresh Yadav",
      adminEmail: "suresh@mcs.edu.in",
      teachers: 12,
      students: 300,
      classes: 4,
      status: "Inactive",
      ticketsCount: 3,
      ticketsHistory: []
    }
  ];

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];

  const filteredSchools = schools.filter(s => {
    if (statusFilter !== "all" && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.adminName.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
    }
    return true;
  });

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

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25">
          <FaPlus className="text-xs" />
          <span>Add School</span>
        </button>
      </div>

      {/* 5 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaSchool />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">1,248</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaCheckCircle />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">892</div>
            <div className="text-[10px] text-slate-400 font-medium">Active Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaSchool />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">56</div>
            <div className="text-[10px] text-slate-400 font-medium">Inactive Schools</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaChalkboardTeacher />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">320</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Teachers</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaUsers />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">12,450</div>
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by school name, admin name, location..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
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
                  {filteredSchools.map((s, idx) => (
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
                      <td className="p-3.5 font-bold text-slate-500">{idx + 1}</td>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>Showing 1 to {filteredSchools.length} of 1,248 schools</div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white">
                  <FaChevronLeft className="text-xs" />
                </button>
                <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-xl">1</span>
                <span className="px-3 py-1 hover:bg-white/5 rounded-xl cursor-pointer">2</span>
                <span className="px-3 py-1 hover:bg-white/5 rounded-xl cursor-pointer">3</span>
                <button className="p-2 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-400 hover:text-white">
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE DETAILS SIDEBAR FOR SELECTED SCHOOL (Col 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          
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
                  <button className="text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-semibold">
                    <FaEdit className="text-[10px]" />
                    <span>Edit</span>
                  </button>
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
                  <button className="text-purple-400 hover:underline text-[11px] font-semibold">View All</button>
                </div>
                <div className="space-y-1.5">
                  {selectedSchool.ticketsHistory.length > 0 ? selectedSchool.ticketsHistory.map((t) => (
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

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="py-2.5 px-3 bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/10">
                  <FaFileAlt className="text-purple-400" />
                  <span>View All Tickets</span>
                </button>
                <button className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow">
                  <FaEnvelope />
                  <span>Contact Admin</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
