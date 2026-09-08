import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserTie,
  FaSchool,
  FaSearch,
  FaSpinner,
  FaComments,
  FaPhone,
  FaVideo,
  FaSync,
  FaUserShield
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";
import SupportChatEngine from "../../../components/SupportChatEngine";

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "https://myschool-admin-panel.onrender.com";
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [adminContacts, setAdminContacts] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_support_contacts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [activeContact, setActiveContact] = useState(() => adminContacts[0] || null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const { socket } = useCall();

  // Background fetch of support contacts (School Admins)
  useEffect(() => {
    fetchContacts();
  }, []);

  // Socket listeners for live status updates & new messages
  useEffect(() => {
    if (!socket) return;

    const handleUserStatusChange = ({ userId, isOnline, lastSeen }) => {
      setAdminContacts((prev) =>
        prev.map((contact) =>
          contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
        )
      );

      setActiveContact((prev) => {
        if (!prev || prev._id !== userId) return prev;
        return { ...prev, isOnline, lastSeen };
      });
    };

    const handleNewMessage = (msg) => {
      if (msg.type === "personal") {
        fetchContacts();
      }
    };

    socket.on("user:status-change", handleUserStatusChange);
    socket.on("support:new-message", handleNewMessage);

    return () => {
      socket.off("user:status-change", handleUserStatusChange);
      socket.off("support:new-message", handleNewMessage);
    };
  }, [socket]);

  const fetchContacts = async () => {
    try {
      setSyncing(true);

      const [supportRes, usersRes] = await Promise.all([
        axios.get(`${API}/api/support/contacts`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
        axios.get(`${API}/api/superadmin/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      const supportList = Array.isArray(supportRes.data) ? supportRes.data : [];
      const usersList = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);

      const contactsMap = new Map();

      supportList.forEach((u) => {
        if (u._id && u._id !== currentUserId && (u.role?.toLowerCase() === "admin")) {
          contactsMap.set(u._id.toString(), {
            _id: u._id,
            name: u.name || "School Admin",
            email: u.email || "",
            role: "admin",
            schoolName: u.schoolName || u.requestedSchool || "School Campus",
            isOnline: Boolean(u.isOnline),
            lastSeen: u.lastSeen || null,
            avatar: u.avatar || u.photo || u.profilePhoto || "",
            lastMessage: u.lastMessage || null,
            unreadCount: u.unreadCount || 0
          });
        }
      });

      usersList.forEach((u) => {
        if (u._id && u._id !== currentUserId && (u.role?.toLowerCase() === "admin") && !contactsMap.has(u._id.toString())) {
          contactsMap.set(u._id.toString(), {
            _id: u._id,
            name: u.name || "School Admin",
            email: u.email || "",
            role: "admin",
            schoolName: u.schoolName || u.requestedSchool || "School Campus",
            isOnline: Boolean(u.isOnline),
            lastSeen: u.lastSeen || null,
            avatar: u.avatar || u.photo || u.profilePhoto || "",
            lastMessage: null,
            unreadCount: 0
          });
        }
      });

      const mergedContacts = Array.from(contactsMap.values());

      mergedContacts.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setAdminContacts(mergedContacts);
      localStorage.setItem("cached_superadmin_support_contacts", JSON.stringify(mergedContacts));

      if (mergedContacts.length > 0) {
        if (!activeContact || !mergedContacts.some((c) => c._id === activeContact._id)) {
          setActiveContact(mergedContacts[0]);
        } else {
          const updatedActive = mergedContacts.find((c) => c._id === activeContact._id);
          if (updatedActive) setActiveContact(updatedActive);
        }
      }
    } catch (err) {
      console.log("Error loading Super Admin support contacts", err);
    } finally {
      setSyncing(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = adminContacts.filter((c) => {
    const query = search.toLowerCase().trim();
    return (
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.schoolName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Super Admin Support Workspace</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Direct video calls, voice calls, file sharing & chat with School Admins.</p>
        </div>
        <button
          onClick={fetchContacts}
          className="flex items-center gap-2 bg-white dark:bg-[#131B2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all self-start md:self-auto cursor-pointer"
        >
          <FaSync className={syncing ? "animate-spin text-blue-500" : "text-blue-500"} />
          <span>{syncing ? "Syncing..." : "Sync Contacts"}</span>
        </button>
      </div>

      {/* Main Support Workspace Box */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row flex-1 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Left Sidebar: Contacts List */}
        <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-[#131B2E] ${
          activeContact ? "hidden md:flex" : "flex"
        }`}>
          {/* Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <FaUserShield className="text-blue-500" />
                School Admins
              </span>
              <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {adminContacts.length} Total
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search by name, school, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FaUserTie className="text-2xl mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                <p className="text-xs font-semibold">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = activeContact?._id === contact._id;
                const isSchoolAdmin = contact.role.toLowerCase() === "admin";

                return (
                  <div
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-600/15 border-l-4 border-blue-500 text-slate-900 dark:text-white"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                          isSchoolAdmin 
                            ? "bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400" 
                            : "bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400"
                        }`}>
                          {contact.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#131B2E] ${
                          contact.isOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{contact.name}</h4>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          isSchoolAdmin 
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" 
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}>
                          {isSchoolAdmin ? "Admin" : "Applicant"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <FaSchool className="text-slate-400 dark:text-slate-500 text-[10px] shrink-0" />
                        <span className="truncate">{contact.schoolName || "Pending Campus"}</span>
                      </p>
                      {contact.lastMessage && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {contact.lastMessage.content || "Attachment"}
                        </p>
                      )}
                    </div>

                    {contact.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Chat & Call Area using SupportChatEngine */}
        <div className={`flex-1 flex-col bg-slate-50/50 dark:bg-[#0B0F19]/40 min-h-0 ${
          activeContact ? "flex" : "hidden md:flex"
        }`}>
          {activeContact ? (
            <SupportChatEngine
              activeContact={activeContact}
              onBack={() => setActiveContact(null)}
              userRole="superadmin"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
              <div>
                <FaComments className="text-3xl mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                <p className="text-sm font-medium">Select a School Admin or Applicant to start voice call, video call, or chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminSupport;
