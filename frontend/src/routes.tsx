import { createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "./components/layout/AdminLayout";
import { AppLayout } from "./components/layout/AppLayout";
import { CoachLayout } from "./components/layout/CoachLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLogsPage } from "./pages/admin/AdminLogsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { CoachBookingsPage } from "./pages/coach/CoachBookingsPage";
import { CoachCoursesPage } from "./pages/coach/CoachCoursesPage";
import { CoachDashboardPage } from "./pages/coach/CoachDashboardPage";
import { CoachSessionsPage } from "./pages/coach/CoachSessionsPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { CheckoutCancelPage } from "./pages/member/CheckoutCancelPage";
import { CheckoutSuccessPage } from "./pages/member/CheckoutSuccessPage";
import { DashboardPage } from "./pages/member/DashboardPage";
import { MyBookingsPage } from "./pages/member/MyBookingsPage";
import { MyPaymentsPage } from "./pages/member/MyPaymentsPage";
import { MySubscriptionPage } from "./pages/member/MySubscriptionPage";
import { ProfilePage } from "./pages/member/ProfilePage";
import { QuestionnairePage } from "./pages/member/QuestionnairePage";
import { CoachDetailPage } from "./pages/public/CoachDetailPage";
import { CoachesListPage } from "./pages/public/CoachesListPage";
import { CourseDetailPage } from "./pages/public/CourseDetailPage";
import { CoursesListPage } from "./pages/public/CoursesListPage";
import { HomePage } from "./pages/public/HomePage";
import { NotFoundPage } from "./pages/public/NotFoundPage";
import { PlanningPage } from "./pages/public/PlanningPage";
import { PlansPage } from "./pages/public/PlansPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/courses", element: <CoursesListPage /> },
      { path: "/courses/:slug", element: <CourseDetailPage /> },
      { path: "/planning", element: <PlanningPage /> },
      { path: "/coaches", element: <CoachesListPage /> },
      { path: "/coaches/:id", element: <CoachDetailPage /> },
      { path: "/plans", element: <PlansPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/questionnaire", element: <QuestionnairePage /> },
          { path: "/my-subscription", element: <MySubscriptionPage /> },
          { path: "/my-bookings", element: <MyBookingsPage /> },
          { path: "/my-payments", element: <MyPaymentsPage /> },
          { path: "/checkout/success", element: <CheckoutSuccessPage /> },
          { path: "/checkout/cancel", element: <CheckoutCancelPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/logs", element: <AdminLogsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["coach"]} />,
    children: [
      {
        element: <CoachLayout />,
        children: [
          { path: "/coach", element: <CoachDashboardPage /> },
          { path: "/coach/courses", element: <CoachCoursesPage /> },
          { path: "/coach/sessions", element: <CoachSessionsPage /> },
          { path: "/coach/bookings", element: <CoachBookingsPage /> },
        ],
      },
    ],
  },
]);
