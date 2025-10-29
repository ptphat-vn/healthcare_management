import { Router } from 'express'
import { aiDiagnosticsController } from '~/controllers/ai.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'

const aiRouter = Router()

aiRouter.get('/ai/diagnostics', authMiddleware, privilegeMiddleware(['read_only']), aiDiagnosticsController)

export default aiRouter


