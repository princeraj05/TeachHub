import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import { CallProvider } from "../../../context/CallContext";

const SuperAdminDashboard = lazy(() => import("./SuperAdminDashboard"));
const SuperAdminUsers = lazy(() => import("./SuperAdminUsers"));
const SuperAdminSchools = lazy(() => import("./SuperAdminSchools"));
const SuperAdminSupport = lazy(() => import("./SuperAdminSupport"));
const SuperAdminProfile = lazy(() => import("./SuperAdminProfile"));
const SuperAdminEvents = lazy(() => import("./SuperAdminEvents"));
const SuperAdminAboutApp = lazy(() => import("./SuperAdminAboutApp"));
const SuperAdminNotifications = lazy(() => import("./SuperAdminNotifications"));
const PaymentCenter = lazy(() => import("../../../components/PaymentCenter"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading workspace...</span>
    </div>
  </div>
);

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><SuperAdminLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><SuperAdminUsers /></Suspense>} />
        <Route path="schools" element={<Suspense fallback={<PageLoader />}><SuperAdminSchools /></Suspense>} />
        <Route path="support" element={<Suspense fallback={<PageLoader />}><SuperAdminSupport /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><SuperAdminProfile /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><SuperAdminEvents /></Suspense>} />
        <Route path="about" element={<Suspense fallback={<PageLoader />}><SuperAdminAboutApp /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageLoader />}><SuperAdminNotifications /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageLoader />}><PaymentCenter role="superadmin" /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default SuperAdminRoutes;
