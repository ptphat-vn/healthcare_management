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
import UserManagementPage from "@/pages/admin/userManagement/UserManagementPage";

import TestOrderManagementPage from "@/pages/admin/testOrderManagement/TestOrderManagementPage";
import TestOrderDetailPage from "@/pages/admin/testOrderManagement/TestOrderDetailPage";
import MedicalRecordPage from "@/pages/admin/medicalRecords/MedicalRecordPage";
import { useMemo } from "react";

import MonitoringServicePage from "@/pages/admin/monitoringService/MonitoringServicePage";

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.data.roleCode;

  const redirectTo = useMemo(() => {
    if (isAuthenticated && user?.data?.roleCode) {
      return `/${user.data.roleCode}/dashboard`;
    }
    return "/auth/login";
  }, [isAuthenticated, user?.data?.roleCode]);

  return <Navigate to={redirectTo} replace />;
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
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "user-management", element: <UserManagementPage /> },
      { path: "monitoring", element: <MonitoringServicePage /> },
      { path: "test-order", element: <TestOrderManagementPage /> },
      { path: "test-order/:orderId", element: <TestOrderDetailPage /> },
      { path: "medical-records", element: <MedicalRecordPage /> },
    ],
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
