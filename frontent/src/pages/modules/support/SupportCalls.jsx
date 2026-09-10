import { useState } from "react";
import { 
  FaPhoneAlt, 
  FaVideo, 
  FaPhoneSlash, 
  FaClock, 
  FaCalendarAlt, 
  FaUser, 
  FaSearch, 
  FaFilter, 
  FaChevronLeft, 
  FaChevronRight, 
  FaEllipsisV, 
  FaComments,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPlus,
  FaPhoneVolume
} from "react-icons/fa";

export default function SupportCalls() {
  const [activeTab, setActiveTab] = useState("all");
  const [dialNumber, setDialNumber] = useState("");
  const [callMode, setCallMode] = useState("audio"); // "audio" or "video"
  const [inCall, setInCall] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Mock Calls Dataset matching Screenshot 5
  const calls = [
    { id: "1", user: "Amit Kumar", phone: "+91 98765 43210", role: "Student", school: "G.D Academy", type: "Audio", duration: "12:45", timeDate: "Today, 11:20 AM", status: "Active", avatarBg: "bg-blue-600" },
    { id: "2", user: "Neha Singh", phone: "+91 87654 32109", role: "Teacher", school: "Sunrise Public School", type: "Video", duration: "28:12", timeDate: "Today, 10:45 AM", status: "Completed", avatarBg: "bg-purple-600" },
    { id: "3", user: "Ramesh Kumar", phone: "+91 76543 21098", role: "School Admin", school: "Bright Future School", type: "Audio", duration: "05:30", timeDate: "Today, 09:12 AM", status: "Missed", avatarBg: "bg-[#7C3AED]" },
    { id: "4", user: "Pooja Sharma", phone: "+91 99887 76655", role: "Teacher", school: "R.K Public School", type: "Video", duration: "15:20", timeDate: "Yesterday, 4:30 PM", status: "Completed", avatarBg: "bg-[#0284C7]" },
    { id: "5", user: "Vikram Patel", phone: "+91 88776 65432", role: "Student", school: "Model Children School", type: "Audio", duration: "08:10", timeDate: "Yesterday, 2:15 PM", status: "Completed", avatarBg: "bg-amber-600" },
    { id: "6", user: "Anjali Verma", phone: "+91 77665 44321", role: "Parent", school: "Little Flower School", type: "Audio", duration: "00:00", timeDate: "Yesterday, 1:05 PM", status: "Missed", avatarBg: "bg-rose-600" },
    { id: "7", user: "Suresh Yadav", phone: "+91 96543 23110", role: "Teacher", school: "Green Valley School", type: "Video", duration: "22:18", timeDate: "8 Sept 2026, 5:40 PM", status: "Completed", avatarBg: "bg-emerald-600" }
  ];

  const handleDialClick = (digit) => {
    setDialNumber(prev => prev + digit);
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Calls</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and view all support calls with students, teachers and school admins.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25">
          <FaPlus className="text-xs" />
          <span>Make a Call</span>
        </button>
      </div>

      {/* 5 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneVolume className="text-lg animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">2</div>
            <div className="text-[10px] text-slate-400 font-medium">Active Calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneAlt className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">24</div>
            <div className="text-[10px] text-slate-400 font-medium">Recent Calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneSlash className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">5</div>
            <div className="text-[10px] text-slate-400 font-medium">Missed Calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaVideo className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">18</div>
            <div className="text-[10px] text-slate-400 font-medium">Video Calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaClock className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">120</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Calls</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Calls Table (Col 8) & Interactive Dialpad / Call Controls Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALLS TABLE & BOTTOM WIDGETS AREA (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar & Tabs */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
              {["All Calls", "Active Calls", "Recent Calls", "Missed Calls", "Video Calls"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase().replace(/\s+/g, ""))}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    activeTab === tab.toLowerCase().replace(/\s+/g, "")
                      ? "bg-purple-600 text-white shadow" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none">
                <option>Last 30 Days</option>
                <option>This Week</option>
              </select>
              <button className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-slate-400 hover:text-white">
                <FaFilter />
                <span>Filters</span>
              </button>
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
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">School</th>
                    <th className="p-3.5">Call Type</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Time & Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {calls.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                      <td className="p-3.5">
                        <input type="checkbox" className="rounded text-purple-600 focus:ring-0" />
                      </td>
                      <td className="p-3.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${c.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                            {c.user.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs">{c.user}</div>
                            <div className="text-[10px] text-slate-400">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.role === "Student" ? "bg-purple-500/10 text-purple-400" :
                          c.role === "Teacher" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{c.school}</td>
                      <td className="p-3.5">
                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                          {c.type === "Video" ? <FaVideo className="text-indigo-400" /> : <FaPhoneAlt className="text-emerald-400" />}
                          <span>{c.type}</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{c.duration}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{c.timeDate}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "Active" ? "bg-emerald-500/20 text-emerald-400 animate-pulse" :
                          c.status === "Completed" ? "bg-blue-500/20 text-blue-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 text-purple-400 hover:bg-white/10 rounded-lg">
                            <FaComments className="text-xs" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                            <FaEllipsisV className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM CALL WIDGETS GRID (Recent Calls, Missed Calls, Call Stats) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Recent Calls List */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">Recent Calls</h4>
                <button className="text-purple-400 text-[10px] font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">NS</div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-[11px]">Neha Singh</div>
                      <div className="text-[9px] text-slate-400">Video Call • 28:12</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">10:45 AM</span>
                </div>
              </div>
            </div>

            {/* Missed Calls List */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">Missed Calls</h4>
                <button className="text-purple-400 text-[10px] font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">AV</div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-[11px]">Anjali Verma</div>
                      <div className="text-[9px] text-rose-400 font-bold">Missed Call</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">1:05 PM</span>
                </div>
              </div>
            </div>

            {/* Call Statistics */}
            <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs mb-1">Call Statistics</h4>
              <div className="flex justify-between"><span className="text-slate-400">Total Calls</span><span className="font-bold text-slate-800 dark:text-white">120</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Audio Calls</span><span className="font-semibold text-emerald-400">85</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Video Calls</span><span className="font-semibold text-purple-400">35</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Average Duration</span><span className="font-mono text-slate-300">08:42</span></div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE DIALPAD & ACTIVE CALL CONTROL SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Make a Call Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaPhoneAlt className="text-purple-400" />
              <span>Make a Call</span>
            </h3>

            {/* Call Type Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs">
              <button 
                onClick={() => setCallMode("audio")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  callMode === "audio" ? "bg-purple-600 text-white shadow" : "text-slate-400"
                }`}
              >
                <FaPhoneAlt className="text-xs" />
                <span>Audio Call</span>
              </button>
              <button 
                onClick={() => setCallMode("video")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  callMode === "video" ? "bg-purple-600 text-white shadow" : "text-slate-400"
                }`}
              >
                <FaVideo className="text-xs" />
                <span>Video Call</span>
              </button>
            </div>

            {/* User Search / Number Display Input */}
            <div className="relative">
              <input 
                type="text"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="Search user by name, phone..."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Phone Dialpad */}
            <div className="grid grid-cols-3 gap-2 text-slate-800 dark:text-white font-bold">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDialClick(num)}
                  className="py-3 bg-slate-100 dark:bg-[#162238] hover:bg-purple-600/20 rounded-xl text-sm font-semibold transition active:scale-95 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Dial Button */}
            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
              <FaPhoneAlt />
              <span>Start {callMode === "video" ? "Video" : "Audio"} Call</span>
            </button>
          </div>

          {/* Active Call Control Box (Matching Screenshot 5) */}
          {inCall && (
            <div className="bg-[#0D1527] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400">Active Call</span>
                </div>
                <span className="font-mono text-xs text-slate-400 font-bold">00:12:45</span>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  AK
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Amit Kumar</h4>
                  <p className="text-xs text-slate-400">Student • G.D Academy</p>
                  <p className="text-[10px] text-slate-400">+91 98765 43210</p>
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                    isMuted ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-white/10 text-white border-white/10"
                  }`}
                >
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  <span className="text-[9px]">Mute</span>
                </button>

                <button className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex flex-col items-center gap-1">
                  <span>Keypad</span>
                </button>

                <button className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex flex-col items-center gap-1">
                  <FaPlus />
                  <span className="text-[9px]">Add Call</span>
                </button>

                <button className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex flex-col items-center gap-1">
                  <FaVideo />
                  <span className="text-[9px]">Video</span>
                </button>
              </div>

              <button 
                onClick={() => setInCall(false)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <FaPhoneSlash />
                <span>End Call</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
