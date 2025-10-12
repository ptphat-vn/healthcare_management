export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  identifyNumber: string;
  dateOfBirth: string;
  gender: string;
  password: string;
}
