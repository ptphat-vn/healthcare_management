import { ObjectId } from 'mongodb'
import { getChatCollection, ChatMessageDocument } from '~/models/chat.model'
import { getUsersCollection } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'

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

/**
 * Serialize message object: Convert ObjectId và Date thành string
 * Để đảm bảo frontend có thể so sánh và sử dụng đúng
 */
export const serializeMessage = (message: any) => {
  if (!message) return null;
  
  return {
    _id: message._id ? String(message._id) : undefined,
    conversationId: message.conversationId,
    senderId: message.senderId ? String(message.senderId) : undefined,
    receiverId: message.receiverId ? String(message.receiverId) : undefined,
    content: message.content,
    metadata: message.metadata,
    read: message.read || false,
    createdAt: message.createdAt instanceof Date 
      ? message.createdAt.toISOString() 
      : (typeof message.createdAt === 'string' ? message.createdAt : new Date().toISOString())
  }
}

export const getConversationMessages = async (conversationId: string, page = 1, limit = 50) => {
  const col = getChatCollection()
  const skip = Math.max(0, page - 1) * limit
  const cursor = col.find({ conversationId }).sort({ createdAt: 1 }).skip(skip).limit(limit)
  const items = await cursor.toArray()
  const total = await col.countDocuments({ conversationId })
  return { messages: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } }
}

export const getRecentConversations = async (authUserId: string, limit = 20) => {
  const chatCol = getChatCollection()
  const usersCol = getUsersCollection()
  const rolesCol = getRolesCollection()

  const authUserIdObj = new ObjectId(authUserId)

  // Aggregate để lấy conversationId unique và tin nhắn cuối cùng
  const pipeline = [
    {
      $match: {
        $or: [
          { senderId: authUserIdObj },
          { receiverId: authUserIdObj }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$content' },
        lastMessageTime: { $first: '$createdAt' },
        senderId: { $first: '$senderId' },
        receiverId: { $first: '$receiverId' }
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    },
    {
      $limit: limit
    }
  ]

  const conversations = await chatCol.aggregate(pipeline).toArray()

  // Lấy thông tin user đối tác
  const partnerIds = conversations.map((conv: any) => {
    const senderId = String(conv.senderId)
    const receiverId = String(conv.receiverId)
    return senderId === authUserId ? new ObjectId(receiverId) : new ObjectId(senderId)
  })

  if (partnerIds.length === 0) return []

  const partners = await usersCol.find({ _id: { $in: partnerIds } } as any).toArray()
  const partnerMap = new Map(partners.map((u: any) => [String(u._id), u]))

  // Lấy roleCodes
  const roleIds = Array.from(new Set(partners.map((u: any) => u.roleId).filter(Boolean))) as ObjectId[]
  const roleDocs = roleIds.length ? await rolesCol.find({ _id: { $in: roleIds } } as any).toArray() : []
  const roleMap = new Map(roleDocs.map((r: any) => [String(r._id), r.code]))

  // Map conversations với thông tin partner
  return conversations.map((conv: any) => {
    const senderId = String(conv.senderId)
    const receiverId = String(conv.receiverId)
    const partnerId = senderId === authUserId ? receiverId : senderId
    const partner = partnerMap.get(partnerId)

    return {
      userId: partnerId,
      userName: partner?.fullName || `User ${partnerId.substring(0, 8)}...`,
      avatar: partner?.avatar,
      roleCode: partner?.roleId ? roleMap.get(String(partner.roleId)) : undefined,
      lastMessage: conv.lastMessage?.substring(0, 50),
      lastMessageTime: conv.lastMessageTime
    }
  })
}
