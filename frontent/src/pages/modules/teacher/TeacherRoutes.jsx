import { Routes, Route, Navigate } from "react-router-dom";

import TeacherLayout from "./TeacherLayout";

import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import MyStudents from "./pages/Students/MyStudents";

import MarkAttendance from "./pages/Attendance/MarkAttendance";
import AttendanceReport from "./pages/Attendance/AttendanceReport";

import MySubjects from "./pages/Subjects/MySubjects";
import ExamSchedule from "./pages/Exams/ExamSchedule";

import TeacherProfile from "./pages/Profile/TeacherProfile";
import MyClasses from "./pages/MyClasses/MyClasses";

function TeacherRoutes() {

  return (

    <Routes>

      <Route path="/" element={<TeacherLayout />}>

        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<TeacherDashboard />} />

        <Route path="my-students" element={<MyStudents />} />

        <Route path="mark-attendance" element={<MarkAttendance />} />

        <Route path="attendance-report" element={<AttendanceReport />} />

        <Route path="my-subjects" element={<MySubjects />} />

        <Route path="exam-schedule" element={<ExamSchedule />} />

        <Route path="profile" element={<TeacherProfile />} />
        <Route path="my-classes" element={<MyClasses/>}/>

      </Route>

    </Routes>

  );

}

export default TeacherRoutes;