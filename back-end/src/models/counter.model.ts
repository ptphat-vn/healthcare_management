import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const COUNTERS_COLLECTION = 'counters'

export interface CounterDocument {
  _id?: ObjectId
  key: string
  seq: number
}

export const getCountersCollection = (): Collection<CounterDocument> => {
  return getDb().collection<CounterDocument>(COUNTERS_COLLECTION)
}


