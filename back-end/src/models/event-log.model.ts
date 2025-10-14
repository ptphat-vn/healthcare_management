import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const EVENT_LOGS_COLLECTION = 'event_logs'

export interface EventLogDocument {
  _id?: ObjectId
  userId: ObjectId
  action: string
  details: string
  timestamp: Date
}

export const getEventLogsCollection = (): Collection<EventLogDocument> => {
  return getDb().collection<EventLogDocument>(EVENT_LOGS_COLLECTION)
}


