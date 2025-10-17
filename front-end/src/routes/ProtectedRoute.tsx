import { useAuth } from "@/hooks/useAuth";
import { setUserProfile } from "@/stores/authSlice";
import { useEffect, type ReactNode } from "react";
import { useDispatch } from "react-redux";
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
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      dispatch(setUserProfile(user));
    }
  }, [user, dispatch]);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const role = user?.data?.roleCode;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
