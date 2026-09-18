import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { 
  FaPhoneAlt, 
  FaVideo, 
  FaPhoneSlash, 
  FaClock, 
  FaUser, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaPhoneVolume,
  FaSpinner,
  FaExclamationCircle,
  FaMicrophone,
  FaMicrophoneSlash,
  FaRedo
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";
import API_URL from "../../../config/api";

export default function SupportCalls() {
  const API = API_URL;
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [callMode, setCallMode] = useState("voice"); // "voice" or "video"
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [callsHistory, setCallsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchContactText, setSearchContactText] = useState("");

  const {
    callState,
    callType,
    callPartner,
    callDuration,
    isMuted,
    isCamOff,
    startCall,
    endCall,
    cancelCall,
    toggleMute,
    toggleCamera
  } = useCall() || {};

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/support/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data || []);
      if (res.data && res.data.length > 0 && !selectedContact) {
        setSelectedContact(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching support call contacts:", err);
    }
  }, [API, token, selectedContact]);

  const fetchCallsHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/support/calls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCallsHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching call history:", err);
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    fetchContacts();
    fetchCallsHistory();

    const handleCallHistoryUpdate = () => {
      fetchCallsHistory();
    };
    window.addEventListener("call:history-updated", handleCallHistoryUpdate);
    return () => {
      window.removeEventListener("call:history-updated", handleCallHistoryUpdate);
    };
  }, [fetchContacts, fetchCallsHistory]);

  const handleStartCall = () => {
    if (!selectedContact) {
      alert("Please select a target user to initiate call.");
      return;
    }
    startCall(selectedContact, callMode);
  };

  const handleDialDigit = (digit) => {
    setSearchContactText(prev => prev + digit);
  };

  // Filtered Contacts for Selection
  const matchingContacts = useMemo(() => {
    if (!searchContactText.trim()) return contacts;
    const q = searchContactText.toLowerCase().trim();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.schoolName?.toLowerCase().includes(q)
    );
  }, [contacts, searchContactText]);

  // Real-time Summary Statistics
  const stats = useMemo(() => {
    const total = callsHistory.length;
    const active = callState !== "idle" ? 1 : 0;
    const missed = callsHistory.filter(c => c.status === "missed" || c.status === "rejected" || c.status === "timeout").length;
    const video = callsHistory.filter(c => c.type === "video").length;
    return { active, total, missed, video };
  }, [callsHistory, callState]);

  // Filter Calls History Table by Tabs & Search
  const filteredCalls = useMemo(() => {
    return callsHistory.filter(call => {
      const isCaller = call.caller?._id === currentUserId;
      const partner = isCaller ? call.receiver : call.caller;
      const partnerName = partner?.name?.toLowerCase() || "";
      const partnerSchool = partner?.schoolName?.toLowerCase() || "";
      const matchesSearch = !searchQuery.trim() || 
        partnerName.includes(searchQuery.toLowerCase()) || 
        partnerSchool.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "activecalls") return callState !== "idle";
      if (activeTab === "missedcalls") return call.status === "missed" || call.status === "rejected" || call.status === "timeout";
      if (activeTab === "videocalls") return call.type === "video";
      return true;
    });
  }, [callsHistory, currentUserId, searchQuery, activeTab, callState]);

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return "00:00";
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API}${url}`;
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Support Calling Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time audio & video support call operations with students, teachers and school admins.
          </p>
        </div>

        {selectedContact && (
          <button 
            onClick={handleStartCall}
            disabled={callState !== "idle"}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 transition cursor-pointer disabled:opacity-50"
          >
            <FaPhoneAlt className="text-xs" />
            <span>Call {selectedContact.name}</span>
          </button>
        )}
      </div>

      {/* 5 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneVolume className="text-lg animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">{stats.active}</div>
            <div className="text-[10px] text-slate-400 font-medium">Active Calls</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneAlt className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">{stats.total}</div>
            <div className="text-[10px] text-slate-400 font-medium">Total Calls Logged</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaPhoneSlash className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">{stats.missed}</div>
            <div className="text-[10px] text-slate-400 font-medium">Missed / Rejected</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaVideo className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">{stats.video}</div>
            <div className="text-[10px] text-slate-400 font-medium">Video Sessions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 font-bold">
            <FaClock className="text-lg" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {stats.total > 0 ? `${Math.round(stats.total * 4.2)}m` : "0m"}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Est. Duration</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Calls Table (Col 8) & Interactive Dialpad / Call Controls Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALLS TABLE AREA (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Controls Bar & Filter Tabs */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
              {[
                { key: "all", label: "All Calls" },
                { key: "activecalls", label: "Active" },
                { key: "missedcalls", label: "Missed" },
                { key: "videocalls", label: "Video" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-purple-600 text-white shadow" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Filter Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by name..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-xs focus:outline-none"
              />
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            </div>
          </div>

          {/* Call History Table */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center space-y-2">
                  <FaSpinner className="animate-spin text-xl text-purple-500 mx-auto" />
                  <p className="text-xs text-slate-400">Loading call history logs...</p>
                </div>
              ) : filteredCalls.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-semibold">
                  No call logs match the selected filter.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#121B2E] border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">User / Participant</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Time & Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredCalls.map((call, idx) => {
                      const isCaller = call.caller?._id === currentUserId;
                      const partner = isCaller ? call.receiver : call.caller;
                      const partnerName = partner?.name || "Unknown User";
                      const partnerRole = partner?.role || "User";
                      const partnerSchool = partner?.schoolName || call.schoolName || "TeachHub HQ";

                      return (
                        <tr key={call._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                          <td className="p-3.5 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {partner?.avatar ? (
                                  <img src={getFileUrl(partner.avatar)} alt={partnerName} className="w-full h-full object-cover" />
                                ) : (
                                  partnerName.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white text-xs">{partnerName}</div>
                                <div className="text-[10px] text-slate-400">{partner?.email || (isCaller ? "Outgoing" : "Incoming")}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 capitalize">
                              {partnerRole}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{partnerSchool}</td>
                          <td className="p-3.5">
                            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 capitalize">
                              {call.type === "video" ? <FaVideo className="text-indigo-400" /> : <FaPhoneAlt className="text-emerald-400" />}
                              <span>{call.type}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">{formatDuration(call.duration)}</td>
                          <td className="p-3.5 text-slate-400 whitespace-nowrap">
                            {new Date(call.createdAt).toLocaleDateString()} {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              call.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                              call.status === "pending" || call.status === "ringing" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                              "bg-rose-500/20 text-rose-400"
                            }`}>
                              {call.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {partner && (
                              <button
                                onClick={() => {
                                  setSelectedContact(partner);
                                  startCall(partner, call.type || "voice");
                                }}
                                title="Redial Call"
                                className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-xl transition cursor-pointer"
                              >
                                <FaRedo className="text-xs" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDE DIALPAD & ACTIVE CALL SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Call Control Box (When Call is Active/Calling/Ringing) */}
          {callState !== "idle" && (
            <div className="bg-[#0D1527] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4 text-white animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {callState === "calling" ? "Calling..." : callState === "ringing" ? "Ringing..." : "Active Call"}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-300 font-bold">{formatDuration(callDuration)}</span>
              </div>

              {callPartner && (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                    {callPartner.avatar ? (
                      <img src={getFileUrl(callPartner.avatar)} alt={callPartner.name} className="w-full h-full object-cover" />
                    ) : (
                      callPartner.name?.substring(0, 2).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{callPartner.name}</h4>
                    <p className="text-xs text-slate-400 capitalize">{callPartner.role || "Participant"} • {callPartner.schoolName || "HQ"}</p>
                  </div>
                </div>
              )}

              {/* In-Call Controls */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  onClick={toggleMute}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    isMuted ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  <span>{isMuted ? "Unmute" : "Mute"}</span>
                </button>

                <button 
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    isCamOff ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                  }`}
                >
                  <FaVideo />
                  <span>{isCamOff ? "Cam Off" : "Cam On"}</span>
                </button>
              </div>

              <button 
                onClick={callState === "calling" ? cancelCall : endCall}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer transition"
              >
                <FaPhoneSlash />
                <span>{callState === "calling" ? "Cancel Call" : "End Call"}</span>
              </button>
            </div>
          )}

          {/* Make a Call Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaPhoneAlt className="text-purple-400" />
              <span>Initiate Support Call</span>
            </h3>

            {/* Call Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#162238] p-1 rounded-xl text-xs">
              <button 
                onClick={() => setCallMode("voice")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  callMode === "voice" ? "bg-purple-600 text-white shadow" : "text-slate-400"
                }`}
              >
                <FaPhoneAlt className="text-xs" />
                <span>Voice Call</span>
              </button>
              <button 
                onClick={() => setCallMode("video")}
                className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  callMode === "video" ? "bg-purple-600 text-white shadow" : "text-slate-400"
                }`}
              >
                <FaVideo className="text-xs" />
                <span>Video Call</span>
              </button>
            </div>

            {/* Contact Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Target User</label>
              <select
                value={selectedContact?._id || ""}
                onChange={(e) => {
                  const found = contacts.find(c => c._id === e.target.value);
                  if (found) setSelectedContact(found);
                }}
                className="w-full bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
              >
                {contacts.length === 0 ? (
                  <option value="">Loading contacts...</option>
                ) : (
                  contacts.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.role}) - {c.schoolName || "HQ"}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <input 
                type="text"
                value={searchContactText}
                onChange={(e) => setSearchContactText(e.target.value)}
                placeholder="Search user by name..."
                className="w-full px-4 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            {/* Phone Dialpad */}
            <div className="grid grid-cols-3 gap-2 text-slate-800 dark:text-white font-bold">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDialDigit(num)}
                  className="py-2.5 bg-slate-100 dark:bg-[#162238] hover:bg-purple-600/20 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Dial Button */}
            <button 
              onClick={handleStartCall}
              disabled={callState !== "idle" || !selectedContact}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FaPhoneAlt />
              <span>Start {callMode === "video" ? "Video" : "Voice"} Call</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
