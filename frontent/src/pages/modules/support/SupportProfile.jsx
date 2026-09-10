import { useState } from "react";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaShieldAlt, 
  FaCalendarAlt, 
  FaEdit, 
  FaCheckCircle, 
  FaStar, 
  FaTicketAlt, 
  FaClock, 
  FaLock, 
  FaCog, 
  FaHistory 
} from "react-icons/fa";

export default function SupportProfile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    fullName: "Prince Raj",
    email: "prince.raj@teachhub.com",
    role: "Support Team Member",
    employeeId: "SUP-2026-014",
    phone: "+91 98765 43210",
    joinedDate: "12 Jan 2024",
    department: "Customer Support",
    reportingTo: "Super Admin",
    location: "Bihar, India"
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information and account details.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25">
          <FaEdit className="text-xs" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* TOP PROFILE BANNER CARD */}
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl">
              PR
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0D1527]" />
          </div>

          <div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">{formData.fullName}</h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                {formData.role}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              Dedicated to helping schools, teachers and students get the best support experience on TeachHub.
            </p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-4 w-full md:w-auto">
          <div><span className="text-slate-400 block text-[10px]">Email</span><span className="font-bold text-slate-800 dark:text-white">{formData.email}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Role</span><span className="font-semibold text-purple-400">{formData.role}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Employee / Support ID</span><span className="font-mono font-bold text-cyan-400">{formData.employeeId}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Joined Date</span><span className="font-semibold text-slate-300">{formData.joinedDate}</span></div>
          <div><span className="text-slate-400 block text-[10px]">Status</span><span className="font-bold text-emerald-400">Active</span></div>
        </div>
      </div>

      {/* MAIN LAYOUT: Form Workspace (Col 8) & Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORM WORKSPACE (Col 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-[#121B2E]/50 text-xs font-bold">
            {["Personal Information", "Security", "Preferences", "Activity"].map((tab) => {
              const key = tab.toLowerCase().split(" ")[0];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-xl transition ${activeTab === key ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Role</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.role} 
                  className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Employee / Support ID</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.employeeId} 
                  className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 font-mono focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Joined Date</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.joinedDate} 
                  className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Reporting To</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.reportingTo} 
                  className="w-full bg-slate-100 dark:bg-[#162238]/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg">
                Save Changes
              </button>
              <button className="px-5 py-2.5 bg-slate-100 dark:bg-[#162238] text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-white/10">
                Cancel
              </button>
            </div>
          </div>

        </div>

        {/* SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Account Status Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Account Status</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FaCheckCircle />
                <span>Active</span>
              </div>
              <p className="text-[11px] text-slate-400">Your account is active and you can access all support features.</p>
            </div>
          </div>

          {/* Support Statistics */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Support Statistics</h3>
              <span className="text-[10px] text-slate-400">This Month</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-rose-400 text-lg">48</div>
                <div className="text-[10px] text-slate-400">Assigned Tickets</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-emerald-400 text-lg">42</div>
                <div className="text-[10px] text-slate-400">Resolved</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-blue-400 text-lg">4</div>
                <div className="text-[10px] text-slate-400">In Progress</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-200 dark:border-white/5">
                <div className="font-black text-amber-400 text-lg">⭐ 4.8</div>
                <div className="text-[10px] text-slate-400">User Rating</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Recent Activity</h3>
              <button className="text-purple-400 font-bold text-[10px] hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div>
                <div><div className="font-bold text-slate-800 dark:text-white text-[11px]">Logged in</div><div className="text-[9px] text-slate-400">Today, 10:20 AM</div></div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✎</div>
                <div><div className="font-bold text-slate-800 dark:text-white text-[11px]">Updated profile photo</div><div className="text-[9px] text-slate-400">Yesterday, 04:15 PM</div></div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
