import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHeadset, 
  FaThLarge, 
  FaTicketAlt, 
  FaComments, 
  FaUsers, 
  FaSchool, 
  FaPhoneAlt, 
  FaBookOpen, 
  FaExclamationTriangle, 
  FaBell, 
  FaUser, 
  FaCog, 
  FaSearch, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { getSupportDashboardStats } from "../../../services/supportTicketApi";

export default function SupportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);

  const userName = localStorage.getItem("userName") || "Support Agent";
  const userEmail = localStorage.getItem("userEmail") || "agent@teachhub.com";
  const userInitials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "SA";

  useEffect(() => {
    let isMounted = true;
    getSupportDashboardStats()
      .then((data) => {
        if (isMounted && data) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load layout stats:", err?.message);
      });
    return () => { isMounted = false; };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/support/login");
  };

  const navItems = [
    { path: "/support/dashboard", label: "Dashboard", icon: FaThLarge },
    { 
      path: "/support/requests", 
      label: "Support Requests", 
      icon: FaTicketAlt, 
      badge: stats?.totals?.all > 0 ? String(stats.totals.all) : null, 
      badgeColor: "bg-rose-500" 
    },
    { path: "/support/chat", label: "Live Chat", icon: FaComments },
    { path: "/support/users", label: "Users", icon: FaUsers },
    { path: "/support/schools", label: "Schools", icon: FaSchool },
    { path: "/support/calls", label: "Calls", icon: FaPhoneAlt },
    { path: "/support/help-center", label: "Help Center", icon: FaBookOpen },
    { 
      path: "/support/escalated", 
      label: "Escalated Issues", 
      icon: FaExclamationTriangle, 
      badge: stats?.totals?.escalated > 0 ? String(stats.totals.escalated) : null, 
      badgeColor: "bg-rose-500" 
    },
    { 
      path: "/support/notifications", 
      label: "Notifications", 
      icon: FaBell, 
      badge: stats?.totals?.new > 0 ? String(stats.totals.new) : null, 
      badgeColor: "bg-purple-500" 
    },
    { 
      path: "/support/my-assigned", 
      label: "My Assigned Requests", 
      icon: FaTicketAlt, 
      badge: stats?.totals?.myAssigned > 0 ? String(stats.totals.myAssigned) : null, 
      badgeColor: "bg-[#7C3AED]" 
    },
  ];

  const secondaryNavItems = [
    { path: "/support/profile", label: "Profile", icon: FaUser },
    { path: "/support/settings", label: "Settings", icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070C16] text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-50
        w-64 bg-[#0B1220] text-slate-300 flex flex-col justify-between border-r border-white/10
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          {/* Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
                  <FaHeadset className="text-purple-400 text-xl" />
                </div>
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white leading-tight">
                  Teach<span className="text-cyan-400">Hub</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400 tracking-wider">Support Portal</div>
              </div>
            </div>

            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <div className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white font-semibold shadow-md shadow-purple-600/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`text-base transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-purple-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor || "bg-rose-500"}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Divider */}
          <div className="px-6 py-2">
            <div className="border-t border-white/10" />
          </div>

          {/* Secondary Navigation Links */}
          <div className="p-4 space-y-1.5 pt-0">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white font-semibold shadow-md shadow-purple-600/20" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }
                  `}
                >
                  <Icon className="text-base text-slate-400 group-hover:text-purple-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

        </div>

        {/* Bottom Support Team Card */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-[#121B2E] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
              <FaHeadset className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white leading-snug truncate">Support Team</h4>
              <p className="text-[10px] text-slate-400 truncate leading-tight">Helping Education Grow Together</p>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        
        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0D1527]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
            >
              <FaBars className="text-lg" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="text-sm" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests, users, schools... (Ctrl + K)"
                className="w-full pl-10 pr-16 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded">Ctrl K</span>
              </div>
            </div>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notification Bell Icon */}
            <button 
              onClick={() => navigate("/support/notifications")}
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition"
              title="Notifications"
            >
              <FaBell className="text-base" />
              {stats?.totals?.new > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {stats.totals.new}
                </span>
              )}
            </button>

            {/* Online Status Pill */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </div>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{userName}</div>
                <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400">Support Team</div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 transition"
                title="Logout"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>

          </div>

        </header>

        {/* PAGE BODY OUTLET */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
