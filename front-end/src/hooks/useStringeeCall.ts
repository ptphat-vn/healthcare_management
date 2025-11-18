import { useGetVideoCallTokenQuery } from "@/services/webRTCApi";
import { useAuth } from "./useAuth";

export function useStringeeToken() {
  const { user } = useAuth();
  const isLoggedIn = !!user?.data?._id;

  // Skip query nếu chưa đăng nhập
  const { data, isLoading, error } = useGetVideoCallTokenQuery(undefined, {
    skip: !isLoggedIn,
  });

  return {
    token: data?.data?.token || "",
    isLoading,
    error,
  };
}
