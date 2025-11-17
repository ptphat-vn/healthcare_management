import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { getStringeeTokenController } from '~/controllers/webrtc.controller'

const router = Router()

router.get('/webrtc/token', authMiddleware, getStringeeTokenController)

export default router


