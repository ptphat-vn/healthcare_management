import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRouter() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={"/"} />;
  return <Outlet />;
}
