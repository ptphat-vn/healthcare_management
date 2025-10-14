export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: GenderUser;
  dateOfBirth: string;
  role: RoleUser;
  status: number;
  createdAt: string;
  updatedAt: string;
}
export type RoleUser = "user" | "admin" | "manager" | "consultant" | "service";

export type GenderUser = "male" | "female";
