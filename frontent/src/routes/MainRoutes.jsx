import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazyWithRetry as lazy } from "../utils/lazyWithRetry";

import Login from "../pages/auth/Login";

const PendingApproval = lazy(() => import("../pages/auth/PendingApproval"));
const AdminRoutes = lazy(() => import("../pages/modules/admin/AdminRoutes"));
const StudentRoutes = lazy(() => import("../pages/modules/student/StudentRoutes"));
const TeacherRoutes = lazy(() => import("../pages/modules/teacher/TeacherRoutes"));
const SuperAdminRoutes = lazy(() => import("../pages/modules/superadmin/SuperAdminRoutes"));

const ModuleLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#F8FAFC] dark:bg-[#090F1C]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-extrabold text-[#7C3AED] dark:text-[#38BDF8] tracking-wider uppercase animate-pulse">
        TeachHub
      </span>
    </div>
  </div>
);

// Route guard wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "superadmin") return <Navigate to="/superadmin/dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (role === "student") return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/pending" replace />;
  }

  return children;
};

function MainRoutes() {
  return (
    <Suspense fallback={<ModuleLoader />}>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        
        {/* Pending Approval */}
        <Route
          path="/pending/*"
          element={
            <ProtectedRoute allowedRoles={["unassigned"]}>
              <PendingApproval />
            </ProtectedRoute>
          }
        />

        {/* Super Admin */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Teacher */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherRoutes />
            </ProtectedRoute>
          }
        />

        {/* Student */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentRoutes />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default MainRoutes;