import { BrowserRouter, HashRouter } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import MainRoutes from "./routes/MainRoutes";

function App() {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

export default App;