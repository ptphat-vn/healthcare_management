import type { GenderUser } from "./user.type";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: GenderUser;
  address?: string;
  dateOfBirth: string;
  password: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: GenderUser;
  address?: string;
  dateOfBirth: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: GenderUser;
  address?: string;
  dateOfBirth: string;
  roleId?: string;
  status?: number;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description: string;
  privileges: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  privileges: string[];
}
export const requestedTests = [
  "White Blood Cell Count",
  "Red Blood Cell Count",
  "Hemoglobin",
  "Hematocrit",
  "Platelet Count",
  "Mean Corpuscular Volume",
  "Mean Corpuscular Haemoglobin",
  "Mean Corpuscular Haemoglobin Concentration",
] as const;

export type RequestedTestName = (typeof requestedTests)[number];

export interface CreateTestOrderRequest {
  medicalRecordId: string;
  requestedTests: RequestedTestName[];
}
export interface UpdateTestOrderRequest {
  patientName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  address: string;
  phoneNumber: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
export interface CommentTestOrderRequest {
  content?: string;
  testOrderId: string;
  commentId: string;
}
export interface AddReagentToInstrumentRequest {
  reagentId: string;
  quatity: number;
  lotNumber: string;
  note: string;
}
