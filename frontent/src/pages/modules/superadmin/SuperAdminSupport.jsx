import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaComments,
  FaPhoneAlt,
  FaVideo,
  FaUsers,
  FaEllipsisH,
  FaSearch,
  FaPaperclip,
  FaRegSmile,
  FaMicrophone,
  FaDownload,
  FaFilePdf,
  FaPaperPlane,
  FaCheckDouble,
  FaCircle
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";

const SORA = "'Sora', sans-serif";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Chat selection and messaging
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All, Open, Waiting, Resolved
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // File upload reference
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const { startCall, socket } = useCall();

  // Load contacts list on mount
  useEffect(() => {
    fetchContactsList();
  }, []);

  // Sync scroll to bottom in chat messaging
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory(selectedContact._id);
    }
  }, [selectedContact]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        selectedContact &&
        msg.type === "personal" &&
        ((msg.sender._id === selectedContact._id && msg.receiver._id === currentUserId) ||
         (msg.sender._id === currentUserId && msg.receiver._id === selectedContact._id))
      ) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId))) {
            return prev;
          }
          return [...prev, msg];
        });
      }

      fetchContactsList();
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, status } : m))
      );
    };

    const handleReactionUpdated = (updatedMsg) => {
      if (selectedContact && updatedMsg.type === "personal") {
        setMessages(prev =>
          prev.map(m => (m._id === updatedMsg._id ? updatedMsg : m))
        );
      }
    };

    socket.on("support:new-message", handleNewMessage);
    socket.on("message:status-update", handleStatusUpdate);
    socket.on("message:reaction-updated", handleReactionUpdated);

    return () => {
      socket.off("support:new-message", handleNewMessage);
      socket.off("message:status-update", handleStatusUpdate);
      socket.off("message:reaction-updated", handleReactionUpdated);
    };
  }, [socket, selectedContact, currentUserId]);

  const fetchContactsList = async () => {
    try {
      setLoadingContacts(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
      
      if (!selectedContact && res.data.length > 0) {
        setSelectedContact(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching support contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchChatHistory = async (otherUserId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API}/api/support/history`, {
        params: { otherUserId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const text = inputText.trim();
    setInputText("");

    const clientMsgId = `client-${Date.now()}`;

    // Optimistic message append
    const tempMsg = {
      _id: clientMsgId,
      sender: { _id: currentUserId },
      receiver: { _id: selectedContact._id },
      type: "personal",
      content: text,
      status: "sent",
      createdAt: new Date().toISOString(),
      clientMessageId: clientMsgId
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await axios.post(
        `${API}/api/support/message`,
        {
          receiver: selectedContact._id,
          type: "personal",
          content: text,
          clientMessageId: clientMsgId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev =>
        prev.map(m => (m.clientMessageId === clientMsgId ? res.data : m))
      );
      
      fetchContactsList();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedContact) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const uploadRes = await axios.post(`${API}/api/support/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const clientMsgId = `client-file-${Date.now()}`;
      
      const res = await axios.post(
        `${API}/api/support/message`,
        {
          receiver: selectedContact._id,
          type: "personal",
          content: "",
          attachments: [{
            url: uploadRes.data.url,
            filename: uploadRes.data.filename,
            mimeType: uploadRes.data.mimeType,
            size: uploadRes.data.size
          }],
          clientMessageId: clientMsgId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, res.data]);
      fetchContactsList();
    } catch (err) {
      alert("Failed to upload file. Make sure file format is supported.");
    } finally {
      setUploading(false);
    }
  };

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      await axios.post(
        `${API}/api/support/react`,
        { messageId, emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error reacting to message:", err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Build list of conversations
  const conversationsList = useMemo(() => {
    return contacts.map(c => {
      const isOnline = c.isOnline;
      const statusLabel = c.unreadCount > 0 ? "Open" : "Open";
      
      return {
        _id: c._id,
        name: c.name,
        schoolName: c.schoolName || "G.D Academy",
        email: c.email,
        lastMessage: c.lastMessage?.content || (c.lastMessage?.attachments?.length > 0 ? "📎 Attachment File" : "No messages yet"),
        time: c.lastMessage?.createdAt 
          ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
          : "",
        unreadCount: c.unreadCount || 0,
        status: statusLabel,
        isOnline: isOnline
      };
    });
  }, [contacts]);

  // Filter conversations list
  const filteredConversations = useMemo(() => {
    return conversationsList
      .filter(c => {
        if (activeFilter === "Open") return c.status === "Open";
        if (activeFilter === "Waiting") return c.status === "Waiting";
        if (activeFilter === "Resolved") return c.status === "Resolved";
        return true;
      })
      .filter(c => {
        const term = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          c.schoolName.toLowerCase().includes(term) ||
          c.lastMessage.toLowerCase().includes(term)
        );
      });
  }, [conversationsList, activeFilter, searchQuery]);

  const initials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-5 text-slate-800 dark:text-white select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B132A] p-4.5 rounded-2.5xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white text-lg shadow-md shadow-[#7C3AED]/20 shrink-0">
            <FaComments />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              Support Workspace
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Real-time communication & support center for school administrators.
            </p>
          </div>
        </div>

        {selectedContact && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => startCall(selectedContact, "voice")}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              title="Voice Call"
            >
              <FaPhoneAlt className="text-xs" /> Voice Call
            </button>
            
            <button
              onClick={() => startCall(selectedContact, "video")}
              className="px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              title="Video Call"
            >
              <FaVideo className="text-xs" /> Video Call
            </button>

            <button
              onClick={() => alert("Add user to conversation")}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 transition cursor-pointer"
              title="Add users to chat"
            >
              <FaUsers className="text-sm" />
            </button>

            <button
              onClick={() => alert("Show more support tools")}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition cursor-pointer"
            >
              <FaEllipsisH className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* MESSAGING CONTAINER */}
      <div className="flex bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-210px)] min-h-[500px]">
        
        {/* LEFT SIDEBAR: Conversations List */}
        <div className="w-full lg:w-[340px] border-r border-slate-100 dark:border-white/[0.06] flex flex-col bg-slate-50/40 dark:bg-[#090F1C]/40 shrink-0 min-h-0">
          
          {/* Search & Filter Header */}
          <div className="p-4 space-y-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-200/60 dark:bg-white/5 p-1 rounded-xl">
              {[
                { id: "All", label: "All", count: conversationsList.length },
                { id: "Open", label: "Open", count: conversationsList.filter(c => c.status === "Open").length },
                { id: "Waiting", label: "Waiting", count: conversationsList.filter(c => c.status === "Waiting").length },
                { id: "Resolved", label: "Resolved", count: conversationsList.filter(c => c.status === "Resolved").length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition cursor-pointer text-center ${
                    activeFilter === tab.id
                      ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/25"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Directory List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 dark:divide-white/[0.04]">
            {loadingContacts ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">Loading contacts...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No conversations found</div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = selectedContact?._id === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => {
                      const orig = contacts.find(contact => contact._id === c._id) || {
                        _id: c._id,
                        name: c.name,
                        email: c.email,
                        schoolName: c.schoolName
                      };
                      setSelectedContact(orig);
                    }}
                    className={`w-full p-4 text-left transition flex items-start gap-3.5 cursor-pointer relative ${
                      isActive 
                        ? "bg-purple-50/80 dark:bg-[#7C3AED]/15 border-l-4 border-[#7C3AED] shadow-xs" 
                        : "hover:bg-slate-100/80 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] text-white flex items-center justify-center font-black shrink-0 relative text-xs shadow-sm">
                      {initials(c.name)}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0B132A] ${c.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{c.name}</h4>
                        {c.time && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{c.time}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7C3AED] dark:text-[#38BDF8] font-bold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded mt-1 inline-block truncate max-w-full">
                        {c.schoolName}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-1">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Main Chat Messaging Window */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B132A] h-full">
          {selectedContact ? (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Active Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] text-white flex items-center justify-center font-black relative text-xs shadow-sm">
                    {initials(selectedContact.name)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0B132A] ${selectedContact.isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{selectedContact.name}</h3>
                    <p className="text-[11px] text-[#7C3AED] dark:text-[#38BDF8] font-bold mt-0.5">{selectedContact.schoolName || "G.D Academy"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                    selectedContact.isOnline 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10"
                  }`}>
                    <FaCircle className={`text-[6px] ${selectedContact.isOnline ? "animate-pulse text-emerald-500" : "text-slate-400"}`} />
                    {selectedContact.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-black/20">
                
                <div className="text-center my-4">
                  <span className="px-3.5 py-1 rounded-full bg-slate-200/60 dark:bg-white/5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today</span>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-400">Loading chat history...</div>
                ) : (
                  messages.map((msg, index) => {
                    const isSenderMe = msg.sender?._id === currentUserId || msg.sender === currentUserId;
                    const hasReaction = msg.reactions && msg.reactions.length > 0;
                    
                    return (
                      <div 
                        key={msg._id || index}
                        className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isSenderMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                      >
                        {msg.content && (
                          <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                            isSenderMe 
                              ? "bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-tr-xs" 
                              : "bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-white/10 rounded-tl-xs"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        )}

                        {msg.attachments && msg.attachments.map((file, fileIdx) => (
                          <div 
                            key={fileIdx}
                            className="bg-slate-100 dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 max-w-xs shadow-xs mt-1"
                          >
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                              <FaFilePdf className="text-base" />
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <h5 className="font-bold text-slate-800 dark:text-white truncate">{file.filename || "Attachment.pdf"}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
                            </div>
                            <a 
                              href={file.url || "#"} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-white/10 transition shrink-0 hover:border-[#7C3AED]"
                            >
                              <FaDownload className="text-xs" />
                            </a>
                          </div>
                        ))}

                        <div className="flex items-center gap-1.5 mt-1 select-none px-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          
                          {isSenderMe && (
                            <FaCheckDouble className={`text-[11px] ${msg.status === "read" ? "text-sky-400" : "text-slate-400"}`} />
                          )}

                          {hasReaction && (
                            <div className="ml-1 flex items-center gap-1 bg-slate-100 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full px-2 py-0.5 text-[10px]">
                              <span>{msg.reactions[0].emoji}</span>
                              <span className="text-[9px] font-bold">{msg.reactions.length}</span>
                            </div>
                          )}
                          
                          {!isSenderMe && !hasReaction && (
                            <button
                              onClick={() => handleReactToMessage(msg._id, "❤️")}
                              className="text-[11px] opacity-40 hover:opacity-100 transition cursor-pointer ml-1"
                            >
                              ❤️
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2.5 bg-white dark:bg-[#0B132A]">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,image/*,video/*"
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-slate-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-[#7C3AED] rounded-xl text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200/60 dark:border-white/10"
                  title="Attach File"
                >
                  <FaPaperclip className="text-sm" />
                </button>

                <button
                  type="button"
                  onClick={() => setInputText(prev => prev + " 😊")}
                  className="w-10 h-10 bg-slate-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-[#7C3AED] rounded-xl text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-200/60 dark:border-white/10"
                  title="Emoji"
                >
                  <FaRegSmile className="text-sm" />
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-800 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition"
                  />
                </div>

                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="w-10 h-10 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white rounded-xl flex items-center justify-center transition shadow-md shadow-[#7C3AED]/20 cursor-pointer shrink-0"
                  >
                    <FaPaperPlane className="text-xs" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert("Voice transcription started...")}
                    className="w-10 h-10 bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] hover:bg-purple-500/20 border border-[#7C3AED]/20 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
                  >
                    <FaMicrophone className="text-xs" />
                  </button>
                )}
              </form>

            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                <FaComments />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">No Active Chat Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Select an Admin from the contact list on the left to start real-time messaging support.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default SuperAdminSupport;
