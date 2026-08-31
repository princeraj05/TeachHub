import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaSearch,
  FaPaperPlane,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaComments,
  FaSchool,
  FaPhoneAlt
} from "react-icons/fa";

// Initial sample fallback conversations if backend contacts are empty
const initialContacts = [
  {
    _id: "c1",
    name: "Banny Thapar",
    schoolName: "G.D Academy",
    lastMessage: "Hello Admin, we need assistance with fee plan configuration.",
    time: "02:15 PM",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "c2",
    name: "Sarah Johnson",
    schoolName: "Lincoln Academy",
    lastMessage: "Thank you! The teacher login issue is resolved now.",
    time: "11:30 AM",
    status: "Resolved",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    _id: "c3",
    name: "James Wilson",
    schoolName: "Pine Academy",
    lastMessage: "Could you share the step to generate monthly attendance reports?",
    time: "Yesterday",
    status: "Open",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

const sampleMessages = {
  c1: [
    { id: "m1", sender: "other", text: "Hello Admin, we need assistance with fee plan configuration.", time: "02:10 PM" },
    { id: "m2", sender: "me", text: "Hi Banny! Sure, could you specify which fee tier you want to enable?", time: "02:12 PM" },
    { id: "m3", sender: "other", text: "We want to configure the Enterprise annual billing cycle.", time: "02:15 PM" }
  ],
  c2: [
    { id: "m4", sender: "other", text: "Teachers are unable to log into the portal.", time: "11:00 AM" },
    { id: "m5", sender: "me", text: "We have updated the permissions. Please ask them to try again.", time: "11:25 AM" },
    { id: "m6", sender: "other", text: "Thank you! The teacher login issue is resolved now.", time: "11:30 AM" }
  ],
  c3: [
    { id: "m7", sender: "other", text: "Could you share the step to generate monthly attendance reports?", time: "Yesterday" }
  ]
};

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");

  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState(initialContacts[0]);
  const [messages, setMessages] = useState(sampleMessages["c1"] || []);
  const [inputMessage, setInputMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch contacts list from backend if available
  useEffect(() => {
    fetchBackendContacts();
  }, []);

  const fetchBackendContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((c, i) => ({
          _id: c._id || `backend-${i}`,
          name: c.name || "School Admin",
          schoolName: c.schoolName || "Partner Institution",
          lastMessage: c.lastMessage || "Click to start conversation",
          time: c.time || "Recent",
          status: c.status || "Open",
          avatar: c.photo || ""
        }));
        setContacts(mapped);
        setSelectedContact(mapped[0]);
      }
    } catch (err) {
      console.log("Using local support inbox view");
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select contact
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    if (sampleMessages[contact._id]) {
      setMessages(sampleMessages[contact._id]);
    } else {
      setMessages([
        { id: `m-${Date.now()}`, sender: "other", text: contact.lastMessage, time: contact.time }
      ]);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages([...messages, newMsg]);

    // Update last message in contact list
    setContacts(
      contacts.map((c) =>
        c._id === selectedContact._id
          ? { ...c, lastMessage: inputMessage.trim(), time: "Just now" }
          : c
      )
    );

    setInputMessage("");

    // Optional API POST call
    if (token) {
      axios.post(
        `${API}/api/support/send`,
        { receiverId: selectedContact._id, message: newMsg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }
  };

  // Toggle Contact Status (Open / Resolved)
  const handleToggleStatus = () => {
    if (!selectedContact) return;
    const newStatus = selectedContact.status === "Open" ? "Resolved" : "Open";
    const updated = { ...selectedContact, status: newStatus };
    setSelectedContact(updated);
    setContacts(contacts.map((c) => (c._id === selectedContact._id ? updated : c)));
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.schoolName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Super Admin Support Inbox</h1>
        <p className="text-sm text-slate-400 mt-1">Direct messaging and support ticket management for school admins.</p>
      </div>

      {/* Main Support Grid */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row flex-1 min-h-[580px]">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-[#131B2E]">
          {/* Sidebar Search */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <p className="p-6 text-xs text-center text-slate-500">No conversations found</p>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?._id === contact._id;
                return (
                  <div
                    key={contact._id}
                    onClick={() => handleSelectContact(contact)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected ? "bg-blue-600/10 border-l-4 border-blue-500" : "hover:bg-slate-800/40"
                    }`}
                  >
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover border border-slate-700 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                        <span className="text-[10px] text-slate-500">{contact.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{contact.schoolName}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-1">{contact.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat Window */}
        <div className="flex-1 flex flex-col bg-[#0B0F19]/40">
          {selectedContact ? (
            <>
              {/* Chat Window Header */}
              <div className="p-4 border-b border-slate-800 bg-[#131B2E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {selectedContact.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedContact.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <FaSchool className="text-slate-500 text-[10px]" />
                      <span>{selectedContact.schoolName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    onClick={handleToggleStatus}
                    className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                      selectedContact.status === "Open"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                    }`}
                  >
                    {selectedContact.status} (Click to toggle)
                  </span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-[#131B2E] border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#131B2E] border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your response message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-[#0B0F19] border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Send</span>
                  <FaPaperPlane className="text-[10px]" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
              <div>
                <FaComments className="text-3xl mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">Select a conversation from the left to start support chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminSupport;
