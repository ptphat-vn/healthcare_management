import { Request, Response, NextFunction } from 'express'
import * as chatService from '~/services/chat.service'
import * as notificationService from '~/services/notification.service'
import { getIo } from '~/utils/socket'

export const getConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
  // route uses param name UserId; read it consistently here
  const userId = (req.params as { UserId?: string }).UserId
  if (!userId) return res.status(400).json({ message: 'userId is required' })

    // Make sure the path param is the OTHER participant's id (not the authenticated user)
    if (String(authUserId) === String(userId)) {
      return res.status(400).json({ message: 'userId must be the other participant id (not yourself). To fetch conversation while authenticated as this user, pass the other user id in the path.' })
    }

    const conversationId = chatService.getConversationId(String(authUserId), userId)
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const data = await chatService.getConversationMessages(conversationId, page, limit)
    return res.status(200).json({ message: 'Conversation messages', data })
  } catch (err) {
    next(err)
  }
}

export const sendMessageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
  const userId = (req.params as { UserId?: string }).UserId
  if (!userId) return res.status(400).json({ message: 'userId is required' })

    const { content, metadata } = req.body as { content?: string; metadata?: Record<string, unknown> }
    if (!content || typeof content !== 'string') return res.status(400).json({ message: 'content is required and must be a string' })

  const conversationId = chatService.getConversationId(String(authUserId), userId)
  const saved = await chatService.saveMessage({ conversationId, senderId: String(authUserId), receiverId: userId, content, metadata })

    // Serialize message: Convert ObjectId và Date thành string
    const serializedMessage = chatService.serializeMessage(saved)

    // Tạo notification cho người nhận
    try {
      const senderInfo = await chatService.getSenderInfo(String(authUserId))
      const notification = await notificationService.createNotification({
        userId: userId,
        actorId: String(authUserId),
        type: 'message',
        title: `Tin nhắn mới từ ${senderInfo?.fullName || 'người dùng'}`,
        body: content.length > 100 ? content.substring(0, 100) + '...' : content,
        data: {
          conversationId,
          messageId: String(saved._id),
          senderId: String(authUserId),
          senderName: senderInfo?.fullName,
          senderAvatar: senderInfo?.avatar
        }
      })

      // Emit notification to receiver via socket
      const io = getIo()
      if (io) {
        io.to(`user_${userId}`).emit('notification:new', notification)
        
        // Update unread count
        const summary = await notificationService.summary(userId, 0)
        io.to(`user_${userId}`).emit('notification:unread-count', { count: summary.count })
      }
    } catch (notifErr) {
      // Log error but don't fail the message send
      console.error('Failed to create notification:', notifErr)
    }

    // If socket.io is available, emit to the conversation room so recipients get message realtime
    const io = getIo()
    if (io) {
      try {
<<<<<<< HEAD
        // Debug: Log room và số clients
        const room = io.sockets.adapter.rooms.get(conversationId);
        console.log(`[HTTP] Emitting message to room: ${conversationId}`);
        console.log(`[HTTP] Room has ${room?.size || 0} clients`);
        console.log(`[HTTP] Serialized message:`, JSON.stringify(serializedMessage, null, 2));
        
        // Emit serialized message để frontend có thể so sánh đúng
        io.to(conversationId).emit('message', serializedMessage)
=======
        // Emit message tới cả sender và receiver qua user rooms để đảm bảo realtime
        // ngay cả khi họ không join conversationId room
        io.to(`user_${authUserId}`).emit('message', serializedMessage)
        io.to(`user_${userId}`).emit('message', serializedMessage)
>>>>>>> f8da01867ac549a97b37f60106dd6c8bff5eaf51
      } catch (e) {
        console.error('[HTTP] Error emitting message:', e);
      }
    } else {
      console.warn('[HTTP] Socket.io not available');
    }

    // Trả về serialized message cho HTTP response
    return res.status(201).json({ message: 'Message sent', data: serializedMessage })
  } catch (err) {
    next(err)
  }
}

export const getRecentConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const conversations = await chatService.getRecentConversations(String(authUserId), limit)

    return res.status(200).json({
      message: 'Recent conversations',
      data: { conversations }
    })
  } catch (err) {
    next(err)
  }
}

export const openConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
    
    const userId = (req.params as { UserId?: string }).UserId
    if (!userId) return res.status(400).json({ message: 'userId is required' })

    const conversationId = chatService.getConversationId(String(authUserId), userId)

    // Mark all messages in this conversation as read
    await chatService.markConversationAsRead(conversationId, String(authUserId))

    // Mark notifications related to this conversation as read
    await notificationService.markConversationNotificationsAsRead(conversationId, String(authUserId))

    // Broadcast updated unread count to all devices of this user
    const io = getIo()
    if (io) {
      const summary = await notificationService.summary(String(authUserId), 0)
      io.to(`user_${authUserId}`).emit('notification:unread-count', { count: summary.count })
    }

    return res.status(200).json({
      message: 'Conversation opened and marked as read',
      data: { conversationId, success: true }
    })
  } catch (err) {
    next(err)
  }
}