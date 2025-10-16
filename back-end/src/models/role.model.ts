import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const ROLES_COLLECTION = 'roles'

export interface RoleDocument {
  _id?: ObjectId
  name: string
  code: string
  description?: string
  privileges: string[]
  createdAt: Date
  updatedAt: Date
}

export const getRolesCollection = (): Collection<RoleDocument> => {
  return getDb().collection<RoleDocument>(ROLES_COLLECTION)
}


