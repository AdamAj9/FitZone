import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/member/DashboardPage";
import { ProfilePage } from "./pages/member/ProfilePage";
import { CoachDetailPage } from "./pages/public/CoachDetailPage";
import { CoachesListPage } from "./pages/public/CoachesListPage";
import { CourseDetailPage } from "./pages/public/CourseDetailPage";
import { CoursesListPage } from "./pages/public/CoursesListPage";
import { HomePage } from "./pages/public/HomePage";
import { NotFoundPage } from "./pages/public/NotFoundPage";
import { Placeholder } from "./pages/public/Placeholder";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/courses", element: <CoursesListPage /> },
      { path: "/courses/:slug", element: <CourseDetailPage /> },
      { path: "/coaches", element: <CoachesListPage /> },
      { path: "/coaches/:id", element: <CoachDetailPage /> },
      { path: "/plans", element: <Placeholder title="Abonnements / Plans" /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
