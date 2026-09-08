import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { CallProvider } from "../../../context/CallContext";
import { lazyWithRetry as lazy } from "../../../utils/lazyWithRetry";

const TeacherDashboard = lazy(() => import("./pages/Dashboard/TeacherDashboard"));
const MyStudents = lazy(() => import("./pages/Students/MyStudents"));
const MarkAttendance = lazy(() => import("./pages/Attendance/MarkAttendance"));
const AttendanceHistory = lazy(() => import("./pages/Attendance/AttendanceHistory"));
const MySubjects = lazy(() => import("./pages/Subjects/MySubjects"));
const SubjectDetails = lazy(() => import("./pages/Subjects/SubjectDetails"));
const ExamSchedule = lazy(() => import("./pages/Exams/ExamSchedule"));
const ExamDetailsAndResults = lazy(() => import("./pages/Exams/ExamDetailsAndResults"));
const TeacherProfile = lazy(() => import("./pages/Profile/TeacherProfile"));
const MyClasses = lazy(() => import("./pages/MyClasses/MyClasses"));
const TeacherSupport = lazy(() => import("./pages/TeacherSupport"));
const LiveProctoring = lazy(() => import("./pages/LiveProctoring/LiveProctoring"));
const TeacherEvents = lazy(() => import("./pages/TeacherEvents"));
const TeacherLeave = lazy(() => import("./pages/TeacherLeave"));
const ShowTimetable = lazy(() => import("./pages/Timetable/ShowTimetable"));
const GroupChat = lazy(() => import("./pages/GroupChat"));
const NotificationsAndActivity = lazy(() => import("./pages/Notifications/NotificationsAndActivity"));
const PaymentCenter = lazy(() => import("../../../components/PaymentCenter"));
const TeacherMyDiary = lazy(() => import("./pages/TeacherMyDiary"));
const AboutAppPage = lazy(() => import("../student/pages/AboutAppPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading module...</span>
    </div>
  </div>
);

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><TeacherLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense>} />
        <Route path="my-students" element={<Suspense fallback={<PageLoader />}><MyStudents /></Suspense>} />
        <Route path="mark-attendance" element={<Suspense fallback={<PageLoader />}><MarkAttendance /></Suspense>} />
        <Route path="attendance-history" element={<Suspense fallback={<PageLoader />}><AttendanceHistory /></Suspense>} />
        <Route path="my-subjects" element={<Suspense fallback={<PageLoader />}><MySubjects /></Suspense>} />
        <Route path="my-subjects/:subjectId" element={<Suspense fallback={<PageLoader />}><SubjectDetails /></Suspense>} />
        <Route path="exam-schedule" element={<Suspense fallback={<PageLoader />}><ExamSchedule /></Suspense>} />
        <Route path="exam-schedule/:examId" element={<Suspense fallback={<PageLoader />}><ExamDetailsAndResults /></Suspense>} />
        <Route path="proctoring" element={<Suspense fallback={<PageLoader />}><LiveProctoring /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><TeacherProfile /></Suspense>} />
        <Route path="my-classes" element={<Suspense fallback={<PageLoader />}><MyClasses /></Suspense>} />
        <Route path="support" element={<Suspense fallback={<PageLoader />}><TeacherSupport /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><TeacherEvents /></Suspense>} />
        <Route path="on-leave" element={<Suspense fallback={<PageLoader />}><TeacherLeave /></Suspense>} />
        <Route path="showtimetable" element={<Suspense fallback={<PageLoader />}><ShowTimetable /></Suspense>} />
        <Route path="support/groups" element={<Suspense fallback={<PageLoader />}><GroupChat /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageLoader />}><PaymentCenter role="teacher" /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageLoader />}><NotificationsAndActivity /></Suspense>} />
        <Route path="mydiary" element={<Suspense fallback={<PageLoader />}><TeacherMyDiary /></Suspense>} />
        <Route path="about" element={<Suspense fallback={<PageLoader />}><AboutAppPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default TeacherRoutes;
