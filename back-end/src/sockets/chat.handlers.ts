import type { Socket, Server } from 'socket.io'
import * as chatService from '~/services/chat/chat.service'
import * as notificationService from '~/services/notification/notification.service'
import * as userService from '~/services/user/user.service'

const userRoomName = (userId: string) => `user_${userId}`

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
    if (roomId) {
      socket.join(roomId)
      console.log(`[Socket] User ${(socket.data as any).userId || 'unknown'} joined room: ${roomId}`)

      // Debug: Log số clients trong room
      const room = io.sockets.adapter.rooms.get(roomId)
      console.log(`[Socket] Room ${roomId} now has ${room?.size || 0} clients`)
    }
  })

  socket.on('leave', ({ roomId }: { roomId: string }) => {
    if (roomId) socket.leave(roomId)
  })

  socket.on(
    'message',
    async (payload: {
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
          createdAt: saved.createdAt instanceof Date ? saved.createdAt.toISOString() : saved.createdAt
        }

        io.to(userRoomName(payload.receiverId)).emit('notification', notification)

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
      } catch (err) {
        console.error('chat message handling failed', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    }
  )

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
  })
}

export default registerChatHandlers
