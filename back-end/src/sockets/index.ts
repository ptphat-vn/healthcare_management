import type { Server } from 'socket.io'
import { registerChatHandlers } from './chat.handlers'

export const initSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)
    registerChatHandlers(socket, io)
  })
}

export default initSockets
