import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { getConversationController, sendMessageController } from '~/controllers/chat.controller'

const router = Router()

// fetch conversation history with another user
router.get('/chats/:UserId', authMiddleware, getConversationController)

// send a message to another user (fallback for REST / Swagger testing)
router.post('/chats/:UserId', authMiddleware, sendMessageController)

export default router
