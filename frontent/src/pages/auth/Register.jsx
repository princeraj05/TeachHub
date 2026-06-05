import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaChalkboardTeacher, FaUserGraduate, FaGraduationCap } from "react-icons/fa";

function Register() {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, form);
      alert("Registered Successfully");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-slate-50">

      {/* ── Left Panel (Branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-[#0B132B] items-center justify-center overflow-hidden">
        {/* Glow Blobs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px]" />

        {/* Cyber Grid Overlay */}
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
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FaGraduationCap className="text-xl text-[#0B132B]" />
            </div>
            <span
              className="text-2xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              TeachHub
            </span>
          </div>

          <h1
            className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6 tracking-tight text-center"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Join the <br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Learning Revolution
            </span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-12 max-w-md mx-auto">
            Create your account today and start your journey with thousands of students and teachers who trust our platform.
          </p>

          {/* Roles Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-white/10 transition-all">
              <FaUserGraduate className="text-teal-400 text-3xl" />
              <span className="text-white text-sm font-bold mt-1">Student</span>
              <span className="text-slate-500 text-xs text-center">Access schedules, courses & exams</span>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-white/10 transition-all">
              <FaChalkboardTeacher className="text-emerald-400 text-3xl" />
              <span className="text-white text-sm font-bold mt-1">Teacher</span>
              <span className="text-slate-500 text-xs text-center">Manage attendance, classes & scores</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form Container) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-2 mb-10 bg-slate-100 border border-slate-200/50 px-4 py-2 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-md">
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span
            className="text-xl font-black text-slate-800 tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            TeachHub
          </span>
        </div>

        <div className="w-full max-w-[440px] bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-3xl border border-slate-100 lg:border-none shadow-xl shadow-slate-100/40 lg:shadow-none">
          <h2
            className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Create account
          </h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">
            Fill in the details below to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="name"
                  placeholder="Your full name"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
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
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Role select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
                Register as a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "student", label: "Student", icon: <FaUserGraduate /> },
                  { value: "teacher", label: "Teacher", icon: <FaChalkboardTeacher /> }
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold capitalize transition-all ${
                      form.role === r.value
                        ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-white"
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-teal-600/10 hover:shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7 font-medium">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-teal-600 font-bold hover:text-teal-500 hover:underline transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;