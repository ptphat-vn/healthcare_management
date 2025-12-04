import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated && user?.data?.roleCode) {
      navigate(`/${user.data.roleCode}/dashboard`, { replace: true });
    } else {
      // Redirect unauthenticated users to login
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, user?.data?.roleCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-4">Trang không tìm thấy</p>
        <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
