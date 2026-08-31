import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../../context/ThemeContext";
import { performLogout } from "../../../utils/logout";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaGraduationCap,
  FaUserShield,
  FaComments,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaCalendarAlt,
  FaInfoCircle,
  FaMoneyBillWave,
  FaUsers,
  FaSchool,
  FaBell,
  FaThLarge,
  FaTimes
} from "react-icons/fa";
import { usePlatform } from "../../../context/PlatformContext";

const SORA = "'Sora', sans-serif";

function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { platformName, logoUrl, confirmLogout } = usePlatform();

  const [unreadCount, setUnreadCount] = useState(12);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const [name, setName] = useState(localStorage.getItem("name") || "Super Admin");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");

  useEffect(() => {
    const handleProfileUpdate = () => {
      setName(localStorage.getItem("name") || "Super Admin");
      setAvatar(localStorage.getItem("avatar") || "");
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const user = res.data;
        if (user) {
          if (user.name) {
            localStorage.setItem("name", user.name);
            setName(user.name);
          }
          const userAvatar = user.avatar || user.photo || user.profilePhoto || "";
          if (userAvatar) {
            localStorage.setItem("avatar", userAvatar);
            setAvatar(userAvatar);
          }
        }
      })
      .catch((err) => {
        console.log("SuperAdmin profile sync error:", err);
        if (err.response && err.response.status === 401) {
          performLogout(navigate);
        }
      });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    confirmLogout(navigate);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/superadmin/dashboard", icon: <FaTachometerAlt className="text-xl" />, label: "Dashboard" },
    { to: "/superadmin/users", icon: <FaUsers className="text-xl" />, label: "Users" },
    { to: "/superadmin/schools", icon: <FaSchool className="text-xl" />, label: "Schools" },
    { to: "/superadmin/events", icon: <FaCalendarAlt className="text-xl" />, label: "Events" },
    { to: "/superadmin/payments", icon: <FaMoneyBillWave className="text-xl" />, label: "Payments" },
    { to: "/superadmin/about", icon: <FaInfoCircle className="text-xl" />, label: "About / Config" },
    { to: "/superadmin/support", icon: <FaComments className="text-xl" />, label: "Support" },
    { 
      to: "/superadmin/notifications", 
      icon: (
        <div className="relative">
          <FaBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#7C3AED] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-[#0B132A]">
              {unreadCount}
            </span>
          )}
        </div>
      ), 
      label: "Notifications" 
    },
    { to: "/superadmin/profile", icon: <FaUserCircle className="text-xl" />, label: "Profile" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient background glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar - Instagram Style */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-20 lg:w-64 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B132A] flex flex-col py-5 px-4 z-40 select-none overflow-y-auto overscroll-contain transition-all duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={platformName} className="w-10 h-10 object-contain rounded-xl shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 shrink-0">
                <FaGraduationCap className="text-xl text-white" />
              </div>
            )}
            <span className="hidden lg:block text-lg font-black bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] bg-clip-text text-transparent tracking-tight truncate max-w-[140px]">
              {platformName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#38BDF8] dark:bg-[#38BDF8]/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex-shrink-0">{link.icon}</div>
                <span className="hidden lg:block text-sm font-semibold">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-white/[0.08] pt-4">
          {/* Appearance Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 px-3.5 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer text-left w-full"
          >
            <div className="flex-shrink-0">
              {theme === "dark" ? <FaSun className="text-xl text-amber-500 animate-pulse" /> : <FaMoon className="text-xl" />}
            </div>
            <span className="hidden lg:block text-sm font-semibold">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3.5 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer text-left w-full"
          >
            <div className="flex-shrink-0">
              <FaSignOutAlt className="text-xl" />
            </div>
            <span className="hidden lg:block text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE: Fixed Bottom Navigation Bar (4 main tabs + More button) */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0B132A]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-around z-[60] px-1 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none h-14">
        <Link
          to="/superadmin/dashboard"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/superadmin/dashboard") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaTachometerAlt className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Dashboard</span>
        </Link>

        <Link
          to="/superadmin/users"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/superadmin/users") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaUsers className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Users</span>
        </Link>

        <Link
          to="/superadmin/schools"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/superadmin/schools") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaSchool className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Schools</span>
        </Link>

        <Link
          to="/superadmin/payments"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 ${
            isActive("/superadmin/payments") ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaMoneyBillWave className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">Payments</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 cursor-pointer ${
            mobileMenuOpen ? "text-[#7C3AED] dark:text-[#38BDF8] font-bold" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <FaThLarge className="text-base" />
          <span className="text-[9px] font-extrabold tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE: Bottom Sheet Sliding Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-3 right-3 max-h-[75vh] bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-2.5xl p-5 shadow-2xl z-50 overflow-y-auto animate-slideUp text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-lg text-[#7C3AED] dark:text-[#38BDF8]" />
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">TeachHub Super Admin</span>
              </div>
              <button
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-white/5 p-1 rounded-xl transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category: System Management */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] mb-2 px-1">Management</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/superadmin/users" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">User Directory</Link>
                  <Link to="/superadmin/schools" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Schools List</Link>
                  <Link to="/superadmin/payments" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">Financial Overview</Link>
                  <Link to="/superadmin/about-app" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/[0.04] p-2.5 rounded-xl text-xs font-bold text-center block text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10">About TeachHub</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <Link to="/superadmin/profile" onClick={() => setMobileMenuOpen(false)} className="text-xs font-bold text-[#7C3AED] dark:text-[#38BDF8] hover:underline">View Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 pl-0 md:pl-20 lg:pl-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between bg-white/70 dark:bg-[#0B132A]/70 backdrop-blur-xl px-5 py-4 sm:px-8 sm:py-5.5 md:py-6 mx-3 md:mx-6 mt-3 md:mt-4 border border-slate-200/80 dark:border-white/15 rounded-3xl shadow-md z-30 select-none">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[200px] sm:max-w-md md:max-w-xl">
              Super Admin Workspace
            </h1>
            <p className="text-[9px] sm:text-xs text-[#7C3AED] dark:text-[#38BDF8] font-black uppercase tracking-widest mt-1">Control Center</p>
          </div>

          <div className="relative flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Quick theme switch in header for convenience */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 cursor-pointer transition text-sm sm:text-lg"
            >
              {theme === "dark" ? <FaSun className="text-amber-500" /> : <FaMoon />}
            </button>

            <div
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-[#38BDF8] transition duration-200">
                  {name}
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">System Owner</p>
              </div>

              <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md border border-white/20 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 top-12 w-52 bg-[#0F172A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 text-slate-350 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center text-white font-black text-xs overflow-hidden border border-white/20 shrink-0">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{name}</p>
                      <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#38BDF8] uppercase tracking-widest mt-0.5 bg-white/5 border border-white/[0.06] px-1.5 py-0.5 rounded">
                        <FaUserShield /> Super Admin
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/superadmin/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                  >
                    <FaUserCircle /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-350 rounded-xl transition cursor-pointer"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="p-4 md:p-6 flex-1 overflow-x-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
