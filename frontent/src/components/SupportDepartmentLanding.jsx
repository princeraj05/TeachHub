import React from "react";
import { 
  FaCreditCard, 
  FaWrench, 
  FaCompass, 
  FaArrowRight, 
  FaQuestionCircle 
} from "react-icons/fa";

export default function SupportDepartmentLanding({ onSelectDepartment, hideBilling = true }) {
  const allDepartments = [
    {
      id: "Onboarding",
      title: "Onboarding",
      icon: <FaCompass className="text-emerald-500 text-2xl" />,
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Login, account setup, school joining and getting started with TeachHub.",
      examples: ["Login Help", "School Joining", "Account Setup", "How TeachHub Works"]
    },
    {
      id: "Technical",
      title: "Technical",
      icon: <FaWrench className="text-amber-500 text-2xl" />,
      badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "App errors, bugs, loading problems and technical issues.",
      examples: ["App Not Working", "Page Error", "Feature Issue", "Technical Problem"]
    },
    {
      id: "Billing",
      title: "Billing",
      icon: <FaCreditCard className="text-[#7C3AED] dark:text-[#38BDF8] text-2xl" />,
      badgeBg: "bg-purple-500/10 text-purple-600 dark:text-[#38BDF8] border-purple-500/20",
      description: "Payment, fees, subscription and transaction related issues.",
      examples: ["Payment Failed", "Fee Payment", "Subscription", "Transaction Issue"]
    }
  ];

  const departments = hideBilling
    ? allDepartments.filter((d) => d.id !== "Billing")
    : allDepartments;

  const gridColsClass = departments.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3";

  return (
    <div className="w-full bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FaQuestionCircle className="text-[#7C3AED] dark:text-[#38BDF8] text-xl shrink-0" />
            <span>How can we help you?</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Choose the department that best matches your issue to reach the right support team.
          </p>
        </div>
      </div>

      <div className={`grid ${gridColsClass} gap-4`}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => onSelectDepartment && onSelectDepartment(dept.id)}
            className="group relative bg-slate-50/70 dark:bg-[#111827]/60 border border-slate-200/80 dark:border-white/[0.08] hover:border-[#7C3AED]/50 dark:hover:border-[#38BDF8]/50 rounded-2.5xl p-5 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0B132A] shadow-sm flex items-center justify-center border border-slate-200/60 dark:border-white/10 group-hover:scale-105 transition-transform duration-200">
                  {dept.icon}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${dept.badgeBg}`}>
                  {dept.title}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5 group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition-colors">
                {dept.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
                {dept.description}
              </p>
            </div>

            <div>
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.05] mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Example Topics:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dept.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0B132A] text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/60 dark:border-white/5"
                    >
                      • {ex}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#7C3AED] dark:hover:bg-[#6D28D9] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-200 cursor-pointer"
              >
                <span>Select {dept.title}</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
