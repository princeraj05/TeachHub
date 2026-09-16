import { useState, useEffect } from "react";
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
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaUserTag
} from "react-icons/fa";
import API_URL, { PUBLIC_SITE_URL } from "../../config/api";

const SORA = "'Sora', sans-serif";

function PublicDeleteAccountPage() {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [schoolName, setSchoolName] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your registered account email address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/api/account-deletion-request`, {
        email: email.trim(),
        name: name.trim(),
        role,
        schoolName: schoolName.trim(),
        reason: reason.trim()
      });

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || "Account deletion request submitted successfully!");
        setEmail("");
        setName("");
        setRole("student");
        setSchoolName("");
        setReason("");
      } else {
        setErrorMsg(res.data?.message || "Failed to submit deletion request. Please try again.");
      }
    } catch (err) {
      console.error("Account deletion submission error:", err);
      setErrorMsg(
        err.response?.data?.message || "A network error occurred while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { title: "Privacy Policy", path: "/privacy-policy", icon: <FaLock /> },
    { title: "Cookie Policy", path: "/cookie-policy", icon: <FaCookieBite /> },
    { title: "Terms of Service", path: "/terms-of-service", icon: <FaFileAlt /> },
    { title: "Disclaimer", path: "/disclaimer", icon: <FaExclamationCircle /> },
    { title: "Refund Policy", path: "/refund-policy", icon: <FaUndo /> },
    { title: "About Us", path: "/about-us", icon: <FaGlobe /> },
    { title: "Account Deletion", path: "/delete-account", icon: <FaShieldAlt /> }
  ];

  return (
    <div style={{ fontFamily: SORA }} className="min-h-screen bg-slate-50 dark:bg-[#090F1C] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-[#7C3AED]/20">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0B132A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-black shadow-md shadow-rose-500/20 shrink-0">
              <FaShieldAlt className="text-sm" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                TeachHub
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Data Privacy & Google Play Compliance
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

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
          
          {/* Top Banner */}
          <div className="border-b border-slate-100 dark:border-white/5 pb-6 space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-black tracking-wider uppercase border border-rose-500/20">
              Data Privacy & Account Control
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Account & Data Deletion Request
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
              In accordance with Google Play Developer Policies and global data protection regulations, users of <strong>TeachHub</strong> have the right to request the complete deletion of their account credentials and associated personal data.
            </p>
          </div>

          {/* Explanation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-200/60 dark:border-white/5 rounded-2.5xl p-5 space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FaTrashAlt className="text-rose-500 text-xs" />
                What Will Be Permanently Deleted
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-400 font-semibold space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Personal profile details (full name, email, credentials, phone number)</li>
                <li>Active session tokens, login history, and device notification tokens</li>
                <li>Personal settings, preferred language, and theme preferences</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-200/60 dark:border-white/5 rounded-2.5xl p-5 space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FaShieldAlt className="text-amber-500 text-xs" />
                Academic Auditing & Retention Policy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Academic records (exam grades, official transcripts, institutional financial receipts) required for state educational compliance may be retained by your school administrator in accordance with institutional policy.
              </p>
            </div>
          </div>

          {/* Submission Feedback Messages */}
          {successMsg && (
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-2xl p-5 text-xs font-bold shadow-sm">
              <FaCheckCircle className="text-emerald-500 text-lg shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm text-emerald-900 dark:text-emerald-200">Request Submitted Successfully!</p>
                <p className="mt-1 leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 rounded-2xl p-5 text-xs font-bold shadow-sm">
              <FaTimesCircle className="text-rose-500 text-lg shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Deletion Request Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white border-l-4 border-rose-500 pl-3">
              Submit Official Deletion Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Account Email */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="email"
                    required
                    placeholder="student@school.com or teacher@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Enter registered full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  User Role
                </label>
                <div className="relative">
                  <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">School Admin</option>
                    <option value="other">Other / Parent</option>
                  </select>
                </div>
              </div>

              {/* School Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  School Name
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Enter school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Reason for Deletion */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Reason for Deletion Request (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why you are requesting account deletion..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 uppercase tracking-wider mt-4"
            >
              <FaTrashAlt />
              {submitting ? "Submitting Request..." : "Submit Account Deletion Request"}
            </button>
          </form>

        </div>
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
              © 2026 TeachHub. All rights reserved.
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

export default PublicDeleteAccountPage;
