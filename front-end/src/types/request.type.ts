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
export interface CreateTestOrderRequest {
  patientName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  address: string;
  phoneNumber: string;
  email: string;
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
