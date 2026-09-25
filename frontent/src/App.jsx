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

function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const urlListener = CapacitorApp.addListener("appUrlOpen", (data) => {
      try {
        const openUrl = data?.url;
        if (!openUrl) return;

        let targetRoute = "";
        if (openUrl.includes("#")) {
          targetRoute = openUrl.split("#")[1];
        } else {
          const urlObj = new URL(openUrl);
          targetRoute = urlObj.pathname + urlObj.search;
        }

        if (targetRoute) {
          if (!targetRoute.startsWith("/")) {
            targetRoute = "/" + targetRoute;
          }
          navigate(targetRoute);
        }
      } catch (err) {
        console.log("Deep link navigation error:", err);
      }
    });

    return () => {
      urlListener.then((handler) => handler.remove());
    };
  }, [navigate]);

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
      <DeepLinkHandler />
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
