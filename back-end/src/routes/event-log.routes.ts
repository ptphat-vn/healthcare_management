import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
import { listEventLogsController, getEventLogController } from '~/controllers/event-log.controller'

const router = Router()

router.get('/event-logs', authMiddleware, privilegeMiddleware(['view_event_logs']), listEventLogsController)
router.get('/event-logs/:id', authMiddleware, privilegeMiddleware(['view_event_logs']), getEventLogController)

export default router
