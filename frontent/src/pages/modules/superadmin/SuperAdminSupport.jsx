import { useEffect, useState } from "react";
import axios from "axios";
import { FaComments, FaSchool, FaPhone } from "react-icons/fa";
import SupportChatEngine from "../../../components/SupportChatEngine";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [subTab, setSubTab] = useState("personal"); // personal, calls
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [callsHistory, setCallsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();

    const handleCallHistoryUpdate = () => {
      fetchCallsHistory();
    };
    window.addEventListener("call:history-updated", handleCallHistoryUpdate);
    return () => {
      window.removeEventListener("call:history-updated", handleCallHistoryUpdate);
    };
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallsHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/calls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCallsHistory(res.data);
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubTabChange = (sub) => {
    setSubTab(sub);
    if (sub === "calls") {
      fetchCallsHistory();
    }
  };

  return (
    <div className="font-sans flex bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
      {/* Contacts List Panel */}
      <div className={`w-full lg:w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50 ${
        activeContact ? "hidden lg:flex" : "flex"
      }`}>
        <div className="p-3 border-b border-slate-100 bg-white flex gap-2 select-none">
          <button
            onClick={() => handleSubTabChange("personal")}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
              subTab === "personal"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            School Admins
          </button>
          <button
            onClick={() => handleSubTabChange("calls")}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center border cursor-pointer ${
              subTab === "calls"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Calls Log
          </button>
        </div>

        {subTab === "personal" && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
            {loading && contacts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center select-none">
                <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-slate-400 text-[10px] font-bold">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                No Admin contacts found.
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full p-4 text-left hover:bg-slate-100/60 transition flex items-center gap-3 cursor-pointer ${
                    activeContact?._id === contact._id ? "bg-white border-l-4 border-[#7C3AED]" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0 relative">
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
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#38BDF8] mt-1">
                      <FaSchool /> {contact.schoolName || "No School Assigned"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {subTab === "calls" && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 bg-white">
            {callsHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold select-none">
                No call history found.
              </div>
            ) : (
              callsHistory.map((call) => {
                const isOutgoing = call.caller?._id === currentUserId;
                const partner = isOutgoing ? call.receiver : call.caller;
                if (!partner) return null;
                
                const isMissed = call.status === "missed";
                const isRejected = call.status === "rejected";
                const isCompleted = call.status === "completed";

                return (
                  <div
                    key={call._id}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition border-b border-slate-100/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-black flex-shrink-0">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{partner.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 select-none">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            isMissed || isRejected ? "text-rose-500" : isCompleted ? "text-green-500" : "text-amber-500"
                          }`}>
                            {isOutgoing ? "Outgoing" : "Incoming"} · {call.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            · {new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isCompleted && call.duration > 0 && (
                          <p className="text-[9px] text-slate-400 font-semibold font-mono mt-0.5">
                            Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#38BDF8] mt-1 select-none">
                          <FaSchool /> {partner.schoolName || "No School Assigned"}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-400 text-xs">
                      {call.type === "video" ? "🎥" : "📞"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Messaging Panel / Chat Engine */}
      <div className={`flex-1 flex-col h-full bg-white relative ${
        activeContact ? "flex" : "hidden lg:flex"
      }`}>
        {subTab === "personal" ? (
          activeContact ? (
            <SupportChatEngine 
              activeContact={activeContact} 
              onBack={() => setActiveContact(null)} 
              userRole="superadmin" 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 select-none">
              <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
                <FaComments />
              </div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">No Conversation Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Select an Admin from the contact list on the left to start real-time messaging support.
              </p>
            </div>
          )
        ) : (
          /* Calls tab default Display placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/10 select-none">
            <div className="w-16 h-16 rounded-3xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-2xl mb-4 shadow-sm">
              <FaPhone />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Calls History Log</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              View call history logs in the sidebar on the left. Dial voice or video calls inside active conversation windows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminSupport;
