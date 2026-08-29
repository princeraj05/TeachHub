import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaInfoCircle,
  FaUpload,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaClock,
  FaLock,
  FaCookieBite,
  FaFileAlt,
  FaExclamationCircle,
  FaUndo,
  FaUser,
  FaPlay,
  FaApple,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaSave,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SuperAdminAboutApp() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Platform Information
  const [platformName, setPlatformName] = useState("TeachHub");
  const [tagline, setTagline] = useState("Smart School Management & Communication Platform");
  const [version, setVersion] = useState("2.1.0");
  const [platformWebsite, setPlatformWebsite] = useState("https://teachhub.app");
  const [logoUrl, setLogoUrl] = useState("");

  // Developer Information
  const [developerName, setDeveloperName] = useState("TeachHub Technologies Pvt. Ltd.");
  const [developerAddress, setDeveloperAddress] = useState("B-32, Sector-63, Noida, Uttar Pradesh - 201301, India");
  const [developerEmail, setDeveloperEmail] = useState("hello@teachhub.app");
  const [developerPhone, setDeveloperPhone] = useState("+91 98765 43210");

  // Support Contact
  const [supportEmail, setSupportEmail] = useState("support@teachhub.app");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [supportWhatsapp, setSupportWhatsapp] = useState("+91 98765 43210");
  const [supportHours, setSupportHours] = useState("Monday - Saturday: 9:00 AM to 6:00 PM (IST)");

  // Legal Links
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("https://teachhub.app/privacy-policy");
  const [cookiePolicyUrl, setCookiePolicyUrl] = useState("https://teachhub.app/cookie-policy");
  const [termsOfServiceUrl, setTermsOfServiceUrl] = useState("https://teachhub.app/terms-of-service");
  const [disclaimerUrl, setDisclaimerUrl] = useState("https://teachhub.app/disclaimer");
  const [refundPolicyUrl, setRefundPolicyUrl] = useState("https://teachhub.app/refund-policy");
  const [aboutUsUrl, setAboutUsUrl] = useState("https://teachhub.app/about-us");

  // App Stores & Social Links
  const [playStoreLink, setPlayStoreLink] = useState("https://play.google.com/store/apps/details?id=com.teachhub.app");
  const [appStoreLink, setAppStoreLink] = useState("https://apps.apple.com/app/teachhub");
  const [socialFacebook, setSocialFacebook] = useState("https://facebook.com");
  const [socialTwitter, setSocialTwitter] = useState("https://twitter.com");
  const [socialInstagram, setSocialInstagram] = useState("https://instagram.com");
  const [socialYoutube, setSocialYoutube] = useState("https://youtube.com");
  const [socialLinkedin, setSocialLinkedin] = useState("https://linkedin.com");

  // Original state backups for Reset button
  const [originalData, setOriginalData] = useState({});

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const logoFileInputRef = useRef(null);

  // Load configuration from API on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.get(`${API}/api/about-app`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        const d = res.data;
        setPlatformName(d.platformName || "TeachHub");
        setTagline(d.tagline || "Smart School Management & Communication Platform");
        setVersion(d.version || "2.1.0");
        setPlatformWebsite(d.platformWebsite || "https://teachhub.app");
        setLogoUrl(d.logoUrl || "");

        setDeveloperName(d.developerName || "TeachHub Technologies Pvt. Ltd.");
        setDeveloperAddress(d.developerAddress || "B-32, Sector-63, Noida, Uttar Pradesh - 201301, India");
        setDeveloperEmail(d.developerEmail || "hello@teachhub.app");
        setDeveloperPhone(d.developerPhone || "+91 98765 43210");

        setSupportEmail(d.supportEmail || "support@teachhub.app");
        setSupportPhone(d.supportPhone || "+91 98765 43210");
        setSupportWhatsapp(d.supportWhatsapp || "+91 98765 43210");
        setSupportHours(d.supportHours || "Monday - Saturday: 9:00 AM to 6:00 PM (IST)");

        setPrivacyPolicyUrl(d.privacyPolicyUrl || "https://teachhub.app/privacy-policy");
        setCookiePolicyUrl(d.cookiePolicyUrl || "https://teachhub.app/cookie-policy");
        setTermsOfServiceUrl(d.termsOfServiceUrl || "https://teachhub.app/terms-of-service");
        setDisclaimerUrl(d.disclaimerUrl || "https://teachhub.app/disclaimer");
        setRefundPolicyUrl(d.refundPolicyUrl || "https://teachhub.app/refund-policy");
        setAboutUsUrl(d.aboutUsUrl || "https://teachhub.app/about-us");

        setPlayStoreLink(d.playStoreLink || "https://play.google.com/store/apps/details?id=com.teachhub.app");
        setAppStoreLink(d.appStoreLink || "https://apps.apple.com/app/teachhub");
        setSocialFacebook(d.socialFacebook || "https://facebook.com");
        setSocialTwitter(d.socialTwitter || "https://twitter.com");
        setSocialInstagram(d.socialInstagram || "https://instagram.com");
        setSocialYoutube(d.socialYoutube || "https://youtube.com");
        setSocialLinkedin(d.socialLinkedin || "https://linkedin.com");

        setOriginalData(d);
      }
    } catch (err) {
      console.error("Error loading platform configuration details:", err);
      setErrorMsg("Failed to fetch platform configuration settings.");
    } finally {
      setLoading(false);
    }
  };

  // Reset to original database values
  const handleReset = () => {
    const d = originalData;
    setPlatformName(d.platformName || "TeachHub");
    setTagline(d.tagline || "Smart School Management & Communication Platform");
    setVersion(d.version || "2.1.0");
    setPlatformWebsite(d.platformWebsite || "https://teachhub.app");
    setLogoUrl(d.logoUrl || "");

    setDeveloperName(d.developerName || "TeachHub Technologies Pvt. Ltd.");
    setDeveloperAddress(d.developerAddress || "B-32, Sector-63, Noida, Uttar Pradesh - 201301, India");
    setDeveloperEmail(d.developerEmail || "hello@teachhub.app");
    setDeveloperPhone(d.developerPhone || "+91 98765 43210");

    setSupportEmail(d.supportEmail || "support@teachhub.app");
    setSupportPhone(d.supportPhone || "+91 98765 43210");
    setSupportWhatsapp(d.supportWhatsapp || "+91 98765 43210");
    setSupportHours(d.supportHours || "Monday - Saturday: 9:00 AM to 6:00 PM (IST)");

    setPrivacyPolicyUrl(d.privacyPolicyUrl || "https://teachhub.app/privacy-policy");
    setCookiePolicyUrl(d.cookiePolicyUrl || "https://teachhub.app/cookie-policy");
    setTermsOfServiceUrl(d.termsOfServiceUrl || "https://teachhub.app/terms-of-service");
    setDisclaimerUrl(d.disclaimerUrl || "https://teachhub.app/disclaimer");
    setRefundPolicyUrl(d.refundPolicyUrl || "https://teachhub.app/refund-policy");
    setAboutUsUrl(d.aboutUsUrl || "https://teachhub.app/about-us");

    setPlayStoreLink(d.playStoreLink || "https://play.google.com/store/apps/details?id=com.teachhub.app");
    setAppStoreLink(d.appStoreLink || "https://apps.apple.com/app/teachhub");
    setSocialFacebook(d.socialFacebook || "https://facebook.com");
    setSocialTwitter(d.socialTwitter || "https://twitter.com");
    setSocialInstagram(d.socialInstagram || "https://instagram.com");
    setSocialYoutube(d.socialYoutube || "https://youtube.com");
    setSocialLinkedin(d.socialLinkedin || "https://linkedin.com");

    setSuccessMsg("Restored original values!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Upload Logo handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);
    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axios.post(`${API}/api/about-app/logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setLogoUrl(res.data.url);
      window.dispatchEvent(new CustomEvent("platformConfigUpdate"));
      setSuccessMsg("Logo uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to upload platform logo.");
    } finally {
      setUploading(false);
    }
  };

  // Save changes handler
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        platformName,
        tagline,
        version,
        platformWebsite,
        logoUrl,
        developerName,
        developerAddress,
        developerEmail,
        developerPhone,
        supportEmail,
        supportPhone,
        supportWhatsapp,
        supportHours,
        privacyPolicyUrl,
        cookiePolicyUrl,
        termsOfServiceUrl,
        disclaimerUrl,
        refundPolicyUrl,
        aboutUsUrl,
        playStoreLink,
        appStoreLink,
        socialFacebook,
        socialTwitter,
        socialInstagram,
        socialYoutube,
        socialLinkedin
      };

      const res = await axios.put(`${API}/api/about-app`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOriginalData(res.data.info);
      window.dispatchEvent(new CustomEvent("platformConfigUpdate"));
      setSuccessMsg("Platform settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading config editor...</p>
      </div>
    );
  }

  // Fallback TeachHub icon inside logo square if logoUrl is empty
  const logoPreview = logoUrl || "https://res.cloudinary.com/dvm1s1hsp/image/upload/v1724653556/teachhub_logo_placeholder.png";

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 text-slate-805 dark:text-white text-left max-w-4xl mx-auto pb-10 select-none">
      
      {/* Breadcrumb Info header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-black relative shrink-0 shadow-md shadow-[#7C3AED]/20">
            <FaInfoCircle className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">About / Platform Configuration</h2>
            <p className="text-[10px] text-slate-455 dark:text-slate-400 font-extrabold uppercase mt-1">
              Settings &gt; About / Platform Configuration
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-black text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15 uppercase tracking-wider"
        >
          <FaSave /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm">
          <FaCheckCircle className="text-emerald-500 text-base shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 text-rose-700 dark:text-rose-450 rounded-2xl px-5 py-4 text-xs font-bold shadow-sm">
          <FaTimesCircle className="text-rose-500 text-base shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main configuration settings panels form */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        
        {/* SECTION 1: Platform Information */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">Platform Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input fields column */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Platform Name *</label>
                <input
                  type="text"
                  required
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Tagline / Short Description</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Version *</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Platform Website</label>
                  <input
                    type="text"
                    value={platformWebsite}
                    onChange={(e) => setPlatformWebsite(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Logo upload columns */}
            <div className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-white/5 rounded-2.5xl bg-slate-50/20">
              <span className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-3">Platform Logo</span>
              
              <div className="w-24 h-24 rounded-2.5xl overflow-hidden bg-white border border-slate-200/50 flex items-center justify-center p-2 mb-3 shadow-inner">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              </div>

              <input
                type="file"
                ref={logoFileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                accept="image/*"
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => logoFileInputRef.current?.click()}
                className="text-[10px] font-black text-[#7C3AED] hover:text-[#6D28D9] border border-[#7C3AED]/20 py-2 px-4.5 rounded-xl transition cursor-pointer select-none uppercase tracking-wider bg-transparent"
              >
                <FaUpload className="inline mr-1" /> {uploading ? "Uploading..." : "Upload Logo"}
              </button>
              
              <p className="text-[8px] text-slate-400 font-bold mt-2 text-center">Recommended: 512x512px (PNG / JPG)</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Developer Information */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">Developer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Developer / Company Name *</label>
              <input
                type="text"
                required
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Developer / Company Address</label>
              <input
                type="text"
                value={developerAddress}
                onChange={(e) => setDeveloperAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Developer Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="email"
                  required
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Developer Phone</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={developerPhone}
                  onChange={(e) => setDeveloperPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Support Contact */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">Support Contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Support Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Support Phone</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Support WhatsApp</label>
              <div className="relative">
                <FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Support Hours</label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={supportHours}
                onChange={(e) => setSupportHours(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Legal Links */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">Legal Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Privacy Policy URL</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={privacyPolicyUrl}
                  onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Cookie Policy URL</label>
              <div className="relative">
                <FaCookieBite className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={cookiePolicyUrl}
                  onChange={(e) => setCookiePolicyUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Terms of Service URL</label>
              <div className="relative">
                <FaFileAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={termsOfServiceUrl}
                  onChange={(e) => setTermsOfServiceUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Disclaimer URL</label>
              <div className="relative">
                <FaExclamationCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={disclaimerUrl}
                  onChange={(e) => setDisclaimerUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Refund Policy URL</label>
              <div className="relative">
                <FaUndo className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={refundPolicyUrl}
                  onChange={(e) => setRefundPolicyUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">About Us URL</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={aboutUsUrl}
                  onChange={(e) => setAboutUsUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: App Information (optional) */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-black tracking-tight border-b border-slate-100 dark:border-white/5 pb-2 text-slate-900 dark:text-white">App Information (optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Google Play Store Link</label>
                <div className="relative">
                  <FaPlay className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
                  <input
                    type="text"
                    value={playStoreLink}
                    onChange={(e) => setPlayStoreLink(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest">Apple App Store Link</label>
                <div className="relative">
                  <FaApple className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 text-xs" />
                  <input
                    type="text"
                    value={appStoreLink}
                    onChange={(e) => setAppStoreLink(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E293B] text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links section */}
            <div className="space-y-3 flex flex-col justify-center">
              <span className="block text-[10px] font-black text-slate-455 uppercase tracking-widest text-center md:text-left">Social Media Links</span>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <a href={socialFacebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <FaFacebookF className="text-xs" />
                </a>
                <a href={socialTwitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <FaTwitter className="text-xs" />
                </a>
                <a href={socialInstagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <FaInstagram className="text-xs" />
                </a>
                <a href={socialYoutube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <FaYoutube className="text-xs" />
                </a>
                <a href={socialLinkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <FaLinkedinIn className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls: Reset & Save */}
        <div className="flex justify-end gap-3 pt-4 select-none">
          <button
            type="button"
            onClick={handleReset}
            className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-500 font-black text-xs px-5 py-3 rounded-xl transition cursor-pointer uppercase tracking-wider"
          >
            Reset
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#7C3AED]/15 uppercase tracking-wider"
          >
            <FaSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default SuperAdminAboutApp;
