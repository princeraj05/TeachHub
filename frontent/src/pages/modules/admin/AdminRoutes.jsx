import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";

import AdminDashboard from "./pages/Dashboard/AdminDashboard";

import Teachers from "./pages/Users/Teachers";
import Students from "./pages/Users/Students";

import Classes from "./pages/Academics/Classes";

import Subjects from "./pages/Academics/Subjects";

import AssignTeacherClass from "./pages/Assignments/AssignTeacherClass";
import AssignStudentClass from "./pages/Assignments/AssignStudentClass";
import AssignSubjectTeacher from "./pages/Assignments/AssignSubjectTeacher";

import AttendanceReport from "./pages/Reports/AttendanceReport";
import ExamResults from "./pages/Reports/ExamResults";

import ExamSchedule from "./pages/Exams/ExamSchedule";

import AdminProfile from "./pages/Profile/AdminProfile";
import AdminSupport from "./pages/AdminSupport";
import AdminRequests from "./pages/Requests/AdminRequests";
import LiveProctoring from "../teacher/pages/LiveProctoring/LiveProctoring";


import { CallProvider } from "../../../context/CallContext";

function AdminRoutes() {

  return (

    <Routes>

      <Route path="/" element={<CallProvider><AdminLayout /></CallProvider>}>

        <Route index element={<Navigate to="dashboard" />} />

        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Users */}
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />

        {/* Requests */}
        <Route path="requests" element={<AdminRequests />} />
        
        {/* Proctoring */}
        <Route path="proctoring" element={<LiveProctoring />} />

        {/* Academics */}
        <Route path="classes" element={<Classes />} />
        
        <Route path="subjects" element={<Subjects />} />

        {/* Assignments */}
        <Route path="assign-teacher-class" element={<AssignTeacherClass />} />
        <Route path="assign-student-class" element={<AssignStudentClass />} />
        <Route path="assign-subject-teacher" element={<AssignSubjectTeacher />} />

        {/* Reports */}
        <Route path="attendance-report" element={<AttendanceReport />} />
        <Route path="exam-results" element={<ExamResults />} />

        {/* Exams */}
        <Route path="exam-schedule" element={<ExamSchedule />} />

        {/* Profile */}
        <Route path="profile" element={<AdminProfile />} />

        {/* Support */}
        <Route path="support" element={<AdminSupport />} />

      </Route>

    </Routes>

  );

}

export default AdminRoutes;