import type { Socket, Server } from 'socket.io'
import * as chatService from '~/services/chat.service'

export const registerChatHandlers = (socket: Socket, io: Server) => {
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
      const saved = await chatService.saveMessage(payload)
      io.to(payload.conversationId).emit('message', saved)
    } catch (err) {
      console.error('chat message handling failed', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('disconnect', () => {
    // no-op for now
  })
}

export default registerChatHandlers
