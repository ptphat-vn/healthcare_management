import { ObjectId } from 'mongodb'
import { getChatCollection, ChatMessageDocument } from '~/models/chat.model'

export const getConversationId = (userA: string, userB: string) => {
  // deterministic id for a 1:1 conversation
  const [a, b] = [userA, userB].map((s) => s.toString()).sort()
  return `${a}_${b}`
}

export const saveMessage = async (payload: {
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  metadata?: Record<string, unknown>
}) => {
  const col = getChatCollection()
  const doc: ChatMessageDocument = {
    conversationId: payload.conversationId,
    senderId: new ObjectId(payload.senderId),
    receiverId: new ObjectId(payload.receiverId),
    content: payload.content,
    metadata: payload.metadata,
    read: false,
    createdAt: new Date()
  }
  const res = await col.insertOne(doc as any)
  return { _id: res.insertedId, ...doc }
}

export const getConversationMessages = async (conversationId: string, page = 1, limit = 50) => {
  const col = getChatCollection()
  const skip = Math.max(0, page - 1) * limit
  const cursor = col.find({ conversationId }).sort({ createdAt: 1 }).skip(skip).limit(limit)
  const items = await cursor.toArray()
  const total = await col.countDocuments({ conversationId })
  return { messages: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}
