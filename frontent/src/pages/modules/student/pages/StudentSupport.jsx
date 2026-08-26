import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { 
  FaComments, 
  FaUsers, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaSearch, 
  FaFilter, 
  FaInfoCircle, 
  FaPlus, 
  FaTimes, 
  FaPaperPlane,
  FaFileAlt,
  FaPhone,
  FaChevronRight
} from "react-icons/fa";
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
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    timeText: "10:25 AM",
    avatarBg: "bg-purple-955/15 text-purple-405 border border-purple-500/20",
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
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timeText: "Yesterday",
    avatarBg: "bg-blue-955/15 text-blue-400 border border-blue-500/20",
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
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeText: "2 Days Ago",
    avatarBg: "bg-emerald-955/15 text-emerald-400 border border-emerald-500/20",
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
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeText: "3 Days Ago",
    avatarBg: "bg-amber-955/15 text-amber-400 border border-amber-500/20",
    avatarIcon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    )
  }
];

const MOCK_TEACHERS = [
  {
    _id: "teacher-1",
    name: "Mrs. Anjali Sharma",
    subject: "Mathematics",
    status: "Available",
    education: "M.Sc. Mathematics, B.Ed.",
    experience: "8+ Years of Experience",
    lastMessage: "Hi Ishani, how can I help you today?",
    time: "10:45 AM",
    badgeBg: "bg-purple-955/15 text-purple-400 border border-purple-500/10",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "teacher-2",
    name: "Mr. Rahul Verma",
    subject: "Physics",
    status: "Available",
    education: "M.Sc. Physics, B.Ed.",
    experience: "6+ Years of Experience",
    lastMessage: "Feel free to ask any doubts.",
    time: "Yesterday",
    badgeBg: "bg-blue-955/15 text-blue-400 border border-blue-500/10",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "teacher-3",
    name: "Mrs. Priya Singh",
    subject: "English",
    status: "Available",
    education: "M.A. English, B.Ed.",
    experience: "7+ Years of Experience",
    lastMessage: "Let's work together to achieve your goals!",
    time: "Yesterday",
    badgeBg: "bg-emerald-955/15 text-emerald-400 border border-emerald-500/10",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "teacher-4",
    name: "Mr. Amit Kumar",
    subject: "Chemistry",
    status: "Busy",
    education: "M.Sc. Chemistry, B.Ed.",
    experience: "5+ Years of Experience",
    lastMessage: "I will reply as soon as I'm available.",
    time: "21 May 2024",
    badgeBg: "bg-amber-955/15 text-amber-400 border border-amber-500/10",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }
];

