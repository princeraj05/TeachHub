import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaGraduationCap, FaCheckCircle, FaSun, FaMoon } from "react-icons/fa";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithPopup, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

const SORA = "'Sora', sans-serif";

function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtpMessage, setDevOtpMessage] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [cooldown, setCooldown] = useState(0);

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

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const saveAuthAndNavigate = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("schoolName", data.user.schoolName || "");
    localStorage.setItem("name", data.user.name);

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
      await axios.post(`${API}/api/auth/send-otp`, { email });
      setOtpSent(true);
      setDevOtpMessage("Verification code sent to your email address!");
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
      let idToken;
      if (Capacitor.isNativePlatform()) {
        const user = await GoogleAuth.signIn();
        const googleIdToken = user.authentication.idToken;
        // Sign in to Firebase Auth locally
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCredential = await signInWithCredential(auth, credential);
        // Get the actual Firebase ID Token!
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200" style={{ fontFamily: SORA }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 shadow-md z-50 transition duration-200 cursor-pointer"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <FaSun className="text-amber-500 text-lg animate-pulse" /> : <FaMoon className="text-lg" />}
      </button>

      {/* ── Left Panel (Branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-[#0F172A] items-center justify-center overflow-hidden">
        {/* Ambient Gradient Glow Blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/15 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] rounded-full bg-[#38BDF8]/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#312E81]/20 blur-[80px]" />

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative z-10 px-16 max-w-xl text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl mb-10 shadow-xl shadow-black/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
              <FaGraduationCap className="text-xl text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              TeachHub
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6 tracking-tight text-center">
            Where Learning <br />
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] bg-clip-text text-transparent">
              Comes Alive
            </span>
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-md mx-auto">
            A secure, unified platform for students, teachers, and admins — built to power modern education and streamlined school operations.
          </p>

          {/* SaaS Stats indicators */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { label: "Students", count: "10k+", color: "text-[#38BDF8]" },
              { label: "Teachers", count: "500+", color: "text-[#7C3AED]" },
              { label: "Admins", count: "50+", color: "text-white" }
            ].map((role) => (
              <div
                key={role.label}
                className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all hover:bg-white/[0.05]"
              >
                <p className={`text-xl font-bold ${role.color}`}>{role.count}</p>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-1">{role.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form Container) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 relative">
        {/* Mobile ambient glow */}
        <div className="fixed lg:hidden top-10 right-10 w-64 h-64 rounded-full bg-[#7C3AED]/5 blur-[80px] pointer-events-none" />
        
        {/* Mobile Header Logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10 bg-slate-100 border border-slate-200/50 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-md">
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">
            TeachHub
          </span>
        </div>

        <div className="w-full max-w-[420px] bg-white dark:bg-[#0F172A] lg:bg-transparent dark:lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-3xl border border-slate-200/60 dark:border-white/10 lg:border-none shadow-xl shadow-slate-100/40 lg:shadow-none">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-slate-500 text-xs mb-8 font-medium">
            {otpSent ? "Enter the OTP sent to your email to verify" : "Enter your email address to log in"}
          </p>

          {devOtpMessage && (
            <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <FaCheckCircle className="text-purple-500 text-sm flex-shrink-0" />
              <span>{devOtpMessage}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs tracking-wider transition-all shadow-md shadow-[#7C3AED]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F8FAFC] lg:bg-white px-2 text-slate-400 font-bold text-[10px] tracking-widest">Or login with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Email (readonly) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-350 text-sm" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-500 text-xs font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* OTP */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner tracking-[0.2em]"
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs tracking-wider transition-all shadow-md shadow-[#7C3AED]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              {/* Back / Resend */}
              <div className="flex justify-between items-center text-xs mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setDevOtpMessage("");
                  }}
                  className="text-slate-500 hover:text-[#7C3AED] font-bold transition-colors cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className={`font-extrabold transition-colors cursor-pointer ${
                    cooldown > 0
                      ? "text-slate-400 cursor-not-allowed opacity-60"
                      : "text-[#7C3AED] hover:text-[#6D28D9]"
                  }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;