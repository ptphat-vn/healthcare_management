import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";

export default function RootRedirect() {
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
