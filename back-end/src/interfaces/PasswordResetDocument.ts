export interface PasswordResetDocument {
  _id?: unknown
  userId: unknown
  token: string
  expiresAt: Date
  createdAt: Date
  used: boolean
}


