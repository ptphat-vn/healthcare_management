export interface UserDocument {
  _id?: unknown
  fullName: string
  email: string
  phoneNumber: string
  identifyNumber: string
  gender: 'male' | 'female'
  address: string
  dateOfBirth: string
  passwordHash: string
  role: 'admin' | 'manager' | 'user' | 'service' | 'consultant'
  status?: 0 | 1 | 2
  createdAt: Date
  updatedAt: Date
}
