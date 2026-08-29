import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const PlatformContext = createContext(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    return {
      platformName: "TeachHub",
      logoUrl: "",
      tagline: "Smart School Management & Communication Platform",
      refreshPlatformConfig: () => {}
    };
  }
  return context;
};

export const PlatformProvider = ({ children }) => {
  const [platformName, setPlatformName] = useState("TeachHub");
  const [logoUrl, setLogoUrl] = useState("");
  const [tagline, setTagline] = useState("Smart School Management & Communication Platform");
  const [platformConfig, setPlatformConfig] = useState(null);

  const fetchPlatformConfig = useCallback(async () => {
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${API}/api/about-app`);
      if (res.data) {
        setPlatformConfig(res.data);
        if (res.data.platformName) setPlatformName(res.data.platformName);
        if (res.data.logoUrl !== undefined) setLogoUrl(res.data.logoUrl || "");
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

  return (
    <PlatformContext.Provider
      value={{
        platformName,
        logoUrl,
        tagline,
        platformConfig,
        refreshPlatformConfig: fetchPlatformConfig
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};
