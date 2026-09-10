import { useState, useRef, useEffect } from "react";
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
  FaCheckDouble, 
  FaEllipsisV, 
  FaPlay, 
  FaDownload,
  FaPlus,
  FaExternalLinkAlt,
  FaFileAlt
} from "react-icons/fa";

export default function SupportLiveChat() {
  const [chatTab, setChatTab] = useState("all"); // "all", "new", "open"
  const [searchChat, setSearchChat] = useState("");
  const [activeContactId, setActiveContactId] = useState("1");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  // Mock Contacts List
  const contacts = [
    {
      id: "1",
      name: "Amit Kumar",
      role: "Student",
      school: "G.D Academy",
      schoolLocation: "Siwan, Bihar",
      email: "amitkumar2009@gmail.com",
      phone: "+91 98765 43210",
      isOnline: true,
      time: "10:24 AM",
      unread: 3,
      avatarBg: "bg-blue-600",
      preview: "Sir mujhe school join karna hai lekin...",
      ticketId: "#TH-1052",
      category: "How to Use",
      priority: "Medium",
      status: "Open",
      created: "10 Sept 2026, 10:20 AM",
      schoolStats: { classes: 12, students: 320, teachers: 18 }
    },
    {
      id: "2",
      name: "Neha Singh",
      role: "Teacher",
      school: "Saraswati Vidya Niketan",
      schoolLocation: "Patna, Bihar",
      email: "neha@school.com",
      phone: "+91 98123 45678",
      isOnline: true,
      time: "09:50 AM",
      unread: 1,
      avatarBg: "bg-[#0284C7]",
      preview: "Attendance mark nahi ho raha hai",
      ticketId: "#TH-1051",
      category: "Technical Issue",
      priority: "High",
      status: "Open",
      created: "10 Sept 2026, 09:45 AM",
      schoolStats: { classes: 18, students: 540, teachers: 26 }
    },
    {
      id: "3",
      name: "Banny Thapar",
      role: "Admin",
      school: "G.D Academy",
      schoolLocation: "Siwan, Bihar",
      email: "banny@gdacademy.com",
      phone: "+91 99887 76655",
      isOnline: true,
      time: "09:12 AM",
      unread: 2,
      avatarBg: "bg-purple-600",
      preview: "Fee module me payment issue aa r...",
      ticketId: "#TH-1049",
      category: "Fees & Payments",
      priority: "High",
      status: "Open",
      created: "10 Sept 2026, 09:00 AM",
      schoolStats: { classes: 12, students: 320, teachers: 18 }
    },
    {
      id: "4",
      name: "Rohit Verma",
      role: "Student",
      school: "Sunrise Public School",
      schoolLocation: "New Delhi",
      email: "rohit@gmail.com",
      phone: "+91 98760 12345",
      isOnline: false,
      time: "08:45 AM",
      unread: 0,
      avatarBg: "bg-cyan-600",
      preview: "App open nahi ho raha hai",
      ticketId: "#TH-1048",
      category: "Technical Issue",
      priority: "Medium",
      status: "Open",
      created: "10 Sept 2026, 08:30 AM",
      schoolStats: { classes: 10, students: 280, teachers: 15 }
    }
  ];

  // Active Contact Data
  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Initial Messages for Active Chat (Amit Kumar)
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "user",
      text: "Hello sir, mujhe school join karna hai lekin mujhe samajh nahi aa raha ki apply kaise karna hai. Kripya guide karein.",
      time: "10:20 AM"
    },
    {
      id: "m2",
      sender: "support",
      text: "Hello Amit, Bilkul, main aapko step by step bata deta hoon. 😊 Aap School tab par click kijiye aur wahan se school search karke 'Join School' par click karein.",
      time: "10:22 AM"
    },
    {
      id: "m3",
      sender: "user",
      text: "Thik hai sir, ek screenshot bhej raha hoon.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80",
      time: "10:23 AM"
    },
    {
      id: "m4",
      sender: "support",
      text: "Aapko yahan 'Join School' par click karna hai. Uske baad Student ya Teacher role select karke submit kar dein.",
      time: "10:24 AM"
    },
    {
      id: "m5",
      sender: "user",
      audio: true,
      audioDuration: "0:18",
      time: "10:25 AM"
    },
    {
      id: "m6",
      sender: "user",
      text: "Thank you sir, ab ho gaya. 🙏",
      time: "10:26 AM"
    }
  ]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: "support",
      text: messageText.trim(),
      time: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-4 select-none">
      
      {/* COLUMN 1: CHATS LIST (Col 3) */}
      <div className="lg:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-sm">
        
        {/* Header & Filter */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>Chats</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">12</span>
          </h2>
          <button className="p-2 text-slate-400 hover:text-white rounded-lg transition">
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
            placeholder="Search by name, school, or issue..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl mb-3 text-xs">
          <button 
            onClick={() => setChatTab("all")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "all" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            All (12)
          </button>
          <button 
            onClick={() => setChatTab("new")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "new" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            New (3)
          </button>
          <button 
            onClick={() => setChatTab("open")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition ${chatTab === "open" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            Open (5)
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`
                p-3 rounded-xl cursor-pointer transition flex items-start gap-3 border
                ${activeContactId === contact.id 
                  ? "bg-purple-600/10 border-purple-500/40" 
                  : "bg-slate-50 dark:bg-[#121B2E] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                }
              `}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${contact.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                  {contact.name.split(" ").map(n => n[0]).join("")}
                </div>
                {contact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0D1527]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{contact.name}</h4>
                  <span className="text-[10px] text-slate-400">{contact.time}</span>
                </div>

                <div className="text-[10px] font-semibold text-purple-400 truncate mt-0.5">
                  {contact.role} • {contact.school}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{contact.preview}</p>
                  {contact.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* COLUMN 2: CENTER CONVERSATION WINDOW (Col 6) */}
      <div className="lg:col-span-6 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col h-full shadow-sm overflow-hidden">
        
        {/* Active Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#121B2E]/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${activeContact.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
              {activeContact.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{activeContact.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </span>
                <span>•</span>
                <span>{activeContact.role}</span>
                <span>•</span>
                <span>{activeContact.school}</span>
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
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition">
              <FaEllipsisV className="text-sm" />
            </button>
          </div>
        </div>

        {/* Messages Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-[#070C16]/40 custom-scrollbar">
          
          {/* Date separator */}
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 dark:bg-[#162238] px-3 py-1 rounded-full">
              Today, 10 Sept 2026
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isUser ? "self-start" : "ml-auto flex-row-reverse"}`}
              >
                <div className={`w-8 h-8 rounded-full ${isUser ? activeContact.avatarBg : "bg-purple-600"} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0`}>
                  {isUser ? activeContact.name.substring(0, 2).toUpperCase() : "ST"}
                </div>

                <div className="space-y-1">
                  <div className={`
                    p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                    ${isUser 
                      ? "bg-slate-200 dark:bg-[#162238] text-slate-800 dark:text-slate-100 rounded-tl-none" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none"
                    }
                  `}>
                    {msg.text && <p>{msg.text}</p>}

                    {/* Image Attachment Card */}
                    {msg.image && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-white/20 max-w-xs group">
                        <img src={msg.image} alt="Attachment" className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button className="p-2 bg-black/60 rounded-full text-white hover:bg-black">
                            <FaDownload className="text-xs" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Audio Voice Player Card */}
                    {msg.audio && (
                      <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl min-w-[200px]">
                        <button className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <FaPlay className="text-xs ml-0.5" />
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-white rounded-full" />
                          </div>
                          <span className="text-[10px] opacity-80">{msg.audioDuration}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`text-[10px] text-slate-400 px-1 flex items-center gap-1 ${isUser ? "" : "justify-end"}`}>
                    <span>{msg.time}</span>
                    {!isUser && <FaCheckDouble className="text-purple-400 text-[10px]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1527] space-y-2">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400">
              <button type="button" className="p-2 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition" title="Attach file">
                <FaPaperclip className="text-sm" />
              </button>
              <button type="button" className="p-2 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition" title="Send Image">
                <FaImage className="text-sm" />
              </button>
              <button type="button" className="p-2 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition" title="Voice note">
                <FaMicrophone className="text-sm" />
              </button>
            </div>

            <input 
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
            />

            <button type="button" className="p-2 text-slate-400 hover:text-amber-400 rounded-xl transition">
              <FaSmile className="text-base" />
            </button>

            <button 
              type="submit"
              className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg transition"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </div>

        </form>

      </div>

      {/* COLUMN 3: RIGHT CONTEXT & DETAILS SIDEBAR (Col 3) */}
      <div className="lg:col-span-3 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col h-full shadow-sm overflow-y-auto custom-scrollbar space-y-4">
        
        {/* User Information Box */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">User Information</h3>
          
          <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 flex flex-col items-center text-center space-y-2">
            <div className={`w-14 h-14 rounded-full ${activeContact.avatarBg} text-white font-bold text-base flex items-center justify-center shadow-md`}>
              {activeContact.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{activeContact.name}</h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 mt-1 inline-block">
                {activeContact.role}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1 w-full pt-2 border-t border-slate-200 dark:border-white/5">
              <div>{activeContact.email}</div>
              <div>{activeContact.phone}</div>
            </div>
          </div>
        </div>

        {/* School Information Box */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">School Information</h3>
          
          <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <FaSchool />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{activeContact.school}</h4>
                  <p className="text-[10px] text-slate-400">{activeContact.schoolLocation}</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-purple-400 hover:underline">View</button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-white/5 text-center text-xs">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{activeContact.schoolStats.classes}</div>
                <div className="text-[10px] text-slate-400">Classes</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{activeContact.schoolStats.students}</div>
                <div className="text-[10px] text-slate-400">Students</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white">{activeContact.schoolStats.teachers}</div>
                <div className="text-[10px] text-slate-400">Teachers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Details Box */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Support Details</h3>
          
          <div className="bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Ticket ID</span>
              <span className="font-mono font-bold text-purple-400">{activeContact.ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{activeContact.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Priority</span>
              <span className="font-bold text-amber-400">{activeContact.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="font-bold text-rose-400">{activeContact.status}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <FaPlus className="text-xs" />
              <span>Create Ticket</span>
            </button>
            <button className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <FaPhoneAlt className="text-xs" />
              <span>Audio Call</span>
            </button>
            <button className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <FaVideo className="text-xs" />
              <span>Video Call</span>
            </button>
            <button className="p-2.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <FaFileAlt className="text-xs" />
              <span>All Tickets</span>
            </button>
          </div>
        </div>

        {/* Recent Tickets History */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Tickets</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 dark:bg-[#121B2E] rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-purple-400 font-mono">#TH-1021</div>
                <div className="text-[10px] text-slate-400">Login issue</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Resolved</span>
            </div>

            <div className="p-2 bg-slate-50 dark:bg-[#121B2E] rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-purple-400 font-mono">#TH-0988</div>
                <div className="text-[10px] text-slate-400">Exam schedule</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Resolved</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
