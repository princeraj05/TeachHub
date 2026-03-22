import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

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
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* ── Left Panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-[#0f172a] items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full bg-cyan-400/10 blur-2xl" />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#0f172a]">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span
              className="text-3xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              TeachHub
            </span>
          </div>

          <h1
            className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Join the
            <span className="block text-teal-400">Learning Revolution</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Create your account today and start your journey with thousands of
            learners and educators.
          </p>

          {/* Roles preview */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5 flex flex-col items-center gap-2">
              <FaUserGraduate className="text-teal-400 text-2xl" />
              <span className="text-white text-sm font-semibold">Student</span>
              <span className="text-slate-500 text-xs">Access courses & tests</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-5 flex flex-col items-center gap-2">
              <FaChalkboardTeacher className="text-emerald-400 text-2xl" />
              <span className="text-white text-sm font-semibold">Teacher</span>
              <span className="text-slate-500 text-xs">Create & manage classes</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-5 py-12 sm:px-10 lg:px-16 xl:px-24">

        {/* mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span
            className="text-2xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            TeachHub
          </span>
        </div>

        <div className="w-full max-w-sm sm:max-w-md">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Create account 🚀
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mb-8">
            Fill in the details below to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="name"
                  placeholder="Your full name"
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition shadow-sm"
                />
              </div>
            </div>

            {/* Role toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-widest">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["student", "teacher"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${
                      form.role === r
                        ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/30"
                        : "bg-white border-slate-200 text-slate-600 hover:border-teal-300"
                    }`}
                  >
                    {r === "student" ? (
                      <FaUserGraduate className="text-base" />
                    ) : (
                      <FaChalkboardTeacher className="text-base" />
                    )}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-teal-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            Already have an account?{" "}
            <Link to="/" className="text-teal-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');`}</style>
    </div>
  );
}

export default Register;