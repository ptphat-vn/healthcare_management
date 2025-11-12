import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'
import type { ReagentCategory } from '~/models/reagent.model'

export const INSTRUMENTS_COLLECTION = 'instruments'

export interface InstrumentDocument {
  _id?: ObjectId
  name: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  location?: string
  description?: string
  categories: ReagentCategory[]
  isActive: boolean
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
  lastModifiedBy?: ObjectId
}

export const getInstrumentsCollection = (): Collection<InstrumentDocument> => {
  return getDb().collection<InstrumentDocument>(INSTRUMENTS_COLLECTION)
}

