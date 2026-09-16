import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaShieldAlt,
  FaLock,
  FaCookieBite,
  FaFileAlt,
  FaExclamationCircle,
  FaUndo,
  FaGlobe,
  FaUser,
  FaEnvelope,
  FaArrowLeft,
  FaSync,
  FaExclamationTriangle
} from "react-icons/fa";
import API_URL, { PUBLIC_SITE_URL } from "../../config/api";

const SORA = "'Sora', sans-serif";

function PublicLegalPage({ type: propType }) {
  const location = useLocation();

  // Determine type from props or pathname
  const getTypeFromPath = () => {
    if (propType) return propType;
    const path = location.pathname.replace(/^\//, "");
    return path || "privacy-policy";
  };

  const type = getTypeFromPath();

  const [policyData, setPolicyData] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/legal/${type}`);
      if (res.data && res.data.data) {
        setPolicyData(res.data.data);
        if (res.data.platformInfo) {
          setPlatformInfo(res.data.platformInfo);
        }
      } else {
        throw new Error("Invalid response structure from backend.");
      }
    } catch (err) {
      console.error(`Error fetching ${type} document:`, err);
      // Fallback: try fetching basic platform info from /api/about-app
      try {
        const fallbackRes = await axios.get(`${API_URL}/api/about-app`);
        if (fallbackRes.data) {
          setPlatformInfo(fallbackRes.data);
        }
      } catch (e) {
        console.error("Fallback platform info fetch error:", e);
      }
      setError("Unable to load document content from server. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchPolicy();
    window.scrollTo(0, 0);
  }, [fetchPolicy, type]);

  const navLinks = [
    { title: "Privacy Policy", path: "/privacy-policy", icon: <FaLock /> },
    { title: "Cookie Policy", path: "/cookie-policy", icon: <FaCookieBite /> },
    { title: "Terms of Service", path: "/terms-of-service", icon: <FaFileAlt /> },
    { title: "Disclaimer", path: "/disclaimer", icon: <FaExclamationCircle /> },
    { title: "Refund Policy", path: "/refund-policy", icon: <FaUndo /> },
    { title: "About Us", path: "/about-us", icon: <FaGlobe /> },
    { title: "Account Deletion", path: "/delete-account", icon: <FaShieldAlt /> }
  ];

  const appName = platformInfo?.platformName || "TeachHub";
  const supportEmail = platformInfo?.supportEmail || "support@teachhub.app";

  return (
    <div style={{ fontFamily: SORA }} className="min-h-screen bg-slate-50 dark:bg-[#090F1C] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-[#7C3AED]/20">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B132A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black shadow-md shadow-[#7C3AED]/20 shrink-0">
              {appName.charAt(0)}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {appName}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Official Compliance & Legal Portal
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-[#38BDF8] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3.5 py-2 rounded-xl transition"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin shadow-md" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-pulse">
              Loading legal document from database...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#0B132A] border border-rose-200 dark:border-rose-900/30 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-5 my-8">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2.5xl flex items-center justify-center mx-auto text-2xl shadow-inner">
              <FaExclamationTriangle />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Failed to Load Legal Content</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto mt-2 leading-relaxed">
                {error}
              </p>
            </div>
            <button
              onClick={fetchPolicy}
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md shadow-[#7C3AED]/20 cursor-pointer"
            >
              <FaSync /> Retry Loading
            </button>
          </div>
        ) : (
          <article className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
            
            {/* Header Document Metadata */}
            <div className="border-b border-slate-100 dark:border-white/5 pb-6 space-y-3">
              {policyData?.badge && (
                <span className="inline-block px-3 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] text-[11px] font-black tracking-wider uppercase border border-[#7C3AED]/20">
                  {policyData.badge}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {policyData?.title}
              </h1>
              {policyData?.effectiveDate && (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Effective Date: {policyData.effectiveDate}
                </p>
              )}
              {policyData?.intro && (
                <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed pt-2">
                  {policyData.intro}
                </p>
              )}
            </div>

            {/* Document Sections */}
            <div className="space-y-6">
              {policyData?.sections?.map((section, idx) => (
                <section key={idx} className="space-y-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white border-l-4 border-[#7C3AED] pl-3 py-0.5">
                    {section.heading}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-4">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            {/* Footer Support Contact Notice */}
            <div className="bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">Have questions about this document?</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Reach out to our official compliance team for assistance.
                </p>
              </div>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
              >
                <FaEnvelope className="text-xs" />
                <span>Contact Privacy Team</span>
              </a>
            </div>

          </article>
        )}
      </main>

      {/* Footer Navigation Bar for all 7 Legal Links */}
      <footer className="bg-white dark:bg-[#0B132A] border-t border-slate-200/80 dark:border-white/[0.08] py-8 px-4 sm:px-8 mt-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {navLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  location.pathname === item.path
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-[10px] opacity-70">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">
              © 2026 {appName}. All rights reserved.
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              Public Domain: {PUBLIC_SITE_URL}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default PublicLegalPage;
