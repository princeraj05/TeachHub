import { Routes, Route, Navigate } from "react-router-dom";

import StudentLayout from "./StudentLayout";

import StudentDashboard from "./pages/StudentDashboard";
import StudentSubjects from "./pages/StudentSubjects";
import StudentAttendance from "./pages/StudentAttendance";
import Exam from "./pages/Exam";
import StudentProfile from "./pages/StudentProfile";
import StudentSupport from "./pages/StudentSupport";
import StudentEvents from "./pages/StudentEvents";
import StudentContact from "./pages/StudentContact";
import StudentLogout from "./pages/StudentLogout";

import SchoolDirectory from "./pages/SchoolDirectory";
import SchoolDetails from "./pages/SchoolDetails";
import AboutAppPage from "./pages/AboutAppPage";
import TeacherOnLeave from "./pages/TeacherOnLeave";
import StudentPayments from "./pages/StudentPayments";
import TimetableView from "../../../components/TimetableView";
import GroupChat from "../teacher/pages/GroupChat";

import { CallProvider } from "../../../context/CallContext";

function StudentRoutes() {

  return (

    <Routes>

      <Route path="/" element={<CallProvider><StudentLayout /></CallProvider>}>

        <Route index element={<Navigate to="dashboard" />} />

        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="exams" element={<Exam />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="support" element={<StudentSupport />} />
        <Route path="support/groups" element={<GroupChat />} />
        <Route path="events" element={<StudentEvents />} />
        <Route path="contact" element={<StudentContact />} />
        <Route path="logout" element={<StudentLogout />} />
        <Route path="schools" element={<SchoolDirectory />} />
        <Route path="schools/:name" element={<SchoolDetails />} />
        <Route path="about" element={<AboutAppPage />} />
        <Route path="teacher-on-leave" element={<TeacherOnLeave />} />
        <Route path="showtimetable" element={<TimetableView />} />
        <Route path="payments" element={<StudentPayments />} />

      </Route>

    </Routes>

  );

}

export default StudentRoutes;
