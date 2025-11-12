import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const NOTIFICATIONS_COLLECTION = 'notifications'

export interface NotificationDocument {
  _id?: ObjectId
  userId: ObjectId // recipient
  actorId?: ObjectId // who triggered the notification (e.g., sender)
  type: string
  title?: string
  body?: string
  data?: Record<string, unknown>
  read?: boolean
  createdAt: Date
}

export const getNotificationsCollection = (): Collection<NotificationDocument> => {
  return getDb().collection<NotificationDocument>(NOTIFICATIONS_COLLECTION)
}

export default { NOTIFICATIONS_COLLECTION, getNotificationsCollection }
