import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { logout, setAuth } from "../stores/authSlice";
import type { RootState } from "@/stores/store";
import type {
  APIResponse,
  AuthResponse,
  ErrorResponse,
  RefreshTokenResponse,
} from "@/types/response.type";
import type { LoginRequest, RegisterRequest } from "@/types/request.type";
import type { User } from "@/types/user.type";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (agrs, api, extraOptions) => {
  let result = await baseQuery(agrs, api, extraOptions);

  if (result.error?.status === 401) {
    const errorData = result.error.data as ErrorResponse;

    if (errorData.message === "Access denied, token expired") {
      const refreshToken = (api.getState() as RootState).auth.refreshToken;

      if (refreshToken) {
        let refreshResult = await baseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: {
              refreshToken,
            },
          },
          api,
          extraOptions
        );

        const newAccessToken = (refreshResult.data as RefreshTokenResponse)
          ?.data?.accessToken;

        if (newAccessToken) {
          api.dispatch(
            setAuth({
              accessToken: newAccessToken,
              refreshToken: refreshToken,
            })
          );

          result = await baseQuery(agrs, api, extraOptions);
        } else {
          api.dispatch(logout());
          window.location.reload();
        }
      }
    } else {
      api.dispatch(logout());
      window.location.reload();
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: customBaseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation<APIResponse<AuthResponse>, LoginRequest>({
      // mutation là biển đổi, gửi dữ liệu xuống BE
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        body: loginData,
      }),
    }),
    register: builder.mutation<APIResponse<AuthResponse>, RegisterRequest>({
      query: (registerData) => ({
        url: "/auth/register",
        method: "POST",
        body: registerData,
      }),
    }),
    getProfile: builder.query<APIResponse<User>, void>({
      query: () => ({
        url: "/auth/me",
      }),
    }),
    logout: builder.mutation<{ success: string; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = baseApi;
