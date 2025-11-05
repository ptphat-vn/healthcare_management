import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const INSTRUMENT_REAGENT_ASSIGNMENTS_COLLECTION = 'instrument_reagent_assignments'

export interface InstrumentReagentAssignmentDocument {
  _id?: ObjectId
  instrumentId: ObjectId
  reagentId: ObjectId
  reagentName: string
  lotNumber: string
  quantity: number
  unitOfMeasure: string
  expirationDate: Date
  vendorSupplyId: ObjectId // Reference to vendor supply for tracking
  assignedBy: ObjectId
  assignedAt: Date
  removedAt?: Date
  removedBy?: ObjectId
  isActive: boolean // True when assigned, false when removed
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export const getInstrumentReagentAssignmentCollection = (): Collection<InstrumentReagentAssignmentDocument> => {
  return getDb().collection<InstrumentReagentAssignmentDocument>(INSTRUMENT_REAGENT_ASSIGNMENTS_COLLECTION)
}

