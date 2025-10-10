export interface UserDocument {
  _id?: unknown
  fullName: string
  email: string
  phoneNumber: string
  identifyNumber: string
  gender: 'male' | 'female'
  age: number
  address: string
  dateOfBirth: string
  passwordHash: string
  role: 'admin' | 'manager' | 'user' | 'service' | 'consultant'
  createdAt: Date
  updatedAt: Date
}
