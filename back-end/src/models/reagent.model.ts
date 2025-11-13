import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const REAGENTS_COLLECTION = 'reagents'

export const REAGENT_CATEGORIES = [
  'Hematology',     
  'Biochemistry',      
  'Immunology',    
  'Molecular/PCR',     
  'Microbiology',     
  'Coagulation',      
  'Enzyme'       
] as const

export type ReagentCategory = typeof REAGENT_CATEGORIES[number]

export interface ReagentDocument {
  _id?: ObjectId
  name: string 
  catalogNumber?: string
  manufacturer?: string
  casNumber: string 
  description: string 
  usagePerRun: {
    min: number
    max: number
    unit: 'ml' | 'μL' | 'L' 
  }
  // Configuration parameters
  ratio?: string // vd: "1:10 to 1:20" cho Diluent
  categories?: string[] 
  storageCondition?: number 
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
  createdByName?: string
  lastModifiedBy?: ObjectId
  lastModifiedByName?: string
}

export const getReagentsCollection = (): Collection<ReagentDocument> => {
  return getDb().collection<ReagentDocument>(REAGENTS_COLLECTION)
}

