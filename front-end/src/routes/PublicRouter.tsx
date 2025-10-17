import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicRouter() {
  const { isAuthenticated, user } = useAuth();

  const redirectPath = useMemo(() => {
    if (!isAuthenticated || !user?.data?.roleCode) return null;
    return `/${user.data.roleCode}/dashboard`;
  }, [isAuthenticated, user?.data?.roleCode]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
