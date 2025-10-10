export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: string;
  dateOfBirth: string;
  role: RoleUser;
  status: number;
  createdAt: string;
  updatedAt: string;
}
export type RoleUser = "USER" | "ADMIN" | "MANAGER" | "CONSULTANT" | "SERVICE";
