import type { APIResponse } from "@/types/response.type";
import { baseApi } from "./baseApi";

export const webRTCApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideoCallToken: builder.query<APIResponse<{ token: string }>, void>({
      query: () => ({
        url: "/webrtc/token",
        method: "GET",
      }),
    }),
  }),
});
export const { useGetVideoCallTokenQuery } = webRTCApi;
