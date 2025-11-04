import type {
  APIResponse,
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
      providesTags: ["testOrder"],
    }),
    createTestOrder: builder.mutation<
      APIResponse<TestOrder>,
      CreateTestOrderRequest
    >({
      query: (data) => ({
        url: "/test-orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["testOrder"],
    }),
    getDetailTestOrder: builder.query<APIResponse<TestOrder>, { id: string }>({
      query: ({ id }) => ({
        url: `/test-orders/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["testOrder"],
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
      invalidatesTags: ["testOrder"],
    }),
    deleteTestOrder: builder.mutation<APIResponse<TestOrder>, string>({
      query: (id) => ({
        url: `/test-orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["testOrder"],
    }),
  }),
});
export const {
  useCreateTestOrderMutation,
  useGetAllTestOrderQuery,
  useGetDetailTestOrderQuery,
  useDeleteTestOrderMutation,
  useUpdateTestOrderMutation,
} = testOrderApi;
