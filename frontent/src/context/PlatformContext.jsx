import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaSignOutAlt } from "react-icons/fa";
import { performLogout } from "../utils/logout";
import API_URL from "../config/api";

const PlatformContext = createContext(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    return {
      platformName: "Your School",
      logoUrl: "",
      tagline: "Smart School Management & Communication Platform",
      refreshPlatformConfig: () => {},
      confirmLogout: (navigate) => performLogout(navigate)
    };
  }
  return context;
};


export const PlatformProvider = ({ children }) => {
  const [platformName, setPlatformName] = useState(localStorage.getItem("platformName") || "Your School");
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem("platformLogoUrl") || "");
  const [tagline, setTagline] = useState("Smart School Management & Communication Platform");
  const [platformConfig, setPlatformConfig] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_platform_config");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });

  // Global Logout Confirmation Modal state
  const [logoutTarget, setLogoutTarget] = useState({ isOpen: false, navigate: null });

  const fetchPlatformConfig = useCallback(async () => {
    try {
      const API = API_URL;
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/api/about-app`, { headers });
      if (res.data) {
        setPlatformConfig(res.data);
        try { localStorage.setItem("teachhub_platform_config", JSON.stringify(res.data)); } catch (e) {}
        if (res.data.platformName) {
          setPlatformName(res.data.platformName);
          localStorage.setItem("platformName", res.data.platformName);
        }
        if (res.data.logoUrl !== undefined) {
          setLogoUrl(res.data.logoUrl || "");
          localStorage.setItem("platformLogoUrl", res.data.logoUrl || "");
        }
        if (res.data.tagline) setTagline(res.data.tagline);
      }
    } catch (err) {
      console.error("Error loading platform configuration:", err);
    }
  }, []);

  useEffect(() => {
    fetchPlatformConfig();

    const handleConfigUpdate = () => {
      fetchPlatformConfig();
    };

    window.addEventListener("platformConfigUpdate", handleConfigUpdate);
    return () => window.removeEventListener("platformConfigUpdate", handleConfigUpdate);
  }, [fetchPlatformConfig]);

  const confirmLogout = (navigate) => {
    setLogoutTarget({ isOpen: true, navigate });
  };

  return (
    <PlatformContext.Provider
      value={{
        platformName,
        logoUrl,
        tagline,
        platformConfig,
        refreshPlatformConfig: fetchPlatformConfig,
        confirmLogout
      }}
    >
      {children}

      {/* Global Confirmation Modal for Logout */}
      {logoutTarget.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 select-none animate-fadeIn text-left">
          <div className="bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-slate-800 dark:text-white space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                <FaSignOutAlt className="text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Confirm Logout</h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              You will need to log back in to access your workspace.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLogoutTarget({ isOpen: false, navigate: null })}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  const nav = logoutTarget.navigate;
                  setLogoutTarget({ isOpen: false, navigate: null });
                  performLogout(nav);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformContext.Provider>
  );
};
