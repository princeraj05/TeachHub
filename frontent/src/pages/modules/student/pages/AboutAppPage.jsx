import { useEffect, useState, useCallback } from "react";
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
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaClock,
  FaLock,
  FaCookieBite,
  FaExclamationCircle,
  FaUndo,
  FaPlay,
  FaApple,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaExternalLinkAlt,
  FaHeadset,
  FaShieldAlt
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";

const SORA = "'Sora', sans-serif";

function AboutAppPage() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { theme } = useTheme();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("app"); // "app", "developer", "support", "legal"

  const fetchAboutInfo = useCallback(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${API}/api/about-app`, { headers })
      .then((res) => {
        if (res.data) {
          setInfo(res.data);
        }
      })
      .catch((err) => {
        console.error("Error loading about app details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API, token]);

  useEffect(() => {
    fetchAboutInfo();
    const handleConfigUpdate = () => fetchAboutInfo();
    window.addEventListener("platformConfigUpdate", handleConfigUpdate);
    return () => window.removeEventListener("platformConfigUpdate", handleConfigUpdate);
  }, [fetchAboutInfo]);

  const features = [
    {
      title: "Follows Modern School Practices",
      desc: "TeachHub follows modern school management standards to streamline daily academic and administrative tasks.",
      icon: <FaSchool />,
      iconStyle: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
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
      iconStyle: "bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:text-sky-400"
    },
    {
      title: "Teacher Attendance",
      desc: "Teachers can mark and manage their daily attendance.",
      icon: <FaUserCheck />,
      iconStyle: "bg-green-500/10 text-green-600 border border-green-500/20 dark:text-green-400"
    },
    {
      title: "Online Payments",
      desc: "Schools can receive online payments from students for fees and other charges securely.",
      icon: <FaCreditCard />,
      iconStyle: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:text-yellow-400"
    }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">Syncing system information...</p>
      </div>
    );
  }

  const platformName = info?.platformName || "TeachHub";
  const tagline = info?.tagline || "Smart School Management & Communication Platform";
  const version = info?.version || "2.1.0";
  const platformWebsite = info?.platformWebsite || "https://teachhub.app";
  const logoUrl = info?.logoUrl || "";

  const developerName = info?.developerName || "TeachHub Technologies Pvt. Ltd.";
  const developerAddress = info?.developerAddress || "Noida, Uttar Pradesh, India";
  const developerEmail = info?.developerEmail || "hello@teachhub.app";
  const developerPhone = info?.developerPhone || "+91 98765 43210";

  const supportEmail = info?.supportEmail || "support@teachhub.app";
  const supportPhone = info?.supportPhone || "+91 98765 43210";
  const supportWhatsapp = info?.supportWhatsapp || "+91 98765 43210";
  const supportHours = info?.supportHours || "Monday - Saturday: 9:00 AM to 6:00 PM (IST)";

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    const clean = url.trim().toLowerCase();
    return clean !== "" && clean !== "na" && clean !== "n/a" && (clean.startsWith("http://") || clean.startsWith("https://"));
  };

  const devDetails = [
    {
      title: "Developer / Company Name",
      value: developerName,
      icon: <FaUser />,
      iconStyle: "bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400"
    },
    {
      title: "Company Address",
      value: developerAddress,
      icon: <FaMapMarkerAlt />,
      iconStyle: "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400"
    },
    {
      title: "Developer Email",
      value: developerEmail,
      isEmail: true,
      icon: <FaEnvelope />,
      iconStyle: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400"
    },
    {
      title: "Developer Phone",
      value: developerPhone,
      isPhone: true,
      icon: <FaPhoneAlt />,
      iconStyle: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
    }
  ];

  const legalLinks = [
    { title: "Privacy Policy", url: info?.privacyPolicyUrl || "https://skyblue-yak-430824.hostingersite.com/privacy-policy", icon: <FaLock /> },
    { title: "Cookie Policy", url: info?.cookiePolicyUrl || "https://skyblue-yak-430824.hostingersite.com/cookie-policy", icon: <FaCookieBite /> },
    { title: "Terms of Service", url: info?.termsOfServiceUrl || "https://skyblue-yak-430824.hostingersite.com/terms-of-service", icon: <FaFileAlt /> },
    { title: "Disclaimer", url: info?.disclaimerUrl || "https://skyblue-yak-430824.hostingersite.com/disclaimer", icon: <FaExclamationCircle /> },
    { title: "Refund Policy", url: info?.refundPolicyUrl || "https://skyblue-yak-430824.hostingersite.com/refund-policy", icon: <FaUndo /> },
    { title: "About Us", url: info?.aboutUsUrl || "https://skyblue-yak-430824.hostingersite.com/about-us", icon: <FaGlobe /> },
    { title: "Account Deletion Request", url: info?.accountDeletionUrl || "https://skyblue-yak-430824.hostingersite.com/delete-account", icon: <FaShieldAlt /> }
  ];

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto text-left select-none pb-10 px-1 sm:px-0 space-y-6">
      
      {/* Top Header Card with Dynamic Branding */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2.5xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-0.5 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="w-full h-full object-contain bg-white rounded-2.5xl p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">
                {platformName.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8]">
                SYSTEM PROFILE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] text-[10px] font-black border border-[#7C3AED]/20">
                v{version}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 truncate">
              {platformName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 line-clamp-1">
              {tagline}
            </p>
          </div>
        </div>

        {isValidUrl(platformWebsite) && (
          <a
            href={platformWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-[#7C3AED]/20 shrink-0 cursor-pointer"
          >
            <FaGlobe /> Visit Website
          </a>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl select-none">
        <button
          type="button"
          onClick={() => setActiveTab("app")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "app"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaFileAlt className="text-xs shrink-0" />
          <span>Platform</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("developer")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "developer"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaCode className="text-xs shrink-0" />
          <span>Developer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "support"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaHeadset className="text-xs shrink-0" />
          <span>Support</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("legal")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
            activeTab === "legal"
              ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
              : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5"
          }`}
        >
          <FaShieldAlt className="text-xs shrink-0" />
          <span>Legal</span>
        </button>
      </div>

      {/* Tab Panel 1: Platform Info */}
      {activeTab === "app" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main App Overview Card */}
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] border border-[#7C3AED]/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaFileAlt />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wider mb-1.5">ABOUT {platformName.toUpperCase()}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {tagline}. {platformName} provides real-time academic coordination, automated proctoring examinations, student time-tables, teacher attendance tracking, and transparent digital fee management for modern schools.
              </p>
            </div>
          </div>

          {/* Section title divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-[1px] bg-slate-200/80 dark:bg-white/[0.08]" />
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">KEY FEATURES & CAPABILITIES</span>
            <div className="flex-1 h-[1px] bg-slate-200/80 dark:bg-white/[0.08]" />
          </div>

          {/* Features cards list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] hover:border-[#7C3AED]/30 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 select-none"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-lg shadow-sm ${feat.iconStyle}`}>
                  {feat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">{feat.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5">{feat.desc}</p>
                  
                  {feat.checks && (
                    <ul className="mt-3 space-y-1.5 pl-0.5">
                      {feat.checks.map((chk, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-extrabold">
                          <FaCheckCircle className="text-teal-500 text-xs shrink-0" />
                          <span>{chk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Apps & Social Links if configured */}
          {(isValidUrl(info?.playStoreLink) || isValidUrl(info?.appStoreLink) || isValidUrl(info?.socialFacebook) || isValidUrl(info?.socialInstagram) || isValidUrl(info?.socialYoutube)) && (
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">OFFICIAL APPS & SOCIAL PLATFORMS</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                {isValidUrl(info?.playStoreLink) && (
                  <a href={info.playStoreLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition shadow-sm">
                    <FaPlay className="text-emerald-400 text-xs" /> Google Play Store
                  </a>
                )}

                {isValidUrl(info?.appStoreLink) && (
                  <a href={info.appStoreLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition shadow-sm">
                    <FaApple className="text-slate-200 text-sm" /> Apple App Store
                  </a>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {isValidUrl(info?.socialFacebook) && (
                    <a href={info.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition">
                      <FaFacebookF className="text-xs" />
                    </a>
                  )}
                  {isValidUrl(info?.socialTwitter) && (
                    <a href={info.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-sky-400 transition">
                      <FaTwitter className="text-xs" />
                    </a>
                  )}
                  {isValidUrl(info?.socialInstagram) && (
                    <a href={info.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-pink-500 transition">
                      <FaInstagram className="text-xs" />
                    </a>
                  )}
                  {isValidUrl(info?.socialYoutube) && (
                    <a href={info.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-600 transition">
                      <FaYoutube className="text-xs" />
                    </a>
                  )}
                  {isValidUrl(info?.socialLinkedin) && (
                    <a href={info.socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 transition">
                      <FaLinkedinIn className="text-xs" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab Panel 2: Developer Info */}
      {activeTab === "developer" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaCode />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1.5">DEVELOPER INFORMATION</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Information about the official developer and engineering entity behind {platformName}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devDetails.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex items-center gap-4 select-none shadow-sm">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-base shadow-sm ${item.iconStyle}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.title}</p>
                  {item.isEmail ? (
                    <a href={`mailto:${item.value}`} className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] hover:underline truncate block mt-0.5">
                      {item.value}
                    </a>
                  ) : item.isPhone ? (
                    <a href={`tel:${item.value}`} className="text-xs font-black text-[#7C3AED] dark:text-[#38BDF8] hover:underline truncate block mt-0.5">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#090F21] border border-white/[0.08] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden select-none shadow-lg">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
            <h3 className="text-sm font-black text-white">Engineering Digital Excellence</h3>
            <p className="text-xs font-bold text-cyan-400 mt-1">for Next-Generation Education</p>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-4 tracking-widest">
              Developed & Maintained by {developerName}
            </p>
          </div>

        </div>
      )}

      {/* Tab Panel 3: Support Contact */}
      {activeTab === "support" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaHeadset />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">SUPPORT CONTACT & HELP DESK</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Get assistance for technical issues, system configurations, and school onboarding inquiries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Support Email Card */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center text-base shrink-0">
                  <FaEnvelope />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Support Email</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{supportEmail}</p>
                </div>
              </div>
              <a
                href={`mailto:${supportEmail}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Send Email
              </a>
            </div>

            {/* Support Phone Card */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center text-base shrink-0">
                  <FaPhoneAlt />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Support Phone</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{supportPhone}</p>
                </div>
              </div>
              <a
                href={`tel:${supportPhone}`}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Call Phone Support
              </a>
            </div>

            {/* Support WhatsApp Card */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
                  <FaWhatsapp />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">WhatsApp Support</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">{supportWhatsapp}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${supportWhatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Support Hours Card */}
            <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center text-base shrink-0">
                  <FaClock />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Support Operating Hours</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5 leading-snug">{supportHours}</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-center py-2.5 rounded-xl text-xs font-bold">
                Standard Working Hours
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Panel 4: Legal & Policies */}
      {activeTab === "legal" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xl shadow-sm">
              <FaShieldAlt />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">LEGAL POLICIES & TERMS</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Read official platform terms, privacy policy guidelines, and compliance documentation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {legalLinks.map((item, idx) => {
              const valid = isValidUrl(item.url);
              return (
                <div key={idx} className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 flex items-center justify-between gap-4 select-none shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 text-[#7C3AED] dark:text-[#38BDF8] border border-slate-200 dark:border-white/10 flex items-center justify-center text-base shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">
                        {valid ? item.url : "Not Provided"}
                      </p>
                    </div>
                  </div>

                  {valid ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] hover:bg-[#7C3AED] hover:text-white border border-[#7C3AED]/20 px-3 py-2 rounded-xl text-[11px] font-black transition shrink-0 cursor-pointer"
                    >
                      <span>View</span>
                      <FaExternalLinkAlt className="text-[9px]" />
                    </a>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 text-[10px] font-extrabold shrink-0">
                      N/A
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

export default AboutAppPage;
