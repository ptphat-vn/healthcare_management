import type { Socket, Server } from 'socket.io'
import * as chatService from '~/services/chat.service'
import * as notificationService from '~/services/notification.service'
import * as userService from '~/services/user.service'

const userRoomName = (userId: string) => `user_${userId}`

// Track active conversations per socket
const activeConversations = new Map<string, Set<string>>() // socketId -> Set of conversationIds

type CallSignalPayload = {
  conversationId: string
  fromUserId: string
  toUserId: string
  callId: string
  isVideo?: boolean
  data?: Record<string, unknown>
}

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

  socket.on('open-conversation', async (payload: { conversationId: string; userId: string }) => {
    try {
      if (!payload?.conversationId || !payload?.userId) {
        socket.emit('error', { message: 'Invalid open-conversation payload: missing conversationId or userId' })
        return
      }

      // Track that this socket is viewing this conversation
      if (!activeConversations.has(socket.id)) {
        activeConversations.set(socket.id, new Set())
      }
      activeConversations.get(socket.id)!.add(payload.conversationId)

      // Mark all messages in this conversation where receiver is userId as read
      await chatService.markConversationAsRead(payload.conversationId, payload.userId)

      // Mark or delete notifications related to this conversation for this user
      await notificationService.markConversationNotificationsAsRead(payload.conversationId, payload.userId)

      // Broadcast updated unread count to all devices of this user
      const summary = await notificationService.summary(payload.userId, 0)
      io.to(userRoomName(payload.userId)).emit('notification:unread-count', { count: summary.count })

      // Acknowledge back to client
      socket.emit('conversation-opened', { conversationId: payload.conversationId, success: true })
    } catch (err) {
      console.error('open-conversation handler failed', err)
      socket.emit('error', { message: 'Failed to open conversation' })
    }
  })

  socket.on('close-conversation', (payload: { conversationId: string }) => {
    if (!payload?.conversationId) return
    
    // Remove from active conversations tracking
    const active = activeConversations.get(socket.id)
    if (active) {
      active.delete(payload.conversationId)
      if (active.size === 0) {
        activeConversations.delete(socket.id)
      }
    }
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
        // ignore
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
        createdAt:
          saved.createdAt instanceof Date
            ? saved.createdAt.toISOString()
            : saved.createdAt
      }

      io.to(userRoomName(payload.receiverId)).emit('notification', notification)

      // Check if receiver is currently viewing this conversation on any device
      const isReceiverViewingConversation = Array.from(io.sockets.sockets.values()).some(s => {
        const socketUserId = (s.data as any).userId
        if (socketUserId !== payload.receiverId) return false
        const active = activeConversations.get(s.id)
        return active && active.has(payload.conversationId)
      })

      // Only create persistent notification if receiver is NOT actively viewing the conversation
      if (!isReceiverViewingConversation) {
        try {
          await notificationService.createNotification({
            userId: payload.receiverId,
            actorId: payload.senderId,
            type: 'message',
            title: senderName ? `${senderName} sent you a message` : 'New message',
            body: snippet,
            data: {
              conversationId: payload.conversationId,
              messageId: String(saved._id),
              senderName,
              senderAvatar
            }
          })
        } catch (e) {
          console.error('Failed to save notification', e)
        }
      }
    } catch (err) {
      console.error('chat message handling failed', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })


  const validateCallPayload = (payload: CallSignalPayload | undefined): payload is CallSignalPayload => {
    if (!payload) return false
    if (!payload.conversationId || !payload.fromUserId || !payload.toUserId || !payload.callId) {
      return false
    }
    return true
  }

  socket.on('call:invite', (payload: CallSignalPayload) => {
    if (!validateCallPayload(payload)) {
      socket.emit('error', { message: 'Invalid call invite payload' })
      return
    }

    io.to(userRoomName(payload.toUserId)).emit('call:invite', payload)
  })

  socket.on('call:answer', (payload: CallSignalPayload) => {
    if (!validateCallPayload(payload)) {
      socket.emit('error', { message: 'Invalid call answer payload' })
      return
    }

    io.to(userRoomName(payload.toUserId)).emit('call:answer', payload)
  })

  socket.on('call:reject', (payload: CallSignalPayload) => {
    if (!validateCallPayload(payload)) {
      socket.emit('error', { message: 'Invalid call reject payload' })
      return
    }

    io.to(userRoomName(payload.toUserId)).emit('call:reject', payload)
  })

  socket.on('call:end', (payload: CallSignalPayload) => {
    if (!validateCallPayload(payload)) {
      socket.emit('error', { message: 'Invalid call end payload' })
      return
    }

    io.to(userRoomName(payload.toUserId)).emit('call:end', payload)
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
    
    // Cleanup active conversation tracking for this socket
    activeConversations.delete(socket.id)
  })
}

export default registerChatHandlers
