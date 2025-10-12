import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/auth/LoginPage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicRouter from "./PublicRouter";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import RegisterPage from "@/pages/auth/RegisterPage";



function RootRedirect() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={"/app/boards"} />;
  if (!isAuthenticated) return <Navigate to={"/auth/login"} />;
}
export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRouter />,
        children: [
      
          { path: "login", element: <LoginPage /> },
          {
            path: "register", element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/home",
    element: <MainLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [{ path: "dashboard", element: "Comming soon" }],
      },
    ],
  },
]);

