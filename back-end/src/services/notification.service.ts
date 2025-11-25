import { ObjectId, WithId } from 'mongodb'
import { getNotificationsCollection, type NotificationDocument } from '~/models/notification.model'
import { HttpError } from '~/models/error.model'

export interface CreateNotificationPayload {
  userId: string
  actorId?: string
  type: string
  title?: string
  body?: string
  data?: Record<string, unknown>
}
const parseObjectId = (id: string, fieldName = 'id') => {
  try {
    return new ObjectId(id)
  } catch {
    throw new HttpError(422, `Invalid ${fieldName}`)
  }
}

export const createNotification = async (payload: CreateNotificationPayload): Promise<WithId<NotificationDocument>> => {
  const userObjectId = parseObjectId(payload.userId, 'user id')
  const actorObjectId = payload.actorId ? parseObjectId(payload.actorId, 'actor id') : undefined

  const doc: NotificationDocument = {
    userId: userObjectId,
    actorId: actorObjectId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    read: false,
    createdAt: new Date()
  }

  const col = getNotificationsCollection()
  const res = await col.insertOne(doc as any)
  const created = await col.findOne({ _id: res.insertedId } as any)
  return created as WithId<NotificationDocument>
}

export interface ListNotificationsParams {
  userId: string
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export const listNotifications = async (params: ListNotificationsParams) => {
  const userObjectId = parseObjectId(params.userId, 'user id')
  const col = getNotificationsCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 20
  const skip = (page - 1) * limit

  const filter: Record<string, any> = { userId: userObjectId }
  if (params.unreadOnly) filter.read = false

  const cursor = col.find(filter as any).sort({ createdAt: -1 }).skip(skip).limit(limit)
  const [items, total] = await Promise.all([cursor.toArray(), col.countDocuments(filter as any)])

  return {
    notifications: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  }
}

export const markAsRead = async (id: string, userId: string) => {
  const objectId = parseObjectId(id, 'notification id')
  const userObjectId = parseObjectId(userId, 'user id')

  const col = getNotificationsCollection()
  const res = await col.findOneAndUpdate({ _id: objectId, userId: userObjectId } as any, { $set: { read: true } }, { returnDocument: 'after' as any })
  const updated = (res as any)?.value
  if (!updated) throw new HttpError(404, 'Notification not found')
  return updated as WithId<NotificationDocument>
}

export const markAllRead = async (userId: string) => {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(userId)
  } catch {
    throw new HttpError(422, 'Invalid user id')
  }
  const col = getNotificationsCollection()
  await col.updateMany({ userId: userObjectId, read: false } as any, { $set: { read: true } })
  return { success: true }
}

// Note: unread count is available via `summary` which returns { count, latest }.

export const summary = async (userId: string, limit: number = 1) => {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(userId)
  } catch {
    throw new HttpError(422, 'Invalid user id')
  }
  const col = getNotificationsCollection()
  const [count, latestArr] = await Promise.all([
    col.countDocuments({ userId: userObjectId, read: false } as any),
    col.find({ userId: userObjectId } as any).sort({ createdAt: -1 }).limit(limit > 0 ? limit : 1).toArray()
  ])
  let latest: any = null
  if (limit && limit > 1) {
    latest = latestArr
  } else {
    latest = latestArr.length ? latestArr[0] : null
  }
  return { count, latest }
}

export const markConversationNotificationsAsRead = async (conversationId: string, userId: string) => {
  const userObjectId = parseObjectId(userId, 'user id')
  const col = getNotificationsCollection()
  
  // Mark all notifications of type 'message' with matching conversationId for this user as read
  const result = await col.updateMany(
    {
      userId: userObjectId,
      type: 'message',
      'data.conversationId': conversationId,
      read: false
    } as any,
    { $set: { read: true } }
  )
  
  return { modifiedCount: result.modifiedCount }
}

export default { createNotification, listNotifications, markAsRead, markAllRead, summary, markConversationNotificationsAsRead }
