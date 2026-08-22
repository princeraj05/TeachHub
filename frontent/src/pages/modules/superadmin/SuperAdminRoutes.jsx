import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import SuperAdminDashboard from "./SuperAdminDashboard";
import SuperAdminSupport from "./SuperAdminSupport";
import SuperAdminProfile from "./SuperAdminProfile";
import SuperAdminEvents from "./SuperAdminEvents";
import SuperAdminAboutApp from "./SuperAdminAboutApp";

import { CallProvider } from "../../../context/CallContext";

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><SuperAdminLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="support" element={<SuperAdminSupport />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="events" element={<SuperAdminEvents />} />
        <Route path="about" element={<SuperAdminAboutApp />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
