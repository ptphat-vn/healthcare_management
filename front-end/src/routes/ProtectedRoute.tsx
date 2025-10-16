import { useAuth } from "@/hooks/useAuth";
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();


  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const role = user?.data?.roleCode;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
