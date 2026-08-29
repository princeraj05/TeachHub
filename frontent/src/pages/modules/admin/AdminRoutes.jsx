import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { CallProvider } from "../../../context/CallContext";
import { lazyWithRetry as lazy } from "../../../utils/lazyWithRetry";

const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const Teachers = lazy(() => import("./pages/Users/Teachers"));
const Students = lazy(() => import("./pages/Users/Students"));
const Classes = lazy(() => import("./pages/Academics/Classes"));
const Subjects = lazy(() => import("./pages/Academics/Subjects"));
const AssignTeacherClass = lazy(() => import("./pages/Assignments/AssignTeacherClass"));
const AssignStudentClass = lazy(() => import("./pages/Assignments/AssignStudentClass"));
const AssignSubjectTeacher = lazy(() => import("./pages/Assignments/AssignSubjectTeacher"));
const AttendanceReport = lazy(() => import("./pages/Reports/AttendanceReport"));
const ExamResults = lazy(() => import("./pages/Reports/ExamResults"));
const ExamSchedule = lazy(() => import("./pages/Exams/ExamSchedule"));
const AdminProfile = lazy(() => import("./pages/Profile/AdminProfile"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminRequests = lazy(() => import("./pages/Requests/AdminRequests"));
const LiveProctoring = lazy(() => import("../teacher/pages/LiveProctoring/LiveProctoring"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const AboutYourSchool = lazy(() => import("./pages/AboutYourSchool"));
const CreateTimetable = lazy(() => import("./pages/CreateTimetable"));
const Appointments = lazy(() => import("./pages/Appointments"));
const TeacherLeaves = lazy(() => import("./pages/TeacherLeaves"));
const TeacherManagement = lazy(() => import("./pages/TeacherManagement"));
const PaymentCenter = lazy(() => import("../../../components/PaymentCenter"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading module...</span>
    </div>
  </div>
);

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><AdminLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />

        {/* Users */}
        <Route path="teachers" element={<Suspense fallback={<PageLoader />}><Teachers /></Suspense>} />
        <Route path="students" element={<Suspense fallback={<PageLoader />}><Students /></Suspense>} />

        {/* Requests */}
        <Route path="requests" element={<Suspense fallback={<PageLoader />}><AdminRequests /></Suspense>} />
        
        {/* Proctoring */}
        <Route path="proctoring" element={<Suspense fallback={<PageLoader />}><LiveProctoring /></Suspense>} />

        {/* Academics */}
        <Route path="classes" element={<Suspense fallback={<PageLoader />}><Classes /></Suspense>} />
        <Route path="subjects" element={<Suspense fallback={<PageLoader />}><Subjects /></Suspense>} />

        {/* Assignments */}
        <Route path="assign-teacher-class" element={<Suspense fallback={<PageLoader />}><AssignTeacherClass /></Suspense>} />
        <Route path="assign-student-class" element={<Suspense fallback={<PageLoader />}><AssignStudentClass /></Suspense>} />
        <Route path="assign-subject-teacher" element={<Suspense fallback={<PageLoader />}><AssignSubjectTeacher /></Suspense>} />

        {/* Reports */}
        <Route path="attendance-report" element={<Suspense fallback={<PageLoader />}><AttendanceReport /></Suspense>} />
        <Route path="exam-results" element={<Suspense fallback={<PageLoader />}><ExamResults /></Suspense>} />

        {/* Exams */}
        <Route path="exam-schedule" element={<Suspense fallback={<PageLoader />}><ExamSchedule /></Suspense>} />

        {/* Profile */}
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><AdminProfile /></Suspense>} />

        {/* Support */}
        <Route path="support" element={<Suspense fallback={<PageLoader />}><AdminSupport /></Suspense>} />

        {/* Events */}
        <Route path="events" element={<Suspense fallback={<PageLoader />}><AdminEvents /></Suspense>} />

        {/* School Config */}
        <Route path="about-school" element={<Suspense fallback={<PageLoader />}><AboutYourSchool /></Suspense>} />
        <Route path="create-timetable" element={<Suspense fallback={<PageLoader />}><CreateTimetable /></Suspense>} />
        <Route path="appointments" element={<Suspense fallback={<PageLoader />}><Appointments /></Suspense>} />
        <Route path="teacher-leaves" element={<Suspense fallback={<PageLoader />}><TeacherLeaves /></Suspense>} />
        <Route path="teacher-management" element={<Suspense fallback={<PageLoader />}><TeacherManagement /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageLoader />}><PaymentCenter role="admin" /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
