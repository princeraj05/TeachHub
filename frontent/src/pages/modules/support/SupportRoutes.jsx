import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SupportLayout from "./SupportLayout";
import { CallProvider } from "../../../context/CallContext";
import { lazyWithRetry as lazy } from "../../../utils/lazyWithRetry";

const SupportDashboard = lazy(() => import("./SupportDashboard"));
const SupportRequests = lazy(() => import("./SupportRequests"));
const SupportTicketDetail = lazy(() => import("./SupportTicketDetail"));
const SupportLiveChat = lazy(() => import("./SupportLiveChat"));
const SupportUsers = lazy(() => import("./SupportUsers"));
const SupportSchools = lazy(() => import("./SupportSchools"));
const SupportCalls = lazy(() => import("./SupportCalls"));
const SupportHelpCenter = lazy(() => import("./SupportHelpCenter"));
const SupportEscalated = lazy(() => import("./SupportEscalated"));
const SupportNotifications = lazy(() => import("./SupportNotifications"));
const SupportMyAssigned = lazy(() => import("./SupportMyAssigned"));
const SupportProfile = lazy(() => import("./SupportProfile"));
const SupportSettings = lazy(() => import("./SupportSettings"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading Support Workspace...</span>
    </div>
  </div>
);

function SupportRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CallProvider><SupportLayout /></CallProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><SupportDashboard /></Suspense>} />
        <Route path="requests" element={<Suspense fallback={<PageLoader />}><SupportRequests /></Suspense>} />
        <Route path="requests/:id" element={<Suspense fallback={<PageLoader />}><SupportTicketDetail /></Suspense>} />
        <Route path="chat" element={<Suspense fallback={<PageLoader />}><SupportLiveChat /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoader />}><SupportUsers /></Suspense>} />
        <Route path="schools" element={<Suspense fallback={<PageLoader />}><SupportSchools /></Suspense>} />
        <Route path="calls" element={<Suspense fallback={<PageLoader />}><SupportCalls /></Suspense>} />
        <Route path="help-center" element={<Suspense fallback={<PageLoader />}><SupportHelpCenter /></Suspense>} />
        <Route path="escalated" element={<Suspense fallback={<PageLoader />}><SupportEscalated /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageLoader />}><SupportNotifications /></Suspense>} />
        <Route path="my-assigned" element={<Suspense fallback={<PageLoader />}><SupportMyAssigned /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><SupportProfile /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><SupportSettings /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default SupportRoutes;
