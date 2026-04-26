import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/public/HomePage";
import { NotFoundPage } from "./pages/public/NotFoundPage";
import { Placeholder } from "./pages/public/Placeholder";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        path: "/courses",
        element: <Placeholder title="Cours / Courses" />,
      },
      {
        path: "/coaches",
        element: <Placeholder title="Coachs / Coaches" />,
      },
      { path: "/plans", element: <Placeholder title="Abonnements / Plans" /> },
      { path: "/login", element: <Placeholder title="Connexion / Login" /> },
      {
        path: "/register",
        element: <Placeholder title="Inscription / Sign up" />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Placeholder title="Tableau de bord / Dashboard" />,
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
