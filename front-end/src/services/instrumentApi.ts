import type { Instrument } from "@/types/instrument.type";
import { baseApi } from "./baseApi";
import type { APIResponse } from "@/types/response.type";
import type {
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
} from "@/types/instrument.type";

export interface GetAllInstrumentsResponse {
  instruments: Instrument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const instrumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all instruments with filters
    getAllInstruments: builder.query<
      APIResponse<GetAllInstrumentsResponse>,
      {
        search?: string;
        status?: "Active" | "Inactive" | "Maintenance" | "Out of Service";
        isActive?: boolean;
        sortBy?: "name" | "createdAt" | "updatedAt";
        sortOrder?: 1 | -1;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/instruments",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["Instrument"],
    }),

    // Get instrument by ID
    getInstrumentById: builder.query<APIResponse<Instrument>, string>({
      query: (id) => ({
        url: `/instruments/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["Instrument"],
    }),

    // Create new instrument
    createInstrument: builder.mutation<
      APIResponse<Instrument>,
      CreateInstrumentRequest
    >({
      query: (instrumentData) => ({
        url: "/instruments",
        method: "POST",
        body: instrumentData,
      }),
      invalidatesTags: ["Instrument"],
    }),

    // Update instrument
    updateInstrument: builder.mutation<
      APIResponse<Instrument>,
      { id: string } & Partial<UpdateInstrumentRequest>
    >({
      query: ({ id, ...instrumentData }) => ({
        url: `/instruments/${id}`,
        method: "PUT",
        body: instrumentData,
      }),
      invalidatesTags: ["Instrument"],
    }),

    // Delete instrument
    deleteInstrument: builder.mutation<APIResponse<Instrument>, string>({
      query: (id) => ({
        url: `/instruments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Instrument"],
    }),

    // Add reagent to instrument
    addReagentToInstrument: builder.mutation<
      APIResponse<any>,
      { instrumentId: string; reagentData: any }
    >({
      query: ({ instrumentId, reagentData }) => ({
        url: `/instruments/${instrumentId}/reagents`,
        method: "POST",
        body: reagentData,
      }),
      invalidatesTags: ["Instrument"],
    }),

    // Remove reagent from instrument
    removeReagentFromInstrument: builder.mutation<
      APIResponse<any>,
      string
    >({
      query: (assignmentId) => ({
        url: `/instruments/reagents/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Instrument"],
    }),

    // Get instrument reagents
    getInstrumentReagents: builder.query<APIResponse<any>, string>({
      query: (instrumentId) => ({
        url: `/instruments/${instrumentId}/reagents`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["Instrument"],
    }),
  }),
});

export const {
  useGetAllInstrumentsQuery,
  useGetInstrumentByIdQuery,
  useCreateInstrumentMutation,
  useUpdateInstrumentMutation,
  useDeleteInstrumentMutation,
  useAddReagentToInstrumentMutation,
  useRemoveReagentFromInstrumentMutation,
  useGetInstrumentReagentsQuery,
} = instrumentApi;
