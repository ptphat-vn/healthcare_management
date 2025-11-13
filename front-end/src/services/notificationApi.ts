import { baseApi } from "./baseApi";
import type {
  NotificationResponse,
  NotificationSummary,
} from "@/types/notification.type";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationResponse,
      { page?: number; limit?: number; unreadOnly?: boolean }
    >({
      query: ({ page = 1, limit = 20, unreadOnly = false }) => ({
        url: "/notifications",
        params: { page, limit, unreadOnly },
      }),
      providesTags: ["Notification"],
    }),

    getNotificationsSummary: builder.query<NotificationSummary, number>({
      query: (limit = 10) => ({
        url: "/notifications/summary",
        params: { limit },
      }),
      providesTags: ["Notification"],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationsSummaryQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
