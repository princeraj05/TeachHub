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
  FaArrowLeft
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";

const SORA = "'Sora', sans-serif";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  // Chat lists and selection
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All, Open, Waiting, Resolved
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // File upload state
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const { startCall, socket } = useCall();

  // Load contacts list on mount
  useEffect(() => {
    fetchContactsList();
  }, []);

  // Sync messages list scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      fetchChatHistory(selectedContact._id);
    }
  }, [selectedContact]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // If the incoming message belongs to the active personal chat, append it
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

      // Refresh contacts list to update last messages/unread counts
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
      
      // Default select Gudiya Kumari (first user) if nothing is selected yet to populate view matching mockup
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

  // Send plain text message
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

      // Replace optimistic message with saved DB message
      setMessages(prev =>
        prev.map(m => (m.clientMessageId === clientMsgId ? res.data : m))
      );
      
      fetchContactsList();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Upload attachments handler
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
      
      // Send file attachment message
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

  // Add Emoji Reaction to message
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

  // Format bytes to human readable size
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Build list of conversations incorporating standard fallback mockup items
  const conversationsList = useMemo(() => {
    const list = contacts.map(c => {
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

    const fallbackItems = [
      {
        _id: "dummy-1",
        name: "Gudiya Kumari",
        schoolName: "Prince school",
        email: "kumarigudiyaa03@gmail.com",
        lastMessage: "Sir, we are facing issue in student attendance...",
        time: "10:45 AM",
        unreadCount: 2,
        status: "Open",
        isOnline: true
      },
      {
        _id: "dummy-2",
        name: "Banny Thapar",
        schoolName: "G.D Academy",
        email: "kannythapar950@gmail.com",
        lastMessage: "Payment not showing in dashboard",
        time: "10:20 AM",
        unreadCount: 1,
        status: "Open",
        isOnline: true
      },
      {
        _id: "dummy-3",
        name: "Rakesh Kumar",
        schoolName: "Sunrise Public School",
        email: "rakesh@gmail.com",
        lastMessage: "Please help to update school information",
        time: "Yesterday",
        unreadCount: 0,
        status: "Waiting",
        isOnline: false
      },
      {
        _id: "dummy-4",
        name: "Asha Verma",
        schoolName: "Bright Future School",
        email: "asha@gmail.com",
        lastMessage: "How to add new teacher in the system?",
        time: "Aug 24",
        unreadCount: 0,
        status: "Open",
        isOnline: true
      },
      {
        _id: "dummy-5",
        name: "Pooja Singh",
        schoolName: "G.D Academy",
        email: "pooja@gmail.com",
        lastMessage: "Thanks, issue has been resolved",
        time: "Aug 23",
        unreadCount: 0,
        status: "Resolved",
        isOnline: false
      },
      {
        _id: "dummy-6",
        name: "Manoj Kumar",
        schoolName: "Prince school",
        email: "manoj@gmail.com",
        lastMessage: "Need help with exam schedule",
        time: "Aug 22",
        unreadCount: 0,
        status: "Open",
        isOnline: false
      },
      {
        _id: "dummy-7",
        name: "Neha Jaiswal",
        schoolName: "Little Angels School",
        email: "neha@gmail.com",
        lastMessage: "Attendance report not generating",
        time: "Aug 21",
        unreadCount: 0,
        status: "Open",
        isOnline: true
      }
    ];

    const final = [...list];
    fallbackItems.forEach(item => {
      if (!final.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
        final.push(item);
      }
    });

    return final;
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

  // Formatted messages array containing mockup chat log if selected user is Gudiya
  const displayedMessages = useMemo(() => {
    if (selectedContact?.name === "Gudiya Kumari" && messages.length === 0) {
      return [
        {
          _id: "m-dummy-1",
          sender: { _id: "other", name: "Gudiya Kumari" },
          content: "Sir, we are facing issue in student attendance.",
          createdAt: new Date().toISOString(),
          timeLabel: "10:43 AM"
        },
        {
          _id: "m-dummy-2",
          sender: { _id: currentUserId },
          content: "Hello Gudiya ji, Please share the exact issue you are facing.",
          createdAt: new Date().toISOString(),
          timeLabel: "10:44 AM",
          status: "read"
        },
        {
          _id: "m-dummy-3",
          sender: { _id: "other" },
          content: "When I mark attendance, it is not saving and showing error.",
          createdAt: new Date().toISOString(),
          timeLabel: "10:44 AM"
        },
        {
          _id: "m-dummy-4",
          sender: { _id: currentUserId },
          content: "Okay, I will check this from my side. Please try again and let me know.",
          createdAt: new Date().toISOString(),
          timeLabel: "10:45 AM",
          status: "read"
        },
        {
          _id: "m-dummy-5",
          sender: { _id: "other" },
          content: "",
          attachments: [{
            filename: "Error Screenshot.pdf",
            size: 1.2 * 1024 * 1024,
            mimeType: "application/pdf"
          }],
          createdAt: new Date().toISOString(),
          timeLabel: "10:45 AM"
        },
        {
          _id: "m-dummy-6",
          sender: { _id: currentUserId },
          content: "Thanks, received. I will resolve this issue shortly.",
          createdAt: new Date().toISOString(),
          timeLabel: "10:46 AM",
          status: "read"
        },
        {
          _id: "m-dummy-7",
          sender: { _id: "other" },
          content: "Thank you sir!",
          reactions: [{ user: currentUserId, emoji: "❤️" }],
          createdAt: new Date().toISOString(),
          timeLabel: "10:46 AM"
        }
      ];
    }

    return messages;
  }, [messages, selectedContact, currentUserId]);

  const initials = (name) => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: SORA }} className="h-[calc(100vh-140px)] flex flex-col text-slate-800 dark:text-white select-none">
      
      {/* 1. Header support calling and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-4 select-none">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <FaComments className="text-[#7C3AED]" /> Support Chat
          </h2>
          <p className="text-[10px] text-slate-455 dark:text-slate-400 font-extrabold uppercase mt-1">
            Support &gt; School Admins &gt; Chat
          </p>
        </div>

        {/* Dial Calling controls */}
        {selectedContact && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
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
              className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 hover:border-slate-350 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaEllipsisH /> More
            </button>
          </div>
        )}
      </div>

      {/* 2. Main split layout: Chat Sidebar & Chat Pane */}
      <div className="flex-1 flex bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm mt-5 min-h-0">
        
        {/* Left Side: Conversations Directory List */}
        <div className="w-full lg:w-[360px] border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/10 shrink-0 min-h-0">
          
          {/* Search bar & filter */}
          <div className="p-4.5 space-y-4 border-b border-slate-100 dark:border-white/5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B132A] text-slate-805 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none"
                />
              </div>

              <button className="w-9 h-9 bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition">
                <FaFilter className="text-xs" />
              </button>
            </div>

            {/* Sub-tabs row */}
            <div className="flex justify-between select-none">
              {[
                { id: "All", count: 18 },
                { id: "Open", count: 12 },
                { id: "Waiting", count: 3 },
                { id: "Resolved", count: 3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition cursor-pointer uppercase ${
                    activeFilter === tab.id
                      ? "bg-[#7C3AED] text-white shadow-sm"
                      : "bg-transparent text-slate-505 hover:text-slate-800"
                  }`}
                >
                  {tab.id} {tab.count}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {loadingContacts && contacts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-slate-400 text-[10px] font-bold">Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                No active conversations found
              </div>
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
                    className={`w-full p-4.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.01] transition flex items-start gap-3 cursor-pointer ${
                      isActive ? "bg-slate-50/50 dark:bg-white/[0.02] border-l-4 border-[#7C3AED]" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black shrink-0 relative text-xs">
                      {initials(c.name)}
                      {c.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white truncate">{c.name}</h4>
                        <span className="text-[9px] font-extrabold text-slate-400 font-mono shrink-0 select-none">{c.time}</span>
                      </div>
                      
                      <p className="text-[9px] text-[#38BDF8] font-bold mt-0.5 truncate select-none">{c.schoolName}</p>
                      
                      <div className="flex items-center justify-between mt-1.5 gap-2 min-w-0">
                        <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold truncate flex-1">
                          {c.lastMessage}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[8px] font-black flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Load more timeline trigger */}
          <div className="p-3 border-t border-slate-100 dark:border-white/5 text-center bg-white dark:bg-transparent">
            <button className="text-[10px] font-black text-slate-455 dark:text-slate-400 uppercase tracking-widest hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto select-none">
              Load more conversations v
            </button>
          </div>

        </div>

        {/* Right Side: Chat Messaging Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0B132A] relative">
          {selectedContact ? (
            <div className="flex-grow flex flex-col min-h-0">
              
              {/* Chat Pane Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black relative shrink-0">
                  {initials(selectedContact.name)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0B132A] rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{selectedContact.name}</h3>
                  <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">{selectedContact.schoolName || "Prince school"}</p>
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-green-555 tracking-wider mt-0.5 select-none animate-pulse">● Online</span>
                </div>
              </div>

              {/* Chat Messages Feed logs scrollable */}
              <div className="flex-grow overflow-y-auto p-5 space-y-5 bg-slate-50/[0.02]">
                
                {/* Date delimiter */}
                <div className="text-center my-6 select-none">
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
                      {/* Text content layout */}
                      {msg.content && (
                        <div className={`p-4 rounded-2.5xl text-xs font-semibold leading-relaxed shadow-sm relative ${
                          isSenderMe 
                            ? "bg-[#7C3AED] text-white rounded-tr-none" 
                            : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                      )}

                      {/* PDF Attachment card */}
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
                            title="Download PDF"
                          >
                            <FaDownload className="text-[10px]" />
                          </a>
                        </div>
                      ))}

                      {/* Bubble Info Row: Time & Reactions */}
                      <div className="flex items-center gap-2 mt-1.5 select-none font-mono">
                        <span className="text-[8.5px] text-slate-400 font-extrabold">
                          {msg.timeLabel || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        
                        {isSenderMe && (
                          <FaCheckDouble className={`text-[9px] ${msg.status === "read" ? "text-blue-500" : "text-slate-350"}`} />
                        )}

                        {/* Reaction Pill overlay click triggers */}
                        {hasReaction && (
                          <div className="ml-1 flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/10 rounded-full px-1.5 py-0.5 text-[9px] font-black text-slate-655 cursor-pointer hover:scale-105 transition-transform">
                            <span>{msg.reactions[0].emoji}</span>
                            <span className="text-[8px]">{msg.reactions.length}</span>
                          </div>
                        )}
                        
                        {/* Hover reaction toggle drawer trigger */}
                        {!isSenderMe && !hasReaction && (
                          <button
                            onClick={() => handleReactToMessage(msg._id, "❤️")}
                            className="opacity-0 hover:opacity-100 group-hover:opacity-100 transition duration-150 text-[10px] text-slate-400 hover:text-[#7C3AED] cursor-pointer ml-1"
                            title="React with Heart"
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

              {/* Chat Pane Footer Message Input */}
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
                  title="Upload attachment file"
                >
                  <FaPaperclip className="text-xs" />
                </button>

                <button
                  type="button"
                  onClick={() => setInputText(prev => prev + " ji")}
                  className="w-9.5 h-9.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl text-slate-500 hover:text-slate-805 flex items-center justify-center transition cursor-pointer shrink-0"
                  title="Insert emoji"
                >
                  <FaRegSmile className="text-xs" />
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-slate-850 dark:text-white placeholder-slate-405 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
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
                    onClick={() => alert("Microphone dictation starts...")}
                    className="w-9.5 h-9.5 bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/20 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Voice message"
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
