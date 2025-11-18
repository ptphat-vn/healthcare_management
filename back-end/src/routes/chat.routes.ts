import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { getConversationController, sendMessageController, getRecentConversationsController, openConversationController } from '~/controllers/chat.controller'

const router = Router()

// get recent conversations list
router.get('/chats/recent', authMiddleware, getRecentConversationsController)

// fetch conversation history with another user
router.get('/chats/:UserId', authMiddleware, getConversationController)

// send a message to another user (fallback for REST / Swagger testing)
router.post('/chats/:UserId', authMiddleware, sendMessageController)

// mark conversation as read (open conversation)
router.put('/chats/:UserId/open', authMiddleware, openConversationController)

export default router
