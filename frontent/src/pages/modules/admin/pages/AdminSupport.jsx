import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaBroadcastTower, FaComments, FaUserCircle, FaSchool } from "react-icons/fa";
import socket from "../../../../socket";

function AdminSupport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("superadmin"); // superadmin, teachers, students
  const [subTab, setSubTab] = useState("personal"); // personal, broadcast

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newBroadcast, setNewBroadcast] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    fetchContacts();
    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.on("support:new-message", (msg) => {
      const currentActive = activeContactRef.current;
      // 1. If personal message in active conversation
      if (
        msg.type === "personal" &&
        currentActive &&
        ((msg.sender._id === currentUserId && msg.receiver._id === currentActive._id) ||
          (msg.sender._id === currentActive._id && msg.receiver._id === currentUserId))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      
      // 2. If broadcast message that admin sent
      if (msg.type === "broadcast" && msg.sender._id === currentUserId) {
        setBroadcastMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("support:new-message");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, broadcastMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
      
      // Auto-select Super Admin if we are in superadmin tab
      const superAdmin = res.data.find(c => c.role === "superadmin");
      if (superAdmin && activeTab === "superadmin") {
        fetchHistory(superAdmin);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  const fetchHistory = async (contact) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/history?otherUserId=${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setActiveContact(contact);
    } catch (err) {
      console.error("Error fetching history:", err);
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
      // Filter broadcasts by targetRole based on our current section
      const targetRole = activeTab === "teachers" ? "teacher" : "student";
      const filtered = res.data.filter(msg => msg.targetRole === targetRole);
      setBroadcastMessages(filtered);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveContact(null);
    setMessages([]);
    setBroadcastMessages([]);
    setNewMessage("");
    setNewBroadcast("");

    if (tab === "superadmin") {
      const superAdmin = contacts.find(c => c.role === "superadmin");
      if (superAdmin) {
        fetchHistory(superAdmin);
      }
    } else {
      setSubTab("personal");
    }
  };

  const handleSubTabChange = (sub) => {
    setSubTab(sub);
    if (sub === "broadcast") {
      fetchBroadcastHistory();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || sending) return;

    setSending(true);
    try {
      await axios.post(
        `${API}/api/support/message`,
        {
          receiver: activeContact._id,
          type: "personal",
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
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

  // Filter contacts by tab
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
        {/* If Active Tab is Super Admin */}
        {activeTab === "superadmin" && (
          <div className="flex-1 flex flex-col h-full bg-white relative">
            {activeContact ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-white z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-black">
                    SA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Super Admin</p>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">TeachHub Owner</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
                  {loading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-slate-400 text-xs font-bold">Loading conversation...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                      Send a message to Super Admin support.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender._id === currentUserId;
                      return (
                        <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                            isOwn
                              ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white rounded-tr-none"
                              : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none"
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-[8px] mt-1.5 text-right font-medium ${isOwn ? "text-white/70" : "text-slate-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
                  <input
                    type="text"
                    placeholder="Type your message to Super Admin..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                  >
                    <FaPaperPlane className="text-xs" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                <p className="text-xs text-slate-400 font-semibold">Super Admin is currently unavailable.</p>
              </div>
            )}
          </div>
        )}

        {/* If Active Tab is Teachers or Students */}
        {activeTab !== "superadmin" && (
          <div className="flex-1 flex">
            {/* Sidebar Contact list */}
            <div className="w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
              <div className="p-3 border-b border-slate-100 bg-white flex gap-2 select-none">
                <button
                  onClick={() => handleSubTabChange("personal")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
                    subTab === "personal"
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Personal Chats
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
                        onClick={() => fetchHistory(contact)}
                        className={`w-full p-4 text-left hover:bg-slate-100/60 transition flex items-center gap-3 cursor-pointer ${
                          activeContact?._id === contact._id ? "bg-white border-l-4 border-[#7C3AED]" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">{contact.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{contact.email}</p>
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
            </div>

            {/* Messaging Area */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
              {subTab === "personal" ? (
                activeContact ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-white z-10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-black">
                        {activeContact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{activeContact.name}</p>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#7C3AED] uppercase bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-1.5 py-0.5 rounded mt-0.5">
                          {activeContact.role}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
                      {loading ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-slate-400 text-xs font-bold">Loading conversation...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                          Send a message to start support chat.
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender._id === currentUserId;
                          return (
                            <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                                isOwn
                                  ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white rounded-tr-none"
                                  : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none"
                              }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[8px] mt-1.5 text-right font-medium ${isOwn ? "text-white/70" : "text-slate-400"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
                      <input
                        type="text"
                        placeholder={`Type your message to ${activeContact.name}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                      >
                        <FaPaperPlane className="text-xs" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                    <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                      <FaComments />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Chat Selected</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Select a {activeTab === "teachers" ? "teacher" : "student"} from the list on the left to start support messaging.
                    </p>
                  </div>
                )
              ) : (
                /* Broadcast messages view */
                <div className="flex-1 flex flex-col h-full bg-white relative">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FaBroadcastTower className="text-teal-500" /> Sent Broadcasts to {activeTab}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                    {loading ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-slate-400 text-xs font-bold">Loading broadcasts...</p>
                      </div>
                    ) : broadcastMessages.length === 0 ? (
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
                    <div ref={messagesEndRef} />
                  </div>
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
