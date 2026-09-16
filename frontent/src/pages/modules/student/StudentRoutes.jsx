import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { CallProvider } from "../../../context/CallContext";
import { lazyWithRetry as lazy } from "../../../utils/lazyWithRetry";

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentMyDiary = lazy(() => import("./pages/StudentMyDiary"));
const StudentSubjects = lazy(() => import("./pages/StudentSubjects"));
const StudentAttendance = lazy(() => import("./pages/StudentAttendance"));
const Exam = lazy(() => import("./pages/Exam"));
const StudentAcademicResults = lazy(() => import("./pages/StudentAcademicResults"));
const ResultMarks = lazy(() => import("./pages/ResultMarks"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const StudentSupport = lazy(() => import("./pages/StudentSupport"));
const StudentEvents = lazy(() => import("./pages/StudentEvents"));
const StudentContact = lazy(() => import("./pages/StudentContact"));
const StudentLogout = lazy(() => import("./pages/StudentLogout"));
const SchoolDirectory = lazy(() => import("./pages/SchoolDirectory"));
const SchoolDetails = lazy(() => import("./pages/SchoolDetails"));
const AboutAppPage = lazy(() => import("./pages/AboutAppPage"));
const TeacherOnLeave = lazy(() => import("./pages/TeacherOnLeave"));
const StudentPayments = lazy(() => import("./pages/StudentPayments"));
const TimetableView = lazy(() => import("../../../components/TimetableView"));
const GroupChat = lazy(() => import("../teacher/pages/GroupChat"));
const StudentNotifications = lazy(() => import("./StudentNotifications"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading module...</span>
    </div>
  </div>
);

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><StudentLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} />
        <Route path="mydiary" element={<Suspense fallback={<PageLoader />}><StudentMyDiary /></Suspense>} />
        <Route path="subjects" element={<Suspense fallback={<PageLoader />}><StudentSubjects /></Suspense>} />
        <Route path="attendance" element={<Suspense fallback={<PageLoader />}><StudentAttendance /></Suspense>} />
        <Route path="exams" element={<Suspense fallback={<PageLoader />}><Exam /></Suspense>} />
        <Route path="results" element={<Suspense fallback={<PageLoader />}><StudentAcademicResults /></Suspense>} />
        <Route path="results/:resultId" element={<Suspense fallback={<PageLoader />}><ResultMarks /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><StudentProfile /></Suspense>} />
        <Route path="support" element={<Suspense fallback={<PageLoader />}><StudentSupport /></Suspense>} />
        <Route path="support/groups" element={<Suspense fallback={<PageLoader />}><GroupChat /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<PageLoader />}><StudentEvents /></Suspense>} />
        <Route path="contact" element={<Suspense fallback={<PageLoader />}><StudentContact /></Suspense>} />
        <Route path="logout" element={<Suspense fallback={<PageLoader />}><StudentLogout /></Suspense>} />
        <Route path="schools" element={<Suspense fallback={<PageLoader />}><SchoolDirectory /></Suspense>} />
        <Route path="schools/:name" element={<Suspense fallback={<PageLoader />}><SchoolDetails /></Suspense>} />
        <Route path="about" element={<Suspense fallback={<PageLoader />}><AboutAppPage /></Suspense>} />
        <Route path="teacher-on-leave" element={<Suspense fallback={<PageLoader />}><TeacherOnLeave /></Suspense>} />
        <Route path="showtimetable" element={<Suspense fallback={<PageLoader />}><TimetableView /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageLoader />}><StudentPayments /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageLoader />}><StudentNotifications /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default StudentRoutes;
