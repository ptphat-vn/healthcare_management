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
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "@/types/request.type";
import type { User } from "@/types/user.type";
import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/request.type";

import type { 
  ConversationResponse,
   SendMessageRequest,
    ChatMessage } from "@/types/chat-type";

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
        const refreshResult = await baseQuery(
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

export { customBaseQuery };

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: customBaseQuery,
  tagTypes: [
    "User",
    "Roles",
    "TestOrder",
    "medicalRecord",
    "Instrument",
    "Comment",
    "Chat",
  ],
  endpoints: (builder) => ({
    login: builder.mutation<APIResponse<AuthResponse>, LoginRequest>({
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
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<APIResponse<User>, UpdateUserRequest>({
      query: (userData) => ({
        url: "/user/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<{ success: string; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    loginGoogle: builder.mutation<
      APIResponse<AuthResponse>,
      { tokenGoogle: string }
    >({
      query: (tokenGoogle) => ({
        url: "auth/login-google",
        method: "POST",
        body: tokenGoogle,
      }),
    }),
    forgotPassword: builder.mutation<
      APIResponse<{ email: string }>,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      APIResponse<{ email: string }>,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    verifyOTP: builder.mutation<
      APIResponse<{ verified: boolean }>,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
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
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useLoginGoogleMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyOTPMutation,
  useGetConversationQuery,
  useSendMessageMutation,
} = baseApi;
