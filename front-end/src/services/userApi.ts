import type { User } from "@/types/user.type";
import { baseApi } from "./baseApi";
import type { APIResponse, GetAllUserResponse } from "@/types/response.type";
import type {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/request.type";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUser: builder.query<
      APIResponse<GetAllUserResponse>,
      {
        search?: string;
        status?: 0 | 1 | 2 | number;
        sortBy?: "fullName" | "email" | "createdAt" | "updatedAt";
        sortOrder?: 1 | -1;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/user/all",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["User"],
    }),

    getAllLabUser: builder.query<
      APIResponse<GetAllUserResponse>,
      { search?: string; status?: number; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/user/lab-users",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["User"],
    }),

    getAllPatient: builder.query<
      APIResponse<GetAllUserResponse>,
      { search?: string; status?: number; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/user/patients",
        method: "GET",
        params: params || {},
      }),
      keepUnusedDataFor: 0,
      providesTags: ["User"],
    }),

    createUser: builder.mutation<APIResponse<User>, CreateUserRequest>({
      query: (userData) => ({
        url: "/admin/create-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<
      APIResponse<User>,
      { id: string } & UpdateUserRequest
    >({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/update/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    getDetailUser: builder.query<APIResponse<User>, { id: string }>({
      query: ({ id }) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["User"],
    }),
    // Get basic user info without privilege requirement (for video calls)
    getBasicUserInfo: builder.query<APIResponse<User>, { id: string }>({
      query: ({ id }) => ({
        url: `/user/basic/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60, // Cache for 1 minute
      providesTags: ["User"],
    }),
    deleteUser: builder.mutation<APIResponse<User>, string>({
      query: (userId) => ({
        url: `/admin/users/delete/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    updateAvatar: builder.mutation<APIResponse<User>, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return {
          url: "/user/avatar",
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["User", "Profile"],
    }),
  }),
});
export const {
  useGetAllUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetDetailUserQuery,
  useGetBasicUserInfoQuery,
  useDeleteUserMutation,
  useUpdateAvatarMutation,
  useGetAllLabUserQuery,
  useGetAllPatientQuery,
} = userApi;
