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
  FaHeadset,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaCalendarAlt,
  FaInfoCircle,
  FaMoneyBillWave,
  FaUsers,
  FaSchool,
  FaExchangeAlt,
  FaBell,
  FaThLarge,
  FaTimes,
  FaBars,
  FaSearch
} from "react-icons/fa";
import { usePlatform } from "../../../context/PlatformContext";
import API_URL from "../../../config/api";

const SORA = "'Sora', sans-serif";

function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { platformName, logoUrl, confirmLogout } = usePlatform();

  const [unreadCount, setUnreadCount] = useState(12);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const API = API_URL;
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
    const API = API_URL;
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
    { to: "/superadmin/profile", icon: <FaUserCircle className="text-xl" />, label: "Profile" },
    { to: "/superadmin/dashboard", icon: <FaTachometerAlt className="text-xl" />, label: "Dashboard" },
    { to: "/superadmin/users", icon: <FaUsers className="text-xl" />, label: "Users" },
    { to: "/superadmin/schools", icon: <FaSchool className="text-xl" />, label: "Schools" },
    { to: "/superadmin/school-change-requests", icon: <FaExchangeAlt className="text-xl text-purple-500" />, label: "School Change Requests" },
    { to: "/superadmin/events", icon: <FaCalendarAlt className="text-xl" />, label: "Events" },
    { to: "/superadmin/payments", icon: <FaMoneyBillWave className="text-xl" />, label: "Payments" },
    { to: "/superadmin/about", icon: <FaInfoCircle className="text-xl" />, label: "About / Config" },
    { to: "/superadmin/support", icon: <FaComments className="text-xl" />, label: "Support" },
    { to: "/superadmin/support-team", icon: <FaHeadset className="text-xl" />, label: "Support Team" },
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
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090F1C] transition-colors duration-200 relative flex" style={{ fontFamily: SORA }}>
      {/* Ambient background glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 dark:bg-[#7C3AED]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#312E81]/15 dark:bg-[#312E81]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#38BDF8]/10 dark:bg-[#38BDF8]/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
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

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:pl-20 lg:pl-64 min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B132A]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 select-none">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              Super Admin Panel
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <FaSun className="text-amber-400 text-sm" /> : <FaMoon className="text-purple-600 text-sm" />}
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] text-white flex items-center justify-center font-black text-xs shadow-md">
                {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{name}</p>
                <p className="text-[10px] text-purple-600 dark:text-[#38BDF8] font-bold uppercase tracking-wider mt-0.5">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
