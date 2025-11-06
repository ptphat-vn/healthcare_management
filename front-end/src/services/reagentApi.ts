import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "./baseApi";
import type { Reagent, ListReagentsParams, CreateReagentRequest } from "@/types/reagent.type";

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

    getReagentById: builder.query<
      { message: string; data: Reagent },
      string
    >({
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

    deleteReagent: builder.mutation<
      { message: string; data: Reagent },
      string
    >({
      query: (id) => ({
        url: `/reagents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reagents"],
    }),
  }),
});

export const {
  useGetAllReagentsQuery,
  useGetReagentByIdQuery,
  useCreateReagentMutation,
  useUpdateReagentMutation,
  useDeleteReagentMutation,
} = reagentApi;