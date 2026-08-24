import { useEffect } from "react";
import axios from "axios";

// Keep a valid session alive across refreshes without clearing it on transient
// network failures. The server remains the source of truth for token validity.
export default function SessionManager({ children }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const user = response.data;
      if (user?.token) localStorage.setItem("token", user.token);
      if (user?.role) localStorage.setItem("role", user.role);
      if (user?.name) localStorage.setItem("name", user.name);
      if (user?.schoolName !== undefined) localStorage.setItem("schoolName", user.schoolName || "");
      if (user?._id) localStorage.setItem("userId", user._id);
    }).catch(() => {
      // Do not remove local session data here: offline users should not be
      // redirected merely because this background refresh cannot reach the API.
    });
  }, []);

  return children;
}
