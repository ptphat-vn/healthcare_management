import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "./baseApi";
import {
  type Reagent,
  type ListReagentsParams,
  type CreateReagentRequest,
  type SearchHistory,
  type VendorSupplyHisSearch,
  type ReagentInventorySearch,
} from "@/types/reagent.type";
import type {
  APIResponse,
  CreateVendorSuppyResponse,
  GetReagentInventoryFifoResponse,
  ReagentHistory,
  VendorSypplyHisResponse,
} from "@/types/response.type";
import type { CreateVendorSuppyRequest } from "@/types/request.type";

interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const reagentApi = createApi({
  reducerPath: "reagentApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Reagents"],
  endpoints: (builder) => ({
    getAllReagents: builder.query<
      {
        message: string;
        data: {
          reagents: Reagent[];
          pagination: PaginationResponse;
        };
      },
      ListReagentsParams
    >({
      query: (params) => ({
        url: "/reagents",
        params: {
          search: params.search,
          sortBy: params.sortBy || "updatedAt",
          sortOrder: params.sortOrder || -1,
          page: params.page || 1,
          limit: params.limit || 10,
          isActive: params.isActive,
        },
      }),
      providesTags: ["Reagents"],
    }),

    getReagentById: builder.query<{ message: string; data: Reagent }, string>({
      query: (id) => `/reagents/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Reagents", id }],
    }),

    createReagent: builder.mutation<
      { message: string; data: Reagent },
      CreateReagentRequest
    >({
      query: (body) => ({
        url: "/reagents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reagents"],
    }),

    updateReagent: builder.mutation<
      { message: string; data: Reagent },
      { id: string; body: Partial<CreateReagentRequest> }
    >({
      query: ({ id, body }) => ({
        url: `/reagents/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Reagents", id },
        "Reagents",
      ],
    }),

    deleteReagent: builder.mutation<{ message: string; data: Reagent }, string>(
      {
        query: (id) => ({
          url: `/reagents/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Reagents"],
      }
    ),

    // Get reagent inventory (FIFO)
    getReagentInventoryFIFO: builder.query<
      APIResponse<GetReagentInventoryFifoResponse>,
      ReagentInventorySearch
    >({
      query: (params: ReagentInventorySearch) => ({
        url: "/reagents/inventory/fifo",
        method: "GET",
        params,
      }),
      keepUnusedDataFor: 0, 
      providesTags: ["Reagents"],
    }),
    // category
    getAllCategoryReagents: builder.query<APIResponse<string[]>, void>({
      query: () => ({
        url: "/reagents/categories",
        method: "GET",
      }),
      providesTags: ["Reagents"],
    }),
    // history
    getUsageReagentHistory: builder.query<
      APIResponse<ReagentHistory>,
      SearchHistory
    >({
      query: (params: SearchHistory) => ({
        url: "/reagents/usage/history",
        method: "GET",
        params,
      }),
      providesTags: ["Reagents"],
    }),
    createVendorSupply: builder.mutation<
      APIResponse<CreateVendorSuppyResponse>,
      CreateVendorSuppyRequest
    >({
      query: (params: CreateVendorSuppyRequest) => ({
        url: "/reagents/vendor-supply",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Reagents"],
    }),
    getVendorSupplyHistory: builder.query<
      APIResponse<VendorSypplyHisResponse>,
      VendorSupplyHisSearch
    >({
      query: (params: VendorSupplyHisSearch) => ({
        url: "reagents/vendor-supply/history",
        method: "GET",
        params,
      }),
      providesTags: ["Reagents"],
    }),
  }),
});

export const {
  useGetAllReagentsQuery,
  useGetReagentByIdQuery,
  useCreateReagentMutation,
  useUpdateReagentMutation,
  useDeleteReagentMutation,
  useGetReagentInventoryFIFOQuery,
  useGetAllCategoryReagentsQuery,
  useGetUsageReagentHistoryQuery,
  useCreateVendorSupplyMutation,
  useGetVendorSupplyHistoryQuery,
} = reagentApi;
