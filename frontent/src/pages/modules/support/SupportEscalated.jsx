import { useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaUser, FaClock } from "react-icons/fa";

export default function SupportEscalated() {
  const escalated = [
    { id: "#TH-1044", user: "Rahul Kumar", role: "Student", school: "G.D Academy", reason: "Repeated video player crashing during proctored exam", escalatedBy: "Prince Raj", date: "10 Sept 2026", status: "Under Review by Super Admin" },
    { id: "#TH-1032", user: "Banny Thapar", role: "Admin", school: "G.D Academy", reason: "Razorpay payment webhook failure for bulk fees collection", escalatedBy: "Anjali Verma", date: "9 Sept 2026", status: "Super Admin Responded" },
    { id: "#TH-1010", user: "Vikram Patel", role: "Admin", school: "Saraswati Vidya Niketan", reason: "Custom domain SSL certificate renewal issue", escalatedBy: "Prince Raj", date: "8 Sept 2026", status: "Resolved" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Escalated Issues</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {escalated.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Critical technical and platform issues escalated directly to Super Admin for resolution.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {escalated.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#0D1527] border border-rose-500/20 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-rose-500 text-base" />
                <span className="font-mono font-bold text-rose-400 text-sm">{item.id}</span>
                <span className="text-xs text-slate-400">• {item.user} ({item.role})</span>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                item.status === "Resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {item.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Escalation Reason:</h3>
              <p className="text-xs text-slate-300 mt-0.5">{item.reason}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400">
              <span>Escalated by: <strong className="text-slate-200">{item.escalatedBy}</strong></span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
