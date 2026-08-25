import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { 
  FaBroadcastTower, 
  FaComments, 
  FaPhone, 
  FaUsers, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaSearch, 
  FaFilter, 
  FaInfoCircle, 
  FaPlus, 
  FaTimes, 
  FaPaperPlane,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { useCall } from "../../../../context/CallContext";
import SupportChatEngine from "../../../../components/SupportChatEngine";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

const MOCK_GROUPS = [
  {
    _id: "mock-1",
    name: "Class 10-A Students",
    description: "General discussions & updates",
    lastMessage: {
      sender: { name: "Riya" },
      content: "Don't forget about the test tomorrow.",
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 min ago
    timeText: "10:25 AM",
    avatarBg: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
    avatarIcon: <FaUsers />
  },
  {
    _id: "mock-2",
    name: "Study Group - Science",
    description: "Share notes, doubts & solutions",
    lastMessage: {
      sender: { name: "Aman" },
      content: "Thanks for the notes!",
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    timeText: "Yesterday",
    avatarBg: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    avatarIcon: <FaGraduationCap />
  },
  {
    _id: "mock-3",
    name: "Project Team Alpha",
    description: "Project discussions & planning",
    lastMessage: {
      sender: { name: "You" },
      content: "Please check the latest update.",
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    timeText: "2 Days Ago",
    avatarBg: "bg-emerald-500/10 text-emerald-555 border border-emerald-500/20",
    avatarIcon: <FaUsers />
  },
  {
    _id: "mock-4",
    name: "School Announcements",
    description: "Official announcements & alerts",
    lastMessage: {
      sender: { name: "Admin" },
      content: "Annual sports day on Sunday.",
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    timeText: "3 Days Ago",
    avatarBg: "bg-amber-500/10 text-amber-555 border border-amber-500/20",
    avatarIcon: <FaBroadcastTower />
  }
];

function StudentSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const name = localStorage.getItem("name") || "Student";
  const { theme, toggleTheme } = useTheme();

  // Tab controls: groups (My Group Chats), admin (School Admin Support), teachers (My Teachers Chat)
  const [activeTab, setActiveTab] = useState("groups");
  const [subTab, setSubTab] = useState("personal"); // personal, calls

  // Data states
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [callsHistory, setCallsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Group chat states
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMessageText, setGroupMessageText] = useState("");
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Unread
  
  // Create group modal states
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const messagesEndRef = useRef(null);
  const { socket } = useCall();

  const userInitials = useMemo(() => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  // Load basic data
  useEffect(() => {
    fetchContacts();
    fetchGroupChats();

    const handleCallHistoryUpdate = () => {
      fetchCallsHistory();
    };
    window.addEventListener("call:history-updated", handleCallHistoryUpdate);
    return () => {
      window.removeEventListener("call:history-updated", handleCallHistoryUpdate);
    };
  }, []);

  // Socket online updates
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

  // Group messages socket subscription
  useEffect(() => {
    if (!socket || !activeGroup) return;

    const handleNewGroupMessage = (message) => {
      if (String(message.group) === String(activeGroup._id)) {
        setGroupMessages(current => 
          current.some(m => m._id === message._id) ? current : [...current, message]
        );
        scrollToBottom();
      }
    };

    socket.on("group:new-message", handleNewGroupMessage);

    return () => {
      socket.off("group:new-message", handleNewGroupMessage);
    };
  }, [socket, activeGroup]);

  // Load group messages when active group changes
  useEffect(() => {
    if (!activeGroup || activeGroup._id.startsWith("mock-")) {
      setGroupMessages([]);
      return;
    }

    axios
      .get(`${API}/api/groups/${activeGroup._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setGroupMessages(res.data);
        scrollToBottom();
      })
      .catch((err) => console.error("Could not load group messages:", err));
  }, [activeGroup]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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

  const fetchGroupChats = async () => {
    try {
      const res = await axios.get(`${API}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchBroadcastHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/support/history?broadcasts=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBroadcastMessages(res.data);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  const fetchCallsHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/calls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCallsHistory(res.data);
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveContact(null);
    setActiveGroup(null);
    setBroadcastMessages([]);
    setSubTab("personal");

    if (tab === "admin") {
      const admin = contacts.find(c => c.role === "admin");
      if (admin) {
        setActiveContact(admin);
        fetchBroadcastHistory();
      }
    }
  };

  const handleSubTabChange = (sub) => {
    setSubTab(sub);
    if (sub === "calls") {
      fetchCallsHistory();
    }
  };

  // Group Message Post Trigger
  const sendGroupMessage = async (e) => {
    e.preventDefault();
    if (!groupMessageText.trim() || !activeGroup) return;

    if (activeGroup._id.startsWith("mock-")) {
      // Mock conversation addition
      const mockMsg = {
        _id: `mock-msg-${Date.now()}`,
        sender: { _id: currentUserId, name: name },
        content: groupMessageText,
        createdAt: new Date().toISOString()
      };
      setGroupMessages(current => [...current, mockMsg]);
      setGroupMessageText("");
      scrollToBottom();
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/groups/${activeGroup._id}/messages`,
        { content: groupMessageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroupMessages(current => 
        current.some(m => m._id === res.data._id) ? current : [...current, res.data]
      );
      setGroupMessageText("");
      scrollToBottom();
    } catch (err) {
      console.error("Could not send group message:", err);
    }
  };

  // Group creation POST request
  const createGroupChat = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await axios.post(
        `${API}/api/groups`,
        { name: newGroupName, memberIds: selectedMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups(current => [res.data, ...current]);
      setActiveGroup(res.data);
      setNewGroupName("");
      setSelectedMembers([]);
      setShowNewGroupModal(false);
    } catch (err) {
      console.error("Could not create group:", err);
    }
  };

  // filter contacts representing student classmates for selection in Group creation
  const classmates = useMemo(() => {
    return contacts.filter(c => c.role === "student" && c._id !== currentUserId);
  }, [contacts, currentUserId]);

  const teacherContacts = useMemo(() => {
    return contacts.filter(c => c.role === "teacher");
  }, [contacts]);

  // Combine real groups and mock groups for display
  const displayGroups = useMemo(() => {
    const combined = [...groups];
    // Only append mock groups that aren't already represented in name
    MOCK_GROUPS.forEach(mock => {
      if (!combined.some(g => g.name.toLowerCase() === mock.name.toLowerCase())) {
        combined.push(mock);
      }
    });

    // Apply search local filter
    return combined.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (g.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === "All" || (filterType === "Unread" && g.unreadCount > 0);
      
      return matchesSearch && matchesFilter;
    });
  }, [groups, searchQuery, filterType]);

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Workspace
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-1">
            LEARNER CONSOLE
          </p>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Support Title Cards */}
      <div className="select-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] px-1">SUPPORT CHAT</p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">Support Center</h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-0.5">Connect with your school community & get help.</p>
      </div>

      {/* Toggle Pill Buttons (3 Options) */}
      <div className="grid grid-cols-3 gap-2.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl select-none">
        <button
          onClick={() => handleTabChange("groups")}
          className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black transition cursor-pointer ${
            activeTab === "groups"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaUsers className="text-sm shrink-0" />
          <span className="hidden sm:inline">My Group Chats</span>
          <span className="sm:hidden">Groups</span>
        </button>

        <button
          onClick={() => handleTabChange("admin")}
          className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black transition cursor-pointer ${
            activeTab === "admin"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaShieldAlt className="text-sm shrink-0" />
          <span className="hidden sm:inline">School Admin Support</span>
          <span className="sm:hidden">Admin</span>
        </button>

        <button
          onClick={() => handleTabChange("teachers")}
          className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-[10px] font-black transition cursor-pointer ${
            activeTab === "teachers"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaGraduationCap className="text-sm shrink-0" />
          <span className="hidden sm:inline">My Teachers Chat</span>
          <span className="sm:hidden">Teachers</span>
        </button>
      </div>

      {/* ======================================= */}
      {/* VIEW 1: MY GROUP CHATS */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          
          {/* Search and Filters dropdown */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search group chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            
            <div className="relative shrink-0">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                <option value="All">All Chats</option>
                <option value="Unread">Unread Chats</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
          </div>

          {/* Group chats list header */}
          <div className="flex items-center justify-between px-1 select-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Group Chats</span>
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FaPlus /> New Group Chat
            </button>
          </div>

          {/* Groups list cards layout */}
          <div className="space-y-3">
            {displayGroups.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 text-slate-400 text-xs font-semibold">
                No group chats match your search criteria.
              </div>
            ) : (
              displayGroups.map((group) => {
                const isMock = group._id.startsWith("mock-");
                const avatarBg = group.avatarBg || "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20";
                const avatarIcon = group.avatarIcon || <FaUsers />;
                const timeText = group.timeText || new Date(group.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={group._id}
                    onClick={() => setActiveGroup(group)}
                    className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 rounded-2.5xl p-4.5 flex items-center justify-between cursor-pointer group transition-all shadow-sm select-none"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-lg ${avatarBg}`}>
                        {avatarIcon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors">
                          {group.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal truncate mt-0.5">
                          {group.description || "General group chat"}
                        </p>
                        {group.lastMessage ? (
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold truncate mt-1">
                            <span className="font-extrabold">{group.lastMessage.sender?.name || "Member"}:</span> {group.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-medium italic mt-1">No messages yet</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                      <span className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold">{timeText}</span>
                      {group.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[9px] font-black tracking-tighter">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom disclaimer alert */}
          <div className="bg-[#7C3AED]/5 dark:bg-white/[0.02] border border-[#7C3AED]/10 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
            <FaInfoCircle className="text-base text-[#7C3AED] dark:text-[#38BDF8] shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-450 leading-relaxed font-semibold">
              Group chats help you stay connected with classmates, teachers, and school updates in one place.
            </p>
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 2: SCHOOL ADMIN SUPPORT */}
      {activeTab === "admin" && (
        <div className="flex flex-col md:flex-row border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0B132A] rounded-3xl overflow-hidden h-[50vh] divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-white/5">
          {/* Admin announcements (Left) */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-slate-50/20">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0B132A] select-none">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FaBroadcastTower className="text-teal-500" /> Admin Announcements
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {broadcastMessages.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs font-semibold select-none">
                  No announcements from Admin.
                </div>
              ) : (
                broadcastMessages.map((msg) => (
                  <div key={msg._id} className="bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-100/50">
                        Announcement
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Admin personal support conversation (Right) */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-[#0B132A] relative">
            {activeContact ? (
              <SupportChatEngine 
                activeContact={activeContact} 
                onBack={() => setActiveContact(null)} 
                userRole="student" 
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-400 text-xs font-semibold select-none">
                Admin support currently unavailable.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 3: MY TEACHERS CHAT */}
      {activeTab === "teachers" && (
        <div className="flex flex-col md:flex-row border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0B132A] rounded-3xl overflow-hidden h-[60vh]">
          {/* Teachers list and call logs pane (Left) */}
          <div className={`w-full md:w-1/3 border-r border-slate-100 dark:border-white/5 flex flex-col h-full bg-slate-50/50 dark:bg-[#0B132A] ${
            activeContact ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0B132A] flex gap-2 select-none">
              <button
                onClick={() => handleSubTabChange("personal")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black text-center border cursor-pointer transition-all ${
                  subTab === "personal"
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100"
                }`}
              >
                Teachers Directory
              </button>
              <button
                onClick={() => handleSubTabChange("calls")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black text-center border cursor-pointer transition-all ${
                  subTab === "calls"
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100"
                }`}
              >
                Calls
              </button>
            </div>

            {subTab === "personal" && (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-white/5">
                {teacherContacts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                    No teachers found.
                  </div>
                ) : (
                  teacherContacts.map((contact) => (
                    <button
                      key={contact._id}
                      onClick={() => setActiveContact(contact)}
                      className={`w-full p-4.5 text-left hover:bg-slate-100/60 dark:hover:bg-white/5 transition flex items-center gap-3 cursor-pointer ${
                        activeContact?._id === contact._id ? "bg-white dark:bg-white/5 border-l-4 border-[#7C3AED]" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0 relative">
                        {contact.name.charAt(0).toUpperCase()}
                        {contact.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full"></span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-850 dark:text-white truncate">{contact.name}</p>
                          {contact.unreadCount > 0 && (
                            <span className="bg-[#7C3AED] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                          {contact.lastMessage ? contact.lastMessage.content || "Media Attachment" : contact.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {subTab === "calls" && (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-white/5 bg-white dark:bg-[#0B132A]">
                {callsHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                    No call history found.
                  </div>
                ) : (
                  callsHistory.map((call) => {
                    const isOutgoing = call.caller?._id === currentUserId;
                    const partner = isOutgoing ? call.receiver : call.caller;
                    if (!partner) return null;
                    
                    const isMissed = call.status === "missed";
                    const isRejected = call.status === "rejected";
                    const isCompleted = call.status === "completed";

                    return (
                      <div
                        key={call._id}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition border-b border-slate-100/50 dark:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                            {partner.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{partner.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 select-none">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                isMissed || isRejected ? "text-rose-500" : isCompleted ? "text-green-500" : "text-amber-500"
                              }`}>
                                {isOutgoing ? "Outgoing" : "Incoming"} · {call.status}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                · {new Date(call.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-400 text-xs">
                          {call.type === "video" ? "🎥" : "📞"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Conversation view (Right) */}
          <div className={`flex-1 flex-col h-full bg-white dark:bg-[#0B132A] relative ${
            activeContact ? "flex" : "hidden md:flex"
          }`}>
            {subTab === "personal" ? (
              activeContact ? (
                <SupportChatEngine 
                  activeContact={activeContact} 
                  onBack={() => setActiveContact(null)} 
                  userRole="student" 
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                    <FaComments />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-wider">No Chat Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                    Select a teacher from the directory on the left to start messaging.
                  </p>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                  <FaPhone />
                </div>
                <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-wider">Calls History Log</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-semibold">
                  View call history in the sidebar on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY MODAL A: Create New Group Chat */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative select-none animate-fadeIn text-slate-800 dark:text-white">
            <button
              onClick={() => {
                setShowNewGroupModal(false);
                setNewGroupName("");
                setSelectedMembers([]);
              }}
              className="absolute top-4.5 right-4.5 text-slate-400 hover:text-slate-655 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center">
                <FaUsers className="text-sm" />
              </div>
              <h3 className="text-sm sm:text-base font-black">Create Group Chat</h3>
            </div>

            <form onSubmit={createGroupChat} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Project Group"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-1.5">Select Members</label>
                <div className="border border-slate-200 dark:border-white/10 rounded-xl max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-2">
                  {classmates.length === 0 ? (
                    <p className="text-[10px] text-slate-450 font-bold text-center py-6">No classmates found to invite.</p>
                  ) : (
                    classmates.map((student) => {
                      const isChecked = selectedMembers.includes(student._id);
                      return (
                        <label
                          key={student._id}
                          className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedMembers(current =>
                                current.includes(student._id)
                                  ? current.filter(id => id !== student._id)
                                  : [...current, student._id]
                              );
                            }}
                            className="rounded border-slate-300 dark:border-white/10 text-[#7C3AED] focus:ring-[#7C3AED]"
                          />
                          <span>{student.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl text-xs font-black transition cursor-pointer"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY MODAL B: Selected Group Chat Window */}
      {activeGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl h-[70vh] shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-slate-800 dark:text-white">
            
            {/* Header info */}
            <header className="p-4.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between select-none shrink-0 bg-slate-50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base ${activeGroup.avatarBg || "bg-[#7C3AED]/10 text-[#7C3AED]"}`}>
                  {activeGroup.avatarIcon || <FaUsers />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black truncate">{activeGroup.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                    {activeGroup.description || "Group discussion feed"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveGroup(null)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-xl transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </header>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-transparent">
              {groupMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 p-8 select-none">
                  <p className="text-xs font-bold uppercase tracking-wider">No Messages Yet</p>
                  <p className="text-[10px] text-slate-450 mt-1 max-w-xs font-semibold">
                    Type below and hit send to start conversation in {activeGroup.name}.
                  </p>
                </div>
              ) : (
                groupMessages.map((msg) => {
                  const isOwn = msg.sender?._id === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 mb-0.5 px-1">
                        {isOwn ? "You" : msg.sender?.name || "Member"}
                      </span>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        isOwn
                          ? "bg-[#7C3AED] text-white rounded-tr-none"
                          : "bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] text-slate-400 font-medium mt-0.5 px-1 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input footer */}
            <form onSubmit={sendGroupMessage} className="p-3 bg-white dark:bg-[#0B132A] border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Type a message..."
                value={groupMessageText}
                onChange={(e) => setGroupMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
              <button
                type="submit"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentSupport;
