import { useEffect, useState } from "react";
import axios from "axios";
import { FaInfoCircle, FaLaptopCode, FaCheckCircle, FaMobileAlt } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AboutAppPage() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/api/about-app`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setInfo(res.data);
      })
      .catch((err) => {
        console.error("Error loading about app details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API, token]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing system information...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-2xl mx-auto space-y-6 text-left">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">System Profile</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          About TeachHub
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5 font-sans">
          TeachHub School Management Console details and technical attributes.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-200 space-y-8">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[60px] pointer-events-none" />
        
        {/* App block */}
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 text-xl shadow-sm">
            <FaInfoCircle />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">About Application</h3>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              {info?.aboutApp || "TeachHub is a state-of-the-art school management system designed to coordinate students, teachers, classes, and exams dynamically."}
            </p>
          </div>
        </div>

        {/* Developer block */}
        <div className="flex gap-4 items-start border-t border-slate-100 dark:border-white/5 pt-6">
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 border border-[#7C3AED]/15 dark:border-[#38BDF8]/10 text-[#7C3AED] dark:text-[#38BDF8] flex items-center justify-center shrink-0 text-xl shadow-sm">
            <FaLaptopCode />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Developer Information</h3>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              {info?.aboutDeveloper || "Designed and Developed by princeraj05"}
            </p>
          </div>
        </div>

        {/* System Capabilities list */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-6">
          <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Core Integration Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              "Real-time Examination Monitoring",
              "Dynamic School Statistics Editor",
              "Role-based Dashboard Navigation",
              "Automated Event Calendar Sync"
            ].map((cap, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-555 dark:text-slate-350 font-semibold">
                <FaCheckCircle className="text-emerald-500 text-sm shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutAppPage;
