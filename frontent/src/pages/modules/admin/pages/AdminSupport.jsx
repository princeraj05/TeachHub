import { useEffect, useState } from "react";
import axios from "axios";
import { FaBroadcastTower, FaComments, FaPhone } from "react-icons/fa";
import SupportChatEngine from "../../../../components/SupportChatEngine";

function AdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("superadmin"); // superadmin, teachers, students
  const [subTab, setSubTab] = useState("personal"); // personal, broadcast, calls

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [callsHistory, setCallsHistory] = useState([]);
  const [newBroadcast, setNewBroadcast] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

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

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
      
      const superAdmin = res.data.find(c => c.role === "superadmin");
      if (superAdmin && activeTab === "superadmin") {
        setActiveContact(superAdmin);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
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
      const superAdmin = contacts.find(c => c.role === "superadmin");
      if (superAdmin) {
        setActiveContact(superAdmin);
      }
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
      return contacts.filter(c => c.role === "teacher");
    }
    if (activeTab === "students") {
      return contacts.filter(c => c.role === "student");
    }
    return [];
  };

  const filteredContacts = getFilteredContacts();

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 select-none">
        {[
          { key: "superadmin", label: "Super Admin Support" },
          { key: "teachers", label: "Teachers Chat" },
          { key: "students", label: "Students Chat" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
                : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Support Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Super Admin Tab */}
        {activeTab === "superadmin" && (
          <div className="flex-1 flex h-full bg-white relative">
            {activeContact ? (
              <SupportChatEngine 
                activeContact={activeContact} 
                onBack={() => setActiveContact(null)} 
                userRole="admin" 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                <p className="text-xs text-slate-400 font-semibold">Super Admin is currently unavailable.</p>
              </div>
            )}
          </div>
        )}

        {/* Teachers and Students Tab */}
        {activeTab !== "superadmin" && (
          <div className="flex-1 flex">
            {/* Sidebar Contact list */}
            <div className={`w-full lg:w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50 ${
              activeContact ? "hidden lg:flex" : "flex"
            }`}>
              <div className="p-3 border-b border-slate-100 bg-white flex gap-2 select-none">
                <button
                  onClick={() => handleSubTabChange("personal")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                    subTab === "personal"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => handleSubTabChange("broadcast")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                    subTab === "broadcast"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Broadcasts
                </button>
                <button
                  onClick={() => handleSubTabChange("calls")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                    subTab === "calls"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Calls
                </button>
              </div>

              {subTab === "personal" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
                  {filteredContacts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                      No {activeTab} found in your school.
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => setActiveContact(contact)}
                        className={`w-full p-4 text-left hover:bg-slate-100/60 transition flex items-center gap-3 cursor-pointer ${
                          activeContact?._id === contact._id ? "bg-white border-l-4 border-[#7C3AED]" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0 relative">
                          {contact.name.charAt(0).toUpperCase()}
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-700 truncate">{contact.name}</p>
                            {contact.unreadCount > 0 && (
                              <span className="bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {contact.lastMessage ? contact.lastMessage.content || "Media Attachment" : contact.email}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {subTab === "broadcast" && (
                <div className="p-4 flex flex-col h-full bg-white">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                    <FaBroadcastTower className="text-teal-500" /> Send Broadcast
                  </h3>
                  <form onSubmit={handleSendBroadcast} className="space-y-3">
                    <textarea
                      placeholder={`Type announcement to all ${activeTab}...`}
                      value={newBroadcast}
                      onChange={(e) => setNewBroadcast(e.target.value)}
                      rows={4}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!newBroadcast.trim() || sending}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs tracking-wider transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <FaBroadcastTower /> Send Broadcast
                    </button>
                  </form>
                </div>
              )}

              {subTab === "calls" && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 bg-white">
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
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition border-b border-slate-100/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                              {partner.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{partner.name}</p>
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
                            {call.type === "video" ? "🎥" : "📞"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Messaging Area / Chat Engine */}
            <div className={`flex-1 flex-col h-full bg-white relative ${
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
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                    <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                      <FaPhone />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Chat Selected</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Select a {activeTab === "teachers" ? "teacher" : "student"} from the list on the left to start support messaging.
                    </p>
                  </div>
                )
              ) : subTab === "broadcast" ? (
                /* Broadcast messages view */
                <div className="flex-1 flex flex-col h-full bg-white relative">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FaBroadcastTower className="text-teal-500" /> Sent Broadcasts to {activeTab}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                    {broadcastMessages.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                        No broadcasts sent yet.
                      </div>
                    ) : (
                      broadcastMessages.map((msg) => (
                        <div key={msg._id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2 select-none">
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-teal-600 uppercase bg-teal-50 px-1.5 py-0.5 rounded">
                              Broadcast
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                              {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Call history default display placeholder when on calls tab */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                    <FaPhone />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Calls History Log</h3>
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

export default AdminSupport;
