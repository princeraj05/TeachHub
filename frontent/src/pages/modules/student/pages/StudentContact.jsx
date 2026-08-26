import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaInfoCircle, 
  FaPhone, 
  FaEnvelope, 
  FaComments, 
  FaMapMarkerAlt, 
  FaChevronRight,
  FaQuestionCircle,
  FaWrench,
  FaUser,
  FaArrowLeft
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

function StudentContact() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  const { theme, toggleTheme } = useTheme();

  const userInitials = useMemo(() => {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [name]);

  function useMemo(fn, deps) {
    return fn();
  }

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-350 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Student Workspace
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-1">
              LEARNER CONSOLE
            </p>
          </div>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-555 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
      </div>

      {/* Main Headers segment */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 select-none border-t border-slate-200 dark:border-white/5 pt-6">
        <div className="max-w-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#A78BFA] px-1">CONTACT</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">Contact Us</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
            We're here to help! Reach out to us for any queries, feedback or support.
          </p>
        </div>

        {/* Right mail envelope illustration */}
        <div className="w-24 h-20 shrink-0 relative hidden sm:block">
          <svg className="w-full h-full text-[#7C3AED]" viewBox="0 0 100 80" fill="none">
            {/* Envelope body */}
            <path d="M10 20h80v50H10z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Flap lines */}
            <path d="M10 20l40 30 40-30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Tiny stars */}
            <circle cx="85" cy="15" r="1.5" fill="currentColor" />
            <circle cx="15" cy="70" r="1" fill="currentColor" />
            {/* Paper coming out */}
            <path d="M25 20V5h50v15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="35" y1="10" x2="65" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          
          {/* Phone overlay tag */}
          <div className="absolute right-0 bottom-0 bg-[#7C3AED] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#090F1C] rotate-12">
            <FaPhone className="text-xs" />
          </div>
        </div>
      </div>

      {/* Grid of 4 Contact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* Card 1: Call Us */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2.5xl flex flex-col justify-between items-center text-center shadow-sm relative h-56">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FaPhone className="text-sm" />
            </div>
            <h4 className="text-xs font-black text-slate-805 dark:text-white mt-3">Call Us</h4>
            <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-1">Speak directly with our support team.</p>
          </div>
          <div className="w-full">
            <span className="block text-[11px] font-black text-[#7C3AED] dark:text-[#A78BFA] mb-3">+91 12345 67890</span>
            <a 
              href="tel:+911234567890"
              className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-purple-500/20 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaPhone className="text-[9px]" /> Call Now
            </a>
          </div>
        </div>

        {/* Card 2: Email Us */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2.5xl flex flex-col justify-between items-center text-center shadow-sm relative h-56">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FaEnvelope className="text-sm" />
            </div>
            <h4 className="text-xs font-black text-slate-805 dark:text-white mt-3">Email Us</h4>
            <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-1">Drop us an email anytime.</p>
          </div>
          <div className="w-full">
            <span className="block text-[10px] font-black text-blue-555 truncate mb-3 px-1">support@teachhub.in</span>
            <a 
              href="mailto:support@teachhub.in"
              className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-blue-500/20 text-blue-500 dark:text-[#38BDF8] text-[10px] font-black py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaEnvelope className="text-[9px]" /> Send Email
            </a>
          </div>
        </div>

        {/* Card 3: Live Chat */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2.5xl flex flex-col justify-between items-center text-center shadow-sm relative h-56">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FaComments className="text-sm" />
            </div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white mt-3">Live Chat</h4>
            <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-1">Chat with our support team in real-time.</p>
          </div>
          <div className="w-full">
            <span className="block text-[10px] font-black text-green-555 mb-3">● Available Now</span>
            <button 
              onClick={() => navigate("/student/support")}
              className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-emerald-500/20 text-green-600 dark:text-green-400 text-[10px] font-black py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaComments className="text-[9px]" /> Start Chat
            </button>
          </div>
        </div>

        {/* Card 4: Support Hours */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] p-5 rounded-2.5xl flex flex-col justify-between items-center text-center shadow-sm relative h-56">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <FaClock className="text-sm" />
            </div>
            <h4 className="text-xs font-black text-slate-850 dark:text-white mt-3">Support Hours</h4>
            <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-1">We're available to help you.</p>
          </div>
          <div className="w-full pt-1.5">
            <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-400">Mon - Sat</span>
            <span className="block text-[10px] font-black text-amber-500 mt-0.5 mb-2.5">9:00 AM - 6:00 PM</span>
          </div>
        </div>

      </div>

      {/* Section: Quick Help Topics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 select-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Help Topics</span>
          <button 
            onClick={() => alert("Open FAQ page.")}
            className="text-[10px] font-black text-[#7C3AED] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All FAQs &gt;
          </button>
        </div>

        {/* Vertical quick topic rows */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.04] shadow-sm select-none">
          
          <div 
            onClick={() => navigate("/student/support")}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaQuestionCircle className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">General Enquiries</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Have a question? We're here to help.</p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
          </div>

          <div 
            onClick={() => navigate("/student/support")}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaWrench className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Technical Support</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Facing an issue? Get technical assistance.</p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
          </div>

          <div 
            onClick={() => navigate("/student/profile")}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <FaUser className="text-sm" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Account & Access</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">Need help with your account or login?</p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
          </div>

          <div 
            onClick={() => navigate("/student/about")}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.01] cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">Feedback & Suggestions</h4>
                <p className="text-[10px] text-slate-455 dark:text-slate-500 font-semibold mt-0.5">We value your feedback to improve TeachHub.</p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:translate-x-0.5 transition">&gt;</span>
          </div>

        </div>
      </div>

      {/* Address segment at bottom */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-[#7C3AED] flex items-center justify-center shrink-0">
            <FaMapMarkerAlt className="text-sm" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Our Address</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1">
              TeachHub Education Pvt. Ltd.<br />
              B-123, Sector 63, Noida, Uttar Pradesh - 201301, India
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.open("https://maps.google.com", "_blank")}
          className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-purple-500/20 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black py-2.5 px-5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <FaMapMarkerAlt className="text-[9px]" /> View on Map
        </button>
      </div>

    </div>
  );
}

export default StudentContact;
