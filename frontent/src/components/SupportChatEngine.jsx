import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaBroadcastTower, FaComments, FaUserCircle, FaSchool, 
  FaPhone, FaVideo, FaMicrophone, FaTimes, FaPaperclip, FaFile, FaFilePdf, 
  FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaSmile, FaReply, 
  FaTrash, FaCheck, FaCheckDouble, FaPause, FaPlay, FaArrowLeft, FaUndo
} from "react-icons/fa";
import { useCall } from "../context/CallContext";

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
  
  // Emojis, Attachments, Replies, Audio Recorder
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !audioBlob) || !activeContact) return;

    const tempMessageId = "msg-" + Date.now();
    let contentToSend = newMessage;
    let finalAttachments = [];

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

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Maximum file limit is 50MB.");
      return;
    }

    setUploadProgress("Uploading file...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/api/support/upload`, formData, {
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
        attachments: [res.data],
        clientMessageId: tempId
      };

      const optimisticMsg = {
        _id: tempId,
        sender: { _id: currentUserId, name: "Me", role: userRole },
        receiver: { _id: activeContact._id },
        content: "",
        attachments: [res.data],
        createdAt: new Date(),
        status: "sent",
        reactions: []
      };

      setMessages(prev => [...prev, optimisticMsg]);
      setShowAttachmentMenu(false);
      setTimeout(scrollToBottom, 50);

      const serverRes = await axios.post(`${API}/api/support/message`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === tempId ? serverRes.data : m));
    } catch (err) {
      alert(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploadProgress(null);
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

  const renderFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) return <FaFilePdf className="text-red-500 text-3xl" />;
    if (mimeType.includes("word") || mimeType.includes("doc")) return <FaFileWord className="text-blue-500 text-3xl" />;
    if (mimeType.includes("excel") || mimeType.includes("xls") || mimeType.includes("sheet")) return <FaFileExcel className="text-green-500 text-3xl" />;
    if (mimeType.includes("powerpoint") || mimeType.includes("ppt")) return <FaFilePowerpoint className="text-orange-500 text-3xl" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <FaFileArchive className="text-purple-500 text-3xl" />;
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative select-none">
      
      {/* Top Header Contact info */}
      <div className="p-4 border-b border-slate-200 bg-white z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-[#7C3AED] lg:hidden">
              <FaArrowLeft className="text-sm" />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-black text-sm uppercase">
              {activeContact.name.charAt(0)}
            </div>
            {activeContact.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{activeContact.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{getPresenceText()}</p>
          </div>
        </div>

        {/* Global WebRTC calling hooks trigger */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => startCall(activeContact, "voice")}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition hover:text-[#7C3AED] cursor-pointer"
          >
            <FaPhone className="text-sm" />
          </button>
          <button 
            onClick={() => startCall(activeContact, "video")}
            className="p-3 rounded-full hover:bg-slate-100 text-slate-600 transition hover:text-[#7C3AED] cursor-pointer"
          >
            <FaVideo className="text-sm" />
          </button>
        </div>
      </div>

      {/* Messages Area container */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/40 relative"
      >
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
              <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed relative ${
                isOwn
                  ? "bg-[#7C3AED] text-white rounded-tr-none"
                  : "bg-white border border-slate-200/60 text-slate-700 rounded-tl-none"
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
                        : "bg-slate-100 border-[#7C3AED] text-slate-500"
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

                      if (isImage) {
                        return (
                          <div key={i} className="relative rounded-lg overflow-hidden border border-black/10">
                            <img 
                              src={attach.url} 
                              alt={attach.filename} 
                              className="max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(attach.url, "_blank")}
                            />
                            <a href={attach.url} download className="block text-center py-1.5 bg-black/40 text-white text-[9px] font-bold">Open Fullscreen</a>
                          </div>
                        );
                      }

                      if (isVideo) {
                        return (
                          <div key={i} className="rounded-lg overflow-hidden border border-black/10 max-w-sm">
                            <video src={attach.url} controls className="w-full max-h-48" />
                          </div>
                        );
                      }

                      if (isAudio) {
                        const isPlaying = currentlyPlayingAudio === attach.url;
                        return (
                          <div key={i} className="flex items-center gap-3 bg-black/5 rounded-xl p-3 max-w-sm">
                            <audio id={`audio-player-${i}`} src={attach.url} onEnded={() => setCurrentlyPlayingAudio(null)} className="hidden" />
                            <button 
                              onClick={() => {
                                const player = document.getElementById(`audio-player-${i}`);
                                if (isPlaying) {
                                  player.pause();
                                  setCurrentlyPlayingAudio(null);
                                } else {
                                  player.play();
                                  setCurrentlyPlayingAudio(attach.url);
                                }
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center ${isOwn ? "bg-white text-[#7C3AED]" : "bg-[#7C3AED] text-white"}`}
                            >
                              {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold truncate">Voice Note</p>
                              <p className="text-[9px] opacity-75">Size: {(attach.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <a 
                          key={i} 
                          href={attach.url} 
                          download 
                          className="flex items-center gap-3 p-3 bg-black/5 rounded-xl text-left border border-black/10 hover:bg-black/10 transition block"
                        >
                          {renderFileIcon(attach.mimeType)}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-[11px]">{attach.filename}</p>
                            <p className="text-[9px] opacity-75">{(attach.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </a>
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
                  <div className="absolute -bottom-2.5 right-2 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm">
                    {msg.reactions.map((react, k) => (
                      <span key={k} title={`Reacted`} className="text-[10px]">{react.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className={`absolute top-0 group-hover:flex hidden items-center gap-1 bg-white border border-slate-200 shadow-lg p-1.5 rounded-xl z-20 ${
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
        <div className="px-4 py-1.5 bg-white border-t border-slate-100 text-[10px] text-slate-500 font-bold tracking-wider select-none animate-pulse">
          {typingUser} is typing...
        </div>
      )}

      {uploadProgress && (
        <div className="px-4 py-2 bg-[#7C3AED]/10 text-white flex items-center justify-between text-xs font-bold font-sans">
          <span>{uploadProgress}</span>
          <div className="w-16 h-1 bg-[#7C3AED] rounded overflow-hidden">
            <div className="h-full bg-white animate-infinite-loading" />
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between select-none">
          <div className="border-l-4 border-[#7C3AED] pl-3">
            <p className="text-[10px] font-bold text-[#7C3AED]">Replying to {replyingTo.sender.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{replyingTo.content || "File attachment"}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Composer Input toolbar */}
      <div className="p-4 bg-white border-t border-slate-200">
        
        {showEmojiPicker && (
          <div className="border border-slate-200 rounded-2xl bg-white p-3 mb-3 shadow-lg max-h-56 overflow-y-auto">
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <div key={cat} className="mb-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat}</p>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_CATEGORIES[cat].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-115 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAttachmentMenu && (
          <div className="absolute bottom-20 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs font-bold text-slate-600">
              <FaPaperclip className="text-blue-500" />
              <span>Choose Document / Media</span>
              <input type="file" onChange={handleAttachmentUpload} className="hidden" />
            </label>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-500 hover:text-[#7C3AED] hover:bg-slate-100 transition cursor-pointer"
          >
            <FaSmile className="text-sm" />
          </button>
          
          <button 
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-3 bg-slate-50 border border-slate-250/60 rounded-xl text-slate-500 hover:text-[#7C3AED] hover:bg-slate-100 transition cursor-pointer"
          >
            <FaPaperclip className="text-sm" />
          </button>

          <input 
            type="text"
            placeholder={isRecording ? "Recording audio..." : "Type your message here..."}
            value={newMessage}
            onChange={handleComposerTyping}
            disabled={isRecording}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all disabled:opacity-50"
          />

          {isRecording ? (
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-[10px] text-red-500 font-bold">{recordingDuration}s</span>
              <button 
                type="button"
                onClick={stopRecording}
                className="bg-green-500 text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaCheck className="text-xs" />
              </button>
              <button 
                type="button"
                onClick={cancelRecording}
                className="bg-red-500 text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold">Voice Note Ready</span>
              <button 
                type="submit"
                className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <FaPaperPlane className="text-xs" />
              </button>
              <button 
                type="button"
                onClick={() => setAudioBlob(null)}
                className="bg-slate-200 text-slate-500 p-3.5 rounded-xl flex items-center justify-center hover:bg-slate-300 transition cursor-pointer"
              >
                <FaUndo className="text-xs" />
              </button>
            </div>
          ) : (
            <>
              {newMessage.trim() ? (
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white p-3.5 rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={startRecording}
                  className="bg-slate-50 border border-slate-250/60 text-slate-500 p-3.5 rounded-xl flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
                >
                  <FaMicrophone className="text-xs" />
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default SupportChatEngine;
