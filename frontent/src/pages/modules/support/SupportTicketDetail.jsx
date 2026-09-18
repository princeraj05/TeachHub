import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaPaperclip, 
  FaPaperPlane, 
  FaSchool, 
  FaUser,
  FaUserCheck,
  FaSpinner,
  FaExclamationCircle,
  FaTimes,
  FaClock
} from "react-icons/fa";
import { 
  getSupportTicketById, 
  replyToSupportTicket, 
  updateSupportTicketStatus, 
  escalateSupportTicket,
  assignSupportTicket,
  getSupportTeamAgents
} from "../../../services/supportTicketApi";

export default function SupportTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyText, setReplyText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [replying, setReplying] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [escalating, setEscalating] = useState(false);

  // Assignment Modal State (Super Admin Only)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [eligibleAgents, setEligibleAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const currentUserId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole") || localStorage.getItem("role");
  const isSuperAdmin = userRole?.toLowerCase() === "superadmin";

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getSupportTicketById(id);
      setTicket(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load support ticket details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleOpenAssignModal = async () => {
    setShowAssignModal(true);
    setLoadingAgents(true);
    setAssignError("");
    setSelectedAgentId(ticket?.assignedTo?._id || "");
    try {
      const agents = await getSupportTeamAgents();
      const ticketDept = ticket?.assignedDepartment || ticket?.department;
      
      // Filter ONLY eligible agents: active status & matching department
      const filtered = (agents || []).filter(agent => {
        const isActive = agent.status === "active";
        const matchesDept = agent.department === ticketDept;
        return isActive && matchesDept;
      });

      setEligibleAgents(filtered);
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to load support team agents.");
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (assigning || !ticket) return;

    setAssigning(true);
    setAssignError("");
    try {
      const targetId = selectedAgentId === "" ? null : selectedAgentId;
      const res = await assignSupportTicket(id, { assignedTo: targetId });
      setShowAssignModal(false);
      if (res.ticket) {
        setTicket(res.ticket);
      } else {
        fetchTicket();
      }
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to update ticket assignment.");
    } finally {
      setAssigning(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replying) return;

    setReplying(true);
    setError("");
    try {
      const attachments = attachmentUrl.trim()
        ? [{ url: attachmentUrl.trim(), filename: "attachment", mimeType: "image/jpeg", size: 1024 }]
        : [];

      const res = await replyToSupportTicket(id, {
        message: replyText.trim(),
        attachments
      });

      setReplyText("");
      setAttachmentUrl("");
      if (res.ticket) {
        setTicket(res.ticket);
      } else {
        fetchTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (updatingStatus || !ticket) return;

    const validStatuses = ["New", "Open", "In Progress", "Waiting", "Resolved", "Closed", "Escalated"];
    if (!validStatuses.includes(newStatus)) return;

    setUpdatingStatus(true);
    setError("");
    try {
      const res = await updateSupportTicketStatus(id, { status: newStatus });
      if (res.ticket) {
        setTicket(res.ticket);
      } else {
        fetchTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim() || escalating) return;

    setEscalating(true);
    setError("");
    try {
      const res = await escalateSupportTicket(id, { reason: escalateReason.trim() });
      setShowEscalateModal(false);
      setEscalateReason("");
      if (res.ticket) {
        setTicket(res.ticket);
      } else {
        fetchTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to escalate ticket.");
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-16 text-center space-y-3">
        <FaSpinner className="animate-spin text-3xl text-purple-500 mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Loading ticket details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center space-y-4">
        <FaExclamationCircle className="text-4xl text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Ticket Loading Error</h3>
          <p className="text-xs text-rose-400 mt-1">{error}</p>
        </div>
        <button 
          onClick={() => navigate("/support/requests")}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Support Requests
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  const requesterName = ticket.requester?.name || "Unknown Requester";
  const requesterEmail = ticket.requester?.email || "";
  const requesterRole = ticket.requesterRole || ticket.requester?.role || "User";
  const schoolName = ticket.schoolName || ticket.requester?.schoolName || "TeachHub HQ";

  return (
    <div className="space-y-6">
      {/* HEADER NAV & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/support/requests")}
            className="p-2.5 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">{ticket.ticketNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                ticket.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400" :
                ticket.status === "Escalated" ? "bg-rose-600 text-white" :
                ticket.status === "In Progress" ? "bg-amber-500/20 text-amber-400" : "bg-purple-500/20 text-purple-400"
              }`}>
                {ticket.status}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{ticket.subject}</h2>
            <div className="text-[11px] text-slate-400">
              Created on {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={handleOpenAssignModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <FaUserCheck />
              <span>{ticket.assignedTo ? "Reassign Agent" : "Assign Agent"}</span>
            </button>
          )}

          {ticket.status !== "Resolved" && (
            <button 
              disabled={updatingStatus}
              onClick={() => handleStatusChange("Resolved")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
            >
              <FaCheckCircle />
              <span>Mark Resolved</span>
            </button>
          )}

          {!ticket.isEscalated && (
            <button 
              onClick={() => setShowEscalateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition cursor-pointer"
            >
              <FaExclamationTriangle />
              <span>Escalate</span>
            </button>
          )}

          {/* Status Quick Dropdown */}
          <select 
            value={ticket.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting">Waiting</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ESCALATION BANNER IF ESCALATED */}
      {ticket.isEscalated && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-extrabold text-rose-500 text-sm">
            <FaExclamationTriangle />
            <span>Ticket Escalated to Super Admin</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Reason: {ticket.escalatedReason || "No details provided."}
          </p>
          {ticket.escalatedAt && (
            <p className="text-[10px] text-slate-400">
              Escalated at: {new Date(ticket.escalatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER WORKSPACE (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ticket Information Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Ticket Details</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Category</span>
                <span className="font-bold text-purple-400">{ticket.category}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.department || ticket.assignedDepartment}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Priority</span>
                <span className="font-bold text-amber-400">{ticket.priority}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl">
                <span className="text-slate-400 block text-[10px]">Assigned Agent</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {ticket.assignedTo?.name || "Unassigned"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-xs mb-1">Issue Description</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#121B2E] p-3.5 rounded-xl whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs mb-2">Attachments ({ticket.attachments.length})</h4>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map((att, idx) => (
                    <a 
                      key={idx} 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 hover:border-purple-500 rounded-xl flex items-center gap-3 transition"
                    >
                      <FaPaperclip className="text-purple-400 text-sm" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[140px]">
                          {att.filename || `Attachment ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-slate-400">View file</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Stream */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#121B2E]/50 text-xs font-bold text-slate-800 dark:text-white">
              Ticket Conversation History
            </div>

            {/* Messages List */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Initial Ticket Submission Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-purple-400">{requesterName} ({requesterRole})</span>
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{ticket.subject}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{ticket.description}</p>
              </div>

              {/* Replied Messages */}
              {ticket.messages && ticket.messages.map((m, idx) => {
                const isUserMsg = m.senderRole === "student" || m.senderRole === "teacher" || m.senderRole === "admin";
                const senderName = m.sender?.name || (isUserMsg ? requesterName : "Support Team");

                return (
                  <div key={idx} className={`flex flex-col ${isUserMsg ? "items-start" : "items-end"}`}>
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {senderName} ({m.senderRole}) • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      isUserMsg 
                        ? "bg-slate-100 dark:bg-[#162238] text-slate-800 dark:text-white" 
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    }`}>
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleReply} className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#121B2E]/50 space-y-3">
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to this support request..."
                className="w-full bg-white dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <input
                  type="url"
                  placeholder="Optional attachment URL..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full sm:w-72 bg-white dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={replying || !replyText.trim()}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {replying ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT CONTEXT SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Assigned Agent Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Assigned Support Agent</h4>
              {isSuperAdmin && (
                <button onClick={handleOpenAssignModal} className="text-purple-400 text-xs font-bold hover:underline cursor-pointer">
                  {ticket.assignedTo ? "Reassign" : "Assign"}
                </button>
              )}
            </div>

            {ticket.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  {ticket.assignedTo.name ? ticket.assignedTo.name.substring(0, 2).toUpperCase() : "SA"}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{ticket.assignedTo.name}</h4>
                  <p className="text-[10px] text-slate-400">{ticket.assignedTo.email}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/10 text-purple-400 uppercase">
                    {ticket.assignedTo.supportDepartment || ticket.assignedDepartment} Department
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center bg-slate-50 dark:bg-[#121B2E] rounded-xl text-slate-400 text-xs font-semibold">
                No support agent assigned yet.
              </div>
            )}
          </div>

          {/* User Details Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Requester Details</h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                {requesterName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{requesterName}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400">
                  {requesterRole}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
              <div>Email: <strong className="text-slate-800 dark:text-slate-200">{requesterEmail}</strong></div>
              <div>School: <strong className="text-slate-800 dark:text-slate-200">{schoolName}</strong></div>
            </div>
          </div>

          {/* School Details Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">School Identity</h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <FaSchool />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{schoolName}</h4>
                <div className="text-[10px] text-slate-400">TeachHub Registered Institution</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN AGENT ASSIGNMENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-purple-500/30 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-purple-400 flex items-center gap-2">
                <FaUserCheck />
                <span>Assign Ticket to Support Agent</span>
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <FaTimes />
              </button>
            </div>

            {assignError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <FaExclamationCircle className="shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Select an active support agent belonging to the <strong className="text-white">{ticket.assignedDepartment || ticket.department}</strong> department:
            </p>

            {loadingAgents ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <FaSpinner className="animate-spin text-xl text-purple-500 mx-auto mb-2" />
                Loading eligible support agents...
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Target Support Agent</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-[#162238] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Unassigned (No Agent) --</option>
                    {eligibleAgents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email}) - {agent.department}
                      </option>
                    ))}
                  </select>
                  {eligibleAgents.length === 0 && (
                    <p className="text-[11px] text-amber-400 mt-1">
                      No active agents found in '{ticket.assignedDepartment || ticket.department}' department.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {assigning ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Confirm Assignment</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ESCALATION MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <FaExclamationTriangle />
                <span>Escalate Ticket to Super Admin</span>
              </h3>
              <button onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Reason for Escalation <span className="text-rose-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Explain why this ticket requires Super Admin intervention..."
                  className="w-full bg-[#162238] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating || !escalateReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {escalating ? "Escalating..." : "Confirm Escalation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
