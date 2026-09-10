import { useState } from "react";
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
  FaUserShield
} from "react-icons/fa";

export default function SupportUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("1");
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "school", "history"

  // Mock Users Dataset matching Screenshot 1
  const users = [
    {
      id: "1",
      code: "STD-00124",
      name: "Aarav Sharma",
      role: "Student",
      class: "5",
      school: "G.D Academy",
      schoolLocation: "Siwan, Bihar",
      email: "aarav@gmail.com",
      phone: "+91 98765 43210",
      dob: "14 Mar 2014",
      joinedOn: "12 Aug 2024",
      status: "Active",
      avatarBg: "bg-purple-600",
      principal: "Ramesh Kumar",
      totalStudents: 320,
      totalTeachers: 18,
      schoolContact: "+91 6122 234567",
      tickets: [
        { id: "#TH-1052", title: "How to join school?", status: "Open", date: "10 Sept 2026", color: "text-rose-400 bg-rose-500/10" },
        { id: "#TH-0987", title: "Password reset issue", status: "Resolved", date: "22 Aug 2026", color: "text-emerald-400 bg-emerald-500/10" },
        { id: "#TH-0876", title: "App not opening", status: "Closed", date: "12 Jul 2026", color: "text-slate-400 bg-slate-500/10" }
      ]
    },
    {
      id: "2",
      code: "TCH-00231",
      name: "Anjali Verma",
      role: "Teacher",
      class: "N/A",
      school: "Saraswati Vidya Niketan",
      schoolLocation: "Patna, Bihar",
      email: "anjali@school.com",
      phone: "+91 87664 32109",
      dob: "05 Jun 1992",
      joinedOn: "5 Jul 2024",
      status: "Active",
      avatarBg: "bg-blue-600",
      principal: "Vikram Patel",
      totalStudents: 540,
      totalTeachers: 26,
      schoolContact: "+91 6122 889900",
      tickets: [
        { id: "#TH-1051", title: "Attendance not showing", status: "Open", date: "10 Sept 2026", color: "text-rose-400 bg-rose-500/10" }
      ]
    },
    {
      id: "3",
      code: "STD-00412",
      name: "Rahul Kumar",
      role: "Student",
      class: "8",
      school: "Bright Future School",
      schoolLocation: "Gaya, Bihar",
      email: "rahul@gmail.com",
      phone: "+91 76543 21098",
      dob: "20 Aug 2011",
      joinedOn: "20 Aug 2024",
      status: "Active",
      avatarBg: "bg-[#7C3AED]",
      principal: "Neha Singh",
      totalStudents: 410,
      totalTeachers: 22,
      schoolContact: "+91 6122 776655",
      tickets: [
        { id: "#TH-1050", title: "App not opening", status: "In Progress", date: "10 Sept 2026", color: "text-amber-400 bg-amber-500/10" }
      ]
    },
    {
      id: "4",
      code: "TEA-00125",
      name: "Neha Singh",
      role: "Teacher",
      class: "N/A",
      school: "Sunrise Public School",
      schoolLocation: "Muzaffarpur, Bihar",
      email: "neha@gmail.com",
      phone: "+91 99887 76655",
      dob: "18 Jun 1988",
      joinedOn: "18 Jun 2024",
      status: "Active",
      avatarBg: "bg-amber-600",
      principal: "Amit Verma",
      totalStudents: 280,
      totalTeachers: 15,
      schoolContact: "+91 6122 443322",
      tickets: []
    },
    {
      id: "5",
      code: "ADM-00018",
      name: "Vikram Patel",
      role: "School Admin",
      class: "N/A",
      school: "R.K Public School",
      schoolLocation: "Chapra, Bihar",
      email: "vikram@school.com",
      phone: "+91 88776 65544",
      dob: "02 May 1985",
      joinedOn: "2 May 2024",
      status: "Active",
      avatarBg: "bg-rose-600",
      principal: "Vikram Patel",
      totalStudents: 520,
      totalTeachers: 22,
      schoolContact: "+91 6122 998877",
      tickets: []
    },
    {
      id: "6",
      code: "STD-00671",
      name: "Pooja Kumari",
      role: "Student",
      class: "6",
      school: "G.D Academy",
      schoolLocation: "Siwan, Bihar",
      email: "pooja@gmail.com",
      phone: "+91 77665 44332",
      dob: "10 Apr 2013",
      joinedOn: "10 Apr 2024",
      status: "Inactive",
      avatarBg: "bg-emerald-600",
      principal: "Ramesh Kumar",
      totalStudents: 320,
      totalTeachers: 18,
      schoolContact: "+91 6122 234567",
      tickets: []
    }
  ];

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role.toLowerCase().replace(/\s+/g, "") !== roleFilter.toLowerCase().replace(/\s+/g, "")) return false;
    if (statusFilter !== "all" && u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.school.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

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
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">1,248</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Users</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <FaUserGraduate className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Students</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">892</div>
            <div className="text-[10px] text-emerald-400 font-bold">72%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <FaChalkboardTeacher className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Teachers</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">286</div>
            <div className="text-[10px] text-emerald-400 font-bold">23%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
            <FaUserShield className="text-xl" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">School Admins</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white leading-tight">70</div>
            <div className="text-[10px] text-emerald-400 font-bold">6%</div>
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, school..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="schooladmin">School Admin</option>
              </select>

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
                  {filteredUsers.map((u, idx) => (
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
                      <td className="p-3.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${u.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                            {u.name.substring(0, 2).toUpperCase()}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div>Showing 1 to {filteredUsers.length} of 1,248 users</div>
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

        {/* RIGHT SIDE DETAILS SIDEBAR FOR SELECTED USER (Col 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          
          {/* Header Profile Box */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full ${selectedUser.avatarBg} text-white font-bold text-lg flex items-center justify-center shadow-md`}>
                {selectedUser.name.substring(0, 2).toUpperCase()}
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
                  <button className="text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-semibold">
                    <FaEdit className="text-[10px]" />
                    <span>Edit</span>
                  </button>
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
                    <span className="text-slate-400">Date of Birth</span>
                    <span>{selectedUser.dob}</span>
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
                    <button className="text-[10px] font-bold text-purple-400 hover:underline">View School</button>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
                    <div className="flex justify-between"><span className="text-slate-400">Principal</span><span>{selectedUser.principal}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Students</span><span>{selectedUser.totalStudents}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Contact</span><span>{selectedUser.schoolContact}</span></div>
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
                  {selectedUser.tickets.length > 0 ? selectedUser.tickets.map((t) => (
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

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow">
                  <FaComments />
                  <span>Start Chat</span>
                </button>
                <button className="py-2.5 px-3 bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 dark:border-white/10">
                  <FaPhoneAlt className="text-emerald-400" />
                  <span>Audio Call</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
