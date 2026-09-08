import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaChalkboardTeacher, FaUserGraduate, FaGraduationCap } from "react-icons/fa";
import { auth } from "../../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const SORA = "'Sora', sans-serif";

import API_URL from "../../config/api";

function Register() {
  const API = API_URL;
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
      // 1. Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // 2. Set profile displayName
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: form.name });
      }

      // 3. Get ID token and sync with backend
      const idToken = await userCredential.user.getIdToken();
      const res = await axios.post(`${API}/api/auth/firebase-sync`, { idToken });

      alert("Registered Successfully");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("This email address is already registered. Please log in instead.");
      } else if (error.code === "auth/weak-password") {
        alert("The password is too weak. Please use at least 6 characters.");
      } else {
        alert(error.message || "Registration Failed");
      }
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
            Join the <br />
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] bg-clip-text text-transparent">
              Learning Revolution
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-md mx-auto">
            Create your account today and start your journey with thousands of students and teachers who trust our platform.
          </p>

          {/* Roles Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-white/10 transition-all hover:bg-white/[0.05]">
              <FaUserGraduate className="text-[#38BDF8] text-3xl" />
              <span className="text-white text-sm font-bold mt-1">Student</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center mt-1">Access courses & schedules</span>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-white/10 transition-all hover:bg-white/[0.05]">
              <FaChalkboardTeacher className="text-[#7C3AED] text-3xl" />
              <span className="text-white text-sm font-bold mt-1">Teacher</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-center mt-1">Manage classes & grading</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form Container) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-12 lg:px-16 xl:px-24 relative">
        {/* Mobile ambient glow */}
        <div className="fixed lg:hidden top-10 right-10 w-64 h-64 rounded-full bg-[#7C3AED]/5 blur-[80px] pointer-events-none" />

        {/* Mobile Header Logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8 sm:mb-10 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-md">
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
            TeachHub
          </span>
        </div>

        <div className="w-full max-w-[440px] bg-white dark:bg-[#0F172A] lg:bg-transparent dark:lg:bg-transparent p-6 sm:p-10 lg:p-0 rounded-3xl border border-slate-200/60 dark:border-white/10 lg:border-none shadow-xl shadow-slate-100/40 lg:shadow-none">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Create account
          </h2>
          <p className="text-slate-500 text-xs mb-6 font-medium">
            Fill in the details below to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm" />
                <input
                  name="name"
                  placeholder="Your full name"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
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
                  type="password"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-405 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Role select */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
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
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      form.role === r.value
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/15"
                        : "bg-slate-50 border-slate-250 text-slate-600 hover:border-[#7C3AED]/50 hover:bg-white"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs tracking-wider transition-all shadow-md shadow-[#7C3AED]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-7 font-semibold uppercase tracking-wide">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-[#7C3AED] font-extrabold hover:text-[#6D28D9] transition-colors hover:underline"
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