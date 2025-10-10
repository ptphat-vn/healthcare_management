import type { User } from "./user.type";

export interface ErrorResponse {
  message?: string;
}

export interface APIResponse<T> {
  success: string;
  message: string;
  status?: number;
  data: T;
}
export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
}
export interface RefreshTokenResponse {
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}
