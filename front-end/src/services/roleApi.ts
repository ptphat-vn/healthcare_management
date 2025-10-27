import type { APIResponse, GetAllRoleResponse } from "@/types/response.type";
import { baseApi } from "./baseApi";
import type { Roles } from "@/types/roles.type";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/request.type";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRole: builder.query<
      APIResponse<GetAllRoleResponse>,
      {
        search?: string;
        sortBy?: "name" | "code" | "createAt";
        sortOrder?: 1 | -1;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/roles",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["Roles"],
    }),
    createRole: builder.mutation<APIResponse<Roles>, CreateRoleRequest>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),
    updateRole: builder.mutation<
      APIResponse<Roles>,
      { id: string } & UpdateRoleRequest
    >({
      query: ({ id, ...roleData }) => ({
        url: `roles/${id}`,
        method: "PUT",
        body: roleData,
      }),
      invalidatesTags: ["Roles"],
    }),
    deleteRole: builder.mutation<APIResponse<Roles>, { roleId: string }>({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});
export const {
  useCreateRoleMutation,
  useGetAllRoleQuery,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = roleApi;
