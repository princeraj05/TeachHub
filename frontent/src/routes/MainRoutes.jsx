import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import PendingApproval from "../pages/auth/PendingApproval";

import AdminRoutes from "../pages/modules/admin/AdminRoutes";
import StudentRoutes from "../pages/modules/student/StudentRoutes";
import TeacherRoutes from "../pages/modules/teacher/TeacherRoutes";
import SuperAdminRoutes from "../pages/modules/superadmin/SuperAdminRoutes";

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

    <Routes>

      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Pending Approval */}
      <Route
        path="/pending"
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

  );

}

export default MainRoutes;