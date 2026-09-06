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

const defaultAdminContacts = [];

function SuperAdminSupport() {
  const API = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const token = localStorage.getItem("token");

  // Instant load state from local cache or pre-loaded defaults
  const [adminContacts, setAdminContacts] = useState(() => {
    const cached = localStorage.getItem("cached_superadmin_support_contacts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => !["admin_gd_academy", "admin_lincoln", "admin_pine"].includes(c._id));
        }
      } catch (e) {}
    }
    return [];
  });

  const [activeContact, setActiveContact] = useState(() => adminContacts[0] || null);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const { socket } = useCall();

  // Background fetch of School Admins from backend
  useEffect(() => {
    fetchSchoolAdmins();
  }, []);

  // Listen to Socket.io user status changes (Online / Offline)
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

    socket.on("user:status-change", handleUserStatusChange);
    return () => {
      socket.off("user:status-change", handleUserStatusChange);
    };
  }, [socket]);

  const fetchSchoolAdmins = async () => {
    try {
      setSyncing(true);
      const res = await axios.get(`${API}/api/superadmin/users?role=admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentUserId = localStorage.getItem("userId");
      const usersList = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      const mappedAdmins = usersList
        .filter((u) => u._id !== currentUserId)
        .map((u) => ({
          _id: u._id,
          name: u.name || "School Admin",
          email: u.email || "",
          role: "admin",
          schoolName: u.schoolName || u.requestedSchool || "Partner School",
          isOnline: u.isOnline !== undefined ? u.isOnline : false,
          avatar: u.photo || ""
        }));

      setAdminContacts(mappedAdmins);
      localStorage.setItem("cached_superadmin_support_contacts", JSON.stringify(mappedAdmins));
      if (mappedAdmins.length > 0) {
        if (!activeContact || !mappedAdmins.some((c) => c._id === activeContact._id)) {
          setActiveContact(mappedAdmins[0]);
        }
      } else {
        setActiveContact(null);
      }
    } catch (err) {
      console.log("Error loading School Admin contacts");
    } finally {
      setSyncing(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = adminContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Super Admin Support Workspace</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Direct video calls, voice calls, file sharing & chat with School Admins.</p>
        </div>
        <button
          onClick={fetchSchoolAdmins}
          className="flex items-center gap-2 bg-white dark:bg-[#131B2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all self-start md:self-auto"
        >
          <FaSync className={syncing ? "animate-spin text-blue-500" : "text-blue-500"} />
          <span>{syncing ? "Syncing..." : "Sync Admins"}</span>
        </button>
      </div>

      {/* Main Support Workspace Box */}
      <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row flex-1 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Left Sidebar: School Admin Contacts */}
        <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-[#131B2E] ${
          activeContact ? "hidden md:flex" : "flex"
        }`}>
          {/* Header Tab */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]/50 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <FaUserShield className="text-blue-500" />
              School Admins List
            </span>
            <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {adminContacts.length} Admins
            </span>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search school admin or school..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Admin Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FaUserTie className="text-2xl mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                <p className="text-xs">No school admins found</p>
              </div>
            ) : (
              filteredContacts.map((admin) => {
                const isSelected = activeContact?._id === admin._id;
                return (
                  <div
                    key={admin._id}
                    onClick={() => setActiveContact(admin)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-600/15 border-l-4 border-blue-500 text-slate-900 dark:text-white"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {admin.avatar ? (
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#131B2E] ${
                          admin.isOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{admin.name}</h4>
                        <span className="text-[10px] text-slate-500 capitalize">{admin.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <FaSchool className="text-slate-400 dark:text-slate-500 text-[10px]" />
                        <span>{admin.schoolName}</span>
                      </p>
                    </div>
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
                <p className="text-sm font-medium">Select a School Admin to start voice call, video call, or chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminSupport;
