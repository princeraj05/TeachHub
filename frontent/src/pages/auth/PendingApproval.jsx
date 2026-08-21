import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaGraduationCap, FaClock, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import UserProfile from "../../components/UserProfile";

const SORA = "'Sora', sans-serif";

function PendingApproval() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const checkRoleStatus = () => {
      axios
        .get(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (res.data && res.data.role && res.data.role !== "unassigned") {
            // Update token and role in localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("name", res.data.name);

            // Redirect automatically without requiring reload/logout
            if (res.data.role === "superadmin") {
              navigate("/superadmin/dashboard");
            } else if (res.data.role === "admin") {
              navigate("/admin/dashboard");
            } else if (res.data.role === "teacher") {
              navigate("/teacher/dashboard");
            } else if (res.data.role === "student") {
              navigate("/student/dashboard");
            }
          }
        })
        .catch((err) => {
          console.error("Polling profile status error:", err);
        });
    };

    // Poll every 3 seconds
    const interval = setInterval(checkRoleStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col xl:flex-row items-center justify-center bg-[#F8FAFC] dark:bg-[#090F1C] p-6 gap-8 font-sans transition-colors duration-200" style={{ fontFamily: SORA }}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 shadow-md z-50 transition duration-200 cursor-pointer"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <FaSun className="text-amber-500 text-lg animate-pulse" /> : <FaMoon className="text-lg" />}
      </button>

      {/* Pending status card */}
      <div className="max-w-md w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden shrink-0 transition-all duration-200">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
        
        {/* Logo */}
        <div className="inline-flex items-center gap-2.5 mb-8 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-md">
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="text-base font-black text-slate-800 dark:text-white tracking-tight">
            TeachHub
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
          <FaClock className="text-3xl animate-pulse" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Wait Kro, School Assign Ho Raha Hai
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          Your login was successful! Please wait until the Super Admin assigns your school and system role. You will be able to access your dashboard as soon as the assignment is completed.
        </p>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-rose-500 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaSignOutAlt className="text-sm" />
          Logout from Account
        </button>
      </div>

      {/* Embedded Personal Profile Setup */}
      <div className="w-full max-w-xl">
        <UserProfile />
      </div>
    </div>
  );
}

export default PendingApproval;
