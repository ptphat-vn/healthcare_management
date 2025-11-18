import type {
  APIResponse,
  CreateCommentTestOrderResponse,
} from "@/types/response.type";
import { baseApi } from "./baseApi";
import type { TestOrder } from "@/types/testOrder.type";

export const commentTestOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCommentTestOrder: builder.mutation<
      APIResponse<CreateCommentTestOrderResponse>,
      { id: string; content: string }
    >({
      query: ({ id, content }) => ({
        url: `/test-orders/${id}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Comment", "TestOrder"],
    }),
    updateCommentTestOrder: builder.mutation<
      APIResponse<TestOrder>,
      { id: string; commentId: string; content: string }
    >({
      query: ({ id, commentId, content }) => ({
        url: `/test-orders/${id}/comments/${commentId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Comment", "TestOrder"],
    }),
    deleteCommentTestOrder: builder.mutation<
      APIResponse<TestOrder>,
      { id: string; commentId: string }
    >({
      query: ({ id, commentId }) => ({
        url: `/test-orders/${id}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment", "TestOrder"],
    }),
  }),
});

export const {
  useCreateCommentTestOrderMutation,
  useUpdateCommentTestOrderMutation,
  useDeleteCommentTestOrderMutation,
} = commentTestOrderApi;
