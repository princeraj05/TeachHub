import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import SuperAdminDashboard from "./SuperAdminDashboard";
import SuperAdminSupport from "./SuperAdminSupport";
import SuperAdminProfile from "./SuperAdminProfile";

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="support" element={<SuperAdminSupport />} />
        <Route path="profile" element={<SuperAdminProfile />} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
