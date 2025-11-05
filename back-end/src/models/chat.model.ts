import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const CHAT_MESSAGES_COLLECTION = 'chat_messages'

export interface ChatMessageDocument {
  _id?: ObjectId
  conversationId: string
  senderId: ObjectId
  receiverId: ObjectId
  content: string
  metadata?: Record<string, unknown>
  read?: boolean
  createdAt: Date
}

export const getChatCollection = (): Collection<ChatMessageDocument> => {
  return getDb().collection<ChatMessageDocument>(CHAT_MESSAGES_COLLECTION)
}
