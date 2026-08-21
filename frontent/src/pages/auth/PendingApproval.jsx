import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaGraduationCap,
  FaClock,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaSchool,
  FaUserCircle
} from "react-icons/fa";
import UserProfile from "../../components/UserProfile";

const SORA = "'Sora', sans-serif";

function PendingApproval() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [activeTab, setActiveTab] = useState("status");
  const [schools, setSchools] = useState([]);
  const [user, setUser] = useState({ name: "Loading...", email: "", role: "", avatar: "" });

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
          if (res.data) {
            setUser(res.data);
            if (res.data.role && res.data.role !== "unassigned") {
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
          }
        })
        .catch((err) => {
          console.error("Polling profile status error:", err);
        });
    };

    checkRoleStatus(); // Run once immediately
    // Poll every 3 seconds
    const interval = setInterval(checkRoleStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/auth/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSchools(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching schools:", err);
      });
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div style={{ fontFamily: SORA }} className="min-h-screen bg-[#F8FAFC] dark:bg-[#090F1C] text-slate-800 dark:text-white transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 bg-white dark:bg-[#0B132A] border-r border-slate-200/60 dark:border-white/10 flex flex-col justify-between py-6 px-3 z-40 transition-all duration-200">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start lg:px-4 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black shadow-md shadow-[#7C3AED]/20">
              <FaGraduationCap className="text-xl" />
            </div>
            <span className="hidden lg:block text-lg font-black tracking-tight text-slate-900 dark:text-white">
              TeachHub
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* Status Link */}
            <button
              onClick={() => setActiveTab("status")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "status"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaClock className="text-xl shrink-0" />
              <span className="hidden lg:block">Wait Kro</span>
            </button>

            {/* Profile Link */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaUserCircle className="text-xl shrink-0" />
              <span className="hidden lg:block">Profile</span>
            </button>

            {/* School List Link */}
            <button
              onClick={() => setActiveTab("schools")}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === "schools"
                  ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:bg-[#38BDF8]/10 dark:text-[#38BDF8]"
                  : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <FaSchool className="text-xl shrink-0" />
              <span className="hidden lg:block">School List</span>
            </button>
          </nav>
        </div>

        {/* Footer controls inside Sidebar */}
        <div className="space-y-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-200 cursor-pointer"
          >
            {theme === "dark" ? <FaSun className="text-xl text-amber-500 animate-pulse" /> : <FaMoon className="text-xl" />}
            <span className="hidden lg:block">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition duration-200 cursor-pointer"
          >
            <FaSignOutAlt className="text-xl shrink-0" />
            <span className="hidden lg:block">Logout</span>
          </button>

          {/* Profile Badge Footer */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-center lg:justify-start gap-3 px-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] p-[1.5px] shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0B132A]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-extrabold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name || "User"}</p>
              <p className="text-[9px] font-extrabold text-[#7C3AED] dark:text-[#38BDF8] tracking-wider uppercase mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-20 lg:pl-64 min-h-screen flex items-center justify-center p-6 sm:p-12 transition-all duration-200">
        
        {activeTab === "status" && (
          <div className="max-w-md w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-200">
            {/* Ambient glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
            
            {/* Clock Icon container */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
              <FaClock className="text-3xl animate-pulse" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Wait Kro, School Assign Ho Raha Hai
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              Your login was successful! Please wait until the Super Admin assigns your school and system role. You will be able to access your dashboard as soon as the assignment is completed.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-2xl border border-teal-100/50 dark:border-teal-400/10 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping mr-1" />
              Checking status in real-time
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="w-full">
            <UserProfile />
          </div>
        )}

        {activeTab === "schools" && (
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 relative overflow-hidden transition-all duration-200">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Directory</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Registered Schools
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">List of available schools in TeachHub</p>
            </div>

            {schools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {schools.map((school, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/10 transition duration-150 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 border border-teal-200/40">
                      <FaSchool className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{school}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Active Center</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaSchool className="text-slate-300 dark:text-slate-700 text-4xl mx-auto mb-3" />
                <p className="text-xs text-slate-450 dark:text-slate-500 font-bold italic">No schools registered yet.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default PendingApproval;
