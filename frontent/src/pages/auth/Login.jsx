import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from "react-icons/fa";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "student") navigate("/student/dashboard");
      else if (res.data.user.role === "teacher") navigate("/teacher/dashboard");
      else if (res.data.user.role === "admin") navigate("/admin/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
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