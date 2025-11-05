import type { Server as IOServer } from 'socket.io'

let io: IOServer | null = null

export const setIo = (server: IOServer) => {
  io = server
}

export const getIo = (): IOServer | null => {
  return io
}

export default { setIo, getIo }
