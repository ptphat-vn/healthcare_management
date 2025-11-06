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
  patientId?: string;
  createdAt: string;
  avatar?: string;
  updatedAt: string;
}
export type RoleUser =
  | "patient"
  | "admin"
  | "lab_manager"
  | "consultant"
  | "service"
  | "lab_user";

export type GenderUser = "male" | "female" | "";
