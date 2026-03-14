import { Routes, Route, Navigate } from "react-router-dom";

import StudentLayout from "./StudentLayout";

import StudentDashboard from "./pages/StudentDashboard";
import StudentSubjects from "./pages/StudentSubjects";
import StudentAttendance from "./pages/StudentAttendance";
import StudentExams from "./pages/StudentExams";
import StudentProfile from "./pages/StudentProfile";

function StudentRoutes() {

  return (

    <Routes>

      <Route path="/" element={<StudentLayout />}>

        <Route index element={<Navigate to="dashboard" />} />

        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="profile" element={<StudentProfile />} />

      </Route>

    </Routes>

  );

}

export default StudentRoutes;