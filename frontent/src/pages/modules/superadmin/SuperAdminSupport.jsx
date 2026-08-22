import { useEffect, useState } from "react";
import axios from "axios";
import { FaComments, FaSchool } from "react-icons/fa";
import SupportChatEngine from "../../../components/SupportChatEngine";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
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
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans flex bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm h-[calc(100vh-140px)]">
      {/* Contacts List Panel */}
      <div className={`w-full lg:w-1/3 border-r border-slate-100 flex flex-col h-full bg-slate-50/50 ${
        activeContact ? "hidden lg:flex" : "flex"
      }`}>
        <div className="p-4 border-b border-slate-100 bg-white select-none">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FaComments className="text-[#7C3AED]" />
            School Admins
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Select admin to support</p>
        </div>

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
      </div>

      {/* Messaging Panel / Chat Engine */}
      <div className={`flex-1 flex-col h-full bg-white relative ${
        activeContact ? "flex" : "hidden lg:flex"
      }`}>
        {activeContact ? (
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
        )}
      </div>
    </div>
  );
}

export default SuperAdminSupport;
