import type { GenderUser } from "./user.type";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  phoneNumber: string;
  identityNumber: string;
  gender: GenderUser;
  dateOfBirth: string;
  password: string;
}
