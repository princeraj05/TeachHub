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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [requestedRole, setRequestedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    axios
      .put(
        `${API}/api/auth/join-request`,
        { schoolName: selectedSchool, role: requestedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setUser((prev) => ({
          ...prev,
          requestedSchool: selectedSchool,
          requestedRole: requestedRole,
          requestStatus: "pending"
        }));
        setShowJoinModal(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit request");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

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

            {/* Pending joining request alert banner */}
            {user.requestStatus === "pending" && (
              <div className="mb-6 px-4 py-3 bg-amber-500/15 border border-amber-500/20 rounded-2xl text-left flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-amber-500">Pending School Approval</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                    Requested to join <strong className="font-bold text-slate-700 dark:text-white">{user.requestedSchool}</strong> as a <strong className="font-bold text-slate-700 dark:text-white capitalize">{user.requestedRole}</strong>. Please wait for school admin approval.
                  </p>
                </div>
              </div>
            )}

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
              <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {schools.map((school, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/10 transition duration-150 shadow-sm gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 border border-teal-200/40">
                        <FaSchool className="text-lg" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{school}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mt-0.5">Active Center</p>
                      </div>
                    </div>

                    {/* Join School Action Button */}
                    <div>
                      {user.requestStatus === "pending" && user.requestedSchool === school ? (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
                          Pending Approval
                        </span>
                      ) : user.requestStatus === "pending" ? (
                        <button
                          disabled
                          className="opacity-40 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-3.5 py-2 rounded-xl cursor-not-allowed"
                        >
                          Join
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowJoinModal(true);
                          }}
                          className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-4 py-2 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                        >
                          Join School
                        </button>
                      )}
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

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowJoinModal(false)}
          />

          {/* Modal content */}
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Request to Join School
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">
                You are applying to join <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedSchool}</strong>
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Select Requested Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestedRole("student")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "student"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-lg">🎓</span>
                    <span className="text-xs font-black">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestedRole("teacher")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "teacher"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-lg">💼</span>
                    <span className="text-xs font-black">Teacher</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApproval;
