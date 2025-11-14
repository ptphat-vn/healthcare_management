import type { Socket, Server } from 'socket.io'
import * as chatService from '~/services/chat.service'
import * as notificationService from '~/services/notification.service'
import * as userService from '~/services/user.service'


const userRoomName = (userId: string) => `user_${userId}`

export const registerChatHandlers = (socket: Socket, io: Server) => {
 
  socket.on('identify', ({ userId }: { userId: string }) => {
    if (!userId) return
    ;(socket.data as any).userId = userId
    socket.join(userRoomName(userId))
  })

  socket.on('join', ({ roomId }: { roomId: string }) => {
    if (roomId) socket.join(roomId)
  })

  socket.on('leave', ({ roomId }: { roomId: string }) => {
    if (roomId) socket.leave(roomId)
  })

  socket.on('message', async (payload: {
    conversationId: string
    senderId: string
    receiverId: string
    content: string
    metadata?: Record<string, unknown>
  }) => {
    try {
      
      if (!payload || !payload.conversationId || !payload.senderId || !payload.receiverId) {
        socket.emit('error', { message: 'Invalid message payload: missing ids' })
        return
      }
      if (typeof payload.content !== 'string' || payload.content.trim() === '') {
        socket.emit('error', { message: 'Message content is required' })
        return
      }

      const saved = await chatService.saveMessage(payload)

      // Serialize message: Convert ObjectId và Date thành string
      const serializedMessage = chatService.serializeMessage(saved)
      
      // Emit serialized message đến conversation room
      io.to(payload.conversationId).emit('message', serializedMessage)

     
      let senderName: string | undefined = undefined
      let senderAvatar: string | undefined = undefined
      try {
        const sender = await userService.getUserDetail(payload.senderId)
        senderName = (sender as any).fullName
        senderAvatar = (sender as any).avatar
      } catch {
      
      }

      const snippet = String(saved.content || '').slice(0, 120)
      const notification = {
        type: 'message',
        conversationId: payload.conversationId,
        from: payload.senderId,
        to: payload.receiverId,
        messageId: String(saved._id), // Serialize ObjectId thành string
        content: saved.content,
        snippet,
        senderName,
        senderAvatar,
        createdAt: saved.createdAt instanceof Date 
          ? saved.createdAt.toISOString() 
          : saved.createdAt,
      }

      io.to(userRoomName(payload.receiverId)).emit('notification', notification)

     
      try {
        await notificationService.createNotification({
          userId: payload.receiverId,
          actorId: payload.senderId,
          type: 'message',
          title: senderName ? `${senderName} sent you a message` : 'New message',
          body: snippet,
          data: { conversationId: payload.conversationId, messageId: String(saved._id), senderName, senderAvatar }
        })
      } catch (e) {
        
        console.error('Failed to save notification', e)
      }
    } catch (err) {
      console.error('chat message handling failed', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('disconnect', () => {
  
    const uid = (socket.data as any).userId
    if (uid) {
      try {
        socket.leave(userRoomName(uid))
      } catch (e) {
        console.error('Failed to leave user room on disconnect', e)
      }
    }
  })
}

export default registerChatHandlers
