import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FaSearch, 
  FaFilter, 
  FaPhoneAlt, 
  FaVideo, 
  FaPaperclip, 
  FaImage, 
  FaMicrophone, 
  FaPaperPlane, 
  FaSmile, 
  FaSchool, 
  FaTicketAlt, 
  FaCheck,
  FaCheckDouble, 
  FaEllipsisV, 
  FaPlay, 
  FaDownload,
  FaPlus,
  FaFileAlt,
  FaSpinner,
  FaExclamationCircle
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";
import API_URL from "../../../config/api";

export default function SupportLiveChat() {
  const API = API_URL;
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole") || localStorage.getItem("role");

  const [chatTab, setChatTab] = useState("all"); // "all", "new", "open"
  const [searchChat, setSearchChat] = useState("");
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const callCtx = useCall() || {};
  const socket = callCtx.socket;

  const currentDepartment = localStorage.getItem("supportDepartment") || "Technical";

  // 1. Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // 2. Real-time Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        msg.type === "personal" &&
        activeContact &&
        ((msg.sender._id === currentUserId && msg.receiver._id === activeContact._id) ||
          (msg.sender._id === activeContact._id && msg.receiver._id === currentUserId))
      ) {
        setMessages(prev => {
          const matchIndex = prev.findIndex(m =>
            m._id === msg._id ||
            (msg.clientMessageId && (m.clientMessageId === msg.clientMessageId || m._id === msg.clientMessageId))
          );
          if (matchIndex !== -1) {
            const updated = [...prev];
            updated[matchIndex] = msg;
            return updated;
          }
          return [...prev, msg];
        });

        if (msg.receiver._id === currentUserId) {
          socket.emit("message:read", { senderId: activeContact._id });
        }
        setTimeout(scrollToBottom, 50);
      }

      // Refresh contacts list to update last message preview & unread counts
      fetchContacts(false);
    };

    const handleStatusChange = ({ userId, isOnline, lastSeen }) => {
      setContacts(prev =>
        prev.map(contact =>
          contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
        )
      );

      setActiveContact(prev => {
        if (!prev || prev._id !== userId) return prev;
        return { ...prev, isOnline, lastSeen };
      });
    };

    const handleStatusUpdate = ({ messageId, status, receiverId }) => {
      if (activeContact && receiverId === activeContact._id) {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
      }
    };

    const handleReadReceipt = ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setMessages(prev => prev.map(m => m.status !== "read" ? { ...m, status: "read" } : m));
      }
    };

    const handleTypingStart = ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setTypingUser(activeContact.name);
      }
    };

    const handleTypingStop = ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setTypingUser(null);
      }
    };

    socket.on("support:new-message", handleNewMessage);
    socket.on("user:status-change", handleStatusChange);
    socket.on("message:status-update", handleStatusUpdate);
    socket.on("message:read-receipt", handleReadReceipt);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("support:new-message", handleNewMessage);
      socket.off("user:status-change", handleStatusChange);
      socket.off("message:status-update", handleStatusUpdate);
      socket.off("message:read-receipt", handleReadReceipt);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, activeContact, currentUserId]);

  // Load chat history when active contact changes
  useEffect(() => {
    if (activeContact && activeContact._id) {
      fetchHistory(activeContact._id);
      if (socket) {
        socket.emit("message:read", { senderId: activeContact._id });
      }
    } else {
      setMessages([]);
    }
  }, [activeContact]);

  const fetchContacts = async (showLoader = true) => {
    try {
      if (showLoader) setLoadingContacts(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data || []);
      if (res.data && res.data.length > 0 && !activeContact) {
        setActiveContact(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      if (showLoader) setLoadingContacts(false);
    }
  };

  const fetchHistory = async (otherUserId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API}/api/support/history`, {
        params: { otherUserId, page: 1, limit: 50 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeContact || sending) return;

    const tempId = "msg-" + Date.now();
    const contentToSend = messageText.trim();
    setMessageText("");

    const optimisticMsg = {
      _id: tempId,
      clientMessageId: tempId,
      sender: { _id: currentUserId, name: "Me" },
      receiver: { _id: activeContact._id },
      content: contentToSend,
      createdAt: new Date(),
      status: "sent",
      attachments: []
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    setSending(true);
    try {
      const payload = {
        receiver: activeContact._id,
        type: "personal",
        content: contentToSend,
        clientMessageId: tempId
      };

      const res = await axios.post(`${API}/api/support/message`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => {
        const matchIndex = prev.findIndex(m => m._id === tempId || m.clientMessageId === tempId);
        if (matchIndex !== -1) {
          const updated = [...prev];
          updated[matchIndex] = res.data;
          return updated;
        }
        return [...prev, res.data];
      });

      fetchContacts(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => prev.map(m => (m._id === tempId || m.clientMessageId === tempId) ? { ...m, status: "failed" } : m));
    } finally {
      setSending(false);
    }
  };

  const handleComposerTyping = (e) => {
    setMessageText(e.target.value);
    if (!activeContact || !socket) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:start", { receiverId: activeContact._id });
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId: activeContact._id });
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post(`${API}/api/support/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      const tempId = "msg-" + Date.now();
      const payload = {
        receiver: activeContact._id,
        type: "personal",
        content: "",
        attachments: [uploadRes.data],
        clientMessageId: tempId
      };

      const res = await axios.post(`${API}/api/support/message`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, res.data]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      alert("Attachment upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Filter contacts by search & tab
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const nameMatch = contact.name?.toLowerCase().includes(searchChat.toLowerCase()) ||
        contact.schoolName?.toLowerCase().includes(searchChat.toLowerCase()) ||
        contact.role?.toLowerCase().includes(searchChat.toLowerCase());
      if (!nameMatch) return false;

      if (chatTab === "new") return contact.unreadCount > 0;
      if (chatTab === "open") return contact.isOnline;
      return true;
    });
  }, [contacts, searchChat, chatTab]);

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API}${url}`;
  };

  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
      
      {/* COLUMN 1: CHATS LIST (Col 3) */}
      <div className="lg:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-sm">
        
        {/* Header & Department Context */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Support Chats</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">
                {filteredContacts.length}
              </span>
            </h2>
            <p className="text-[10px] text-purple-400 font-semibold mt-0.5">
              {userRole?.toLowerCase() === "superadmin" ? "All Departments (SuperAdmin)" : `${currentDepartment} Department`}
            </p>
          </div>
          <button onClick={() => fetchContacts(true)} className="p-2 text-slate-400 hover:text-white rounded-lg transition" title="Refresh">
            <FaFilter className="text-xs" />
          </button>
        </div>

        {/* Search Chat Input */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FaSearch className="text-xs" />
          </div>
          <input 
            type="text"
            value={searchChat}
            onChange={(e) => setSearchChat(e.target.value)}
            placeholder="Search by name, role, school..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl mb-3 text-xs">
          <button 
            onClick={() => setChatTab("all")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "all" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            All ({contacts.length})
          </button>
          <button 
            onClick={() => setChatTab("new")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "new" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setChatTab("open")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "open" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            Online
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loadingContacts ? (
            <div className="py-12 text-center space-y-2">
              <FaSpinner className="animate-spin text-xl text-purple-500 mx-auto" />
              <p className="text-xs text-slate-400">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              No support conversations found.
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => setActiveContact(contact)}
                className={`
                  p-3 rounded-xl cursor-pointer transition flex items-start gap-3 border
                  ${activeContact?._id === contact._id 
                    ? "bg-purple-600/10 border-purple-500/40" 
                    : "bg-slate-50 dark:bg-[#121B2E] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                  }
                `}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                    {contact.avatar ? (
                      <img src={getFileUrl(contact.avatar)} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      contact.name ? contact.name.substring(0, 2).toUpperCase() : "U"
                    )}
                  </div>
                  {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0D1527]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{contact.name}</h4>
                    {contact.lastMessage?.createdAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-semibold text-purple-400 truncate mt-0.5">
                    <span className="capitalize">{contact.role}</span> {contact.schoolName ? `• ${contact.schoolName}` : ""}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {contact.lastMessage ? (contact.lastMessage.content || "File attachment") : "No messages yet"}
                    </p>
                    {contact.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* COLUMN 2: CENTER CONVERSATION WINDOW (Col 6) */}
      <div className="lg:col-span-6 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm overflow-hidden">
        
        {activeContact ? (
          <>
            {/* Active Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#121B2E]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                  {activeContact.avatar ? (
                    <img src={getFileUrl(activeContact.avatar)} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    activeContact.name?.substring(0, 2).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{activeContact.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className={`flex items-center gap-1 font-semibold ${activeContact.isOnline ? "text-emerald-400" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${activeContact.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                      <span>{activeContact.isOnline ? "Online" : "Offline"}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{activeContact.role}</span>
                    {activeContact.schoolName && (
                      <>
                        <span>•</span>
                        <span>{activeContact.schoolName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-xl transition" title="Audio Call">
                  <FaPhoneAlt className="text-sm" />
                </button>
                <button className="p-2 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-xl transition" title="Video Call">
                  <FaVideo className="text-sm" />
                </button>
              </div>
            </div>

            {/* Messages Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-[#070C16]/40 custom-scrollbar">
              {loadingMessages ? (
                <div className="py-20 text-center space-y-2">
                  <FaSpinner className="animate-spin text-2xl text-purple-500 mx-auto" />
                  <p className="text-xs text-slate-400">Loading conversation history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 font-semibold">
                  No previous messages with {activeContact.name}. Start conversation below.
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender?._id === activeContact._id || msg.sender === activeContact._id;
                  return (
                    <div 
                      key={msg._id}
                      className={`flex gap-3 max-w-[80%] ${isUser ? "self-start" : "ml-auto flex-row-reverse"}`}
                    >
                      <div className={`w-8 h-8 rounded-full ${isUser ? "bg-indigo-600" : "bg-purple-600"} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {isUser ? (activeContact.name?.substring(0, 2).toUpperCase() || "U") : "ST"}
                      </div>

                      <div className="space-y-1">
                        <div className={`
                          p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                          ${isUser 
                            ? "bg-slate-200 dark:bg-[#162238] text-slate-800 dark:text-slate-100 rounded-tl-none" 
                            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none"
                          }
                        `}>
                          {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                          {/* Attachment Cards */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att, idx) => {
                                const isImage = att.mimeType?.startsWith("image/");
                                const fileUrl = getFileUrl(att.url);
                                return isImage ? (
                                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/20 max-w-xs">
                                    <img src={fileUrl} alt={att.filename} className="w-full h-36 object-cover" />
                                  </div>
                                ) : (
                                  <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/20 rounded-xl text-white text-xs hover:underline">
                                    <FaFileAlt />
                                    <span className="truncate max-w-[150px]">{att.filename || "Attachment"}</span>
                                    <FaDownload className="text-[10px] ml-auto" />
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className={`text-[10px] text-slate-400 px-1 flex items-center gap-1 ${isUser ? "" : "justify-end"}`}>
                          <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                          {!isUser && (
                            <span>
                              {msg.status === "sent" && <FaCheck className="text-white/60 text-[10px]" />}
                              {msg.status === "delivered" && <FaCheckDouble className="text-white/60 text-[10px]" />}
                              {msg.status === "read" && <FaCheckDouble className="text-teal-300 text-[10px]" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {typingUser && (
                <div className="text-[10px] text-purple-400 font-bold tracking-wider animate-pulse">
                  {typingUser} is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] space-y-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-400">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition" 
                    title="Attach file"
                  >
                    <FaPaperclip className="text-sm" />
                  </button>
                </div>

                <input 
                  type="text"
                  value={messageText}
                  onChange={handleComposerTyping}
                  placeholder="Type a support response..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
                />

                <button 
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <FaTicketAlt className="text-4xl text-purple-500/40 mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Active Chat Selected</h3>
            <p className="text-xs mt-1 max-w-xs">Select a user conversation from the list on the left to start real-time messaging.</p>
          </div>
        )}

      </div>

      {/* COLUMN 3: RIGHT CONTEXT & DETAILS SIDEBAR (Col 3) */}
      <div className="lg:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-sm overflow-y-auto custom-scrollbar space-y-4">
        
        {activeContact ? (
          <>
            {/* User Information Box */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">User Information</h3>
              
              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md overflow-hidden">
                  {activeContact.avatar ? (
                    <img src={getFileUrl(activeContact.avatar)} alt={activeContact.name} className="w-full h-full object-cover" />
                  ) : (
                    activeContact.name?.substring(0, 2).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{activeContact.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 mt-1 inline-block capitalize">
                    {activeContact.role}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 w-full pt-2 border-t border-slate-200 dark:border-white/5">
                  <div className="truncate">{activeContact.email}</div>
                  {activeContact.phone && <div>{activeContact.phone}</div>}
                </div>
              </div>
            </div>

            {/* School Information Box */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">School Information</h3>
              
              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <FaSchool />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-xs">{activeContact.schoolName || "TeachHub HQ"}</h4>
                    <p className="text-[10px] text-slate-400">Institutional Identity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Department Box */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Support Context</h3>
              
              <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="font-bold text-purple-400">{currentDepartment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Access Level</span>
                  <span className="font-semibold text-emerald-400">Active Agent</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Select a contact to view information.
          </div>
        )}

      </div>

    </div>
  );
}
