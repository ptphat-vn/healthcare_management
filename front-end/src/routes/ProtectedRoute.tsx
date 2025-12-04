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

  // Show loading while checking authentication
  if (isAuthenticated === undefined) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user data is loaded
  if (!user?.data) {
    return <div>Loading user data...</div>;
  }

  const role = user.data.roleCode;

  // Check role permissions
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
