import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaEnvelope, 
  FaLock, 
  FaGraduationCap, 
  FaCheckCircle, 
  FaSun, 
  FaMoon,
  FaArrowRight
} from "react-icons/fa";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { useTheme } from "../../context/ThemeContext";
import { usePlatform } from "../../context/PlatformContext";

const SORA = "'Sora', sans-serif";

function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { platformName, logoUrl, platformConfig } = usePlatform();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtpMessage, setDevOtpMessage] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [cooldown, setCooldown] = useState(0);
  const [liveStats, setLiveStats] = useState({ students: 0, teachers: 0, admins: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/api/about-app`);
        if (res.data && res.data.stats) {
          setLiveStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load live stats:", err);
      }
    };
    fetchStats();
  }, [API]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      if (role === "superadmin") navigate("/superadmin/dashboard", { replace: true });
      else if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "teacher") navigate("/teacher/dashboard", { replace: true });
      else if (role === "student") navigate("/student/dashboard", { replace: true });
      else navigate("/pending", { replace: true });
    }
  }, [navigate]);

  const saveAuthAndNavigate = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("schoolName", data.user.schoolName || "");
    localStorage.setItem("name", data.user.name);
    localStorage.setItem("avatar", data.user.avatar || "");

    const role = data.user.role;
    if (role === "superadmin") navigate("/superadmin/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
    else if (role === "teacher") navigate("/teacher/dashboard");
    else if (role === "student") navigate("/student/dashboard");
    else navigate("/pending");
  };

  const syncWithBackend = async (idToken) => {
    try {
      const res = await axios.post(`${API}/api/auth/firebase-sync`, { idToken });
      saveAuthAndNavigate(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Sync Failed");
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;
    if (cooldown > 0) return;
    setLoading(true);
    setDevOtpMessage("");
    try {
      const res = await axios.post(`${API}/api/auth/send-otp`, { email });
      setOtpSent(true);
      if (res.data.otp) {
        setDevOtpMessage(`Verification code: ${res.data.otp} (SMTP failed/Dev Mode)`);
      } else {
        setDevOtpMessage("Verification code sent to your email address!");
      }
      setCooldown(60);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email || !otp) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/verify-otp`, { email, otp });
      saveAuthAndNavigate(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth is not initialized. Please check network connection.");
      }
      let idToken;
      if (Capacitor.isNativePlatform()) {
        const user = await GoogleAuth.signIn();
        const googleIdToken = user.authentication.idToken;
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCredential = await signInWithCredential(auth, credential);
        idToken = await userCredential.user.getIdToken();
      } else {
        const userCredential = await signInWithPopup(auth, googleProvider);
        idToken = await userCredential.user.getIdToken();
      }
      await syncWithBackend(idToken);
    } catch (error) {
      alert(error.message || "Google Sign-In Failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirecting loader
  const tokenExists = localStorage.getItem("token");
  const roleExists = localStorage.getItem("role");
  if (tokenExists && roleExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070C18]">
        <div className="w-9 h-9 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex flex-col lg:flex-row font-sans bg-slate-50 dark:bg-[#070C18] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden" 
      style={{ fontFamily: SORA }}
    >
      {/* Dynamic Ambient Background Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/15 dark:bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[100px] pointer-events-none" />

      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#8B5CF6 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 sm:top-7 sm:right-7 p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 shadow-lg shadow-black/5 z-50 transition-all duration-200 cursor-pointer active:scale-95"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? (
          <FaSun className="text-amber-400 text-lg animate-pulse" />
        ) : (
          <FaMoon className="text-purple-600 text-lg" />
        )}
      </button>

      {/* ── Left Panel (Desktop Branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative items-center justify-center p-12 lg:p-16 border-r border-slate-200/50 dark:border-white/5">
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3.5 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/80 dark:border-white/10 px-5 py-2.5 rounded-2xl mb-8 shadow-xl shadow-purple-950/5">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="w-9 h-9 object-contain rounded-xl shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
                <FaGraduationCap className="text-lg text-white" />
              </div>
            )}
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {platformName || "TeachHub"}
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight mb-5">
            Where Learning <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Comes Alive
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
            A secure, unified platform for students, teachers, and admins — built to power modern education and streamlined school operations.
          </p>

          {/* SaaS Metrics Pills */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            {[
              { 
                label: "Students", 
                count: liveStats.students !== undefined ? `${liveStats.students}` : (platformConfig?.stats?.students !== undefined ? `${platformConfig.stats.students}` : "0"), 
                accent: "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20" 
              },
              { 
                label: "Teachers", 
                count: liveStats.teachers !== undefined ? `${liveStats.teachers}` : (platformConfig?.stats?.teachers !== undefined ? `${platformConfig.stats.teachers}` : "0"), 
                accent: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" 
              },
              { 
                label: "Admins", 
                count: liveStats.admins !== undefined ? `${liveStats.admins}` : (platformConfig?.stats?.admins !== undefined ? `${platformConfig.stats.admins}` : "0"), 
                accent: "from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20" 
              }
            ].map((item) => (
              <div
                key={item.label}
                className={`bg-gradient-to-b ${item.accent} backdrop-blur-md border rounded-2xl p-4 text-center shadow-sm hover:scale-105 transition-transform duration-200`}
              >
                <p className="text-xl font-black">{item.count}</p>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Right Panel (Modern Glass Card Container) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        
        {/* Glassmorphic Form Card */}
        <div className="w-full max-w-[440px] bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-purple-950/10 dark:shadow-black/70 transition-all duration-300">
          
          {/* Header Brand Badge inside card for both mobile & desktop */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-purple-500/10 dark:bg-white/[0.05] border border-purple-500/20 dark:border-white/10 mb-4 shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt={platformName} className="w-6 h-6 object-contain rounded-md" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xs">
                  <FaGraduationCap className="text-white text-xs" />
                </div>
              )}
              <span className="text-xs font-black tracking-wide text-purple-700 dark:text-purple-300">
                {platformName || "Your School"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
              {otpSent ? "Enter the verification OTP code sent to your email" : "Enter your registered email address to continue"}
            </p>
          </div>

          {/* Dev OTP Notification Banner */}
          {devOtpMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
              <FaCheckCircle className="text-purple-500 text-base shrink-0" />
              <span className="leading-snug">{devOtpMessage}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 dark:text-slate-500 text-sm pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 dark:bg-[#151D36] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 focus:bg-white dark:focus:bg-[#1A2444] transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <FaArrowRight className="text-[10px]" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <span className="relative z-10 bg-white dark:bg-[#0B132B] px-3 text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  Or login with
                </span>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] active:scale-[0.98] text-slate-700 dark:text-slate-200 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 dark:text-slate-500 text-sm pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-[#151D36]/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* OTP Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 dark:text-slate-500 text-sm pointer-events-none" />
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 dark:bg-[#151D36] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-center tracking-[0.3em] font-mono text-sm font-black focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 focus:bg-white dark:focus:bg-[#1A2444] transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <FaArrowRight className="text-[10px]" />
                  </>
                )}
              </button>

              {/* Change Email / Resend Actions */}
              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setDevOtpMessage("");
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className={`font-extrabold transition-colors cursor-pointer ${
                    cooldown > 0
                      ? "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                      : "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer text */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-8 text-center">
          Protected by end-to-end OTP authentication &bull; TeachHub
        </p>

      </div>
    </div>
  );
}

export default Login;
