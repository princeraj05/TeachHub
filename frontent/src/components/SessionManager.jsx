import { useEffect } from "react";
import axios from "axios";

// Keep a valid session alive across refreshes without clearing it on transient
// network failures. The server remains the source of truth for token validity.
export default function SessionManager({ children }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    axios
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const user = response.data;
        if (user?.token) localStorage.setItem("token", user.token);
        if (user?.role) localStorage.setItem("role", user.role);
        if (user?.name) localStorage.setItem("name", user.name);
        if (user?.schoolName !== undefined) localStorage.setItem("schoolName", user.schoolName || "");
        if (user?._id) localStorage.setItem("userId", user._id);
        if (user?.avatar) localStorage.setItem("avatar", user.avatar);
      })
      .catch((error) => {
        // Do NOT clear localStorage or force redirect on background sync error!
        // On mobile APKs / PWAs, network interface initialization delays on app launch
        // or temporary server connection issues must NOT kick the user out.
        console.warn("Background profile sync notice:", error?.message);
      });
  }, []);

  return children;
}
