import { useGetProfileQuery, useLogoutMutation } from "@/services/baseApi";
import { logout } from "@/stores/authSlice";
import type { RootState } from "@/stores/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export function useAuth() {
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  const { data: user } = useGetProfileQuery(undefined, { skip: !accessToken });
  //nếu không có token thì bỏ qua api nay
  const [logoutApi] = useLogoutMutation();
  const handleLogout = async () => {
    try {
      const result = await logoutApi();
      toast.success(result.data?.message);
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    } finally {
      dispatch(logout());
    }
  };
  return { isAuthenticated, user, logout: handleLogout };
}
