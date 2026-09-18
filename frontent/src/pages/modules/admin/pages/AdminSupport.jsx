import { useEffect, useState } from "react";
import axios from "axios";
import { FaBroadcastTower, FaComments, FaPhone, FaTicketAlt } from "react-icons/fa";
import { useCall } from "../../../../context/CallContext";
import SupportChatEngine from "../../../../components/SupportChatEngine";
import CreateSupportTicketModal from "../../../../components/CreateSupportTicketModal";
import API_URL from "../../../../config/api";

export default function AdminSupport() {
  const API = API_URL;
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("superadmin"); // superadmin, teachers, students
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [subTab, setSubTab] = useState("personal"); // personal, broadcast, calls
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [newBroadcast, setNewBroadcast] = useState("");
  const [callsHistory, setCallsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const callCtx = useCall() || {};
  const socket = callCtx.socket;

  const DEFAULT_SUPERADMIN = {
    _id: "superadmin_support_fallback",
    name: "Super Admin Support",
    email: "support@teachhub.com",
    role: "superadmin",
    schoolName: "TeachHub HQ",
    isOnline: true,
    avatar: ""
  };

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
      
      const superAdmin = res.data.find(c => c.role?.toLowerCase() === "superadmin") || DEFAULT_SUPERADMIN;
      if (activeTab === "superadmin") {
        setActiveContact(superAdmin);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      if (activeTab === "superadmin") {
        setActiveContact(DEFAULT_SUPERADMIN);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcastHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/history?broadcasts=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const targetRole = activeTab === "teachers" ? "teacher" : "student";
      const filtered = res.data.filter(msg => msg.targetRole === targetRole);
      setBroadcastMessages(filtered);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    } finally {
      setLoading(false);
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
    setNewBroadcast("");

    if (tab === "superadmin") {
      const superAdmin = contacts.find(c => c.role?.toLowerCase() === "superadmin") || DEFAULT_SUPERADMIN;
      setActiveContact(superAdmin);
    } else {
      setSubTab("personal");
    }
  };

  const handleSubTabChange = (sub) => {
    setSubTab(sub);
    if (sub === "broadcast") {
      fetchBroadcastHistory();
    } else if (sub === "calls") {
      fetchCallsHistory();
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!newBroadcast.trim() || sending) return;

    const targetRole = activeTab === "teachers" ? "teacher" : "student";
    setSending(true);
    try {
      await axios.post(
        `${API}/api/support/message`,
        {
          type: "broadcast",
          targetRole,
          content: newBroadcast
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBroadcast("");
      fetchBroadcastHistory();
      alert("Broadcast sent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const getFilteredContacts = () => {
    if (activeTab === "teachers") {
      return contacts.filter(c => c.role?.toLowerCase() === "teacher");
    }
    if (activeTab === "students") {
      return contacts.filter(c => c.role?.toLowerCase() === "student");
    }
    return [];
  };

  const filteredContacts = getFilteredContacts();

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#1f2937]/50 p-1.5 sm:p-2 gap-1.5 sm:gap-2 select-none shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { key: "superadmin", label: "Super Admin Support" },
            { key: "teachers", label: "Teachers Chat" },
            { key: "students", label: "Students Chat" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
                  : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.02] dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <FaTicketAlt className="text-xs" />
          <span>+ Create Support Ticket</span>
        </button>
      </div>

      <CreateSupportTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />

      {/* Main Support Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Super Admin Tab */}
        {activeTab === "superadmin" && (
          <div className="flex-1 flex h-full bg-white dark:bg-[#111827] relative">
            <SupportChatEngine 
              activeContact={activeContact || DEFAULT_SUPERADMIN} 
              onBack={() => setActiveContact(null)} 
              userRole="admin" 
            />
          </div>
        )}

        {/* Teachers and Students Tab */}
        {activeTab !== "superadmin" && (
          <div className="flex-1 flex">
            {/* Sidebar Contact list */}
            <div className={`w-full lg:w-1/3 border-r border-slate-200/80 dark:border-white/[0.05] flex flex-col h-full bg-slate-50/50 dark:bg-[#111827]/50 ${
              activeContact ? "hidden lg:flex" : "flex"
            }`}>
              <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.05] bg-white dark:bg-[#111827] flex gap-2 select-none">
                <button
                  onClick={() => handleSubTabChange("personal")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold text-center border transition cursor-pointer ${
                    subTab === "personal"
                      ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-white/[0.02] dark:text-slate-400 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => handleSubTabChange("broadcast")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold text-center border transition cursor-pointer ${
                    subTab === "broadcast"
                      ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-white/[0.02] dark:text-slate-400 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  Broadcast
                </button>
                <button
                  onClick={() => handleSubTabChange("calls")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold text-center border transition cursor-pointer ${
                    subTab === "calls"
                      ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-white/[0.02] dark:text-slate-400 dark:border-white/[0.05] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  Calls
                </button>
              </div>

              {subTab === "personal" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      {loading ? "Loading..." : "No contacts found."}
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <div
                        key={contact._id}
                        onClick={() => setActiveContact(contact)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                          activeContact?._id === contact._id 
                            ? "bg-[#7C3AED]/10 text-[#7C3AED]" 
                            : "hover:bg-slate-100/60 dark:hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm overflow-hidden">
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                              ) : (
                                contact.name?.charAt(0).toUpperCase() || "U"
                              )}
                            </div>
                            {contact.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111827]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{contact.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{contact.role}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {subTab === "broadcast" && (
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                      <FaBroadcastTower className="text-[#7C3AED]" />
                      Broadcast to {activeTab === "teachers" ? "Teachers" : "Students"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                      Send an announcement broadcast message to all active {activeTab}.
                    </p>
                    <textarea
                      rows={4}
                      value={newBroadcast}
                      onChange={(e) => setNewBroadcast(e.target.value)}
                      placeholder="Write broadcast message..."
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1f2937] text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                    />
                  </div>
                  <button
                    onClick={handleSendBroadcast}
                    disabled={sending || !newBroadcast.trim()}
                    className="w-full mt-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-[#7C3AED]/15 cursor-pointer"
                  >
                    {sending ? "Sending..." : "Send Announcement Broadcast"}
                  </button>
                </div>
              )}

              {subTab === "calls" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {callsHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold select-none">
                      {loading ? "Loading call logs..." : "No past call logs."}
                    </div>
                  ) : (
                    callsHistory.map((call) => {
                      const isCaller = call.caller?._id === currentUserId;
                      const partner = isCaller ? call.receiver : call.caller;
                      const isCompleted = call.status === "completed";
                      return (
                        <div key={call._id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[#7C3AED] flex items-center justify-center text-xs font-bold">
                              {partner?.name ? partner.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{partner?.name || "User"}</p>
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                {isCaller ? "Outgoing" : "Incoming"} • {new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {isCompleted && call.duration > 0 && (
                                <p className="text-[9px] text-slate-400 font-semibold font-mono mt-0.5">
                                  Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                </p>
                              )}
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

            {/* Chat area */}
            <div className={`flex-1 flex-col h-full bg-white dark:bg-[#111827] relative ${
              activeContact ? "flex" : "hidden lg:flex"
            }`}>
              {subTab === "personal" ? (
                activeContact ? (
                  <SupportChatEngine 
                    activeContact={activeContact} 
                    onBack={() => setActiveContact(null)} 
                    userRole="admin" 
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 dark:bg-transparent">
                    <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                      <FaComments />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">No Contact Selected</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-xs leading-relaxed">
                      Select a contact from the list on the left to view conversation and start messaging.
                    </p>
                  </div>
                )
              ) : subTab === "broadcast" ? (
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Broadcast Log History</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {broadcastMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                        No broadcast messages sent yet.
                      </div>
                    ) : (
                      broadcastMessages.map((msg) => (
                        <div key={msg._id} className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] rounded-2xl p-4 shadow-sm relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/[0.03] pb-2 mb-2 select-none">
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-teal-600 uppercase bg-teal-50 dark:bg-teal-500/10 px-1.5 py-0.5 rounded">
                              Broadcast
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                              {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-sans">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Call history default display placeholder when on calls tab */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 dark:bg-transparent">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                    <FaPhone />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Calls History Log</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-xs leading-relaxed">
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
