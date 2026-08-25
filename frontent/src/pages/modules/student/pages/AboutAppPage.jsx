import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaInfoCircle,
  FaFileAlt,
  FaCheckCircle,
  FaSchool,
  FaBuilding,
  FaUserPlus,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaCalendarAlt,
  FaBookOpen,
  FaUserCheck,
  FaCreditCard,
  FaCode,
  FaUser,
  FaGlobe,
  FaHome,
  FaMapMarkerAlt
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function AboutAppPage() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("app"); // "app" or "developer"

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

  const features = [
    {
      title: "Follows Modern School Practices",
      desc: "TeachHub follows modern school management standards to streamline daily academic and administrative tasks.",
      icon: <FaSchool />,
      iconStyle: "bg-emerald-550/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
    },
    {
      title: "School Registration",
      desc: "New schools can easily register and create their profile on TeachHub.",
      icon: <FaBuilding />,
      iconStyle: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400"
    },
    {
      title: "Apply for School",
      desc: "Students can apply to schools directly through the platform.",
      icon: <FaUserPlus />,
      iconStyle: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400"
    },
    {
      title: "Apply for Teaching",
      desc: "Teachers can apply for teaching positions in registered schools.",
      icon: <FaChalkboardTeacher />,
      iconStyle: "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400"
    },
    {
      title: "Modern Examination System",
      desc: "Conduct modern online examinations with advanced proctoring tools.",
      icon: <FaLaptopCode />,
      iconStyle: "bg-teal-500/10 text-teal-600 border border-teal-500/20 dark:text-teal-400",
      checks: [
        "Student registration for exams",
        "Camera monitoring during exams",
        "Live screen sharing",
        "Cheating prevention & real-time monitoring"
      ]
    },
    {
      title: "Student Time Table",
      desc: "Students can view their class routine and exam schedule.",
      icon: <FaCalendarAlt />,
      iconStyle: "bg-pink-500/10 text-pink-600 border border-pink-500/20 dark:text-pink-400"
    },
    {
      title: "Class & Exam Management",
      desc: "Manage classes, subjects, and exams effortlessly in one place.",
      icon: <FaBookOpen />,
      iconStyle: "bg-sky-500/10 text-sky-655 border border-sky-500/20 dark:text-sky-400"
    },
    {
      title: "Teacher Attendance",
      desc: "Teachers can mark and manage their daily attendance.",
      icon: <FaUserCheck />,
      iconStyle: "bg-green-500/10 text-green-600 border border-green-500/20 dark:text-green-400"
    },
    {
      title: "Online Payments",
      desc: "Schools can receive online payments from students for fees and other charges. Teachers can also receive payments online securely.",
      icon: <FaCreditCard />,
      iconStyle: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:text-yellow-400"
    }
  ];

  const devDetails = [
    {
      title: "Developer Name",
      value: "Prince Raj",
      icon: <FaUser />,
      iconStyle: "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400"
    },
    {
      title: "Developer Portfolio",
      value: "https://princeraj.dev",
      isLink: true,
      icon: <FaGlobe />,
      iconStyle: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400"
    },
    {
      title: "Permanent Location",
      value: "Siwan, Bihar, India",
      icon: <FaHome />,
      iconStyle: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
    },
    {
      title: "Current Location",
      value: "Noida, Uttar Pradesh, India",
      icon: <FaMapMarkerAlt />,
      iconStyle: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400"
    }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing system information...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-2xl mx-auto text-left select-none pb-8">
      {/* Top Header */}
      <div className="mb-6">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">System Profile</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          About TeachHub
        </h1>
        <p className="text-xs text-slate-505 dark:text-slate-400 font-medium mt-1 leading-relaxed font-sans">
          TeachHub School Management Console details and technical attributes.
        </p>
      </div>

      {/* Tabs navigation row */}
      <div className="flex bg-slate-100 dark:bg-[#0B132A] p-1.5 rounded-2.5xl border border-slate-200/60 dark:border-white/[0.06] mb-8 select-none">
        <button
          onClick={() => setActiveTab("app")}
          className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer ${
            activeTab === "app"
              ? "bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-500/15"
              : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          About Application
        </button>
        <button
          onClick={() => setActiveTab("developer")}
          className={`flex-1 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer ${
            activeTab === "developer"
              ? "bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-500/15"
              : "text-slate-555 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Developer Info
        </button>
      </div>

      {/* Tab Panel contents */}
      {activeTab === "app" ? (
        <div className="space-y-6">
          {/* Main App card */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex gap-4 items-start relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[60px] pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaFileAlt />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#6366F1] dark:text-[#818CF8] uppercase tracking-wider mb-2">ABOUT APPLICATION</h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {info?.aboutApp || "TeachHub is a modern school management system designed to simplify school operations and enhance the learning experience."}
              </p>
            </div>
          </div>

          {/* Section title divider */}
          <div className="flex items-center gap-4 my-6 py-2">
            <div className="flex-1 h-[1px] bg-slate-250/60 dark:bg-white/[0.08]" />
            <span className="text-[10px] font-black uppercase text-slate-405 dark:text-slate-500 tracking-widest">KEY FEATURES & INFORMATION</span>
            <div className="flex-1 h-[1px] bg-slate-250/60 dark:bg-white/[0.08]" />
          </div>

          {/* Features cards list */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-4 items-start select-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base shadow-sm ${feat.iconStyle}`}>
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">{feat.title}</h4>
                  <p className="text-[11px] text-slate-555 dark:text-slate-400 font-semibold leading-relaxed mt-1">{feat.desc}</p>
                  {feat.checks && (
                    <ul className="mt-2.5 space-y-1.5 pl-0.5">
                      {feat.checks.map((chk, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-extrabold">
                          <FaCheckCircle className="text-teal-500 text-xs shrink-0" />
                          {chk}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Developer card */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex gap-4 items-start relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#06B6D4]/5 blur-[60px] pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaCode />
            </div>
            <div>
              <h3 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">DEVELOPER INFORMATION</h3>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                Information about the developer and creator of TeachHub.
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex items-center gap-4 select-none">
            {/* Avatar block */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white text-base font-black shadow-md border-2 border-white dark:border-[#0B132A] shrink-0">
              PR
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Prince Raj</h3>
              <p className="text-xs font-bold text-blue-550 dark:text-[#38BDF8] mt-0.5">Full Stack Developer</p>
              <p className="text-[11px] text-slate-555 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed">
                {info?.aboutDeveloper || "Designed and Developed TeachHub School Management System."}
              </p>
            </div>
          </div>

          {/* Section Divider */}
          <div className="flex items-center gap-4 my-6 py-2">
            <div className="flex-1 h-[1px] bg-slate-250/60 dark:bg-white/[0.08]" />
            <span className="text-[10px] font-black uppercase text-slate-405 dark:text-slate-500 tracking-widest">DEVELOPER DETAILS</span>
            <div className="flex-1 h-[1px] bg-slate-250/60 dark:bg-white/[0.08]" />
          </div>

          {/* Details cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devDetails.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.06] rounded-2.5xl p-4.5 flex items-center gap-4 select-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base shadow-sm ${item.iconStyle}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.title}</p>
                  {item.isLink ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-550 dark:text-[#38BDF8] hover:underline truncate block mt-0.5"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Graphic Neon Card */}
          <div className="bg-[#090F21] border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden select-none">
            {/* Glow behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
            
            {/* SVG illustration */}
            <svg className="w-40 h-40 shrink-0 text-cyan-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Floating Cap */}
              <g filter="url(#glow)">
                <path d="M100 35L150 55L100 75L50 55L100 35Z" fill="#22D3EE" fillOpacity="0.15" stroke="#22D3EE" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M70 63V85C70 93.3 83.4 100 100 100C116.6 100 130 93.3 130 85V63" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M142 58.5V85" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="142" cy="86" r="2.5" fill="#22D3EE"/>
              </g>
              
              {/* Laptop base */}
              <path d="M35 155H165C170.523 155 175 159.477 175 165V168H25V165C25 159.477 29.477 155 35 155Z" fill="#1E293B" stroke="#06B6D4" strokeWidth="2.5"/>
              <path d="M80 155H120" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round"/>
              
              {/* Laptop screen */}
              <rect x="42" y="90" width="116" height="65" rx="5" fill="#0B132A" stroke="#06B6D4" strokeWidth="2.5"/>
              
              {/* Code overlay */}
              <path d="M85 112L73 122.5L85 133" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M115 112L127 122.5L115 133" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M104 110L96 135" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round"/>
              
              <defs>
                <filter id="glow" x="35" y="20" width="130" height="100" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
            
            <h3 className="text-sm font-black text-white mt-4">Building Digital Solutions</h3>
            <p className="text-xs font-bold text-cyan-400 mt-1">for Better Education</p>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase mt-6 tracking-widest flex items-center gap-1.5 justify-center">
              Thank you for using TeachHub! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AboutAppPage;
