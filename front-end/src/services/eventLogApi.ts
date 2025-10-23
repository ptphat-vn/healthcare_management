import type { APIResponse } from "@/types/response.type";
import { baseApi } from "./baseApi";
import type { EventLog } from "@/types/monitor.type";

export const eventLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventLogs: builder.query<
      APIResponse<EventLog[]>,
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
