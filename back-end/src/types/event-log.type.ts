export interface EventLogDocument {
  _id?: unknown
  userId: unknown
  action: string
  details: string
  timestamp: Date
}
