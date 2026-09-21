import { useEffect } from "react";
import { BrowserRouter, HashRouter, useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import MainRoutes from "./routes/MainRoutes";
import SessionManager from "./components/SessionManager";
import { PlatformProvider } from "./context/PlatformContext";
import { LanguageProvider } from "./context/LanguageContext";
import { initFCM } from "./utils/fcm";

function BackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonListener = CapacitorApp.addListener("backButton", () => {
      const rootPaths = ["/", "/pending", "/student/dashboard", "/teacher/dashboard", "/admin/dashboard", "/superadmin/dashboard"];
      if (rootPaths.includes(location.pathname)) {
        CapacitorApp.minimizeApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backButtonListener.then((handler) => handler.remove());
    };
  }, [location, navigate]);

  return null;
}

function FCMInitializer() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      initFCM(navigate);
    }
  }, [navigate]);

  return null;
}

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <BackButtonHandler />
      <FCMInitializer />
      <LanguageProvider>
        <PlatformProvider>
          <SessionManager>
            <MainRoutes />
          </SessionManager>
        </PlatformProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
