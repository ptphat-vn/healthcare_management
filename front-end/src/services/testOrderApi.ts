import type {
  APIResponse,
  CreateTestOrderResponse,
  GetAllTestOrderResponse,
} from "@/types/response.type";
import { baseApi } from "./baseApi";
import type {
  CreateTestOrderRequest,
  UpdateTestOrderRequest,
} from "@/types/request.type";
import type { TestOrder } from "@/types/testOrder.type";

export const testOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTestOrder: builder.query<
      APIResponse<GetAllTestOrderResponse>,
      {
        search?: string;
        sortBy?: "patientName" | "createdDate" | "runDate" | "status";
        status?:
          | "pending"
          | "cancelled"
          | "completed"
          | "reviewed"
          | "ai_reviewed";
        sortOrder: 1 | -1;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/test-orders",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["TestOrder"],
    }),
    createTestOrder: builder.mutation<
      APIResponse<CreateTestOrderResponse>,
      CreateTestOrderRequest
    >({
      query: (data) => ({
        url: "/test-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TestOrder"],
    }),
    getDetailTestOrder: builder.query<APIResponse<TestOrder>, { id: string }>({
      query: ({ id }) => ({
        url: `/test-orders/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["TestOrder"],
    }),
    updateTestOrder: builder.mutation<
      APIResponse<TestOrder>,
      { id: string } & UpdateTestOrderRequest
    >({
      query: ({ id, ...data }) => ({
        url: `/test-orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TestOrder"],
    }),
    deleteTestOrder: builder.mutation<APIResponse<TestOrder>, string>({
      query: (id) => ({
        url: `/test-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TestOrder"],
    }),
    createTestResult: builder.mutation<
      APIResponse<TestOrder>,
      { testOrderId: string; instrumentId: string }
    >({
      query: ({ testOrderId, instrumentId }) => ({
        url: `/test-orders/${testOrderId}/run-with-instrument`,
        method: "POST",
        body: { instrumentId },
      }),
      invalidatesTags: ["TestOrder"],
    }),
    // createTestOrderReview: builder.mutation<
    //   APIResponse<TestOrder>,
    //   {
    //     testOrderId: string;
    //     params: { testResultId: string; newResult: string };
    //   }
    // >({
    //   query: ({ testOrderId, params }) => ({
    //     url: `/test-orders/${testOrderId}/review`,
    //     method: "POST",
    //     body: params,
    //   }),
    //   invalidatesTags: ["TestOrder"],
    // }),
    createTestOrderReviewByAI: builder.mutation<
      APIResponse<TestOrder>,
      { testOrderId: string }
    >({
      query: ({ testOrderId }) => ({
        url: `/test-orders/${testOrderId}/ai-review`,
        method: "POST",
      }),
      invalidatesTags: ["TestOrder"],
    }),
  }),
});
export const {
  useCreateTestOrderMutation,
  useGetAllTestOrderQuery,
  useGetDetailTestOrderQuery,
  useDeleteTestOrderMutation,
  useUpdateTestOrderMutation,
  useCreateTestResultMutation,
  // useCreateTestOrderReviewMutation,
  useCreateTestOrderReviewByAIMutation,
} = testOrderApi;
