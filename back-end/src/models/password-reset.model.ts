import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const PASSWORD_RESET_COLLECTION = 'password_resets'

export interface PasswordResetDocument {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
  used: boolean
}

export const getPasswordResetCollection = (): Collection<PasswordResetDocument> => {
  return getDb().collection<PasswordResetDocument>(PASSWORD_RESET_COLLECTION)
}


