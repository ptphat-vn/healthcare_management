import type { RequestedTestName } from "./request.type";
import type { Roles } from "./roles.type";
import type { TestOrder } from "./testOrder.type";
import type { GenderUser, User } from "./user.type";

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
export interface CreateTestOrderResponse {
  medicalRecordId: string;
  requestedTests: RequestedTestName[];
  patientName: string;
  dateOfBirth: string;
  gender: GenderUser;
  address: null;
  phoneNumber: string;
  email: string;
  status: CreateTestOrderStatus;
  createdDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTestOrderStatus =
  | "pending"
  | "complete"
  | "review"
  | "cancel"
  | "reviewAI";

export interface CreateCommentTestOrderResponse {
  commentId: string;
  testOrder: TestOrder;
}
export interface ReagentToInstrumentResponse {
  _id: string;
  instrumentId: string;
  reagentId: string;
  reagentName: string;
  lotNumber: string;
  quantity: number;
  unitOfMeasure: string;
  expirationDate: string;
  vendorSupplyId: string;
  assignedBy: string;
  assignedAt: string;
  removedAt?: string;
  removedBy?: string;
  isActive: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}
