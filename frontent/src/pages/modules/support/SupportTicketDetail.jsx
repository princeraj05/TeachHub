import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaEllipsisV, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSchool, 
  FaUser, 
  FaPaperclip, 
  FaImage, 
  FaMicrophone, 
  FaSmile, 
  FaPaperPlane, 
  FaPhoneAlt, 
  FaVideo, 
  FaDownload, 
  FaFilePdf, 
  FaFileImage,
  FaShare,
  FaQuestionCircle,
  FaSync,
  FaCodeBranch
} from "react-icons/fa";

export default function SupportTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("conversation"); // "conversation", "notes", "activity", "related"
  const [replyMode, setReplyMode] = useState("message"); // "message" or "note"
  const [replyText, setReplyText] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  // Mock Ticket Details matching Screenshot 3
  const ticket = {
    id: id ? `#${id}` : "#TH-1052",
    title: "How to join school?",
    status: "Open",
    createdOn: "10 Sept 2026, 10:20 AM",
    lastUpdated: "10 Sept 2026, 11:05 AM",
    source: "Mobile App (Android)",
    category: "How to Use",
    priority: "Medium",
    assignedTo: "Prince Raj",
    description: "Mujhe school join karna hai lekin mujhe samajh nahi aa raha ki apply kaise karna hai. Kripya step by step guide karein.",
    attachments: [
      { name: "screenshot.jpg", size: "1.2 MB", type: "image", url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80" },
      { name: "guide.pdf", size: "850 KB", type: "pdf" }
    ],
    user: {
      name: "Amit Kumar",
      role: "Student",
      email: "amitkumar2009@gmail.com",
      phone: "+91 98765 43210",
      location: "Siwan, Bihar",
      joinedOn: "5 Sept 2026",
      avatarBg: "bg-blue-600"
    },
    school: {
      name: "G.D Academy",
      location: "Siwan, Bihar",
      status: "Active",
      classes: 12,
      students: 320,
      teachers: 18
    }
  };

  const messages = [
    {
      id: "m1",
      sender: "user",
      senderName: "Amit Kumar (Student)",
      text: "Hello sir, mujhe school join karna hai lekin mujhe samajh nahi aa raha ki apply kaise karna hai. Kripya guide karein.",
      time: "10:20 AM"
    },
    {
      id: "m2",
      sender: "support",
      senderName: "Prince Raj (Support Team)",
      text: "Hello Amit, Bilkul, main aapko step by step bata deta hoon. 😊 Aap School tab par click kijiye aur wahan se school search karke 'Join School' par click karein.",
      time: "10:25 AM"
    },
    {
      id: "m3",
      sender: "user",
      senderName: "Amit Kumar (Student)",
      text: "Thank you sir, ab ho gaya. 🙏",
      time: "10:27 AM"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER NAV & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/support/requests")}
            className="p-2.5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-xl transition"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 dark:text-white font-mono">{ticket.id}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                {ticket.status}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{ticket.title}</h2>
            <div className="text-[11px] text-slate-400">Created on {ticket.createdOn} • via {ticket.source}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <FaCheckCircle />
            <span>Mark as Resolved</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <FaExclamationTriangle />
            <span>Escalate</span>
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-1 rounded-xl">
            <button className="p-1.5 text-slate-400 hover:text-white"><FaChevronLeft className="text-xs" /></button>
            <button className="p-1.5 text-slate-400 hover:text-white"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT: Left Information & Workspace (Col 8) & Right User/School Context (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER WORKSPACE (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Ticket Information Grid */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Ticket Information</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Category</span>
                <span className="font-bold text-purple-400">{ticket.category}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Priority</span>
                <span className="font-bold text-amber-400">{ticket.priority}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="font-bold text-rose-400">{ticket.status}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Assigned To</span>
                <span className="font-bold text-slate-800 dark:text-white">{ticket.assignedTo}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-xs mb-1">Issue Description</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#121B2E] p-3 rounded-xl">
                {ticket.description}
              </p>
            </div>

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">Attachments ({ticket.attachments.length})</h4>
                  <button className="text-purple-400 text-xs font-bold hover:underline">Download All</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map((att, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center gap-3">
                      {att.type === "image" ? <FaFileImage className="text-purple-400 text-lg" /> : <FaFilePdf className="text-rose-400 text-lg" />}
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">{att.name}</div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                      <button className="text-slate-400 hover:text-white ml-2"><FaDownload className="text-xs" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Workspace Tabs & Stream */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Workspace Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 p-3 bg-slate-50/50 dark:bg-[#121B2E]/50 text-xs font-bold">
              <button 
                onClick={() => setActiveTab("conversation")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTab === "conversation" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Conversation
              </button>
              <button 
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTab === "notes" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Internal Notes (2)
              </button>
              <button 
                onClick={() => setActiveTab("activity")}
                className={`px-3 py-1.5 rounded-xl transition ${activeTab === "activity" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Activity Log
              </button>
            </div>

            {/* Conversation Messages Stream */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div key={m.id} className={`flex gap-3 ${isUser ? "self-start" : "ml-auto flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full ${isUser ? ticket.user.avatarBg : "bg-purple-600"} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                      {isUser ? ticket.user.name.substring(0, 2).toUpperCase() : "PR"}
                    </div>
                    <div className="space-y-1 max-w-[80%]">
                      <div className="text-[10px] text-slate-400">{m.senderName} • {m.time}</div>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isUser ? "bg-slate-100 dark:bg-[#162238] text-slate-800 dark:text-white" : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Reply Form */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#121B2E]/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <button onClick={() => setReplyMode("message")} className={`px-2.5 py-1 rounded-lg ${replyMode === "message" ? "bg-purple-600 text-white" : "text-slate-400"}`}>
                  Message
                </button>
                <button onClick={() => setReplyMode("note")} className={`px-2.5 py-1 rounded-lg ${replyMode === "note" ? "bg-amber-600 text-white" : "text-slate-400"}`}>
                  Note (Internal)
                </button>
              </div>

              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyMode === "message" ? "Type your reply..." : "Type internal note visible only to support team..."}
                className="w-full bg-white dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-xs focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="p-2 hover:text-purple-400"><FaPaperclip className="text-xs" /></button>
                  <button className="p-2 hover:text-purple-400"><FaImage className="text-xs" /></button>
                  <button className="p-2 hover:text-purple-400"><FaMicrophone className="text-xs" /></button>
                  <button className="p-2 hover:text-amber-400"><FaSmile className="text-xs" /></button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1">
                    <FaPhoneAlt /><span>Audio Call</span>
                  </button>
                  <button className="px-3 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center gap-1">
                    <FaPaperPlane /><span>Send</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT CONTEXT SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* User Details Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">User Details</h4>
              <button className="text-purple-400 text-xs font-bold hover:underline">View Profile</button>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${ticket.user.avatarBg} text-white font-bold text-sm flex items-center justify-center`}>
                AK
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ticket.user.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                  {ticket.user.role}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
              <div>{ticket.user.email}</div>
              <div>{ticket.user.phone}</div>
              <div>{ticket.user.location}</div>
              <div>Joined: {ticket.user.joinedOn}</div>
            </div>
          </div>

          {/* School Information Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">School Information</h4>
              <button className="text-purple-400 text-xs font-bold hover:underline">View School</button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <FaSchool />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{ticket.school.name}</h4>
                <div className="text-[10px] text-slate-400">{ticket.school.location}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-center text-xs">
              <div><div className="font-bold text-white">{ticket.school.classes}</div><div className="text-[10px] text-slate-400">Classes</div></div>
              <div><div className="font-bold text-white">{ticket.school.students}</div><div className="text-[10px] text-slate-400">Students</div></div>
              <div><div className="font-bold text-white">{ticket.school.teachers}</div><div className="text-[10px] text-slate-400">Teachers</div></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Quick Actions</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button className="p-2.5 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-300 font-bold flex items-center justify-center gap-1">
                <FaShare className="text-purple-400" /><span>Share Guide</span>
              </button>
              <button className="p-2.5 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-300 font-bold flex items-center justify-center gap-1">
                <FaQuestionCircle className="text-blue-400" /><span>Send FAQ</span>
              </button>
              <button className="p-2.5 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-300 font-bold flex items-center justify-center gap-1">
                <FaSync className="text-amber-400" /><span>Reassign</span>
              </button>
              <button className="p-2.5 bg-slate-100 dark:bg-[#162238] rounded-xl text-slate-300 font-bold flex items-center justify-center gap-1">
                <FaCodeBranch className="text-emerald-400" /><span>Merge Ticket</span>
              </button>
            </div>
          </div>

          {/* Resolution Panel Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Resolution</h4>
            
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add resolution note here..."
              className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />

            <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
              Mark as Resolved
            </button>

            <button className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-xl">
              Escalate to Super Admin
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
