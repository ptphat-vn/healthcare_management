import { Request, Response, NextFunction } from 'express'
import * as chatService from '~/services/chat.service'
import { getIo } from '~/utils/socket'

export const getConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
    const otherUserId = (req.params as { otherUserId: string }).otherUserId
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' })

    const conversationId = chatService.getConversationId(String(authUserId), otherUserId)
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
    const otherUserId = (req.params as { otherUserId: string }).otherUserId
    if (!otherUserId) return res.status(400).json({ message: 'otherUserId is required' })

    const { content, metadata } = req.body as { content?: string; metadata?: Record<string, unknown> }
    if (!content || typeof content !== 'string') return res.status(400).json({ message: 'content is required and must be a string' })

    const conversationId = chatService.getConversationId(String(authUserId), otherUserId)
    const saved = await chatService.saveMessage({ conversationId, senderId: String(authUserId), receiverId: otherUserId, content, metadata })

    // If socket.io is available, emit to the conversation room so recipients get message realtime
    const io = getIo()
    if (io) {
      try {
        io.to(conversationId).emit('message', saved)
      } catch (e) {
        // ignore emit errors
      }
    }

    return res.status(201).json({ message: 'Message sent', data: saved })
  } catch (err) {
    next(err)
  }
}