const MOCK_CALL_LOGS = [
  {
    _id: "cl-1",
    name: "Mrs. Anjali Sharma",
    role: "Mathematics Teacher",
    type: "Outgoing Call",
    typeColor: "text-green-555",
    icon: (
      <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    time: "10:45 AM",
    duration: "07:32",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "cl-2",
    name: "Mr. Rahul Verma",
    role: "Physics Teacher",
    type: "Incoming Call",
    typeColor: "text-blue-500",
    icon: (
      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    time: "Yesterday",
    duration: "06:18",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "cl-3",
    name: "Mrs. Priya Singh",
    role: "English Teacher",
    type: "Outgoing Call",
    typeColor: "text-green-555",
    icon: (
      <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    time: "Yesterday",
    duration: "12:21",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "cl-4",
    name: "Mr. Amit Kumar",
    role: "Chemistry Teacher",
    type: "Missed Call",
    typeColor: "text-rose-500",
    icon: (
      <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    time: "21 May 2024",
    duration: "--:--",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "cl-5",
    name: "School Admin Support",
    role: "Support Team",
    type: "Incoming Call",
    typeColor: "text-blue-500",
    icon: (
      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    time: "20 May 2024",
    duration: "04:05",
    avatar: "school"
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
  const [subTab, setSubTab] = useState("personal"); // personal (Teachers Directory), calls (Calls Log)
  const [callHistoryTab, setCallHistoryTab] = useState("history"); // history, contacts

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Unread
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Group chat lists & window
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupMessageText, setGroupMessageText] = useState("");

  // Create group modal states
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Admin Conversation Simulated Messages
  const [adminMessages, setAdminMessages] = useState([
    {
      _id: "admin-msg-init",
      sender: "admin",
      content: "Hello! 👋\nHow can I help you today?\nFeel free to ask any questions or share your concerns.",
      time: "11:28 AM"
    }
  ]);
  const [adminInputText, setAdminInputText] = useState("");

  // Teacher Chat Selected Overlay
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [teacherInputText, setTeacherInputText] = useState("");

  const messagesEndRef = useRef(null);
  const adminMessagesEndRef = useRef(null);
  const teacherMessagesEndRef = useRef(null);

  const userInitials = useMemo(() => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  useEffect(() => {
    fetchContacts();
    fetchGroupChats();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
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

  const scrollToBottom = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Group chat messaging handlers
  const sendGroupMessage = async (e) => {
    e.preventDefault();
    if (!groupMessageText.trim() || !activeGroup) return;

    if (activeGroup._id.startsWith("mock-")) {
      const mockMsg = {
        _id: `mock-msg-${Date.now()}`,
        sender: { _id: currentUserId, name: name },
        content: groupMessageText,
        createdAt: new Date().toISOString()
      };
      setGroupMessages(current => [...current, mockMsg]);
      setGroupMessageText("");
      scrollToBottom(messagesEndRef);
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
      scrollToBottom(messagesEndRef);
    } catch (err) {
      console.error("Could not send group message:", err);
    }
  };

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

  // Simulated School Admin Auto-Responder replies
  const handleAdminMessageSubmit = (e) => {
    if (e) e.preventDefault();
    if (!adminInputText.trim()) return;

    const studentMsg = {
      _id: `admin-std-${Date.now()}`,
      sender: "student",
      content: adminInputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdminMessages(prev => [...prev, studentMsg]);
    setAdminInputText("");
    scrollToBottom(adminMessagesEndRef);

    setTimeout(() => {
      const reply = {
        _id: `admin-rep-${Date.now()}`,
        sender: "admin",
        content: "Thank you for writing to us. A school support coordinator has been notified and will reply to your message shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdminMessages(prev => [...prev, reply]);
      scrollToBottom(adminMessagesEndRef);
    }, 1000);
  };

  const handleAdminQuickTopic = (topicName, simulatedText) => {
    const studentMsg = {
      _id: `admin-std-q-${Date.now()}`,
      sender: "student",
      content: `I need help with: ${topicName}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdminMessages(prev => [...prev, studentMsg]);
    scrollToBottom(adminMessagesEndRef);

    setTimeout(() => {
      const reply = {
        _id: `admin-rep-q-${Date.now()}`,
        sender: "admin",
        content: simulatedText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdminMessages(prev => [...prev, reply]);
      scrollToBottom(adminMessagesEndRef);
    }, 1000);
  };

  // Simulated Teacher Auto-Responder replies
  const handleTeacherMessageSubmit = (e) => {
    e.preventDefault();
    if (!teacherInputText.trim() || !activeTeacher) return;

    const studentMsg = {
      _id: `teach-std-${Date.now()}`,
      sender: "student",
      content: teacherInputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTeacherMessages(prev => [...prev, studentMsg]);
    setTeacherInputText("");
    scrollToBottom(teacherMessagesEndRef);

    setTimeout(() => {
      const reply = {
        _id: `teach-rep-${Date.now()}`,
        sender: "teacher",
        content: `Hi, thank you for your query. Let's discuss this doubt in detail during my next office hours. Be sure to review the chapters we covered today.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTeacherMessages(prev => [...prev, reply]);
      scrollToBottom(teacherMessagesEndRef);
    }, 1200);
  };

  const handleSelectTeacher = (teacher) => {
    setActiveTeacher(teacher);
    setTeacherMessages([
      {
        _id: `teach-init-${Date.now()}`,
        sender: "teacher",
        content: teacher.lastMessage,
        time: teacher.time
      }
    ]);
    scrollToBottom(teacherMessagesEndRef);
  };

  const classmates = useMemo(() => {
    return contacts.filter(c => c.role === "student" && c._id !== currentUserId);
  }, [contacts, currentUserId]);

  const displayGroups = useMemo(() => {
    const combined = [...groups];
    MOCK_GROUPS.forEach(mock => {
      if (!combined.some(g => g.name.toLowerCase() === mock.name.toLowerCase())) {
        combined.push(mock);
      }
    });

    return combined.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (g.lastMessage?.content || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === "All" || (filterType === "Unread" && g.unreadCount > 0);
      
      return matchesSearch && matchesFilter;
    });
  }, [groups, searchQuery, filterType]);

  const displayTeachers = useMemo(() => {
    return MOCK_TEACHERS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = subjectFilter === "All" || t.subject === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, subjectFilter]);

  const displayCallLogs = useMemo(() => {
    return MOCK_CALL_LOGS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
          onClick={() => { setActiveTab("groups"); setSearchQuery(""); }}
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
          onClick={() => { setActiveTab("admin"); setSearchQuery(""); }}
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
          onClick={() => { setActiveTab("teachers"); setSubTab("personal"); setSearchQuery(""); }}
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

          <div className="flex items-center justify-between px-1 select-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Group Chats</span>
            <button
              onClick={() => setShowNewGroupModal(true)}
              className="text-[10px] font-black text-[#7C3AED] dark:text-[#A78BFA] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FaPlus /> New Group Chat
            </button>
          </div>

          <div className="space-y-3">
            {displayGroups.map((group) => {
              const avatarBg = group.avatarBg || "bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20";
              const avatarIcon = group.avatarIcon || <FaUsers />;
              const timeText = group.timeText || new Date(group.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={group._id}
                  onClick={() => {
                    setActiveGroup(group);
                    if (!group._id.startsWith("mock-")) {
                      axios.get(`${API}/api/groups/${group._id}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                      }).then(res => setGroupMessages(res.data));
                    }
                  }}
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
                        <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold truncate mt-1">
                          <span className="font-extrabold">{group.lastMessage.sender?.name || "Member"}:</span> {group.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-medium italic mt-1">No messages yet</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                    <span className="text-[9px] text-slate-455 dark:text-slate-500 font-extrabold">{timeText}</span>
                    {group.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[9px] font-black tracking-tighter">
                        {group.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#7C3AED]/5 dark:bg-white/[0.02] border border-[#7C3AED]/10 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
            <FaInfoCircle className="text-base text-[#7C3AED] dark:text-[#38BDF8] shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-slate-555 dark:text-slate-455 leading-relaxed font-semibold">
              Group chats help you stay connected with classmates, teachers, and school updates in one place.
            </p>
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 2: SCHOOL ADMIN SUPPORT */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex items-center justify-between gap-4 relative">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA]">SCHOOL ADMIN SUPPORT</span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">Chat with School Admin</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                Need help? Our school admin team is here to assist you with quick and reliable support.
              </p>
            </div>

            <div className="shrink-0 text-center select-none flex flex-col items-center">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Admin Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-[#0B132A]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-green-555 mt-1.5">Online</span>
              <span className="text-[7px] font-bold text-slate-400 mt-0.5">Replies in minutes</span>
            </div>
          </div>

          <div className="space-y-3 select-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quick Help Topics</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => handleAdminQuickTopic("Admission Related Queries", "For admissions, application review takes 24-48 hours. Please check your Status page.")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-slate-805 dark:text-slate-200">Admission Related Queries</span>
                </div>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
              </div>

              <div 
                onClick={() => handleAdminQuickTopic("Academic Information", "Your class routines, exams schedule, and syllabus are loaded in the Subjects & Exams tabs.")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <FaGraduationCap className="text-lg" />
                  </div>
                  <span className="text-xs font-black text-slate-805 dark:text-slate-200">Academic Information</span>
                </div>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
              </div>

              <div 
                onClick={() => handleAdminQuickTopic("Fee & Payment Support", "All payments can be processed online. For invoices, please contact finance@teachhub.com.")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0 text-base font-black">
                    ₹
                  </div>
                  <span className="text-xs font-black text-slate-805 dark:text-slate-200">Fee & Payment Support</span>
                </div>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
              </div>

              <div 
                onClick={() => handleAdminQuickTopic("Technical Issues", "If experiencing video stream lag, please refresh the webpage or check bandwidth connectivity.")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-[#7C3AED]/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-slate-805 dark:text-slate-200">Technical Issues</span>
                </div>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start a conversation</span>
            
            <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
              {adminMessages.map((msg) => {
                const isOwn = msg.sender === "student";
                return (
                  <div key={msg._id} className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}>
                    {!isOwn && (
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                        alt="Admin Avatar" 
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                      />
                    )}
                    <div className="flex flex-col max-w-[78%]">
                      <div className={`p-4 rounded-2.5xl text-xs font-semibold leading-relaxed whitespace-pre-wrap shadow-sm ${
                        isOwn 
                          ? "bg-[#7C3AED] text-white rounded-tr-none" 
                          : "bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-white/5"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={adminMessagesEndRef} />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => handleAdminQuickTopic("General Query", "How can I help you today? Please type your request in the box below.")}
                className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 text-[10px] font-bold py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <FaComments className="text-[#7C3AED]" /> Ask a Question
              </button>
              <button 
                onClick={() => handleAdminQuickTopic("Raise Request", "To request school certificate or leave letter, please fill out the forms inside Profile desk.")}
                className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 text-[10px] font-bold py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <FaFileAlt className="text-[#7C3AED]" /> Raise a Request
              </button>
              <button 
                onClick={() => handleAdminQuickTopic("Request Call", "A coordinator will schedule a callback at your registered phone number. Expect a call by tomorrow afternoon.")}
                className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 text-[10px] font-bold py-2 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <FaPhone className="text-[#7C3AED]" /> Request a Call
              </button>
            </div>

            <form onSubmit={handleAdminMessageSubmit} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={adminInputText}
                  onChange={(e) => setAdminInputText(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-800 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                />
                
                <button 
                  type="button"
                  onClick={() => alert("Upload file attachments.")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </div>

          <div className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
            <FaInfoCircle className="text-base text-[#38BDF8] shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Our school admin team is available during school working hours (Mon - Sat, 9:00 AM to 5:00 PM).
            </p>
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* VIEW 3: MY TEACHERS CHAT */}
      {activeTab === "teachers" && (
        <div className="space-y-6">
          
          {/* Sub-tab Pill Row Selector (Teachers Directory, Calls) */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl select-none max-w-xs">
            <button
              onClick={() => { setSubTab("personal"); setSearchQuery(""); }}
              className={`flex-1 py-2 text-center text-[10px] font-black rounded-lg cursor-pointer transition ${
                subTab === "personal"
                  ? "bg-white dark:bg-[#0B132A] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Teachers Directory
            </button>
            <button
              onClick={() => { setSubTab("calls"); setSearchQuery(""); }}
              className={`flex-1 py-2 text-center text-[10px] font-black rounded-lg cursor-pointer transition ${
                subTab === "calls"
                  ? "bg-white dark:bg-[#0B132A] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Calls
            </button>
          </div>

          {/* ======================= */}
          {/* SUB-VIEW 1: TEACHERS DIRECTORY */}
          {subTab === "personal" && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header Description block */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex items-center justify-between gap-4 relative select-none">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA]">TEACHERS</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">Teachers Directory</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                    Explore our experienced and dedicated teachers. Connect with them for guidance and support.
                  </p>
                </div>

                {/* Right Open book graphic SVG */}
                <div className="w-16 h-16 shrink-0 relative flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <svg className="w-12 h-12 text-[#7C3AED] dark:text-purple-900/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {/* User profile outline sitting beside */}
                  <div className="absolute right-0 bottom-0 bg-[#7C3AED] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                    👤
                  </div>
                </div>
              </div>

              {/* Search & Subject filter dropdown */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by name, subject or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="relative shrink-0">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white py-3 pl-9 pr-8 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                </div>
              </div>

              {/* Teachers list details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 select-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teachers List</span>
                  <span className="text-[10px] font-black text-slate-455 dark:text-slate-500">Total Teachers: {displayTeachers.length}</span>
                </div>

                {displayTeachers.map((teacher) => {
                  const isAvailable = teacher.status === "Available";
                  return (
                    <div 
                      key={teacher._id}
                      className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 rounded-2.5xl p-4.5 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0 select-none">
                          <img src={teacher.avatar} alt={teacher.name} className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-white/5" />
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0B132A] ${
                            isAvailable ? "bg-green-500" : "bg-gray-400"
                          }`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-2 select-none">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                              {teacher.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${teacher.badgeBg}`}>
                              {teacher.subject}
                            </span>
                            <span className={`text-[8px] font-black flex items-center gap-1 ${isAvailable ? "text-green-555" : "text-slate-400"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} /> {teacher.status}
                            </span>
                          </div>
                          
                          {/* Education & Experience info */}
                          <div className="flex flex-col gap-0.5 mt-2 text-[10px] text-slate-450 dark:text-slate-400 font-extrabold select-none">
                            <span className="flex items-center gap-1.5">
                              <span className="text-xs">🎓</span> {teacher.education}
                            </span>
                            <span className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-amber-500">⭐</span> {teacher.experience}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Message CTA button */}
                      <button
                        onClick={() => handleSelectTeacher(teacher)}
                        className="bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 dark:border-[#38BDF8]/20 dark:hover:border-[#38BDF8]/40 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] py-2 px-4.5 rounded-xl font-black transition cursor-pointer flex items-center gap-1.5 select-none"
                      >
                        <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom can't find teacher CTA banner */}
              <div 
                onClick={() => handleTabChange("admin")}
                className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer hover:border-[#7C3AED]/20 transition select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0 text-sm font-bold">
                    i
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200">Can't find a teacher?</h5>
                    <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">Contact your school admin for more information.</p>
                  </div>
                </div>
                <FaChevronRight className="text-slate-400 text-xs shrink-0" />
              </div>

            </div>
          )}

          {/* ======================= */}
          {/* SUB-VIEW 2: CALLS LOG */}
          {subTab === "calls" && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header Description block */}
              <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex items-center justify-between gap-4 relative select-none">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA]">CALLS</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">Calls / Call History</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                    View your recent calls and connect with your teachers or school admin.
                  </p>
                </div>

                {/* Right large Phone handset icon bubble */}
                <div className="w-16 h-16 rounded-full bg-violet-600/10 text-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/5 relative">
                  <svg className="w-8 h-8 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>

              {/* Quick Actions (New Call / Video Call Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                <div 
                  onClick={() => alert("Initiating Voice call selection...")}
                  className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                      <FaPhone className="text-sm" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-805 dark:text-white">New Call</h4>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">Make a new call to any contact</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
                </div>

                <div 
                  onClick={() => alert("Initiating Video call selection...")}
                  className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 p-4.5 rounded-2.5xl flex items-center justify-between cursor-pointer transition shadow-sm group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                      {/* Video camera SVG */}
                      <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-805 dark:text-white">Video Call</h4>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">Start a video call with any contact</p>
                    </div>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
                </div>
              </div>

              {/* Sub-tab pills (Call History, Contacts) */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl select-none max-w-xs">
                <button
                  onClick={() => setCallHistoryTab("history")}
                  className={`flex-1 py-2 text-center text-[10px] font-black rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    callHistoryTab === "history"
                      ? "bg-white dark:bg-[#0B132A] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <FaClock className="text-[9px]" /> Call History
                </button>
                <button
                  onClick={() => setCallHistoryTab("contacts")}
                  className={`flex-1 py-2 text-center text-[10px] font-black rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    callHistoryTab === "contacts"
                      ? "bg-white dark:bg-[#0B132A] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  👤 Contacts
                </button>
              </div>

              {/* Logs block */}
              {callHistoryTab === "history" ? (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Today</span>
                  
                  {displayCallLogs.map((log) => {
                    const isSchoolAdmin = log.avatar === "school";
                    return (
                      <div 
                        key={log._id}
                        className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] hover:border-purple-500/20 rounded-2.5xl p-4.5 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Avatar icon */}
                          <div className="shrink-0 select-none">
                            {isSchoolAdmin ? (
                              <div className="w-11 h-11 rounded-full bg-purple-950/15 border border-purple-500/10 text-purple-400 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            ) : (
                              <img src={log.avatar} alt={log.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-white/5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                              {log.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-extrabold mt-0.5">{log.role}</p>
                            
                            {/* Direction type badge */}
                            <div className="flex items-center gap-1 mt-2 select-none">
                              {log.icon}
                              <span className={`text-[9px] font-black uppercase tracking-wider ${log.typeColor}`}>
                                {log.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Call CTA buttons (Right) */}
                        <div className="flex items-center gap-3 select-none ml-3 shrink-0">
                          <div className="flex flex-col items-end gap-0.5 text-right mr-1">
                            <span className="text-[9px] text-slate-455 dark:text-slate-500 font-extrabold">{log.time}</span>
                            <span className="text-[8px] text-slate-400 font-black font-mono">{log.duration}</span>
                          </div>

                          {/* Dial receiver icon */}
                          <button 
                            onClick={() => alert(`Dialing ${log.name}...`)}
                            className="w-9 h-9 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 border border-purple-500/20 hover:border-purple-500/40 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center transition cursor-pointer"
                          >
                            <FaPhone className="text-xs" />
                          </button>

                          {/* Options dots */}
                          <button className="text-slate-400 hover:text-slate-655 p-1 rounded transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs font-semibold select-none bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6">
                  No contacts found. Use the search to query directory.
                </div>
              )}

              {/* End-to-end encrypted notification banner */}
              <div className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2.5xl flex items-start gap-3 select-none">
                <FaInfoCircle className="text-base text-[#38BDF8] shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Calls are end-to-end encrypted for your privacy and security.
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY MODAL A: Create New Group Chat */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 dark:text-slate-400 mb-1.5">Select Members</label>
                <div className="border border-slate-200 dark:border-white/10 rounded-xl max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-2">
                  {classmates.length === 0 ? (
                    <p className="text-[10px] text-slate-455 font-bold text-center py-6">No classmates found to invite.</p>
                  ) : (
                    classmates.map((student) => {
                      const isChecked = selectedMembers.includes(student._id);
                      return (
                        <label
                          key={student._id}
                          className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-355"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl h-[70vh] shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-slate-800 dark:text-white">
            
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
                onClick={() => {
                  setActiveGroup(null);
                  setGroupMessages([]);
                }}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-xl transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </header>

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
                      <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-500 mb-0.5 px-1">
                        {isOwn ? "You" : msg.sender?.name || "Member"}
                      </span>
                      <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                        isOwn
                          ? "bg-[#7C3AED] text-white rounded-tr-none"
                          : "bg-slate-100 dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-sm"
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

      {/* ======================================= */}
      {/* OVERLAY MODAL C: Teacher Chat Window */}
      {activeTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl h-[70vh] shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-slate-800 dark:text-white">
            
            <header className="p-4.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between select-none shrink-0 bg-slate-50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3 min-w-0">
                <img src={activeTeacher.avatar} alt={activeTeacher.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/5 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black truncate">{activeTeacher.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${activeTeacher.badgeBg}`}>
                      {activeTeacher.subject}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">● {activeTeacher.status}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTeacher(null);
                  setTeacherMessages([]);
                }}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-2 rounded-xl transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-transparent">
              {teacherMessages.map((msg) => {
                const isOwn = msg.sender === "student";
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-500 mb-0.5 px-1">
                      {isOwn ? "You" : activeTeacher.name}
                    </span>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed whitespace-pre-wrap ${
                      isOwn
                        ? "bg-[#7C3AED] text-white rounded-tr-none"
                        : "bg-slate-100 dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/5 text-slate-900 dark:text-slate-200 rounded-tl-none shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] text-slate-400 font-medium mt-0.5 px-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={teacherMessagesEndRef} />
            </div>

            <form onSubmit={handleTeacherMessageSubmit} className="p-3 bg-white dark:bg-[#0B132A] border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder={`Ask ${activeTeacher.name} a doubt...`}
                value={teacherInputText}
                onChange={(e) => setTeacherInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-900 dark:text-white focus:outline-none focus:border-[#7C3AED]"
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
