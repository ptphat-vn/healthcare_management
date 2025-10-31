import { useGetProfileQuery, useLogoutMutation } from "@/services/baseApi";
import { logout } from "@/stores/authSlice";
import { store, type RootState } from "@/stores/store";
import { useDispatch, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
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
      console.log(error);
    } finally {
      dispatch(logout());
      persistStore(store).purge();
      localStorage.clear();
      window.location.reload();
    }
  };
  return { isAuthenticated, user, logout: handleLogout };
}
