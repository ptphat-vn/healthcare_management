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
  testOrderId?: ObjectId // Nếu dùng cho test order
  instrumentId?: ObjectId // Nếu dùng với instrument
  batchLotNumber?: string // Lot number của reagent được sử dụng
  performedBy: ObjectId
  performedAt: Date
  notes?: string
  createdAt: Date
}

export const getReagentUsageHistoryCollection = (): Collection<ReagentUsageHistoryDocument> => {
  return getDb().collection<ReagentUsageHistoryDocument>(REAGENT_USAGE_HISTORY_COLLECTION)
}

