import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout";
import MainLayout from "@/components/layouts/MainLayout";
import PublicRouter from "./PublicRouter";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import UserManagementPage from "@/pages/admin/userManagement/UserManagementPage";

import TestOrderManagementPage from "@/pages/admin/testOrderManagement/TestOrderManagementPage";
import TestOrderDetailPage from "@/pages/admin/testOrderManagement/TestOrderDetailPage";
import MedicalRecordPage from "@/pages/admin/medicalRecords/MedicalRecordPage";
import MedicalRecordDetail from "@/pages/admin/medicalRecords/medicalRecordDetail/MedicalRecordDetail";
import { useMemo } from "react";

import MonitoringServicePage from "@/pages/admin/monitoringService/MonitoringServicePage";
import UserDetail from "@/pages/admin/userManagement/userDetail/UserDetail";
import RoleManagementPage from "@/pages/admin/roleManagement/RoleManagementPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import UserManagement from "@/pages/manager/UserManagement/UserManagementPage";
import LabUserDashboard from "@/pages/labUser/LabUserDashboard";

import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import PatientDashboardPage from "@/pages/user/PatientDashboardPage";
import LabManagerDashboard from "@/pages/manager/LabManagerDashboard";

import MedicalRecordPatientPage from "@/pages/user/medical_record/MedicalRecordPage";
import ProfilePatient from "@/pages/user/ProfilePatient";
import ServiceDashboard from "@/pages/service/ServiceDashboardPage";
import InstrumentManagementPage from "@/pages/service/instrumentManager/InstrumentManagementPage";
import ReagentManagementPage from "@/pages/labUser/reagentManagement/ReagentManagementPage";
import ReagentDetailPage from "@/pages/labUser/reagentManagement/reagentDetail/ReagentDetailPage";
import InstrumentDetailPage from "@/pages/service/instrumentManager/InstrumentDetailPage";
import InstrumentReagentDetailPage from "@/pages/service/instrumentManager/InstrumentReagentDetailPage";

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  // const role = user?.data.roleCode;

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
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ForgotPasswordPage /> },
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
      // user management
      { path: "user-management", element: <UserManagementPage /> },
      { path: "user-management/:id", element: <UserDetail /> },
      // role management
      { path: "roles-management", element: <RoleManagementPage /> },
      // event log
      { path: "event-log", element: <MonitoringServicePage /> },
      // test-order
      { path: "test-order", element: <TestOrderManagementPage /> },
      { path: "test-order/:orderId", element: <TestOrderDetailPage /> },
      // medical record
      { path: "medical-records", element: <MedicalRecordPage /> },
      { path: "medical-records/:id", element: <MedicalRecordDetail /> },
      // profile
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // Manager
  {
    path: "lab_manager",
    element: (
      <ProtectedRoute allowedRoles={["lab_manager"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <LabManagerDashboard /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "roles-management", element: <RoleManagementPage /> },
      { path: "user-management/:id", element: <UserDetail /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "medical-record", element: <MedicalRecordPage /> },
      { path: "medical-records/:id", element: <MedicalRecordDetail /> },
      { path: "test-order", element: <TestOrderManagementPage /> },
      { path: "test-order/:orderId", element: <TestOrderDetailPage /> },
      { path: "event-log", element: <MonitoringServicePage /> },
    ],
  },

  // LAB USER ROUTE
  {
    path: "/lab_user",
    element: (
      <ProtectedRoute allowedRoles={["lab_user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <LabUserDashboard /> },
      { path: "test-order", element: <TestOrderManagementPage /> },
      { path: "test-order/:orderId", element: <TestOrderDetailPage /> },
      { path: "medical-records", element: <MedicalRecordPage /> },
      { path: "reagent-management", element: <ReagentManagementPage /> },
      { path: "medical-records/:id", element: <MedicalRecordDetail /> },
      { path: "test-order", element: <TestOrderManagementPage /> },
      { path: "test-order/:orderId", element: <TestOrderDetailPage /> },
      { path: "event-log", element: <MonitoringServicePage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "reagent-management/:id", element: <ReagentDetailPage /> },
    ],
  },

  // USER ROUTE
  {
    path: "/patient",
    element: (
      <ProtectedRoute allowedRoles={["patient"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <PatientDashboardPage /> },
      { path: "medical-record", element: <MedicalRecordPatientPage /> },
      { path: "profile", element: <ProfilePatient /> },
    ],
  },

  //SERVICE ROUTES
  {
    path: "/service",
    element: (
      <ProtectedRoute allowedRoles={["service"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <ServiceDashboard /> },
      { path: "instruments", element: <InstrumentManagementPage /> },
      { path: "instruments/:id", element: <InstrumentDetailPage /> },
      {
        path: "instruments/:instrumentId/reagents/:assignmentId",
        element: <InstrumentReagentDetailPage />,
      },
      { path: "reagent/:id", element: <ReagentDetailPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
