import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/auth/LoginPage";
import { createBrowserRouter, Navigate } from "react-router-dom";

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={"/app/boards"} />;
  if (!isAuthenticated) return <Navigate to={"/auth/login"} />;
}

export const router = createBrowserRouter([
  { path: "/home", element: "Comming soon" },
  { path: "/login", element: <LoginPage /> },
]);
