import { useGetVideoCallTokenQuery } from "@/services/webRTCApi";

export function useStringeeToken() {
  const { data, isLoading, error } = useGetVideoCallTokenQuery();
  return {
    token: data?.data?.token || "",
    isLoading,
    error,
  };
}
