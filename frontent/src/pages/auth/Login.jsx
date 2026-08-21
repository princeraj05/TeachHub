import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from "react-icons/fa";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const SORA = "'Sora', sans-serif";

function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const syncWithBackend = async (idToken) => {
    try {
      const res = await axios.post(`${API}/api/auth/firebase-sync`, { idToken });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("schoolName", res.data.user.schoolName || "");
      localStorage.setItem("name", res.data.user.name);

      const role = res.data.user.role;
      if (role === "superadmin") navigate("/superadmin/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else if (role === "student") navigate("/student/dashboard");
      else navigate("/pending");
    } catch (error) {
      alert(error.response?.data?.message || "Sync Failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await userCredential.user.getIdToken();
      await syncWithBackend(idToken);
    } catch (error) {
      alert(error.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      await syncWithBackend(idToken);
    } catch (error) {
      alert(error.message || "Google Sign-In Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-[#F8FAFC]" style={{ fontFamily: SORA }}>
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

        <div className="w-full max-w-[420px] bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-3xl border border-slate-200/60 lg:border-none shadow-xl shadow-slate-100/40 lg:shadow-none">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back
          </h2>
          <p className="text-slate-500 text-xs mb-8 font-medium">
            Enter your credentials to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-[#7C3AED] transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs tracking-wider transition-all shadow-md shadow-[#7C3AED]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-xs tracking-wider transition-all mt-3 flex items-center justify-center gap-2 cursor-pointer"
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

          <p className="text-center text-xs text-slate-500 mt-8 font-semibold uppercase tracking-wide">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="text-[#7C3AED] font-extrabold hover:text-[#6D28D9] transition-colors hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;