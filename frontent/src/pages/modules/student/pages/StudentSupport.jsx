import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  FaBroadcastTower, 
  FaComments, 
  FaPhone, 
  FaSearch, 
  FaUsers,
  FaVideo
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCall } from "../../../../context/CallContext";
import SupportChatEngine from "../../../../components/SupportChatEngine";

const SORA = "'Sora', sans-serif";

function StudentSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("admin"); // admin, teachers
  const [subTab, setSubTab] = useState("personal"); // personal, broadcast, calls
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [callsHistory, setCallsHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const callCtx = useCall() || {};
  const socket = callCtx.socket;

  const DEFAULT_SUPER_ADMIN = {
    _id: "superadmin_support_fallback",
    name: "TeachHub Super Admin Support",
    email: "superadmin@teachhub.com",
    role: "superadmin",
    schoolName: "TeachHub Platform HQ",
    isOnline: true,
    avatar: ""
  };

  const adminContacts = useMemo(() => {
    const list = contacts
      .filter(c => c.role?.toLowerCase() === "superadmin")
      .map(c => ({
        ...c,
        avatar: c.avatar || c.photo || c.profilePhoto || ""
      }));
    if (list.length === 0) {
      return [DEFAULT_SUPER_ADMIN];
    }
    return list;
  }, [contacts]);

  useEffect(() => {
    fetchContacts();

    const handleCallHistoryUpdate = () => {
      fetchCallsHistory();
    };
    window.addEventListener("call:history-updated", handleCallHistoryUpdate);
    return () => {
      window.removeEventListener("call:history-updated", handleCallHistoryUpdate);
    };
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
      
      const foundSuper = res.data.find(c => c.role?.toLowerCase() === "superadmin");
      const superAdmin = foundSuper ? {
        ...foundSuper,
        avatar: foundSuper.avatar || foundSuper.photo || foundSuper.profilePhoto || ""
      } : DEFAULT_SUPER_ADMIN;

      if (activeTab === "admin") {
        setActiveContact(superAdmin);
        fetchBroadcastHistory();
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      if (activeTab === "admin") {
        setActiveContact(DEFAULT_SUPER_ADMIN);
      }
    } finally {
      setLoading(false);
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
    setBroadcastMessages([]);
    setSubTab("personal");

    if (tab === "admin") {
      const superAdmin = adminContacts[0] || DEFAULT_SUPER_ADMIN;
      setActiveContact(superAdmin);
      fetchBroadcastHistory();
    }
  };

  const handleSubTabChange = (sub) => {
    setSubTab(sub);
    if (sub === "calls") {
      fetchCallsHistory();
    }
  };

  const teacherContacts = useMemo(() => {
    return contacts
      .filter(c => c.role?.toLowerCase() === "teacher")
      .filter(c => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.subject?.toLowerCase().includes(q)
        );
      });
  }, [contacts, searchQuery]);

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-130px)] min-h-[500px] bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl overflow-hidden shadow-sm" style={{ fontFamily: SORA }}>
      {/* Top Header & Tab bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#111827] p-2 sm:p-2.5 gap-2 select-none shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleTabChange("admin")}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "admin"
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
                : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Super Admin Support
          </button>
          <button
            onClick={() => handleTabChange("teachers")}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "teachers"
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
                : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            My Teachers Chat
          </button>
        </div>

        {/* Action Button: Make Group */}
        <Link 
          to="/student/support/groups" 
          className="rounded-xl bg-[#7C3AED] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition shrink-0 ml-auto flex items-center gap-1.5"
        >
          <FaUsers className="text-xs" />
          <span>+ Make Group</span>
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* If Active Tab is Admin Support */}
        {activeTab === "admin" && (
          <div className="flex-1 flex flex-col md:flex-row md:divide-x divide-slate-100 dark:divide-white/[0.05] overflow-hidden min-h-0">
            {/* Mobile Sub-tabs for Admin Announcements vs Personal Chat */}
            <div className="md:hidden flex border-b border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#111827] p-1.5 gap-1 select-none shrink-0">
              <button
                type="button"
                onClick={() => setSubTab("broadcast")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  subTab === "broadcast"
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                }`}
              >
                📢 Announcements
              </button>
              <button
                type="button"
                onClick={() => setSubTab("personal")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  subTab === "personal"
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]"
                }`}
              >
                💬 Super Admin Chat
              </button>
            </div>

            {/* Broadcast lists (Left on desktop, toggled on mobile) */}
            <div className={`w-full md:w-5/12 flex-col h-full bg-slate-50/20 dark:bg-[#111827]/40 select-none min-h-0 ${
              subTab === "broadcast" ? "flex" : "hidden md:flex"
            }`}>
              <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#111827] shrink-0">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FaBroadcastTower className="text-teal-500" /> System Announcements
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {broadcastMessages.length === 0 ? (
                  <div className="py-12 md:py-20 text-center text-slate-400 text-xs font-semibold">
                    No announcements from Admin.
                  </div>
                ) : (
                  broadcastMessages.map((msg) => (
                    <div key={msg._id} className="bg-white dark:bg-[#1f2937] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.03] pb-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold text-teal-600 uppercase bg-teal-50 px-1.5 py-0.5 rounded">
                          Announcement
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Personal Super Admin Chat */}
            <div className={`w-full md:w-7/12 flex-col h-full bg-white dark:bg-[#111827] relative min-h-0 ${
              subTab === "personal" ? "flex" : "hidden md:flex"
            }`}>
              {/* Super Admin Support Header Bar */}
              <div className="p-2.5 sm:p-3 border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/70 dark:bg-[#0B132A] flex items-center justify-between select-none shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {activeContact?.name || DEFAULT_SUPER_ADMIN.name}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm">
                    Super Admin
                  </span>
                </div>
                {adminContacts.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {adminContacts.map((adm) => (
                      <button
                        key={adm._id}
                        onClick={() => setActiveContact(adm)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                          activeContact?._id === adm._id
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {adm.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <SupportChatEngine 
                activeContact={activeContact || adminContacts[0] || DEFAULT_SUPER_ADMIN} 
                onBack={() => setActiveContact(null)} 
                userRole="student" 
              />
            </div>
          </div>
        )}

        {/* If Active Tab is Teachers Chat */}
        {activeTab === "teachers" && (
          <div className="flex-1 flex">
            {/* Teacher list sidebar */}
            <div className={`w-full md:w-1/3 border-r border-slate-100 dark:border-white/[0.05] flex flex-col h-full bg-slate-50/50 dark:bg-[#111827] ${
              activeContact ? "hidden md:flex" : "flex"
            }`}>
              <div className="p-3 border-b border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#111827] flex flex-col gap-2 select-none">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubTabChange("personal")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                      subTab === "personal"
                        ? "bg-slate-800 dark:bg-purple-650 text-white border-slate-800 dark:border-purple-650"
                        : "bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-450 border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    Teachers Directory
                  </button>
                  <button
                    onClick={() => handleSubTabChange("calls")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                      subTab === "calls"
                        ? "bg-slate-800 dark:bg-purple-650 text-white border-slate-800 dark:border-purple-650"
                        : "bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-450 border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    Calls Log
                  </button>
                </div>

                {subTab === "personal" && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search teachers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1f2937] text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  </div>
                )}
              </div>

              {subTab === "personal" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-white/[0.03]">
                  {teacherContacts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                      {loading ? "Loading teachers..." : "No teachers found."}
                    </div>
                  ) : (
                    teacherContacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => setActiveContact(contact)}
                        className={`w-full p-4 text-left transition flex items-center gap-3 cursor-pointer ${
                          activeContact?._id === contact._id 
                            ? "bg-white dark:bg-white/[0.02] border-l-4 border-[#7C3AED]" 
                            : "hover:bg-slate-100/60 dark:hover:bg-white/[0.01]"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0 relative">
                          {contact.avatar ? (
                            <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            contact.name ? contact.name.charAt(0).toUpperCase() : "T"
                          )}
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#111827] rounded-full"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{contact.name}</p>
                            {contact.unreadCount > 0 && (
                              <span className="bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {contact.lastMessage ? contact.lastMessage.content || "Media Attachment" : (contact.subject || contact.email)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {subTab === "calls" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-white/[0.03] bg-white dark:bg-[#111827]">
                  {callsHistory.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                      {loading ? "Loading calls..." : "No call history found."}
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
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition border-b border-slate-100/50 dark:border-white/[0.03]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                              {partner.name ? partner.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{partner.name}</p>
                              <div className="flex items-center gap-1 mt-0.5 select-none">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                  isMissed || isRejected ? "text-rose-500" : isCompleted ? "text-green-500" : "text-amber-500"
                                }`}>
                                  {isOutgoing ? "Outgoing" : "Incoming"} · {call.status}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                  · {new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {isCompleted && call.duration > 0 && (
                                <p className="text-[9px] text-slate-400 font-semibold font-mono mt-0.5">
                                  Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs">
                            {call.type === "video" ? <FaVideo className="text-purple-500" /> : <FaPhone className="text-[#7C3AED]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Chat Area / Chat Engine */}
            <div className={`flex-1 flex-col h-full bg-white dark:bg-[#111827] relative ${
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
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 dark:bg-white/[0.01] select-none">
                    <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                      <FaComments />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">No Teacher Selected</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Select a teacher from the directory on the left to start real-time messaging and voice/video calling.
                    </p>
                  </div>
                )
              ) : (
                /* Calls tab default Display placeholder */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 dark:bg-white/[0.01] select-none">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                    <FaPhone />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider">Calls History Log</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    View call history in the sidebar on the left. Dial voice or video calls inside active conversation windows.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentSupport;
