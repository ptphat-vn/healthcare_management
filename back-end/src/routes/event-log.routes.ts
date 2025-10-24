import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'
import { listEventLogsController, getEventLogController } from '~/controllers/event-log.controller'

const router = Router()

// Only roles allowed to view event logs
const VIEW_EVENT_LOG_ROLES = ['admin', 'manager', 'service']

router.get('/event-logs', authMiddleware, roleMiddleware(VIEW_EVENT_LOG_ROLES), listEventLogsController)
router.get('/event-logs/:id', authMiddleware, roleMiddleware(VIEW_EVENT_LOG_ROLES), getEventLogController)

export default router
