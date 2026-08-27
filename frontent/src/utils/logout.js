import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";
import axios from "axios";

export const performLogout = async (navigate) => {
  try {
    // 1. Invalidate backend session if token exists
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (token) {
      try {
        await axios.post(
          `${API}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Backend logout API call failed:", err);
      }
    }

    // 2. Clear all session and persistent caches
    localStorage.clear();
    sessionStorage.clear();

    // 2. Sign out of Firebase Auth if active
    if (auth) {
      await signOut(auth);
    }

    // 3. Clear Capacitor native Google Auth sessions
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
      } catch (err) {
        console.warn("Capacitor GoogleAuth signout skipped or failed:", err);
      }
    }
  } catch (error) {
    console.error("Error during explicit logout process:", error);
  } finally {
    // 4. Redirect to login landing page
    if (navigate) {
      navigate("/");
    } else {
      window.location.href = "/";
    }
  }
};
