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
import TeacherSupport from "./pages/TeacherSupport";
import LiveProctoring from "./pages/LiveProctoring/LiveProctoring";
import TeacherEvents from "./pages/TeacherEvents";
import TeacherLeave from "./pages/TeacherLeave";
import TimetableView from "../../../components/TimetableView";
import GroupChat from "./pages/GroupChat";
import PaymentCenter from "../../../components/PaymentCenter";

import { CallProvider } from "../../../context/CallContext";

function TeacherRoutes() {

  return (

    <Routes>

      <Route path="/" element={<CallProvider><TeacherLayout /></CallProvider>}>

        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<TeacherDashboard />} />

        <Route path="my-students" element={<MyStudents />} />

        <Route path="mark-attendance" element={<MarkAttendance />} />

        <Route path="attendance-report" element={<Navigate to="/teacher/mark-attendance" replace />} />

        <Route path="my-subjects" element={<MySubjects />} />

        <Route path="exam-schedule" element={<ExamSchedule />} />

        <Route path="proctoring" element={<LiveProctoring />} />

        <Route path="profile" element={<TeacherProfile />} />
        <Route path="my-classes" element={<MyClasses/>}/>
        <Route path="support" element={<TeacherSupport />} />
        <Route path="events" element={<TeacherEvents />} />
        <Route path="on-leave" element={<TeacherLeave />} />
        <Route path="showtimetable" element={<TimetableView />} />
        <Route path="support/groups" element={<GroupChat />} />
        <Route path="payments" element={<PaymentCenter role="teacher" />} />

      </Route>

    </Routes>

  );

}

export default TeacherRoutes;
