import { useEffect } from "react";
import axios from "axios";
import { performLogout } from "../utils/logout";
import API_URL from "../config/api";

// Keep a valid session alive across refreshes without clearing it on transient
// network failures. The server remains the source of truth for token validity.
export default function SessionManager({ children }) {
  useEffect(() => {
    // Intercept 401 Unauthorized API responses across the app
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath === "/" || currentPath === "/login";
          const isLoginApi =
            error.config?.url?.includes("/api/auth/login") ||
            error.config?.url?.includes("/api/auth/verify-otp") ||
            error.config?.url?.includes("/api/auth/firebase-sync");

          if (!isAuthPage && !isLoginApi) {
            console.warn("Session expired or invalid token (401 Unauthorized). Automatically logging out...");
            performLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem("token");
    if (!token) {
      return () => {
        axios.interceptors.response.eject(interceptor);
      };
    }

    const API = API_URL;
    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const user = response.data;
        try {
          if (user?.token) localStorage.setItem("token", user.token);
          if (user?.role) localStorage.setItem("role", user.role);
          if (user?.name) localStorage.setItem("name", user.name);
          if (user?.schoolName !== undefined) localStorage.setItem("schoolName", user.schoolName || "");
          if (user?._id) localStorage.setItem("userId", user._id);
          if (user?.avatar) localStorage.setItem("avatar", user.avatar);
        } catch (storageErr) {
          console.warn("SessionManager storage quota warning:", storageErr?.message);
        }
      })
      .catch((error) => {
        console.warn("Background profile sync notice:", error?.message);
      });

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return children;
}
