import { useEffect, useState } from "react";
import axios from "axios";
import { FaBroadcastTower, FaComments } from "react-icons/fa";
import SupportChatEngine from "../../../../components/SupportChatEngine";

function TeacherSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("admin"); // admin, students
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
      
      // Auto-select Admin if we are in admin tab initially
      const admin = res.data.find(c => c.role === "admin");
      if (admin && activeTab === "admin") {
        setActiveContact(admin);
        fetchBroadcastHistory();
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcastHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/support/history?broadcasts=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBroadcastMessages(res.data);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveContact(null);
    setBroadcastMessages([]);

    if (tab === "admin") {
      const admin = contacts.find(c => c.role === "admin");
      if (admin) {
        setActiveContact(admin);
        fetchBroadcastHistory();
      }
    }
  };

  const studentContacts = contacts.filter(c => c.role === "student");

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 select-none">
        <button
          onClick={() => handleTabChange("admin")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "admin"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
              : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800"
          }`}
        >
          School Admin Support
        </button>
        <button
          onClick={() => handleTabChange("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "students"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
              : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-800"
          }`}
        >
          My Students Chat
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* If Active Tab is Admin Support */}
        {activeTab === "admin" && (
          <div className="flex-1 flex divide-x divide-slate-100">
            {/* Broadcast lists (Left) */}
            <div className="w-1/2 flex flex-col h-full bg-slate-50/20 select-none">
              <div className="p-4 border-b border-slate-100 bg-white">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FaBroadcastTower className="text-teal-500" /> Admin Announcements
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {broadcastMessages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                    No announcements from Admin.
                  </div>
                ) : (
                  broadcastMessages.map((msg) => (
                    <div key={msg._id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold text-teal-600 uppercase bg-teal-50 px-1.5 py-0.5 rounded">
                          Announcement
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Personal Admin Chat (Right) */}
            <div className="w-1/2 flex flex-col h-full bg-white relative">
              {activeContact ? (
                <SupportChatEngine 
                  activeContact={activeContact} 
                  onBack={() => setActiveContact(null)} 
                  userRole="teacher" 
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-slate-400 text-xs font-semibold select-none">
                  Admin support currently unavailable.
                </div>
              )}
            </div>
          </div>
        )}

        {/* If Active Tab is Students Chat */}
        {activeTab === "students" && (
          <div className="flex-1 flex">
            {/* Student list sidebar */}
            <div className={`w-full lg:w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50 ${
              activeContact ? "hidden lg:flex" : "flex"
            }`}>
              <div className="p-4 border-b border-slate-100 bg-white select-none">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FaComments className="text-[#7C3AED]" /> Students Directory
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
                {studentContacts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                    No students found.
                  </div>
                ) : (
                  studentContacts.map((contact) => (
                    <button
                      key={contact._id}
                      onClick={() => setActiveContact(contact)}
                      className={`w-full p-4 text-left hover:bg-slate-100/60 transition flex items-center gap-3 cursor-pointer ${
                        activeContact?._id === contact._id ? "bg-white border-l-4 border-[#7C3AED]" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0 relative">
                        {contact.name.charAt(0).toUpperCase()}
                        {contact.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-700 truncate">{contact.name}</p>
                          {contact.unreadCount > 0 && (
                            <span className="bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {contact.lastMessage ? contact.lastMessage.content || "Media Attachment" : contact.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area / Chat Engine */}
            <div className={`flex-1 flex-col h-full bg-white relative ${
              activeContact ? "flex" : "hidden lg:flex"
            }`}>
              {activeContact ? (
                <SupportChatEngine 
                  activeContact={activeContact} 
                  onBack={() => setActiveContact(null)} 
                  userRole="teacher" 
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 select-none">
                  <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4">
                    <FaComments />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Chat Selected</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Select a student from the directory on the left to start messaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherSupport;
