import type { Socket, Server } from 'socket.io'
import * as chatService from '~/services/chat.service'
import * as notificationService from '~/services/notification.service'
import * as userService from '~/services/user.service'

// simple helper to name a user's personal room
const userRoomName = (userId: string) => `user_${userId}`

export const registerChatHandlers = (socket: Socket, io: Server) => {
  // allow client to declare its user id so we can deliver direct notifications
  socket.on('identify', ({ userId }: { userId: string }) => {
    if (!userId) return
    // store on socket and join a personal room for this user
    // joining a room makes it easy to emit to all sockets for the user
    // (useful if the user is connected from multiple devices/tabs)
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
      // basic validation
      if (!payload || !payload.conversationId || !payload.senderId || !payload.receiverId) {
        socket.emit('error', { message: 'Invalid message payload: missing ids' })
        return
      }
      if (typeof payload.content !== 'string' || payload.content.trim() === '') {
        socket.emit('error', { message: 'Message content is required' })
        return
      }

      const saved = await chatService.saveMessage(payload)

      // broadcast message to participants in the conversation room
      io.to(payload.conversationId).emit('message', saved)

      // also send a lightweight notification to the receiver's personal room
      // clients should listen to 'notification' to update badges/UI even if
      // they are not currently in the conversation room.
      // attempt to fetch sender metadata to enrich the notification
      let senderName: string | undefined = undefined
      let senderAvatar: string | undefined = undefined
      try {
        const sender = await userService.getUserDetail(payload.senderId)
        senderName = (sender as any).fullName
        senderAvatar = (sender as any).avatar
      } catch {
        // ignore - we'll still send a minimal notification
      }

      const snippet = String(saved.content || '').slice(0, 120)
      const notification = {
        type: 'message',
        conversationId: payload.conversationId,
        from: payload.senderId,
        to: payload.receiverId,
        messageId: saved._id,
        content: saved.content,
        snippet,
        senderName,
        senderAvatar,
        createdAt: saved.createdAt,
      }

      io.to(userRoomName(payload.receiverId)).emit('notification', notification)

      // persist a notification so clients can fetch history / unread counts
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
        // do not fail message delivery if saving notification fails
        console.error('Failed to save notification', e)
      }
    } catch (err) {
      console.error('chat message handling failed', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('disconnect', () => {
    // if the socket had identified, remove from its personal room (socket.io will
    // automatically remove socket from joined rooms on disconnect, so this is mostly
    // a no-op; kept for clarity/extension)
    const uid = (socket.data as any).userId
    if (uid) {
      try {
        socket.leave(userRoomName(uid))
      } catch (e) {
        // ignore
      }
    }
  })
}

export default registerChatHandlers
