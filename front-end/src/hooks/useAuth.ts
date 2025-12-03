import { useGetProfileQuery, useLogoutMutation } from "@/services/baseApi";
import { logout } from "@/stores/authSlice";
import { store, type RootState } from "@/stores/store";
import { useDispatch, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
import { toast } from "sonner";
import { socketService } from "@/services/socketService";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      // Disconnect socket trước khi logout
      socketService.disconnect();

      // Backup chat conversations trước khi clear localStorage
      const chatKeys: string[] = [];
      const chatData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("chat_conversations_")) {
          chatKeys.push(key);
          chatData[key] = localStorage.getItem(key) || "";
        }
      }

      dispatch(logout());
      persistStore(store).purge();
      localStorage.clear();

      // Restore chat conversations sau khi clear
      Object.entries(chatData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Sử dụng navigate thay vì window.location.reload()
      navigate("/auth/login", { replace: true });
    }
  };
  return { isAuthenticated, user, logout: handleLogout };
}
