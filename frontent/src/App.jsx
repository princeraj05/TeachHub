import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import MainRoutes from "./routes/MainRoutes";
import SessionManager from "./components/SessionManager";

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <SessionManager><MainRoutes /></SessionManager>
    </Router>
  );
}

export default App;
