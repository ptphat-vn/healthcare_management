export interface User {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  gender: GenderUser;
  dateOfBirth: string;
  address?: string;
  roleId?: string;
  roleCode?: RoleUser;
  roleName?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
export type RoleUser =
  | "user"
  | "admin"
  | "manager"
  | "consultant"
  | "service"
  | "lab_user";

export type GenderUser = "male" | "female";
