import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import SuperAdminDashboard from "./SuperAdminDashboard";
import SuperAdminUsers from "./SuperAdminUsers";
import SuperAdminSchools from "./SuperAdminSchools";
import SuperAdminSupport from "./SuperAdminSupport";
import SuperAdminProfile from "./SuperAdminProfile";
import SuperAdminEvents from "./SuperAdminEvents";
import SuperAdminAboutApp from "./SuperAdminAboutApp";
import SuperAdminNotifications from "./SuperAdminNotifications";
import PaymentCenter from "../../../components/PaymentCenter";

import { CallProvider } from "../../../context/CallContext";

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><SuperAdminLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="schools" element={<SuperAdminSchools />} />
        <Route path="support" element={<SuperAdminSupport />} />
        <Route path="profile" element={<SuperAdminProfile />} />
        <Route path="events" element={<SuperAdminEvents />} />
        <Route path="about" element={<SuperAdminAboutApp />} />
        <Route path="notifications" element={<SuperAdminNotifications />} />
        <Route path="payments" element={<PaymentCenter role="superadmin" />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
