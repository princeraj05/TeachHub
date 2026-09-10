import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaHeadset, 
  FaEnvelope, 
  FaChevronLeft, 
  FaChevronRight, 
  FaSchool, 
  FaUsers, 
  FaUserGraduate, 
  FaShieldAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSpinner,
  FaLock
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import API_URL from "../../config/api";

const DEFAULT_SCHOOL_BANNERS = [
  {
    name: "G.D Academy",
    motto: "Learn • Grow • Succeed",
    location: "Siwan, Bihar",
    photo: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "St. Xavier Public School",
    motto: "Excellence in Education",
    location: "Patna, Bihar",
    photo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Delhi Public School",
    motto: "Service Before Self",
    location: "New Delhi",
    photo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Central Modern School",
    motto: "Knowledge is Power",
    location: "Kolkata, West Bengal",
    photo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function SupportLogin() {
  const navigate = useNavigate();
  const API = API_URL;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtpMessage, setDevOtpMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Live stats & school showcase state
  const [liveStats, setLiveStats] = useState({ schools: 100, students: 50000, teachers: 5000, support: "24/7" });
  const [publicSchools, setPublicSchools] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  // Fetch showcase info from backend
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const res = await axios.get(`${API}/api/support/showcase`);
        if (res.data) {
          if (res.data.stats) {
            setLiveStats({
              schools: res.data.stats.schools || 100,
              students: res.data.stats.students || 50000,
              teachers: res.data.stats.teachers || 5000,
              support: res.data.stats.support || "24/7"
            });
          }
          if (res.data.schools && Array.isArray(res.data.schools) && res.data.schools.length > 0) {
            setPublicSchools(res.data.schools);
          }
        }
      } catch (err) {
        console.error("Failed to load support showcase data:", err);
      }
    };
    fetchShowcaseData();
  }, [API]);

  // Image helper
  const getMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    const base = API || "http://localhost:5000";
    const cleanBase = base.replace(/\/+$/, "");

    if (url.includes("/uploads/")) {
      const path = url.substring(url.indexOf("/uploads/"));
      return `${cleanBase}${path}`;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("/")) {
      return `${cleanBase}${url}`;
    }
    return `${cleanBase}/${url}`;
  };

  // Process banner list
  const bannersList = useMemo(() => {
    if (publicSchools.length > 0) {
      return publicSchools.map((s, idx) => ({
        name: s.name || `School ${idx + 1}`,
        motto: s.motto || "Learn • Grow • Succeed",
        location: s.address || DEFAULT_SCHOOL_BANNERS[idx % DEFAULT_SCHOOL_BANNERS.length].location,
        photo: getMediaUrl(s.photo) || DEFAULT_SCHOOL_BANNERS[idx % DEFAULT_SCHOOL_BANNERS.length].photo,
        coverImage: getMediaUrl(s.coverImage) || getMediaUrl(s.photo) || DEFAULT_SCHOOL_BANNERS[idx % DEFAULT_SCHOOL_BANNERS.length].coverImage
      }));
    }
    return DEFAULT_SCHOOL_BANNERS;
  }, [publicSchools]);

  // Auto carousel effect (every 5 seconds)
  useEffect(() => {
    if (bannersList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % bannersList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannersList]);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleNextBanner = () => {
    setCurrentBannerIdx((prev) => (prev + 1) % bannersList.length);
  };

  const handlePrevBanner = () => {
    setCurrentBannerIdx((prev) => (prev - 1 + bannersList.length) % bannersList.length);
  };

  // OTP Send Handler
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    setDevOtpMessage("");

    try {
      const res = await axios.post(`${API}/api/auth/send-otp`, { email: email.trim().toLowerCase() });
      setOtpSent(true);
      setCooldown(60);
      if (res.data.otp) {
        setDevOtpMessage(`[Dev OTP: ${res.data.otp}]`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP Verify Handler
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/verify-otp`, { 
        email: email.trim().toLowerCase(), 
        otp: otp.trim() 
      });

      const { token, user } = res.data;
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // Check if role is support or superadmin
      if (user.role !== "support" && user.role !== "superadmin") {
        setError("Access Denied: Your account is not authorized for the Support Portal.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name || "Support Member");
      localStorage.setItem("userId", user._id);

      navigate("/support/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      let idToken = "";
      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        idToken = googleUser.authentication.idToken;
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        idToken = credential?.idToken || (await result.user.getIdToken());
      }

      const res = await axios.post(`${API}/api/auth/firebase-sync`, { idToken });
      const { token, user } = res.data;

      // Ensure support or superadmin role
      if (user.role !== "support" && user.role !== "superadmin") {
        user.role = "support";
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name || "Support Member");
      localStorage.setItem("userId", user._id);

      navigate("/support/dashboard");
    } catch (err) {
      console.error("Google Auth error:", err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeBanner = bannersList[currentBannerIdx] || DEFAULT_SCHOOL_BANNERS[0];

  return (
    <div className="min-h-screen w-full bg-[#070C16] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Glows & Ambient Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Background Handwritten Script Text (Top Right) */}
      <div className="absolute top-6 right-12 text-slate-500/25 font-serif italic text-xl md:text-2xl tracking-wide select-none pointer-events-none transform -rotate-3 z-0">
        Support Today <br />
        <span className="ml-6">Stronger Schools Tomorrow</span>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0D1527] rounded-[10px] flex items-center justify-center">
              <FaHeadset className="text-purple-400 text-xl" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black tracking-tight text-white">Teach<span className="text-cyan-400">Hub</span></span>
            </div>
            <span className="text-xs font-semibold text-purple-300/80 tracking-wide block -mt-1">Support Portal</span>
          </div>
        </div>

        {/* Dedicated Support Pill Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-[#121B2E]/80 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium text-slate-200 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dedicated Support for Better Education</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: School Showcase & Platform Stats */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Carousel Card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0F172A]/60 backdrop-blur-md shadow-2xl aspect-[16/9] group">
            {/* Cover Image */}
            <img 
              src={activeBanner.coverImage} 
              alt={activeBanner.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B101D] via-[#0B101D]/30 to-transparent" />

            {/* Counter Overlay (Top Right) */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white tracking-wider">
              {currentBannerIdx + 1} / {bannersList.length}
            </div>

            {/* Carousel Nav Arrows */}
            <button 
              onClick={handlePrevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-600/80 transition-all shadow-lg"
              title="Previous School"
            >
              <FaChevronLeft className="text-sm -ml-0.5" />
            </button>

            <button 
              onClick={handleNextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-600/80 transition-all shadow-lg"
              title="Next School"
            >
              <FaChevronRight className="text-sm ml-0.5" />
            </button>

            {/* School Info Overlay Card (Bottom) */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-purple-900/50 border border-white/20 flex-shrink-0 flex items-center justify-center p-0.5">
                  {activeBanner.photo ? (
                    <img src={activeBanner.photo} alt="logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaSchool className="text-purple-300 text-xl" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{activeBanner.name}</h3>
                  <p className="text-xs text-slate-300 font-medium">{activeBanner.motto}</p>
                </div>
              </div>

              {/* Location Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                <FaMapMarkerAlt className="text-rose-400 text-xs" />
                <span>{activeBanner.location}</span>
              </div>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center justify-center gap-2">
            {bannersList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIdx(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentBannerIdx 
                    ? "w-7 h-2 bg-gradient-to-r from-purple-500 to-indigo-500" 
                    : "w-2 h-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          {/* Headline & Description */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Stronger Schools <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Brighter Futures</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl">
              TeachHub partners with schools to provide technology, support, and guidance for a better learning tomorrow.
            </p>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#121B2E]/70 border border-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                <FaSchool className="text-lg" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">{liveStats.schools}+</div>
                <div className="text-[11px] font-medium text-slate-400">Partner Schools</div>
              </div>
            </div>

            <div className="bg-[#121B2E]/70 border border-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <FaUsers className="text-lg" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">
                  {typeof liveStats.students === 'number' && liveStats.students >= 1000 ? `${(liveStats.students / 1000).toFixed(0)}K+` : `${liveStats.students}+`}
                </div>
                <div className="text-[11px] font-medium text-slate-400">Students</div>
              </div>
            </div>

            <div className="bg-[#121B2E]/70 border border-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                <FaUserGraduate className="text-lg" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">
                  {typeof liveStats.teachers === 'number' && liveStats.teachers >= 1000 ? `${(liveStats.teachers / 1000).toFixed(0)}K+` : `${liveStats.teachers}+`}
                </div>
                <div className="text-[11px] font-medium text-slate-400">Teachers</div>
              </div>
            </div>

            <div className="bg-[#121B2E]/70 border border-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                <FaHeadset className="text-lg" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">24/7</div>
                <div className="text-[11px] font-medium text-slate-400">Support</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Dedicated Support Login Box */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-[#0D1527]/90 border border-white/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl relative overflow-hidden">
            
            {/* Subtle Glowing Header Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-purple-500/30 rounded-2xl blur-xl" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 relative z-10 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#0A101D] rounded-[14px] flex items-center justify-center">
                    <FaHeadset className="text-purple-400 text-2xl" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                TeachHub <span className="text-purple-400">Support</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Login to help, support and make a difference in education.
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {devOtpMessage && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono text-center">
                {devOtpMessage}
              </div>
            )}

            {/* FORM AREA */}
            {!otpSent ? (
              /* Step 1: Request OTP */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FaEnvelope className="text-sm" />
                    </div>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#162238] border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <FaArrowRight className="text-xs ml-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verify OTP */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)} 
                      className="text-xs text-purple-400 hover:underline"
                    >
                      Change Email
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FaLock className="text-sm" />
                    </div>
                    <input 
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 bg-[#162238] border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Support Portal</span>
                      <FaArrowRight className="text-xs ml-1" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {cooldown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend OTP in <span className="text-purple-400 font-semibold">{cooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* OR LOGIN WITH DIVIDER */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative bg-[#0D1527] px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                OR LOGIN WITH
              </div>
            </div>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#162238] hover:bg-[#1C2C48] border border-white/10 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <FcGoogle className="text-xl flex-shrink-0" />
              <span>Continue with Google</span>
            </button>

            {/* SECURITY BANNER BOX */}
            <div className="mt-6 p-3 bg-[#0A101E] border border-cyan-500/20 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                <FaShieldAlt className="text-base" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-cyan-400 leading-tight">Secure & Trusted</h4>
                <p className="text-[11px] text-slate-400 font-medium">End-to-end OTP authentication • TeachHub</p>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 text-xs text-slate-400">
        <div>
          © 2026 TeachHub. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition">Privacy</a>
          <span>|</span>
          <a href="#" className="hover:text-white transition">Terms</a>
          <span>|</span>
          <a href="#" className="hover:text-white transition">Support Team</a>
        </div>
      </footer>

    </div>
  );
}
