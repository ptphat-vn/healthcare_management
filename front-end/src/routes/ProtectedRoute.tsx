import { useAuth } from "@/hooks/useAuth";
import { setUserProfile } from "@/stores/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  console.log(isAuthenticated);
  useEffect(() => {
    if (user) {
      // nếu user đó tồn tại thì gọi dispatch ra lưu vào trong store
      dispatch(setUserProfile(user));
    }
  }, [user]);

  if (!isAuthenticated) return <Navigate to={"/auth/login"} />;

  return <Outlet />;
}
