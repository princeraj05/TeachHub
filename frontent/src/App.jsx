import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import MainRoutes from "./routes/MainRoutes";
import SessionManager from "./components/SessionManager";
import { PlatformProvider } from "./context/PlatformContext";

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <PlatformProvider>
        <SessionManager>
          <MainRoutes />
        </SessionManager>
      </PlatformProvider>
    </Router>
  );
}

export default App;
