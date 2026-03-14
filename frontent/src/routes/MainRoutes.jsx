import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminRoutes from "../pages/modules/admin/AdminRoutes";
import StudentRoutes from "../pages/modules/student/StudentRoutes";
import TeacherRoutes from "../pages/modules/teacher/TeacherRoutes";

function MainRoutes() {

  return (

    <Routes>

      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Teacher */}
      <Route path="/teacher/*" element={<TeacherRoutes />} />

      {/* Student */}
      <Route path="/student/*" element={<StudentRoutes />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}

export default MainRoutes;