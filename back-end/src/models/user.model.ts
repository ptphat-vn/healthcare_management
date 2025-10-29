import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const USERS_COLLECTION = 'users'

export interface UserDocument {
  _id?: ObjectId
  patientId?: string
  fullName: string
  email: string
  phoneNumber?: string
  identifyNumber?: string
  gender?: 'male' | 'female'
  address?: string
  dateOfBirth?: string
  passwordHash?: string
  roleId: ObjectId
  status?: 0 | 1 | 2
  createdAt: Date
  updatedAt: Date
}

export const getUsersCollection = (): Collection<UserDocument> => {
  return getDb().collection<UserDocument>(USERS_COLLECTION)
}
