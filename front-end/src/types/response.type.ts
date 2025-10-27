import type { Roles } from "./roles.type";
import type { TestOrder } from "./testOrder.type";
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
export interface GetAllUserResponse {
  user: User[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAllRoleResponse {
  role: Roles[];
  pagination: Pagination;
}
export interface GetAllTestOrderResponse {
  testOrder: TestOrder[];
  pagination: Pagination;
}
