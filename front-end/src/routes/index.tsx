import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout";
import MainLayout from "@/components/layouts/MainLayout";
import PublicRouter from "./PublicRouter";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserDashBoard from "@/pages/user/UserDashBoard";

// ✅ RootRedirect – điều hướng về đúng dashboard theo role
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.data.role;

  if (isAuthenticated && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Navigate to="/auth/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },

  // AUTH LAYOUT (login, register)
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRouter />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ADMIN ROUTE
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <AdminDashboard /> }],
  },

  // USER ROUTE
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <UserDashBoard /> }],
  },
]);
