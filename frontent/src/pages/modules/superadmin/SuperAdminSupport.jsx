import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaComments,
  FaPhoneAlt,
  FaVideo,
  FaUsers,
  FaEllipsisH,
  FaSearch,
  FaFilter,
  FaSchool,
  FaPaperclip,
  FaRegSmile,
  FaMicrophone,
  FaDownload,
  FaFilePdf,
  FaPaperPlane,
  FaCheckDouble,
  FaArrowLeft,
  FaCheckCircle,
  FaHourglassHalf,
  FaStar,
  FaFlag,
  FaUser,
  FaAt,
  FaBullhorn,
  FaRegClock,
  FaSort
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";

const SORA = "'Sora', sans-serif";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // View state: "dashboard" or "chat"
  const [viewMode, setViewMode] = useState("chat");

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
  }, [messages, viewMode]);

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
      
      // Default select Gudiya Kumari (first user) as baseline active chat
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
    if (bytes === 0) return "0 Bytes";
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
        lastMessage: c.lastMessage?.content || (c.lastMessage?.attachments?.length > 0 ? "Attachment File" : "No messages yet"),
        time: c.lastMessage?.createdAt 
          ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
          : "10:20 AM",
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

  // Messages log feed
  const displayedMessages = useMemo(() => {
    return messages;
  }, [messages]);

  const initials = (name) => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-805 dark:text-white select-none">
      
      {/* SUPPORT CHAT DETAILED WORKSPACE */}
      <div className="space-y-6 animate-fadeIn">
        
        {/* Header breadcrumbs support calling actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <FaComments className="text-[#7C3AED]" /> Support Chat
              </h2>
              <p className="text-[10px] text-slate-455 dark:text-slate-400 font-extrabold uppercase mt-1.5">
                Support &gt; School Admins &gt; Chat
              </p>
            </div>
          </div>

          {selectedContact && (
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto select-none">
              <button
                onClick={() => startCall(selectedContact, "voice")}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition cursor-pointer"
                title="Voice Call"
              >
                <FaPhoneAlt className="text-sm" />
              </button>
              
              <button
                onClick={() => startCall(selectedContact, "video")}
                className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center transition cursor-pointer"
                title="Video Call"
              >
                <FaVideo className="text-sm" />
              </button>

              <button
                onClick={() => alert("Add user to conversation")}
                className="w-10 h-10 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 flex items-center justify-center transition cursor-pointer"
                title="Add users to chat"
              >
                <FaUsers className="text-sm" />
              </button>

              <button
                onClick={() => alert("Show more support tools")}
                className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 hover:border-slate-350 text-slate-705 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <FaEllipsisH /> More
              </button>
            </div>
          )}
        </div>

        {/* Messaging Viewport split layout */}
        <div className="flex bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-210px)] min-h-0">
          
          {/* Left sidebar chats directory */}
          <div className="hidden lg:flex w-[320px] border-r border-slate-100 dark:border-white/5 flex-col bg-slate-50/10 shrink-0 min-h-0">
            
            <div className="p-4 space-y-3.5 border-b border-slate-100 dark:border-white/5">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-805 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-[9px] font-black uppercase">
                {[
                  { id: "All", label: `All (${conversationsList.length})` },
                  { id: "Open", label: `Open (${conversationsList.filter(c => c.status === "Open").length})` },
                  { id: "Waiting", label: `Waiting (${conversationsList.filter(c => c.status === "Waiting").length})` },
                  { id: "Resolved", label: `Resolved (${conversationsList.filter(c => c.status === "Resolved").length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2 py-1 rounded transition cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-[#7C3AED] text-white"
                        : "bg-transparent text-slate-505"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {filteredConversations.map((c) => {
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
                    className={`w-full p-4.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.01] transition flex items-start gap-3 cursor-pointer ${
                      isActive ? "bg-slate-50/50 dark:bg-white/[0.02] border-l-4 border-[#7C3AED]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black shrink-0 relative text-[10px]">
                      {initials(c.name)}
                      {c.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white dark:border-[#0B132A] rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-slate-850 dark:text-white truncate">{c.name}</h4>
                        <span className="text-[8.5px] text-slate-400 font-semibold font-mono">{c.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-405 font-bold uppercase tracking-wider mt-0.5">{c.schoolName}</p>
                      <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold truncate mt-1.5">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right chat message window */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B132A] h-full">
            {selectedContact ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Active contact header */}
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black relative text-xs">
                      {initials(selectedContact.name)}
                      {selectedContact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-555 border-2 border-white dark:border-[#0B132A] rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-850 dark:text-white leading-tight">{selectedContact.name}</h3>
                      <p className="text-[9px] text-slate-455 dark:text-slate-400 font-bold mt-0.5">{selectedContact.schoolName || "G.D Academy"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] text-slate-400 font-semibold">
                      {selectedContact.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Messages log */}
                <div className="flex-grow overflow-y-auto p-5 space-y-5 bg-slate-50/[0.02]">
                    
                    <div className="text-center my-6">
                      <span className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-455 uppercase tracking-widest font-mono">Today</span>
                    </div>

                    {displayedMessages.map((msg, index) => {
                      const isSenderMe = msg.sender._id === currentUserId;
                      const hasReaction = msg.reactions && msg.reactions.length > 0;
                      
                      return (
                        <div 
                          key={msg._id || index}
                          className={`flex flex-col max-w-[70%] ${isSenderMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          {msg.content && (
                            <div className={`p-4 rounded-2.5xl text-xs font-semibold leading-relaxed shadow-sm relative ${
                              isSenderMe 
                                ? "bg-[#7C3AED] text-white rounded-tr-none" 
                                : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none"
                            }`}>
                              <p>{msg.content}</p>
                            </div>
                          )}

                          {msg.attachments && msg.attachments.map((file, fileIdx) => (
                            <div 
                              key={fileIdx}
                              className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2.5xl p-4 flex items-center gap-3.5 max-w-sm shadow-sm hover:border-[#7C3AED]/20 transition"
                            >
                              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                <FaFilePdf className="text-lg" />
                              </div>
                              <div className="min-w-0 flex-1 text-xs">
                                <h5 className="font-black text-slate-805 dark:text-white truncate">{file.filename || "Attachment.pdf"}</h5>
                                <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">{formatBytes(file.size || 1.2 * 1024 * 1024)} • PDF</p>
                              </div>
                              <a 
                                href={file.url || "#"} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200 dark:border-white/10 transition shrink-0 cursor-pointer"
                              >
                                <FaDownload className="text-[10px]" />
                              </a>
                            </div>
                          ))}

                          <div className="flex items-center gap-2 mt-1.5 select-none font-mono">
                            <span className="text-[8.5px] text-slate-400 font-extrabold">
                              {msg.timeLabel || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            
                            {isSenderMe && (
                              <FaCheckDouble className={`text-[9px] ${msg.status === "read" ? "text-blue-500" : "text-slate-350"}`} />
                            )}

                            {hasReaction && (
                              <div className="ml-1 flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 rounded-full px-1.5 py-0.5 text-[9px] font-black text-slate-655 cursor-pointer">
                                <span>{msg.reactions[0].emoji}</span>
                                <span className="text-[8px]">{msg.reactions.length}</span>
                              </div>
                            )}
                            
                            {!isSenderMe && !hasReaction && (
                              <button
                                onClick={() => handleReactToMessage(msg._id, "❤️")}
                                className="text-[10px] text-slate-400 hover:text-[#7C3AED] cursor-pointer ml-1"
                              >
                                ❤️
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="p-4.5 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
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
                      className="w-9.5 h-9.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-805 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <FaPaperclip className="text-xs" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputText(prev => prev + " ji")}
                      className="w-9.5 h-9.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-805 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <FaRegSmile className="text-xs" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-850 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    {inputText.trim() ? (
                      <button
                        type="submit"
                        className="w-9.5 h-9.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <FaPaperPlane className="text-xs" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert("Voice transcription started...")}
                        className="w-9.5 h-9.5 bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <FaMicrophone className="text-xs" />
                      </button>
                    )}
                  </form>

                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/10">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                    <FaComments />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Active Chat Selected</h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed">
                    Select an Admin from the contact list on the left to start real-time messaging support.
                  </p>
                </div>
              )}
      </div>

      </div>

    </div>

  </div>
);
}

export default SuperAdminSupport;
