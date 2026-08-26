import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaComments,
  FaSchool,
  FaPhoneAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaSearch,
  FaFilter,
  FaSort,
  FaStar,
  FaFlag,
  FaUser,
  FaUsers,
  FaAt,
  FaBullhorn,
  FaRegClock,
  FaArrowLeft
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";
import SupportChatEngine from "../../../components/SupportChatEngine";

const SORA = "'Sora', sans-serif";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  
  // Navigation states
  const [activeContact, setActiveContact] = useState(null);
  
  // Dashboard Metrics & Selections
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [activeCategory, setActiveCategory] = useState("School Admins"); // School Admins, My Group Chats, Teachers Chats, All Tickets
  const [statusFilter, setStatusFilter] = useState("All"); // All, Open, Waiting, Resolved
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Data states
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { socket } = useCall();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUserStatusChange = ({ userId, isOnline, lastSeen }) => {
      setContacts(prev =>
        prev.map(contact =>
          contact._id === userId
            ? { ...contact, isOnline, lastSeen }
            : contact
        )
      );

      setActiveContact(prev => {
        if (!prev || prev._id !== userId) return prev;
        return { ...prev, isOnline, lastSeen };
      });
    };

    socket.on("user:status-change", handleUserStatusChange);

    return () => {
      socket.off("user:status-change", handleUserStatusChange);
    };
  }, [socket]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Build conversations timeline list incorporating seeded mockup items if database is empty
  const conversationsList = useMemo(() => {
    // If the database has real admin contacts, we use them
    const baseList = contacts.map(c => ({
      _id: c._id,
      name: c.name,
      schoolName: c.schoolName || "G.D Academy",
      email: c.email,
      lastMessage: c.lastMessage?.content || "Tap to chat with admin",
      time: c.lastMessage?.createdAt 
        ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
        : "10:20 AM",
      unreadCount: c.unreadCount || 0,
      status: c.unreadCount > 0 ? "Open" : "Open",
      isOnline: c.isOnline,
      isNew: c.unreadCount > 0
    }));

    // Fallback/Dummy items matching mockup exactly
    const dummyItems = [
      {
        _id: "dummy-1",
        name: "Gudiya Kumari",
        schoolName: "Prince school",
        email: "kumarigudiyaa03@gmail.com",
        lastMessage: "Sir, we are facing issue in student attendance...",
        time: "10:45 AM",
        unreadCount: 2,
        status: "Open",
        isOnline: true,
        isNew: true
      },
      {
        _id: "dummy-2",
        name: "Banny Thapar",
        schoolName: "G.D Academy",
        email: "kannythapar950@gmail.com",
        lastMessage: "Payment not showing in dashboard",
        time: "10:20 AM",
        unreadCount: 1,
        status: "Open",
        isOnline: true,
        isNew: false
      },
      {
        _id: "dummy-3",
        name: "Rakesh Kumar",
        schoolName: "Sunrise Public School",
        email: "rakesh@gmail.com",
        lastMessage: "Please help to update school information",
        time: "Yesterday",
        unreadCount: 0,
        status: "Waiting",
        isOnline: false,
        isNew: false
      },
      {
        _id: "dummy-4",
        name: "Asha Verma",
        schoolName: "Bright Future School",
        email: "asha@gmail.com",
        lastMessage: "How to add new teacher in the system?",
        time: "Aug 24",
        unreadCount: 0,
        status: "Open",
        isOnline: true,
        isNew: false
      },
      {
        _id: "dummy-5",
        name: "Pooja Singh",
        schoolName: "G.D Academy",
        email: "pooja@gmail.com",
        lastMessage: "Thanks, issue has been resolved",
        time: "Aug 23",
        unreadCount: 0,
        status: "Resolved",
        isOnline: false,
        isNew: false
      }
    ];

    // Combine baseList and dummies, ensuring Gudiya/Banny exist for realistic presentation
    const combined = [...baseList];
    dummyItems.forEach(item => {
      if (!combined.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
        combined.push(item);
      }
    });

    return combined;
  }, [contacts]);

  // Filtered timeline
  const filteredConversations = useMemo(() => {
    return conversationsList
      .filter(item => {
        // Status filter
        if (statusFilter === "Open") return item.status === "Open";
        if (statusFilter === "Waiting") return item.status === "Waiting";
        if (statusFilter === "Resolved") return item.status === "Resolved";
        return true;
      })
      .filter(item => {
        // Search filter
        const term = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(term) ||
          item.schoolName.toLowerCase().includes(term) ||
          item.lastMessage.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        return sortOrder === "newest" ? 0 : 0; // maintain relative mockup order
      });
  }, [conversationsList, statusFilter, search, sortOrder]);

  const initials = (name) => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-800 dark:text-white">
      
      {!activeContact ? (
        
        /* ======================================= */
        /* VIEW A: SUPPORT DASHBOARD LIST VIEW */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header segment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <FaComments className="text-[#7C3AED]" /> Support Dashboard
              </h2>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1">
                Manage all support conversations, chats and calls from schools, admins and teachers.
              </p>
            </div>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-2.5 px-4 rounded-xl text-xs font-bold focus:outline-none cursor-pointer self-start sm:self-auto shadow-sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>All Time</option>
            </select>
          </div>

          {/* KPI Stats Grid (4 cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            {/* Total Conversations */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Conversations</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center">
                  <FaComments className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">18</p>
              <span className="block text-[9px] font-black text-green-555 mt-2">↑ 25% from last month</span>
            </div>

            {/* Open Conversations */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Conversations</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FaUsers className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">12</p>
              <span className="block text-[9px] font-black text-blue-550 mt-2">↑ 20% from last month</span>
            </div>

            {/* Resolved */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FaCheckCircle className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">6</p>
              <span className="block text-[9px] font-black text-green-555 mt-2">↑ 15% from last month</span>
            </div>

            {/* Calls (This Month) */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-4.5 rounded-2.5xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calls (This Month)</span>
                <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FaPhoneAlt className="text-sm" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-none">9</p>
              <span className="block text-[9px] font-black text-amber-550 mt-2">↑ 30% from last month</span>
            </div>
          </div>

          {/* Category Tabs row */}
          <div className="flex gap-2.5 border-b border-slate-200 dark:border-white/5 pb-1 select-none overflow-x-auto">
            {[
              { id: "School Admins", label: "School Admins", count: 8 },
              { id: "My Group Chats", label: "My Group Chats", count: 4 },
              { id: "Teachers Chats", label: "Teachers Chats", count: 6 },
              { id: "All Tickets", label: "All Tickets", count: 18 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`pb-3 px-3 text-xs font-black transition cursor-pointer relative shrink-0 ${
                  activeCategory === tab.id
                    ? "text-[#7C3AED] dark:text-[#38BDF8]"
                    : "text-slate-500 hover:text-slate-750"
                }`}
              >
                {tab.label} <span className="text-[10px] font-bold text-slate-400 ml-0.5">({tab.count})</span>
                {activeCategory === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] dark:bg-[#38BDF8]" />
                )}
              </button>
            ))}
          </div>

          {/* Search input line filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by name, school or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-805 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <button className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-slate-350">
              <FaFilter className="text-slate-400" /> All Status
            </button>

            <button 
              onClick={() => setSortOrder(p => p === "newest" ? "oldest" : "newest")}
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-705 dark:text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-slate-350"
            >
              <FaSort className="text-slate-400" /> Sort
            </button>
          </div>

          {/* Split Layout: Chats List & Support metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Columns: Chat Conversation items */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
              
              {/* Internal sub-tabs list */}
              <div className="flex gap-4 border-b border-slate-100 dark:border-white/5 pb-2.5 select-none">
                {[
                  { id: "All", label: "All", count: 8 },
                  { id: "Open", label: "Open", count: 5 },
                  { id: "Waiting", label: "Waiting", count: 2 },
                  { id: "Resolved", label: "Resolved", count: 1 }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setStatusFilter(sub.id)}
                    className={`text-xs font-extrabold pb-0.5 border-b-2 transition cursor-pointer ${
                      statusFilter === sub.id 
                        ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#38BDF8]" 
                        : "border-transparent text-slate-455 hover:text-slate-700"
                    }`}
                  >
                    {sub.label} ({sub.count})
                  </button>
                ))}
              </div>

              {/* Chat list timeline rows */}
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredConversations.length === 0 ? (
                  <div className="py-20 text-center text-slate-405 font-bold">
                    No active chats match current category.
                  </div>
                ) : (
                  filteredConversations.map((item) => (
                    <div 
                      key={item._id}
                      onClick={() => {
                        // Find the original contact object to pass to SupportChatEngine
                        const orig = contacts.find(c => c._id === item._id) || {
                          _id: item._id,
                          name: item.name,
                          email: item.email,
                          schoolName: item.schoolName
                        };
                        setActiveContact(orig);
                      }}
                      className="py-4.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer rounded-xl px-2"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black shrink-0 relative text-xs">
                          {initials(item.name)}
                          {item.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</h4>
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-550/15 text-[#7C3AED] dark:text-[#A78BFA] text-[7.5px] font-black uppercase tracking-wider">NEW</span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-400 font-extrabold flex items-center gap-1 mt-0.5">
                            <FaSchool className="text-[8px]" /> {item.schoolName}
                          </p>
                          <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold truncate mt-1">
                            {item.lastMessage}
                          </p>
                        </div>
                      </div>

                      {/* Right metadata badge counts */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5 font-mono select-none">
                        <span className="text-[9px] text-slate-400 font-extrabold">{item.time}</span>
                        <div className="flex items-center gap-2">
                          {item.unreadCount > 0 && (
                            <span className="w-4.5 h-4.5 rounded-full bg-[#7C3AED] text-white text-[9px] font-black flex items-center justify-center leading-none">
                              {item.unreadCount}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            item.status === "Resolved" ? "bg-green-50 text-green-700" :
                            item.status === "Waiting" ? "bg-orange-50 text-orange-700" :
                            "bg-blue-50 text-blue-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Bottom centered link */}
              <div className="text-center pt-2 select-none border-t border-slate-100 dark:border-white/5">
                <button className="text-[10px] font-black text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-widest hover:underline cursor-pointer">
                  View all conversations &gt;
                </button>
              </div>

            </div>

            {/* Right Column: Support summary, Quick filters, mega actions */}
            <div className="space-y-6 select-none">
              
              {/* Support Summary Metrics */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Support Summary</span>
                
                <div className="space-y-3.5 text-xs font-bold text-slate-655 dark:text-slate-350">
                  <div className="flex items-center justify-between p-1">
                    <span className="flex items-center gap-2.5">
                      <FaRegClock className="text-blue-500 text-sm" /> Avg. Response Time
                    </span>
                    <span className="text-[#38BDF8] font-black font-mono">1h 24m</span>
                  </div>

                  <div className="flex items-center justify-between p-1">
                    <span className="flex items-center gap-2.5">
                      <FaCheckCircle className="text-green-555 text-sm" /> Resolution Rate
                    </span>
                    <span className="text-green-555 font-black font-mono">92%</span>
                  </div>

                  <div className="flex items-center justify-between p-1">
                    <span className="flex items-center gap-2.5">
                      <FaStar className="text-amber-500 text-sm" /> User Satisfaction
                    </span>
                    <span className="text-amber-500 font-black font-mono">4.6 / 5</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Open analytics report details.")}
                  className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-purple-500/20 text-[#7C3AED] dark:text-[#A78BFA] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </button>
              </div>

              {/* Quick Filters category counts */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quick Filters</span>
                
                <div className="space-y-1">
                  {[
                    { label: "High Priority", count: 3, icon: <FaFlag className="text-rose-500 text-xs shrink-0" /> },
                    { label: "Unassigned", count: 2, icon: <FaUser className="text-blue-500 text-xs shrink-0" /> },
                    { label: "My Conversations", count: 4, icon: <FaUsers className="text-blue-500 text-xs shrink-0" /> },
                    { label: "Mentions", count: 1, icon: <FaAt className="text-[#7C3AED] text-xs shrink-0" /> }
                  ].map((filter, index) => (
                    <div 
                      key={index}
                      onClick={() => alert(`Showing logs for filter: ${filter.label}`)}
                      className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/[0.01] rounded-xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-750 dark:text-slate-350">
                        {filter.icon}
                        <span>{filter.label}</span>
                      </div>
                      <span className="text-xs font-black font-mono text-slate-500">{filter.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Megaphone announcement CTA button */}
              <button 
                onClick={() => alert("Write announcement notification details...")}
                className="w-full bg-transparent hover:bg-blue-500/10 border border-blue-500/20 text-blue-600 py-3.5 rounded-2.5xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaBullhorn /> Create Support Announcement
              </button>

            </div>

          </div>

        </div>
      ) : (
        /* ======================================= */
        /* VIEW B: ACTIVE CHAT CONVERSATION DRAWER */
        <div className="bg-white border border-slate-200/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)] animate-fadeIn text-slate-800">
          <div className="h-full flex flex-col relative bg-white">
            
            {/* Extended Back bar header */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setActiveContact(null)}
                className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black py-1.5 px-3 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <FaArrowLeft className="text-[8px]" /> Back to Dashboard
              </button>
              
              <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
                Support session
              </span>
            </div>

            {/* Chat engine core render */}
            <div className="flex-1 flex flex-col min-h-0">
              <SupportChatEngine
                activeContact={activeContact}
                onBack={() => setActiveContact(null)}
                userRole="superadmin"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default SuperAdminSupport;
