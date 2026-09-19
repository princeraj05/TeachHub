import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaPaperclip, 
  FaPaperPlane, 
  FaSpinner, 
  FaExclamationCircle,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { getSupportTicketById, replyToSupportTicket } from "../services/supportTicketApi";

export default function RequesterSupportTicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyText, setReplyText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  const rawRole = localStorage.getItem("role") || localStorage.getItem("userRole") || "student";
  const userRole = rawRole === "unassigned" ? "pending" : rawRole.toLowerCase();

  const backPath = `/${userRole}/support-team`;

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getSupportTicketById(id);
      setTicket(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You are not authorized to view this support request.");
      } else if (status === 404) {
        setError("Support request not found.");
      } else {
        setError(err.response?.data?.message || "Failed to load support request details.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replying) return;

    setReplying(true);
    setReplyError("");
    setReplySuccess("");
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
      setReplySuccess("Your response has been sent successfully.");
      
      if (res.ticket) {
        setTicket(res.ticket);
      } else {
        fetchTicket();
      }

      setTimeout(() => setReplySuccess(""), 4000);
    } catch (err) {
      setReplyError(err.response?.data?.message || "Unable to send your response. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-16 text-center space-y-3">
        <FaSpinner className="animate-spin text-3xl text-[#7C3AED] dark:text-[#38BDF8] mx-auto" />
        <p className="text-xs text-slate-400 font-bold">Loading support request details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto my-8">
        <FaExclamationCircle className="text-4xl text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Unable to Load Request</h3>
          <p className="text-xs text-rose-400 mt-1 font-semibold">{error}</p>
        </div>
        <button 
          onClick={() => navigate(backPath)}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Return to Support Team
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  const requesterName = ticket.requester?.name || "You";
  const requesterRole = ticket.requesterRole || ticket.requester?.role || "Requester";

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER NAV & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(backPath)}
            className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer shrink-0"
            title="Back to Support Team"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-[#7C3AED] dark:text-[#38BDF8] font-mono">{ticket.ticketNumber}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                ticket.status === "Resolved" ? "bg-emerald-500/20 text-emerald-500" :
                ticket.status === "Closed" ? "bg-slate-500/20 text-slate-400" :
                ticket.status === "Escalated" ? "bg-rose-600 text-white" :
                ticket.status === "In Progress" ? "bg-amber-500/20 text-amber-500" : "bg-purple-500/20 text-[#7C3AED] dark:text-[#38BDF8]"
              }`}>
                {ticket.status}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{ticket.subject}</h2>
            <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Submitted on {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* ESCALATION BANNER IF ESCALATED */}
      {ticket.isEscalated && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-black text-rose-500 text-xs">
            <FaExclamationTriangle />
            <span>Support Request Escalated to Senior Support Management</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Reason: {ticket.escalatedReason || "Under priority review by support lead."}
          </p>
        </div>
      )}

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / MAIN WORKSPACE (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ticket Metadata Card */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Request Overview</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-slate-400 block text-[10px] font-bold">Category</span>
                <span className="font-bold text-[#7C3AED] dark:text-[#38BDF8]">{ticket.category}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-slate-400 block text-[10px] font-bold">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.department || ticket.assignedDepartment}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#121B2E] rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-slate-400 block text-[10px] font-bold">Priority</span>
                <span className="font-bold text-amber-500">{ticket.priority}</span>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs mb-1.5">Original Issue Description</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#121B2E] p-4 rounded-2xl border border-slate-100 dark:border-white/5 whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-xs mb-2">Attachments ({ticket.attachments.length})</h4>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map((att, idx) => (
                    <a 
                      key={idx} 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-3 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 hover:border-[#7C3AED] rounded-xl flex items-center gap-2.5 transition"
                    >
                      <FaPaperclip className="text-[#7C3AED] dark:text-[#38BDF8] text-xs" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[150px]">
                          {att.filename || `Attachment ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">View attachment</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation History */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#121B2E]/60 text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Conversation Thread
            </div>

            {/* Messages Stream */}
            <div className="p-4 space-y-4 max-h-[550px] overflow-y-auto">
              {/* Initial Request Bubble */}
              <div className="p-4 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span className="font-extrabold text-[#7C3AED] dark:text-[#38BDF8]">{requesterName} ({requesterRole})</span>
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-100 font-extrabold">{ticket.subject}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{ticket.description}</p>
              </div>

              {/* Replied Messages */}
              {ticket.messages && ticket.messages.map((m, idx) => {
                const isRequesterMsg = m.senderRole === "student" || m.senderRole === "teacher" || m.senderRole === "admin" || m.senderRole === "unassigned";
                const senderName = m.sender?.name || (isRequesterMsg ? requesterName : "TeachHub Support Team");

                return (
                  <div key={idx} className={`flex flex-col ${isRequesterMsg ? "items-start" : "items-end"}`}>
                    <div className="text-[10px] text-slate-400 mb-1 px-1 font-bold">
                      {senderName} ({m.senderRole}) • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] font-medium ${
                      isRequesterMsg 
                        ? "bg-slate-100 dark:bg-[#162238] text-slate-800 dark:text-white border border-slate-200/60 dark:border-white/5" 
                        : "bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white shadow-md"
                    }`}>
                      {m.message}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-col gap-1">
                          {m.attachments.map((att, aIdx) => (
                            <a
                              key={aIdx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] underline flex items-center gap-1 opacity-90 hover:opacity-100 font-bold"
                            >
                              <FaPaperclip className="text-[10px]" />
                              <span>{att.filename || "View Attachment"}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Form */}
            {ticket.status !== "Closed" ? (
              <form onSubmit={handleReplySubmit} className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#121B2E]/60 space-y-3">
                {replyError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                    <FaExclamationCircle className="shrink-0" />
                    <span>{replyError}</span>
                  </div>
                )}

                {replySuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
                    <FaCheckCircle className="shrink-0" />
                    <span>{replySuccess}</span>
                  </div>
                )}

                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the support team..."
                  className="w-full bg-white dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-slate-800 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-none"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <input
                    type="url"
                    placeholder="Optional attachment URL..."
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full sm:w-72 bg-white dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
            ) : (
              <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#121B2E]/50 text-center text-xs font-bold text-slate-400">
                This support request has been closed.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-white/5 pb-2.5">
              Assigned Support Agent
            </h4>

            {ticket.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center shrink-0">
                  {ticket.assignedTo.name ? ticket.assignedTo.name.substring(0, 2).toUpperCase() : "SA"}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{ticket.assignedTo.name}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{ticket.assignedTo.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/10 text-[#7C3AED] dark:text-[#38BDF8] uppercase">
                    {ticket.assignedTo.supportDepartment || ticket.assignedDepartment} Department
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200/60 dark:border-white/5 text-center text-xs font-bold text-slate-400">
                Assigned to {ticket.assignedDepartment || ticket.department} Department Team
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
