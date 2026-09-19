import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaTicketAlt, 
  FaTimes, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaSpinner, 
  FaPaperclip 
} from "react-icons/fa";
import API_URL from "../config/api";

const CATEGORIES_BY_DEPT = [
  {
    department: "Technical",
    categories: [
      "Attendance Issue",
      "Exam / Proctoring Problem",
      "Result Calculation Error",
      "App Crash / Error",
      "Broken Link / Page Load",
      "Audio/Video Call Glitch"
    ]
  },
  {
    department: "Billing",
    categories: [
      "School Subscription",
      "Student Payment",
      "Teacher Salary Payment",
      "Invoice & Receipt",
      "Refund Request",
      "Transaction Error"
    ]
  },
  {
    department: "Onboarding",
    categories: [
      "Admin Account Setup",
      "Teacher Onboarding",
      "Student Registration",
      "Bulk Data Upload",
      "School Profile Setup",
      "Initial Usage Guidance"
    ]
  }
];

export default function CreateSupportTicketModal({ isOpen, onClose, initialDepartment }) {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [category, setCategory] = useState("Attendance Issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(() => {
    if (initialDepartment && isOpen) {
      const deptGroup = CATEGORIES_BY_DEPT.find(
        (g) => g.department.toLowerCase() === initialDepartment.toLowerCase()
      );
      if (deptGroup && deptGroup.categories.length > 0) {
        setCategory(deptGroup.categories[0]);
      }
    }
  }, [initialDepartment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError("Please select a problem category.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject title.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe your issue in detail (at least 10 characters).");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const attachments = attachmentUrl.trim()
        ? [{ url: attachmentUrl.trim(), filename: "attachment", mimeType: "image/jpeg", size: 1024 }]
        : [];

      const res = await axios.post(
        `${API}/api/support/tickets`,
        {
          category,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          attachments
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ticket = res.data?.ticket || res.data;
      setCreatedTicket(ticket);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit support ticket. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory("Attendance Issue");
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setAttachmentUrl("");
    setError("");
    setCreatedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#090F1C]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
              <FaTicketAlt />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Support Request</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reach out to TeachHub platform support for assistance.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {createdTicket ? (
            /* Success View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-3xl border border-emerald-500/20 animate-bounce">
                <FaCheckCircle />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Support Request Submitted!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your ticket has been logged and routed to our support team.
                </p>
              </div>

              {/* Ticket Details Summary Card */}
              <div className="bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Ticket Number:</span>
                  <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">
                    {createdTicket.ticketNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {createdTicket.subject}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Department:</span>
                  <span className="font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-[11px]">
                    {createdTicket.department || createdTicket.assignedDepartment}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Priority:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {createdTicket.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {createdTicket.status}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            /* Ticket Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <FaExclamationCircle className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Problem Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {CATEGORIES_BY_DEPT.map((group) => (
                    <optgroup key={group.department} label={group.department}>
                      {group.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Cannot view exam results or attendance"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what happened, error messages, or steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Priority & Optional Attachment URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Low">Low - General Question</option>
                    <option value="Medium">Medium - Normal Issue</option>
                    <option value="High">High - Important Malfunction</option>
                    <option value="Urgent">Urgent - Blocking / Outage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <FaPaperclip className="text-[10px]" /> Attachment URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://.../screenshot.jpg"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#090F1C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaTicketAlt className="text-xs" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
