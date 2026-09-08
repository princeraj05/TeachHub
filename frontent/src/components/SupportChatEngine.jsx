import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaBroadcastTower, FaComments, FaUserCircle, FaSchool, 
  FaPhone, FaVideo, FaMicrophone, FaTimes, FaPaperclip, FaFile, FaFilePdf, 
  FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaSmile, FaReply, 
  FaTrash, FaCheck, FaCheckDouble, FaPause, FaPlay, FaArrowLeft, FaUndo,
  FaImage, FaMusic, FaFolderOpen, FaDownload, FaExpand
} from "react-icons/fa";
import { useCall } from "../context/CallContext";
import { downloadFileMobile } from "../utils/permissionAndDownloadUtils";

const EMOJI_CATEGORIES = {
  "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"],
  "Gestures": ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🙏", "✍️", "👏", "🙌", "👐"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"]
};

function SupportChatEngine({ activeContact, onBack, userRole }) {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUser, setTypingUser] = useState(null);
  
  // Emojis, Attachments, Replies, Audio Recorder & Media Staging
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Staged File Upload & Lightbox State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Audio Playback
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  // Global Call Context hook
  const { socket, startCall } = useCall();

  // Refs
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Helper to get full file URL
  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
      return url;
    }
    return `${API}${url}`;
  };

  // Initialize socket listeners for active contact messaging & status updates
  useEffect(() => {
    if (!socket) return;

    socket.on("support:new-message", (msg) => {
      if (
        msg.type === "personal" &&
        activeContact &&
        ((msg.sender._id === currentUserId && msg.receiver._id === activeContact._id) ||
          (msg.sender._id === activeContact._id && msg.receiver._id === currentUserId))
      ) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId))) {
            return prev;
          }
          return [...prev, msg];
        });

        // Trigger read receipt if we are the recipient
        if (msg.receiver._id === currentUserId) {
          socket.emit("message:read", { senderId: activeContact._id });
        }
        setTimeout(scrollToBottom, 50);
      }
    });

    socket.on("message:status-update", ({ messageId, status, receiverId }) => {
      if (activeContact && receiverId === activeContact._id) {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, status } : m));
      }
    });

    socket.on("message:read-receipt", ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setMessages(prev => prev.map(m => m.status !== "read" ? { ...m, status: "read" } : m));
      }
    });

    socket.on("message:reaction-updated", (updatedMsg) => {
      if (activeContact && (updatedMsg.sender._id === activeContact._id || updatedMsg.receiver._id === activeContact._id)) {
        setMessages(prev => prev.map(m => m._id === updatedMsg._id ? { ...m, reactions: updatedMsg.reactions } : m));
      }
    });

    socket.on("message:deleted-everyone", (deletedMsg) => {
      if (activeContact && (deletedMsg.sender._id === activeContact._id || deletedMsg.receiver._id === activeContact._id)) {
        setMessages(prev => prev.map(m => m._id === deletedMsg._id ? { ...m, content: "This message was deleted", attachments: [], reactions: [] } : m));
      }
    });

    socket.on("typing:start", ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setTypingUser(activeContact.name);
      }
    });

    socket.on("typing:stop", ({ senderId }) => {
      if (activeContact && senderId === activeContact._id) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("support:new-message");
      socket.off("message:status-update");
      socket.off("message:read-receipt");
      socket.off("message:reaction-updated");
      socket.off("message:deleted-everyone");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [activeContact, socket]);

  // Load chat history when active contact changes
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    clearSelectedFile();
    if (activeContact) {
      loadHistory(1, true);
      if (socket) {
        socket.emit("message:read", { senderId: activeContact._id });
      }
    }
  }, [activeContact, socket]);

  const loadHistory = async (pageNumber, isInitial = false) => {
    if (!activeContact) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/history`, {
        params: { otherUserId: activeContact._id, page: pageNumber, limit: 30 },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.length < 30) {
        setHasMore(false);
      }

      if (isInitial) {
        setMessages(res.data);
        setTimeout(scrollToBottom, 100);
      } else {
        const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;
        setMessages(prev => [...res.data, ...prev]);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - prevScrollHeight;
          }
        }, 50);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current && chatContainerRef.current.scrollTop === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Staging media file handlers
  const handleFilePicked = (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("Maximum file limit is 50MB.");
      return;
    }
    setSelectedFile(file);
    setShowAttachmentMenu(false);

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  // Clipboard Paste handler (for screenshots / pasted images)
  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFilePicked(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !audioBlob && !selectedFile) || !activeContact) return;

    const tempMessageId = "msg-" + Date.now();
    let contentToSend = newMessage;
    let finalAttachments = [];

    // 1. Voice recording upload
    if (audioBlob) {
      try {
        setUploadProgress("Uploading voice note...");
        const formData = new FormData();
        const recordingFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        formData.append("file", recordingFile);

        const res = await axios.post(`${API}/api/support/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
        finalAttachments = [res.data];
        contentToSend = "";
      } catch (err) {
        alert("Failed to upload audio recording: " + err.message);
        setUploadProgress(null);
        return;
      } finally {
        setUploadProgress(null);
        setAudioBlob(null);
      }
    } 
    // 2. Staged File Upload
    else if (selectedFile) {
      try {
        setUploadProgress(`Uploading ${selectedFile.name}...`);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await axios.post(`${API}/api/support/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
        finalAttachments = [res.data];
      } catch (err) {
        alert("Failed to upload attachment: " + (err.response?.data?.message || err.message));
        setUploadProgress(null);
        return;
      } finally {
        setUploadProgress(null);
        clearSelectedFile();
      }
    }

    const payload = {
      receiver: activeContact._id,
      type: "personal",
      content: contentToSend,
      attachments: finalAttachments,
      replyTo: replyingTo ? replyingTo._id : null,
      clientMessageId: tempMessageId
    };

    const optimisticMsg = {
      _id: tempMessageId,
      sender: { _id: currentUserId, name: "Me", role: userRole },
      receiver: { _id: activeContact._id },
      content: contentToSend,
      attachments: finalAttachments,
      replyTo: replyingTo,
      createdAt: new Date(),
      status: "sent",
      reactions: []
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await axios.post(`${API}/api/support/message`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === tempMessageId ? res.data : m));
    } catch (err) {
      console.error("HTTP fallback sending error:", err);
      setMessages(prev => prev.map(m => m._id === tempMessageId ? { ...m, status: "failed" } : m));
    }
  };

  const handleComposerTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) {
      socket.emit("typing:start", { receiverId: activeContact._id });
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing:stop", { receiverId: activeContact._id });
      }, 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied / not available: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setAudioBlob(null);
    }
  };

  const triggerReaction = async (messageId, emoji) => {
    try {
      await axios.post(`${API}/api/support/react`, { messageId, emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Reaction trigger failed:", err);
    }
  };

  const triggerDelete = async (messageId, type) => {
    try {
      await axios.delete(`${API}/api/support/message/${messageId}?deleteType=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (type === "me") {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) {
      alert("Delete message failed: " + (err.response?.data?.message || err.message));
    }
  };

  const renderFileIcon = (mimeType = "") => {
    if (mimeType.includes("pdf")) return <FaFilePdf className="text-red-500 text-3xl" />;
    if (mimeType.includes("word") || mimeType.includes("doc")) return <FaFileWord className="text-blue-500 text-3xl" />;
    if (mimeType.includes("excel") || mimeType.includes("xls") || mimeType.includes("sheet")) return <FaFileExcel className="text-green-500 text-3xl" />;
    if (mimeType.includes("powerpoint") || mimeType.includes("ppt")) return <FaFilePowerpoint className="text-orange-500 text-3xl" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <FaFileArchive className="text-purple-500 text-3xl" />;
    if (mimeType.includes("image")) return <FaImage className="text-teal-500 text-3xl" />;
    if (mimeType.includes("audio")) return <FaMusic className="text-[#7C3AED] text-3xl" />;
    return <FaFile className="text-slate-400 text-3xl" />;
  };

  const getPresenceText = () => {
    if (!activeContact) return "";
    if (activeContact.isOnline) return "Online";
    if (!activeContact.lastSeen) return "Offline";
    const date = new Date(activeContact.lastSeen);
    const today = new Date();
    
    const isToday = date.toDateString() === today.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Last seen today at ${timeStr}`;
    }
    return `Last seen on ${date.toLocaleDateString()} at ${timeStr}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#111827] relative select-none w-full min-w-0">
      
      {/* Top Header Contact info */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#111827] z-10 flex items-center justify-between shadow-sm w-full shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
          {onBack && (
            <button 
              type="button"
              onClick={onBack} 
              className="p-1.5 sm:p-2 -ml-1 rounded-xl text-slate-500 hover:text-[#7C3AED] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition cursor-pointer shrink-0"
              title="Back"
            >
              <FaArrowLeft className="text-sm sm:text-base" />
            </button>
          )}
          <div className="relative shrink-0">
            {activeContact.avatar ? (
              <img 
                src={getFileUrl(activeContact.avatar)} 
                alt={activeContact.name} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 dark:border-white/10" 
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#6366F1] text-white flex items-center justify-center font-black text-xs sm:text-sm uppercase shadow-sm">
                {activeContact.name.charAt(0)}
              </div>
            )}
            {activeContact.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate leading-tight">{activeContact.name}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5">{getPresenceText()}</p>
          </div>
        </div>

        {/* Global WebRTC calling hooks trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => startCall(activeContact, "voice")}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200 hover:bg-[#7C3AED]/15 hover:text-[#7C3AED] transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Voice Call"
          >
            <FaPhone className="text-xs sm:text-sm" />
          </button>
          <button 
            type="button"
            onClick={() => startCall(activeContact, "video")}
            className="p-2 sm:p-2.5 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] hover:bg-[#7C3AED]/25 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Video Call"
          >
            <FaVideo className="text-xs sm:text-sm" />
          </button>
        </div>
      </div>

      {/* Messages Area container with Drag & Drop */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-100/40 dark:bg-[#0B132A]/20 relative"
      >
        {isDragging && (
          <div className="absolute inset-0 bg-[#7C3AED]/15 backdrop-blur-xs z-40 flex flex-col items-center justify-center border-2 border-dashed border-[#7C3AED] rounded-xl pointer-events-none">
            <FaPaperclip className="text-4xl text-[#7C3AED] animate-bounce mb-2" />
            <p className="text-sm font-bold text-[#7C3AED]">Drop media or document files here</p>
          </div>
        )}

        {loading && page === 1 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-slate-400 text-[10px] font-bold">Loading conversation...</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender._id === currentUserId;
          
          return (
            <div 
              key={msg._id} 
              id={`msg-el-${msg._id}`}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group relative`}
            >
              <div className={`max-w-[85%] sm:max-w-[65%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs text-xs font-medium leading-relaxed relative ${
                isOwn
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-tr-xs"
                  : "bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-xs"
              }`}>
                
                {msg.replyTo && (
                  <div 
                    onClick={() => {
                      const el = document.getElementById(`msg-el-${msg.replyTo._id}`);
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`p-2.5 rounded-lg border-l-4 mb-2 cursor-pointer truncate text-[10px] ${
                      isOwn 
                        ? "bg-white/10 border-white/55 text-white/90" 
                        : "bg-slate-100 dark:bg-white/[0.02] border-[#7C3AED] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <p className="font-bold mb-0.5">Replying to message</p>
                    <p>{msg.replyTo.content || "Attachment file"}</p>
                  </div>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {msg.attachments.map((attach, i) => {
                      const isImage = attach.mimeType.startsWith("image/");
                      const isVideo = attach.mimeType.startsWith("video/");
                      const isAudio = attach.mimeType.startsWith("audio/");
                      const fileUrl = getFileUrl(attach.url);

                      if (isImage) {
                        return (
                          <div key={i} className="relative rounded-xl overflow-hidden border border-black/10 group/img shadow-sm bg-black/5">
                            <img 
                              src={fileUrl} 
                              alt={attach.filename} 
                              className="max-h-64 sm:max-h-72 w-full object-cover cursor-pointer hover:scale-[1.02] transition duration-200"
                              onClick={() => setLightboxMedia(attach)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => setLightboxMedia(attach)}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
                                title="Enlarge Image"
                              >
                                <FaExpand className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadFileMobile(fileUrl, attach.filename)}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
                                title="Download Image"
                              >
                                <FaDownload className="text-xs" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (isVideo) {
                        return (
                          <div key={i} className="rounded-xl overflow-hidden border border-black/10 max-w-sm bg-black">
                            <video src={fileUrl} controls className="w-full max-h-56" />
                            <button 
                              type="button" 
                              onClick={() => downloadFileMobile(fileUrl, attach.filename)} 
                              className="w-full text-center py-1.5 bg-black/60 text-white text-[9px] font-bold hover:bg-black transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <FaDownload /> Download Video
                            </button>
                          </div>
                        );
                      }

                      if (isAudio) {
                        const isPlaying = currentlyPlayingAudio === fileUrl;
                        return (
                          <div key={i} className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-xl p-3 max-w-sm">
                            <audio id={`audio-player-${msg._id}-${i}`} src={fileUrl} onEnded={() => setCurrentlyPlayingAudio(null)} className="hidden" />
                            <button 
                              onClick={() => {
                                const player = document.getElementById(`audio-player-${msg._id}-${i}`);
                                if (isPlaying) {
                                  player?.pause();
                                  setCurrentlyPlayingAudio(null);
                                } else {
                                  player?.play();
                                  setCurrentlyPlayingAudio(fileUrl);
                                }
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOwn ? "bg-white text-[#7C3AED]" : "bg-[#7C3AED] text-white"}`}
                            >
                              {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold truncate">Voice Note / Audio</p>
                              <p className="text-[9px] opacity-75">Size: {(attach.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => downloadFileMobile(fileUrl, attach.filename || "audio.webm")} 
                              className="p-1.5 text-xs text-slate-500 hover:text-[#7C3AED] transition cursor-pointer"
                              title="Download Audio"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={i} 
                          onClick={() => downloadFileMobile(fileUrl, attach.filename)} 
                          className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-left border border-black/10 hover:bg-black/10 transition cursor-pointer"
                        >
                          {renderFileIcon(attach.mimeType)}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-[11px]">{attach.filename}</p>
                            <p className="text-[9px] opacity-75">{(attach.size / 1024 / 1024).toFixed(2)} MB • Tap to Download</p>
                          </div>
                          <FaDownload className="text-slate-400 text-xs shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                <div className="flex items-center justify-end gap-1.5 mt-1.5 select-none">
                  <span className={`text-[8px] font-medium ${isOwn ? "text-white/70" : "text-slate-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isOwn && (
                    <span className="text-[10px]">
                      {msg.status === "sent" && <FaCheck className="text-white/60" />}
                      {msg.status === "delivered" && <FaCheckDouble className="text-white/60" />}
                      {msg.status === "read" && <FaCheckDouble className="text-teal-300" />}
                    </span>
                  )}
                </div>

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm">
                    {msg.reactions.map((react, k) => (
                      <span key={k} title={`Reacted`} className="text-[10px]">{react.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`absolute top-0 group-hover:flex hidden items-center gap-1 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] shadow-lg p-1.5 rounded-xl z-20 ${
                isOwn ? "right-[72%]" : "left-[72%]"
              }`}>
                {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => triggerReaction(msg._id, emoji)}
                    className="hover:scale-125 transition text-sm cursor-pointer p-0.5"
                  >
                    {emoji}
                  </button>
                ))}
                
                <button 
                  onClick={() => setReplyingTo(msg)}
                  title="Reply" 
                  className="p-1 text-slate-500 hover:text-[#7C3AED] text-[10px] cursor-pointer"
                >
                  <FaReply />
                </button>
                <button 
                  onClick={() => triggerDelete(msg._id, isOwn ? "everyone" : "me")}
                  title="Delete" 
                  className="p-1 text-slate-500 hover:text-red-500 text-[10px] cursor-pointer"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="px-4 py-1.5 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-white/[0.05] text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider select-none animate-pulse">
          {typingUser} is typing...
        </div>
      )}

      {uploadProgress && (
        <div className="px-4 py-2 bg-[#7C3AED]/10 text-[#7C3AED] dark:text-white flex items-center justify-between text-xs font-bold font-sans border-t border-slate-200 dark:border-white/5">
          <span>{uploadProgress}</span>
          <div className="w-16 h-1 bg-[#7C3AED]/20 rounded overflow-hidden">
            <div className="h-full bg-[#7C3AED] animate-pulse" />
          </div>
        </div>
      )}

      {/* Replying Banner */}
      {replyingTo && (
        <div className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-white/[0.05] flex items-center justify-between select-none">
          <div className="border-l-4 border-[#7C3AED] pl-3">
            <p className="text-[10px] font-bold text-[#7C3AED]">Replying to {replyingTo.sender.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{replyingTo.content || "File attachment"}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Selected File Attachment Preview Staging Bar */}
      {selectedFile && (
        <div className="p-3 bg-slate-100 dark:bg-[#1f2937]/80 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between select-none">
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            {filePreviewUrl ? (
              <img src={filePreviewUrl} alt="Preview" className="w-11 h-11 rounded-lg object-cover border border-slate-300 dark:border-white/10 shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center text-xl shrink-0 font-bold">
                {renderFileIcon(selectedFile.type)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to send
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={clearSelectedFile} 
            className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
            title="Remove attachment"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={(e) => handleFilePicked(e.target.files[0])} className="hidden" accept="*/*" />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFilePicked(e.target.files[0])} className="hidden" accept="image/*,video/*" />
      <input type="file" ref={docInputRef} onChange={(e) => handleFilePicked(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
      <input type="file" ref={audioInputRef} onChange={(e) => handleFilePicked(e.target.files[0])} className="hidden" accept="audio/*" />

      {/* Composer Input toolbar */}
      <div className="p-2.5 sm:p-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-white/[0.05]">
        
        {showEmojiPicker && (
          <div className="border border-slate-200 dark:border-white/[0.05] rounded-2xl bg-white dark:bg-[#1f2937] p-2.5 sm:p-3 mb-3 shadow-lg max-h-52 sm:max-h-56 overflow-y-auto">
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <div key={cat} className="mb-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat}</p>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
                  {EMOJI_CATEGORIES[cat].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-base sm:text-lg hover:scale-115 transition cursor-pointer p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Attachment Options Menu */}
        {showAttachmentMenu && (
          <div className="absolute bottom-20 left-2 right-2 sm:left-4 sm:right-auto bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 w-64">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <FaImage className="text-sm" />
              </div>
              <div>
                <p className="font-bold">Photos & Videos</p>
                <p className="text-[9px] text-slate-400 font-normal">Images, gallery, MP4 videos</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FaFilePdf className="text-sm" />
              </div>
              <div>
                <p className="font-bold">Document & PDF</p>
                <p className="text-[9px] text-slate-400 font-normal">PDF, Word, Excel, ZIP</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
                <FaMusic className="text-sm" />
              </div>
              <div>
                <p className="font-bold">Audio File</p>
                <p className="text-[9px] text-slate-400 font-normal">MP3, WAV, WebM audio</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200 transition text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FaFolderOpen className="text-sm" />
              </div>
              <div>
                <p className="font-bold">Choose Any File</p>
                <p className="text-[9px] text-slate-400 font-normal">Browse all local media & files</p>
              </div>
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-3">
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 sm:p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-250/60 dark:border-white/[0.08] rounded-xl text-slate-500 dark:text-slate-450 hover:text-[#7C3AED] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer shrink-0"
            title="Emoji Picker"
          >
            <FaSmile className="text-xs sm:text-sm" />
          </button>
          
          <button 
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className={`p-2 sm:p-3 border rounded-xl transition cursor-pointer shrink-0 ${
              selectedFile || showAttachmentMenu 
                ? "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30" 
                : "bg-slate-50 dark:bg-white/[0.02] border-slate-250/60 dark:border-white/[0.08] text-slate-500 dark:text-slate-450 hover:text-[#7C3AED] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            }`}
            title="Attach Media / Files"
          >
            <FaPaperclip className="text-xs sm:text-sm" />
          </button>

          <input 
            type="text"
            placeholder={isRecording ? "Recording audio..." : selectedFile ? `Caption for ${selectedFile.name}...` : "Type your message here..."}
            value={newMessage}
            onChange={handleComposerTyping}
            onPaste={handlePaste}
            disabled={isRecording}
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all disabled:opacity-50"
          />

          {isRecording ? (
            <div className="flex items-center gap-1.5 sm:gap-2 animate-pulse shrink-0">
              <span className="text-[10px] text-red-500 font-bold">{recordingDuration}s</span>
              <button 
                type="button"
                onClick={stopRecording}
                className="bg-green-500 text-white p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaCheck className="text-xs" />
              </button>
              <button 
                type="button"
                onClick={cancelRecording}
                className="bg-red-500 text-white p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="hidden sm:inline text-[9px] text-slate-400 font-bold">Voice Note</span>
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaPaperPlane className="text-xs" />
              </button>
              <button 
                type="button"
                onClick={() => setAudioBlob(null)}
                className="bg-slate-200 text-slate-500 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:bg-slate-300 transition cursor-pointer"
              >
                <FaUndo className="text-xs" />
              </button>
            </div>
          ) : (
            <>
              {newMessage.trim() || selectedFile ? (
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer shrink-0 shadow-md hover:shadow-lg"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={startRecording}
                  className="bg-slate-50 dark:bg-white/[0.02] border border-slate-250/60 dark:border-white/[0.08] text-slate-500 dark:text-slate-450 p-2.5 sm:p-3.5 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/[0.04] transition cursor-pointer shrink-0"
                  title="Record Voice Note"
                >
                  <FaMicrophone className="text-xs" />
                </button>
              )}
            </>
          )}
        </form>
      </div>

      {/* Full Image Lightbox Modal */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => downloadFileMobile(getFileUrl(lightboxMedia.url), lightboxMedia.filename || "image.png")}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition cursor-pointer"
              title="Download"
            >
              <FaDownload />
            </button>
            <button 
              type="button" 
              onClick={() => setLightboxMedia(null)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition cursor-pointer"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] p-2 flex items-center justify-center">
            <img src={getFileUrl(lightboxMedia.url)} alt={lightboxMedia.filename} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          </div>
          <p className="text-white/80 text-xs font-semibold mt-3">{lightboxMedia.filename}</p>
        </div>
      )}

    </div>
  );
}

export default SupportChatEngine;
