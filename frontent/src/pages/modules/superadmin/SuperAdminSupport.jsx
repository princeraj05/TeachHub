import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaUserCircle, FaPaperPlane, FaSchool, FaComments } from "react-icons/fa";
import socket from "../../../socket";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    fetchContacts();

    // Connect socket and listen
    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();
    socket.on("support:new-message", (msg) => {
      const currentActive = activeContactRef.current;
      // Check if message belongs to current active chat
      if (
        msg.type === "personal" &&
        currentActive &&
        ((msg.sender._id === currentUserId && msg.receiver._id === currentActive._id) ||
          (msg.sender._id === currentActive._id && msg.receiver._id === currentUserId))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("support:new-message");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const fetchHistory = async (contact) => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`${API}/api/support/history?otherUserId=${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setActiveContact(contact);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || sending) return;

    setSending(true);
    try {
      const res = await axios.post(
        `${API}/api/support/message`,
        {
          receiver: activeContact._id,
          type: "personal",
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend automatically emits the message so it will be added by socket listener, 
      // but we can also manually add it to state immediately if we want. To prevent duplicate, 
      // since the socket will emit to all, the socket listener will catch it.
      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="font-sans flex bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
      {/* Contacts List Panel */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FaComments className="text-[#7C3AED]" />
            School Admins
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Select admin to support</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-semibold">
              No Admin contacts found.
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => fetchHistory(contact)}
                className={`w-full p-4 text-left hover:bg-slate-100/60 transition flex items-center gap-3 cursor-pointer ${
                  activeContact?._id === contact._id ? "bg-white border-l-4 border-[#7C3AED]" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-700 truncate">{contact.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{contact.email}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#38BDF8] mt-1">
                    <FaSchool /> {contact.schoolName || "No School Assigned"}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messaging Panel */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {activeContact ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-black">
                  {activeContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{activeContact.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <FaSchool className="text-[#38BDF8]" /> {activeContact.schoolName}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
              {loadingHistory ? (
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

            {/* Message input composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
              <input
                type="text"
                placeholder="Type your message here..."
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
            <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
              <FaComments />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Conversation Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Select an Admin from the contact list on the left to start real-time messaging support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminSupport;
