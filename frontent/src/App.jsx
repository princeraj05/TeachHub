import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import MainRoutes from "./routes/MainRoutes";
import SessionManager from "./components/SessionManager";
import { PlatformProvider } from "./context/PlatformContext";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
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
