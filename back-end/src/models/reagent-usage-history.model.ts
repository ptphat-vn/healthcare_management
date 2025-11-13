import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const REAGENT_USAGE_HISTORY_COLLECTION = 'reagent_usage_history'

export interface ReagentUsageHistoryDocument {
  _id?: ObjectId
  reagentId: ObjectId
  reagentName: string
  quantity: number
  unit: string 
  action: 'Used' | 'Consumed' | 'Wasted' | 'Expired' | 'Returned'
  testOrderId?: ObjectId 
  testOrderName?: string
  instrumentId?: ObjectId 
  instrumentName?: string
  batchLotNumber?: string // Lot number của reagent được sử dụng
  performedBy: ObjectId
  performedByName?: string
  performedAt: Date
  notes?: string
  createdAt: Date
}

export const getReagentUsageHistoryCollection = (): Collection<ReagentUsageHistoryDocument> => {
  return getDb().collection<ReagentUsageHistoryDocument>(REAGENT_USAGE_HISTORY_COLLECTION)
}

