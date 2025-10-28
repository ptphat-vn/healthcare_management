import type { APIResponse } from "@/types/response.type";
import { baseApi } from "./baseApi";
import type { EventLogListResponse } from "@/types/monitor.type";

export const eventLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventLogs: builder.query<
      APIResponse<EventLogListResponse>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/event-logs",
        method: "GET",
        params: params || undefined,
      }),
    }),
  }),
});
export const { useGetEventLogsQuery } = eventLogApi;
