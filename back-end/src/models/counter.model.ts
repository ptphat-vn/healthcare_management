import type { Collection, Document } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const COUNTERS_COLLECTION = 'counters'

export interface CounterDocument extends Document {
  _id: string
  seq: number
}

export const getCountersCollection = (): Collection<CounterDocument> => {
  return getDb().collection<CounterDocument>(COUNTERS_COLLECTION)
}

export const getNextSequence = async (key: string): Promise<number> => {
  const counters = getCountersCollection()
 
  const result = await counters.findOneAndUpdate(
    { _id: key } as any,
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  )
  let seq: number | undefined = (result as any)?.value?.seq
  if (typeof seq !== 'number') {
    const doc = await counters.findOne({ _id: key } as any)
    seq = (doc as any)?.seq ?? 1
  }
  return typeof seq === 'number' ? seq : 1
}


