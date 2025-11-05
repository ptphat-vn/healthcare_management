import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const REAGENTS_COLLECTION = 'reagents'

export interface ReagentDocument {
  _id?: ObjectId
  name: string 
  catalogNumber?: string
  manufacturer?: string
  casNumber?: string 
  description: string 
  usagePerRun: {
    min: number
    max: number
    unit: 'ml' | 'μL' | 'L' 
  }
  // Configuration parameters
  ratio?: string // vd: "1:10 to 1:20" cho Diluent
  preciseAmount?: { // vd: 50-200 μL cho Lysing
    min: number
    max: number
    unit: 'μL'
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
  lastModifiedBy?: ObjectId
}

export const getReagentsCollection = (): Collection<ReagentDocument> => {
  return getDb().collection<ReagentDocument>(REAGENTS_COLLECTION)
}

