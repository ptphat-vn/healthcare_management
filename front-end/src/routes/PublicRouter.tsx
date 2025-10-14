import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRouter() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const role = user?.data?.role || "user";
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}
