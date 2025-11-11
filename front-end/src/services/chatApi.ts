import type { APIResponse } from "@/types/response.type";
import { baseApi } from "./baseApi";
import type {
  ChatMessage,
  ConversationResponse,
  SendMessageRequest,
} from "@/types/chat-type";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversation: builder.query<
      APIResponse<ConversationResponse>,
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 50 }) => ({
        url: `/chats/${userId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    sendMessage: builder.mutation<
      APIResponse<ChatMessage>,
      { userId: string; message: SendMessageRequest }
    >({
      query: ({ userId, message }) => ({
        url: `/chats/${userId}`,
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetConversationQuery,
  useSendMessageMutation,
} = chatApi;